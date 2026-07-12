import { prisma } from "@/lib/prisma";
import { SUPER_ADMIN_ROLE, isSuperAdminRole } from "@/lib/roles";
import { AppRole } from "@/lib/roles";

export async function resolveActorId(user: { id: string; role: AppRole }) {
  if (!isSuperAdminRole(user.role)) {
    return user.id;
  }

  const fallbackUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!fallbackUser) {
    throw new Error(`${SUPER_ADMIN_ROLE} needs at least one database user before creating audited operational records`);
  }

  return fallbackUser.id;
}
