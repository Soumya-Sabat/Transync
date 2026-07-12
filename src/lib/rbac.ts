import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { AppRole, SUPER_ADMIN_ROLE, isSuperAdminRole } from "@/lib/roles";
import { getNavItemsForRole } from "@/lib/navigation";

type Permission = 
  | "vehicles:create" | "vehicles:read" | "vehicles:update" | "vehicles:delete"
  | "drivers:create" | "drivers:read" | "drivers:update" | "drivers:delete" | "drivers:suspend"
  | "trips:create" | "trips:read" | "trips:update" | "trips:delete" | "trips:dispatch" | "trips:complete"
  | "maintenance:create" | "maintenance:read" | "maintenance:update" | "maintenance:close" | "maintenance:delete"
  | "fuel:create" | "fuel:read" | "fuel:update"
  | "expenses:create" | "expenses:read" | "expenses:update" | "expenses:delete"
  | "reports:read" | "reports:export"
  | "documents:create" | "documents:read" | "documents:update" | "documents:delete"
  | "users:create" | "users:read" | "users:update" | "users:delete";

const rolePermissions: Record<Role, Permission[]> = {
  FLEET_MANAGER: [
    "vehicles:create",
    "vehicles:read",
    "vehicles:update",
    "vehicles:delete",
    "drivers:create",
    "drivers:read",
    "drivers:update",
    "drivers:delete",
    "drivers:suspend",
    "trips:create",
    "trips:read",
    "trips:update",
    "trips:delete",
    "trips:dispatch",
    "trips:complete",
    "maintenance:create",
    "maintenance:read",
    "maintenance:update",
    "maintenance:close",
    "fuel:create",
    "fuel:read",
    "fuel:update",
    "expenses:create",
    "expenses:read",
    "expenses:update",
    "expenses:delete",
    "reports:read",
    "reports:export",
    "documents:create",
    "documents:read",
    "documents:update",
    "documents:delete",
    "users:create",
    "users:read",
    "users:update",
  ],
  DRIVER: [
    "trips:read",
    "trips:update",
    "trips:complete",
    "fuel:create",
    "fuel:read",
    "expenses:create",
    "expenses:read",
    "documents:read",
  ],
  SAFETY_OFFICER: [
    "drivers:read",
    "drivers:update",
    "drivers:suspend",
    "trips:read",
    "maintenance:read",
    "documents:read",
    "reports:read",
  ],
  FINANCIAL_ANALYST: [
    "vehicles:read",
    "drivers:read",
    "trips:read",
    "maintenance:read",
    "fuel:read",
    "expenses:read",
    "expenses:create",
    "expenses:update",
    "reports:read",
    "reports:export",
    "documents:read",
  ],
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  if (isSuperAdminRole(role)) return true;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: AppRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: AppRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getPermissionsForRole(role: AppRole): Permission[] {
  if (isSuperAdminRole(role)) {
    return [
      "vehicles:create", "vehicles:read", "vehicles:update", "vehicles:delete",
      "drivers:create", "drivers:read", "drivers:update", "drivers:delete", "drivers:suspend",
      "trips:create", "trips:read", "trips:update", "trips:delete", "trips:dispatch", "trips:complete",
      "maintenance:create", "maintenance:read", "maintenance:update", "maintenance:close", "maintenance:delete",
      "fuel:create", "fuel:read", "fuel:update",
      "expenses:create", "expenses:read", "expenses:update", "expenses:delete",
      "reports:read", "reports:export",
      "documents:create", "documents:read", "documents:update", "documents:delete",
      "users:create", "users:read", "users:update", "users:delete",
    ];
  }
  return rolePermissions[role] ?? [];
}

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
