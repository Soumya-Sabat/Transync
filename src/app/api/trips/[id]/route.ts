import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { TripStatus, VehicleStatus, DriverStatus, Prisma } from "@prisma/client";
import { resolveActorId } from "@/lib/audit";

type ExistingTrip = Prisma.TripGetPayload<{
  include: { vehicle: true; driver: true };
}>;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("trips:read");
    const { id } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        assignedBy: { select: { id: true, name: true } },
        fuelLogs: true,
        expenses: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission("trips:update");
    const { id } = await params;
    const body = await request.json();
    const { status, actualDistance, completedAt, ...otherData } = body;

    const existingTrip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Handle dispatch - move from DRAFT to DISPATCHED
    if (status === TripStatus.DISPATCHED && existingTrip.status === TripStatus.DRAFT) {
      return await dispatchTrip(id, existingTrip, await resolveActorId(session.user));
    }

    // Handle completion - move from DISPATCHED to COMPLETED
    if (status === TripStatus.COMPLETED && existingTrip.status === TripStatus.DISPATCHED) {
      return await completeTrip(id, existingTrip, actualDistance, completedAt);
    }

    // Handle cancellation
    const currentStatus = existingTrip.status;
    if (status === TripStatus.CANCELLED && (currentStatus === TripStatus.DRAFT || currentStatus === TripStatus.DISPATCHED)) {
      return await cancelTrip(id, existingTrip);
    }

    // Regular update
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: { ...otherData, status },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update trip" }, { status: 500 });
  }
}

async function dispatchTrip(tripId: string, existingTrip: ExistingTrip, userId: string) {
  // Use a transaction with row-level locking to prevent race conditions
  const result = await prisma.$transaction(async (tx) => {
    // Lock the vehicle and driver rows for update
    const vehicle = await tx.vehicle.findUnique({
      where: { id: existingTrip.vehicleId },
    });

    const driver = await tx.driver.findUnique({
      where: { id: existingTrip.driverId },
    });

    if (!vehicle || !driver) {
      throw new Error("Vehicle or driver not found");
    }

    // Validate business rules
    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new Error(`Vehicle is not available (current status: ${vehicle.status})`);
    }

    if (driver.status !== DriverStatus.AVAILABLE) {
      throw new Error(`Driver is not available (current status: ${driver.status})`);
    }

    // Check driver license expiry
    if (new Date(driver.licenseExpiry) < new Date()) {
      throw new Error("Driver's license has expired");
    }

    if (existingTrip.cargoWeight > vehicle.maxLoadCapacity) {
      throw new Error(`Cargo weight (${existingTrip.cargoWeight}kg) exceeds vehicle max capacity (${vehicle.maxLoadCapacity}kg)`);
    }

    // Check if vehicle or driver already has an active trip (double-booking prevention)
    const activeVehicleTrip = await tx.trip.findFirst({
      where: {
        vehicleId: vehicle.id,
        status: { in: [TripStatus.DISPATCHED] },
        NOT: { id: tripId },
      },
    });

    if (activeVehicleTrip) {
      throw new Error("Vehicle is already on another active trip");
    }

    const activeDriverTrip = await tx.trip.findFirst({
      where: {
        driverId: driver.id,
        status: { in: [TripStatus.DISPATCHED] },
        NOT: { id: tripId },
      },
    });

    if (activeDriverTrip) {
      throw new Error("Driver is already on another active trip");
    }

    // All validations passed - update trip and statuses
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.DISPATCHED,
        startedAt: new Date(),
      },
      include: { vehicle: true, driver: true },
    });

    // Update vehicle and driver status to ON_TRIP
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: VehicleStatus.ON_TRIP },
    });

    await tx.driver.update({
      where: { id: driver.id },
      data: { status: DriverStatus.ON_TRIP },
    });

    // Log status history
    await tx.statusHistory.createMany({
      data: [
        {
          entityType: "VEHICLE",
          entityId: vehicle.id,
          oldStatus: VehicleStatus.AVAILABLE,
          newStatus: VehicleStatus.ON_TRIP,
          actorId: userId,
        },
        {
          entityType: "DRIVER",
          entityId: driver.id,
          oldStatus: DriverStatus.AVAILABLE,
          newStatus: DriverStatus.ON_TRIP,
          actorId: userId,
        },
        {
          entityType: "TRIP",
          entityId: tripId,
          oldStatus: TripStatus.DRAFT,
          newStatus: TripStatus.DISPATCHED,
          actorId: userId,
        },
      ],
    });

    return updatedTrip;
  }, {
    maxWait: 5000,
    timeout: 10000,
  });

  return NextResponse.json(result);
}

async function completeTrip(tripId: string, existingTrip: ExistingTrip, actualDistance?: number, completedAt?: string) {
  const result = await prisma.$transaction(async (tx) => {
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        actualDistance: actualDistance !== undefined ? actualDistance : null,
      },
      include: { vehicle: true, driver: true },
    });

    // Revert vehicle and driver status to AVAILABLE
    await tx.vehicle.update({
      where: { id: existingTrip.vehicleId },
      data: { status: VehicleStatus.AVAILABLE },
    });

    await tx.driver.update({
      where: { id: existingTrip.driverId },
      data: { status: DriverStatus.AVAILABLE },
    });

    // Log status history
    await tx.statusHistory.createMany({
      data: [
        {
          entityType: "VEHICLE",
          entityId: existingTrip.vehicleId,
          oldStatus: VehicleStatus.ON_TRIP,
          newStatus: VehicleStatus.AVAILABLE,
          actorId: existingTrip.assignedById,
        },
        {
          entityType: "DRIVER",
          entityId: existingTrip.driverId,
          oldStatus: DriverStatus.ON_TRIP,
          newStatus: DriverStatus.AVAILABLE,
          actorId: existingTrip.assignedById,
        },
        {
          entityType: "TRIP",
          entityId: tripId,
          oldStatus: TripStatus.DISPATCHED,
          newStatus: TripStatus.COMPLETED,
          actorId: existingTrip.assignedById,
        },
      ],
    });

    return updatedTrip;
  });

  return NextResponse.json(result);
}

async function cancelTrip(tripId: string, existingTrip: ExistingTrip) {
  const result = await prisma.$transaction(async (tx) => {
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.CANCELLED },
      include: { vehicle: true, driver: true },
    });

    // If trip was dispatched, revert statuses
    if (existingTrip.status === TripStatus.DISPATCHED) {
      await tx.vehicle.update({
        where: { id: existingTrip.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      });

      await tx.driver.update({
        where: { id: existingTrip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });

      await tx.statusHistory.createMany({
        data: [
          {
            entityType: "VEHICLE",
            entityId: existingTrip.vehicleId,
            oldStatus: VehicleStatus.ON_TRIP,
            newStatus: VehicleStatus.AVAILABLE,
            actorId: existingTrip.assignedById,
          },
          {
            entityType: "DRIVER",
            entityId: existingTrip.driverId,
            oldStatus: DriverStatus.ON_TRIP,
            newStatus: DriverStatus.AVAILABLE,
            actorId: existingTrip.assignedById,
          },
        ],
      });
    }

    await tx.statusHistory.create({
      data: {
        entityType: "TRIP",
        entityId: tripId,
        oldStatus: existingTrip.status,
        newStatus: TripStatus.CANCELLED,
        actorId: existingTrip.assignedById,
      },
    });

    return updatedTrip;
  });

  return NextResponse.json(result);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("trips:delete");
    const { id } = await params;

    await prisma.trip.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
