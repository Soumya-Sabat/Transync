import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { TripStatus, Prisma } from "@prisma/client";
import { resolveActorId } from "@/lib/audit";

export const runtime = "nodejs";

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

    if (!source || !destination || cargoWeight === undefined || !plannedDistance || !vehicleId || !driverId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const actorId = await resolveActorId(session.user);

    // Create trip in DRAFT status
    const trip = await prisma.trip.create({
      data: {
        source,
        destination,
        cargoWeight: parseFloat(cargoWeight),
        plannedDistance: parseFloat(plannedDistance),
        vehicleId,
        driverId,
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
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
