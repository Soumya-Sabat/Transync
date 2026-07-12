import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requirePermission("reports:read");

    const [
      vehicleCount,
      driverCount,
      activeTrips,
      fuelSummary,
      expenseSummary,
      maintenanceSummary,
      vehiclesByStatus,
      tripsByStatus,
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.trip.count({ where: { status: "DISPATCHED" } }),
      prisma.fuelLog.aggregate({ _sum: { cost: true, liters: true } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
      prisma.vehicle.groupBy({ by: ["status"], _count: true }),
      prisma.trip.groupBy({ by: ["status"], _count: true }),
    ]);

    return NextResponse.json({
      summary: {
        vehicleCount,
        driverCount,
        activeTrips,
        fuelCost: fuelSummary._sum.cost ?? 0,
        fuelLiters: fuelSummary._sum.liters ?? 0,
        expenseCost: expenseSummary._sum.amount ?? 0,
        maintenanceCost: maintenanceSummary._sum.cost ?? 0,
      },
      vehiclesByStatus,
      tripsByStatus,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to build reports" },
      { status: 500 }
    );
  }
}
