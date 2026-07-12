import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("vehicles:read");
    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: { take: 5, orderBy: { createdAt: "desc" } },
        maintenanceLogs: { take: 5, orderBy: { createdAt: "desc" } },
        fuelLogs: { take: 5, orderBy: { createdAt: "desc" } },
        _count: {
          select: { trips: true, maintenanceLogs: true, fuelLogs: true, expenses: true },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("vehicles:update");
    const { id } = await params;
    const body = await request.json();

    const {
      registrationNo,
      name,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      status,
    } = body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        registrationNo,
        name,
        type,
        maxLoadCapacity: maxLoadCapacity ? parseFloat(maxLoadCapacity) : undefined,
        odometer: odometer ? parseFloat(odometer) : undefined,
        acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : undefined,
        status,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("vehicles:delete");
    const { id } = await params;

    await prisma.vehicle.update({
      where: { id },
      data: { status: "RETIRED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
