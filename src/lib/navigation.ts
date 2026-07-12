import { Role } from "@prisma/client";
import { AppRole, isSuperAdminRole } from "@/lib/roles";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const baseNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
];

const fullOperationalNav: NavItem[] = [
  ...baseNav,
  { href: "/vehicles", label: "Vehicles", icon: "Truck" },
  { href: "/drivers", label: "Drivers", icon: "Users" },
  { href: "/trips", label: "Trips", icon: "MapPin" },
  { href: "/maintenance", label: "Maintenance", icon: "Wrench" },
  { href: "/fuel-expenses", label: "Fuel & Expenses", icon: "Fuel" },
  { href: "/reports", label: "Reports", icon: "BarChart3" },
  { href: "/documents", label: "Documents", icon: "FileText" },
];

export function getNavItemsForRole(role: AppRole): NavItem[] {
  const roleNav: Record<Role, NavItem[]> = {
    FLEET_MANAGER: fullOperationalNav,
    DRIVER: [
      ...baseNav,
      { href: "/trips", label: "My Trips", icon: "MapPin" },
      { href: "/fuel-expenses", label: "Fuel Logs", icon: "Fuel" },
      { href: "/documents", label: "Documents", icon: "FileText" },
    ],
    SAFETY_OFFICER: [
      ...baseNav,
      { href: "/drivers", label: "Drivers", icon: "Users" },
      { href: "/documents", label: "Documents", icon: "FileText" },
      { href: "/reports", label: "Reports", icon: "BarChart3" },
    ],
    FINANCIAL_ANALYST: fullOperationalNav,
  };

  if (isSuperAdminRole(role)) {
    return [
      ...fullOperationalNav,
      { href: "/super-admin", label: "Super Admin", icon: "Settings" },
    ];
  }

  return roleNav[role] || baseNav;
}
