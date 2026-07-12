import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    ON_TRIP: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    IN_SHOP: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    RETIRED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    OFF_DUTY: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    DISPATCHED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    OPEN: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    CLOSED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    FLEET_MANAGER: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    DRIVER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    SAFETY_OFFICER: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    FINANCIAL_ANALYST: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    SUPER_ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
