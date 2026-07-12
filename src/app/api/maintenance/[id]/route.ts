import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { MaintenanceStatus, VehicleStatus } from "@prisma/client";
import { resolveActorId } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("maintenance:read");
    const { id } = await params;

    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, registrationNo: true, name: true, status: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!log) {
      return NextResponse.json({ error: "Maintenance log not found" }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error fetching maintenance log:", error);
    return NextResponse.json({ error: "Failed to fetch maintenance log" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission("maintenance:update");
    const { id } = await params;
    const body = await request.json();

    const { vehicleId, type, cost, date, odometer, notes, status } = body;

    const existingLog = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!existingLog) {
      return NextResponse.json({ error: "Maintenance log not found" }, { status: 404 });
    }

    const actorId = await resolveActorId(session.user);

    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.update({
        where: { id },
        data: {
          vehicleId,
          type,
          cost: cost !== undefined ? parseFloat(cost) : undefined,
          date: date ? new Date(date) : undefined,
          odometer: odometer !== undefined ? parseFloat(odometer) : undefined,
          notes,
          status,
        },
        include: { vehicle: true },
      });

      // Handle status change to CLOSED
      if (status === MaintenanceStatus.CLOSED && existingLog.status === MaintenanceStatus.OPEN) {
        await tx.vehicle.update({
          where: { id: existingLog.vehicleId },
          data: { status: VehicleStatus.AVAILABLE },
        });

        await tx.statusHistory.create({
          data: {
            entityType: "VEHICLE",
            entityId: existingLog.vehicleId,
            oldStatus: VehicleStatus.IN_SHOP,
            newStatus: VehicleStatus.AVAILABLE,
            actorId,
          },
        });
      }

      return log;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating maintenance log:", error);
    return NextResponse.json({ error: "Failed to update maintenance log" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("maintenance:delete");
    const { id } = await params;

    await prisma.maintenanceLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting maintenance log:", error);
    return NextResponse.json({ error: "Failed to delete maintenance log" }, { status: 500 });
  }
}
