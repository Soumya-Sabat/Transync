import { isSuperAdminRole, type AppRole, type DbRole } from "@/lib/roles";

export type Permission =
  | "vehicles:create" | "vehicles:read" | "vehicles:update" | "vehicles:delete"
  | "drivers:create" | "drivers:read" | "drivers:update" | "drivers:delete" | "drivers:suspend"
  | "trips:create" | "trips:read" | "trips:update" | "trips:delete" | "trips:dispatch" | "trips:complete"
  | "maintenance:create" | "maintenance:read" | "maintenance:update" | "maintenance:close" | "maintenance:delete"
  | "fuel:create" | "fuel:read" | "fuel:update"
  | "expenses:create" | "expenses:read" | "expenses:update" | "expenses:delete"
  | "reports:read" | "reports:export"
  | "documents:create" | "documents:read" | "documents:update" | "documents:delete"
  | "users:create" | "users:read" | "users:update" | "users:delete";

const allPermissions: Permission[] = [
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

const rolePermissions: Record<DbRole, Permission[]> = {
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
    "documents:create",
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

export function hasPermission(role: AppRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  if (isSuperAdminRole(role)) return true;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: AppRole | undefined, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: AppRole | undefined, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function getPermissionsForRole(role: AppRole | undefined): Permission[] {
  if (!role) return [];
  if (isSuperAdminRole(role)) return allPermissions;
  return rolePermissions[role] ?? [];
}
