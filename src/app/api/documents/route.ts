import { NextResponse } from "next/server";
import { DocumentType, EntityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveActorId } from "@/lib/audit";
import { requirePermission } from "@/lib/rbac";

export const runtime = "nodejs";

const entityTypes = ["VEHICLE", "DRIVER"] as const;
type DocumentEntityType = (typeof entityTypes)[number];
const documentTypes = [
  "VEHICLE_INSURANCE",
  "VEHICLE_REGISTRATION",
  "VEHICLE_PERMIT",
  "VEHICLE_FITNESS_CERT",
  "DRIVER_LICENSE",
] as const;

function isDocumentEntityType(value: unknown): value is DocumentEntityType {
  return typeof value === "string" && entityTypes.includes(value as DocumentEntityType);
}

function isDocumentType(value: unknown): value is DocumentType {
  return typeof value === "string" && documentTypes.includes(value as DocumentType);
}

export async function GET(request: Request) {
  try {
    await requirePermission("documents:read");
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType") || "";
    const type = searchParams.get("type") || "";

    const where: Prisma.DocumentWhereInput = {};
    if (entityType) where.entityType = entityType as EntityType;
    if (type) where.type = type as DocumentType;

    const documents = await prisma.document.findMany({
      where,
      orderBy: [{ expiryDate: "asc" }, { createdAt: "desc" }],
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("documents:create");
    const body = await request.json();
    const { entityType, entityId, type, fileUrl, expiryDate } = body;
    const selectedEntityId = String(entityId ?? "").trim();
    const selectedFileUrl = String(fileUrl ?? "").trim();

    if (!entityType || !selectedEntityId || !type || !selectedFileUrl) {
      return NextResponse.json({ error: "Entity, document type, and file URL are required" }, { status: 400 });
    }

    if (!isDocumentEntityType(entityType)) {
      return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
    }

    if (!isDocumentType(type)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    const entity =
      entityType === "VEHICLE"
        ? await prisma.vehicle.findUnique({ where: { id: selectedEntityId }, select: { id: true } })
        : await prisma.driver.findUnique({ where: { id: selectedEntityId }, select: { id: true } });

    if (!entity) {
      return NextResponse.json({ error: "Selected entity was not found" }, { status: 400 });
    }

    const actorId = await resolveActorId(session.user);
    const latest = await prisma.document.findFirst({
      where: { entityType, entityId: selectedEntityId, type },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const document = await prisma.document.create({
      data: {
        entityType,
        entityId: selectedEntityId,
        type,
        fileUrl: selectedFileUrl,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        version: (latest?.version ?? 0) + 1,
        uploadedById: actorId,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create document" },
      { status: 500 }
    );
  }
}
