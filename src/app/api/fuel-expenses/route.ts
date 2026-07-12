import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requirePermission("fuel:read");
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const vehicleId = searchParams.get("vehicleId") || "";
    const tripId = searchParams.get("tripId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Prisma.FuelLogWhereInput = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (tripId) where.tripId = tripId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vehicle: { select: { id: true, registrationNo: true, name: true } },
          trip: { select: { id: true, source: true, destination: true } },
        },
      }),
      prisma.fuelLog.count({ where }),
    ]);

    // Get total fuel cost
    const totalCost = await prisma.fuelLog.aggregate({
      where,
      _sum: { cost: true, liters: true },
    });

    return NextResponse.json({
      logs,
      summary: {
        totalCost: totalCost._sum.cost || 0,
        totalLiters: totalCost._sum.liters || 0,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching fuel logs:", error);
    return NextResponse.json({ error: "Failed to fetch fuel logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("fuel:create");
    const body = await request.json();

    const { vehicleId, tripId, liters, cost, date, odometer } = body;

    if (!vehicleId || liters === undefined || cost === undefined || odometer === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        tripId: tripId || null,
        liters: parseFloat(liters),
        cost: parseFloat(cost),
        date: new Date(date),
        odometer: parseFloat(odometer),
      },
      include: {
        vehicle: { select: { id: true, registrationNo: true, name: true } },
        trip: { select: { id: true, source: true, destination: true } },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Error creating fuel log:", error);
    return NextResponse.json({ error: "Failed to create fuel log" }, { status: 500 });
  }
}
