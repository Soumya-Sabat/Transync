export const SUPER_ADMIN_ROLE = "SUPER_ADMIN" as const;

export const dbRoles = [
  "FLEET_MANAGER",
  "DRIVER",
  "SAFETY_OFFICER",
  "FINANCIAL_ANALYST",
] as const;

export const appRoles = [SUPER_ADMIN_ROLE, ...dbRoles] as const;

export type SuperAdminRole = typeof SUPER_ADMIN_ROLE;
export type DbRole = (typeof dbRoles)[number];
export type AppRole = DbRole | SuperAdminRole;

export function isSuperAdminRole(role: AppRole | string | undefined): role is SuperAdminRole {
  return role === SUPER_ADMIN_ROLE;
}

export function isDbRole(role: string): role is DbRole {
  return dbRoles.includes(role as DbRole);
}

export function formatRole(role: AppRole | string): string {
  return role.replaceAll("_", " ");
}
