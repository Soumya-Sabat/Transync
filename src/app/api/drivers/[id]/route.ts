import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("drivers:read");
    const { id } = await params;

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: { take: 5, orderBy: { createdAt: "desc" } },
        _count: {
          select: { trips: true },
        },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error("Error fetching driver:", error);
    return NextResponse.json({ error: "Failed to fetch driver" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("drivers:update");
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      contactNumber,
      safetyScore,
      status,
    } = body;

    const driver = await prisma.driver.update({
      where: { id },
      data: {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        contactNumber,
        safetyScore: safetyScore !== undefined ? parseFloat(safetyScore) : undefined,
        status,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    console.error("Error updating driver:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("drivers:delete");
    const { id } = await params;

    await prisma.driver.update({
      where: { id },
      data: { status: "SUSPENDED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting driver:", error);
    return NextResponse.json({ error: "Failed to delete driver" }, { status: 500 });
  }
}
