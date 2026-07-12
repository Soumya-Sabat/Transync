import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { Prisma, VehicleStatus } from "@prisma/client";

export const runtime = "nodejs";

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

    if (!registrationNo || !name || !type || maxLoadCapacity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNo },
    });

    if (existingVehicle) {
      return NextResponse.json({ error: "Registration number already exists" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNo,
        name,
        type,
        maxLoadCapacity: parseFloat(maxLoadCapacity),
        odometer: parseFloat(odometer) || 0,
        acquisitionCost: parseFloat(acquisitionCost) || 0,
        status,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
