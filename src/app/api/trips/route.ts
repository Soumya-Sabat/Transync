import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { TripStatus, Prisma } from "@prisma/client";
import { resolveActorId } from "@/lib/audit";

export const runtime = "nodejs";

function parseRequiredNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return Number.NaN;
  return Number(value);
}

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
  }

  if (error instanceof Error && error.message === "Forbidden") {
    return NextResponse.json({ error: "You do not have permission to create trips" }, { status: 403 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    return NextResponse.json({ error: "Selected vehicle, driver, or user was not found" }, { status: 400 });
  }

  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 500 }
  );
}

export async function GET(request: Request) {
  try {
    await requirePermission("trips:read");
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const vehicleId = searchParams.get("vehicleId") || "";
    const driverId = searchParams.get("driverId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Prisma.TripWhereInput = {};
    
    if (search) {
      where.OR = [
        { source: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (status) {
      where.status = status as TripStatus;
    }
    
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }
    
    if (driverId) {
      where.driverId = driverId;
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vehicle: { select: { id: true, registrationNo: true, name: true, status: true } },
          driver: { select: { id: true, name: true, licenseNumber: true, status: true } },
          assignedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return NextResponse.json({
      trips,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("trips:create");
    const body = await request.json();

    const {
      source,
      destination,
      cargoWeight,
      plannedDistance,
      vehicleId,
      driverId,
    } = body;

    const trimmedSource = String(source ?? "").trim();
    const trimmedDestination = String(destination ?? "").trim();
    const parsedCargoWeight = parseRequiredNumber(cargoWeight);
    const parsedPlannedDistance = parseRequiredNumber(plannedDistance);
    const selectedVehicleId = String(vehicleId ?? "").trim();
    const selectedDriverId = String(driverId ?? "").trim();

    if (!trimmedSource || !trimmedDestination || cargoWeight === undefined || plannedDistance === undefined || !selectedVehicleId || !selectedDriverId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Number.isFinite(parsedCargoWeight) || parsedCargoWeight <= 0) {
      return NextResponse.json({ error: "Cargo weight must be a valid positive number" }, { status: 400 });
    }

    if (!Number.isFinite(parsedPlannedDistance) || parsedPlannedDistance <= 0) {
      return NextResponse.json({ error: "Planned distance must be a valid positive number" }, { status: 400 });
    }

    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findUnique({
        where: { id: selectedVehicleId },
        select: { id: true, maxLoadCapacity: true },
      }),
      prisma.driver.findUnique({
        where: { id: selectedDriverId },
        select: { id: true },
      }),
    ]);

    if (!vehicle) {
      return NextResponse.json({ error: "Selected vehicle was not found" }, { status: 400 });
    }

    if (!driver) {
      return NextResponse.json({ error: "Selected driver was not found" }, { status: 400 });
    }

    if (vehicle.maxLoadCapacity < parsedCargoWeight) {
      return NextResponse.json(
        { error: `Cargo weight exceeds selected vehicle capacity (${vehicle.maxLoadCapacity})` },
        { status: 400 }
      );
    }

    const actorId = await resolveActorId(session.user);

    // Create trip in DRAFT status
    const trip = await prisma.trip.create({
      data: {
        source: trimmedSource,
        destination: trimmedDestination,
        cargoWeight: parsedCargoWeight,
        plannedDistance: parsedPlannedDistance,
        vehicleId: selectedVehicleId,
        driverId: selectedDriverId,
        assignedById: actorId,
        status: TripStatus.DRAFT,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("Error creating trip:", error);
    return errorResponse(error, "Failed to create trip");
  }
}
