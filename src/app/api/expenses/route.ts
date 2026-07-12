import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { resolveActorId } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requirePermission("expenses:read");
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const vehicleId = searchParams.get("vehicleId") || "";
    const tripId = searchParams.get("tripId") || "";
    const type = searchParams.get("type") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Prisma.ExpenseWhereInput = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (tripId) where.tripId = tripId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vehicle: { select: { id: true, registrationNo: true, name: true } },
          trip: { select: { id: true, source: true, destination: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    // Get total by type
    const totalByType = await prisma.expense.groupBy({
      by: ["type"],
      where,
      _sum: { amount: true },
    });

    return NextResponse.json({
      expenses,
      summary: {
        totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
        byType: totalByType.reduce((acc, item) => {
          acc[item.type] = item._sum.amount || 0;
          return acc;
        }, {} as Record<string, number>),
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("expenses:create");
    const body = await request.json();

    const { vehicleId, tripId, type, amount, date, description } = body;

    if (!type || amount === undefined || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const actorId = await resolveActorId(session.user);

    const expense = await prisma.expense.create({
      data: {
        vehicleId: vehicleId || null,
        tripId: tripId || null,
        type,
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        createdById: actorId,
      },
      include: {
        vehicle: { select: { id: true, registrationNo: true, name: true } },
        trip: { select: { id: true, source: true, destination: true } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
