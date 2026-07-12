import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { MaintenanceStatus, Prisma, VehicleStatus } from "@prisma/client";
import { resolveActorId } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requirePermission("maintenance:read");
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const vehicleId = searchParams.get("vehicleId") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Prisma.MaintenanceLogWhereInput = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status as MaintenanceStatus;

    const [logs, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vehicle: { select: { id: true, registrationNo: true, name: true, status: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching maintenance logs:", error);
    return NextResponse.json({ error: "Failed to fetch maintenance logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("maintenance:create");
    const body = await request.json();

    const { vehicleId, type, cost, date, odometer, notes, status = MaintenanceStatus.OPEN } = body;

    if (!vehicleId || !type || cost === undefined || !odometer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const actorId = await resolveActorId(session.user);

    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId,
          type,
          cost: parseFloat(cost),
          date: new Date(date),
          odometer: parseFloat(odometer),
          notes,
          status,
          createdById: actorId,
        },
        include: { vehicle: true },
      });

      if (status === MaintenanceStatus.OPEN) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { status: VehicleStatus.IN_SHOP },
        });

        await tx.statusHistory.create({
          data: {
            entityType: "VEHICLE",
            entityId: vehicleId,
            oldStatus: VehicleStatus.AVAILABLE,
            newStatus: VehicleStatus.IN_SHOP,
            actorId,
          },
        });
      }

      return log;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance log:", error);
    return NextResponse.json({ error: "Failed to create maintenance log" }, { status: 500 });
  }
}
