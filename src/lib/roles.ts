import { Role } from "@prisma/client";

export const SUPER_ADMIN_ROLE = "SUPER_ADMIN" as const;

export type SuperAdminRole = typeof SUPER_ADMIN_ROLE;
export type AppRole = Role | SuperAdminRole;

export const appRoles = [
  SUPER_ADMIN_ROLE,
  Role.FLEET_MANAGER,
  Role.DRIVER,
  Role.SAFETY_OFFICER,
  Role.FINANCIAL_ANALYST,
] as const;

export const dbRoles = [
  Role.FLEET_MANAGER,
  Role.DRIVER,
  Role.SAFETY_OFFICER,
  Role.FINANCIAL_ANALYST,
] as const;

export function isSuperAdminRole(role: AppRole | string | undefined): role is SuperAdminRole {
  return role === SUPER_ADMIN_ROLE;
}

export function isDbRole(role: string): role is Role {
  return dbRoles.includes(role as Role);
}

export function formatRole(role: AppRole | string): string {
  return role.replaceAll("_", " ");
}
