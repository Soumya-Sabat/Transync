import { isSuperAdminRole, type AppRole, type DbRole } from "@/lib/roles";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

type ProtectedNavItem = NavItem & {
  roles: DbRole[];
};

const navItems: ProtectedNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    roles: ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    href: "/vehicles",
    label: "Vehicles",
    icon: "Truck",
    roles: ["FLEET_MANAGER", "FINANCIAL_ANALYST"],
  },
  {
    href: "/drivers",
    label: "Drivers",
    icon: "Users",
    roles: ["FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    href: "/trips",
    label: "Trips",
    icon: "MapPin",
    roles: ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    href: "/maintenance",
    label: "Maintenance",
    icon: "Wrench",
    roles: ["FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    href: "/fuel-expenses",
    label: "Fuel & Expenses",
    icon: "Fuel",
    roles: ["FLEET_MANAGER", "DRIVER", "FINANCIAL_ANALYST"],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: "BarChart3",
    roles: ["FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    href: "/documents",
    label: "Documents",
    icon: "FileText",
    roles: ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
];

function toNavItem(item: ProtectedNavItem): NavItem {
  return {
    href: item.href,
    label: item.label,
    icon: item.icon,
  };
}

export function getNavItemsForRole(role: AppRole | undefined): NavItem[] {
  if (!role) return [];

  if (isSuperAdminRole(role)) {
    return [
      ...navItems.map(toNavItem),
      { href: "/super-admin", label: "Super Admin", icon: "Settings" },
    ];
  }

  return navItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...toNavItem(item),
      label: role === "DRIVER" && item.href === "/trips" ? "My Trips" : item.label,
    }));
}
