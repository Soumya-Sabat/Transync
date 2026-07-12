import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";
import { isDbRole } from "@/lib/roles";

export const runtime = "nodejs";

function safeUserSelect() {
  return {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  } as const;
}

export async function GET() {
  try {
    await requireSuperAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: safeUserSelect(),
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load users" },
      { status: error instanceof Error && error.message === "Forbidden" ? 403 : 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: "Email, name, password, and role are required" }, { status: 400 });
    }

    if (!isDbRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await prisma.user.create({
      data: {
        email: String(email).toLowerCase(),
        name: String(name),
        passwordHash,
        role: role as Role,
      },
      select: safeUserSelect(),
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const { id, name, role, password } = body;

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    if (role && !isDbRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const data: { name?: string; role?: Role; passwordHash?: string } = {};
    if (name) data.name = String(name);
    if (role) data.role = role as Role;
    if (password) {
      if (String(password).length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      data.passwordHash = await bcrypt.hash(String(password), 12);
    }

    const user = await prisma.user.update({
      where: { id: String(id) },
      data,
      select: safeUserSelect(),
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireSuperAdmin();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    const relatedCounts = await prisma.user.findUnique({
      where: { id: String(id) },
      select: {
        _count: {
          select: {
            documents: true,
            assignedTrips: true,
            maintenanceLogs: true,
            expenses: true,
            statusHistory: true,
          },
        },
      },
    });

    if (!relatedCounts) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasOperationalHistory = Object.values(relatedCounts._count).some((count) => count > 0);
    if (hasOperationalHistory) {
      return NextResponse.json(
        { error: "User has operational history and cannot be hard-deleted safely" },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id: String(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
