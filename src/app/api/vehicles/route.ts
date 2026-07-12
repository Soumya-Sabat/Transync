import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { Prisma, VehicleStatus } from "@prisma/client";

export const runtime = "nodejs";

const vehicleStatuses = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"] as const;

function isVehicleStatus(status: unknown): status is VehicleStatus {
  return typeof status === "string" && vehicleStatuses.includes(status as VehicleStatus);
}

function parseNumber(value: unknown, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
  }

  if (error instanceof Error && error.message === "Forbidden") {
    return NextResponse.json({ error: "You do not have permission to manage vehicles" }, { status: 403 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json({ error: "Registration number already exists" }, { status: 409 });
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    await requirePermission("vehicles:read");
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Prisma.VehicleWhereInput = {};
    
    if (search) {
      where.OR = [
        { registrationNo: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (status) {
      where.status = status as VehicleStatus;
    }
    
    if (type) {
      where.type = type;
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { trips: true, maintenanceLogs: true, fuelLogs: true },
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("vehicles:create");
    const body = await request.json();

    const {
      registrationNo,
      name,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      status = "AVAILABLE",
    } = body;

    const trimmedRegistrationNo = String(registrationNo ?? "").trim();
    const trimmedName = String(name ?? "").trim();
    const trimmedType = String(type ?? "").trim();
    const parsedMaxLoadCapacity = parseNumber(maxLoadCapacity, Number.NaN);
    const parsedOdometer = parseNumber(odometer);
    const parsedAcquisitionCost = parseNumber(acquisitionCost);
    const vehicleStatus = isVehicleStatus(status) ? status : "AVAILABLE";

    if (!trimmedRegistrationNo || !trimmedName || !trimmedType || maxLoadCapacity === undefined || maxLoadCapacity === "") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Number.isFinite(parsedMaxLoadCapacity) || parsedMaxLoadCapacity < 0) {
      return NextResponse.json({ error: "Max load must be a valid number" }, { status: 400 });
    }

    if (!Number.isFinite(parsedOdometer) || parsedOdometer < 0) {
      return NextResponse.json({ error: "Odometer must be a valid number" }, { status: 400 });
    }

    if (!Number.isFinite(parsedAcquisitionCost) || parsedAcquisitionCost < 0) {
      return NextResponse.json({ error: "Acquisition cost must be a valid number" }, { status: 400 });
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNo: trimmedRegistrationNo },
    });

    if (existingVehicle) {
      return NextResponse.json({ error: "Registration number already exists" }, { status: 409 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNo: trimmedRegistrationNo,
        name: trimmedName,
        type: trimmedType,
        maxLoadCapacity: parsedMaxLoadCapacity,
        odometer: parsedOdometer,
        acquisitionCost: parsedAcquisitionCost,
        status: vehicleStatus,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return errorResponse(error, "Failed to create vehicle");
  }
}
