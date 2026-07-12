import { auth } from "@/lib/auth";
import { SUPER_ADMIN_ROLE } from "@/lib/roles";
import { getNavItemsForRole } from "@/lib/navigation";
import { hasPermission, type Permission } from "@/lib/permissions";

export {
  getPermissionsForRole,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type Permission,
} from "@/lib/permissions";

export async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!hasPermission(session.user.role, permission)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== SUPER_ADMIN_ROLE) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export { getNavItemsForRole };
