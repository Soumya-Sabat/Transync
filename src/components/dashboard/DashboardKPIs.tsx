"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Truck,
  MapPin,
  Users,
  Wrench,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  bgColor?: string;
}

function KPICard({ title, value, icon, trend, trendLabel, bgColor = "bg-primary/10" }: KPICardProps) {
  const TrendIcon = trend !== undefined
    ? trend > 0
      ? TrendingUp
      : trend < 0
      ? TrendingDown
      : Minus
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", bgColor)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && TrendIcon && (
          <div className="flex items-center gap-1 text-xs mt-1">
            <TrendIcon className={cn(
              "h-3 w-3",
              trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
            )} />
            <span className={cn(
              trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
            )}>
              {Math.abs(trend)}%
            </span>
            <span className="text-muted-foreground">{trendLabel || "vs last month"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardKPIsData {
  activeVehicles: { value: number; trend: number };
  availableVehicles: { value: number; trend: number };
  inMaintenanceVehicles: { value: number; trend: number };
  activeTrips: { value: number; trend: number };
  pendingTrips: { value: number; trend: number };
  driversOnDuty: { value: number; trend: number };
  fleetUtilization: { value: number; trend: number };
  totalOperationalCost: { value: number; trend: number };
}

export async function DashboardKPIs() {
  // In production, fetch from API
  const data: DashboardKPIsData = {
    activeVehicles: { value: 42, trend: 5 },
    availableVehicles: { value: 28, trend: -2 },
    inMaintenanceVehicles: { value: 5, trend: 1 },
    activeTrips: { value: 12, trend: 15 },
    pendingTrips: { value: 3, trend: -25 },
    driversOnDuty: { value: 35, trend: 3 },
    fleetUtilization: { value: 67, trend: 4 },
    totalOperationalCost: { value: 125000, trend: -2 },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Active Vehicles"
        value={formatNumber(data.activeVehicles.value)}
        trend={data.activeVehicles.trend}
        icon={<Truck className="h-5 w-5 text-primary" />}
      />
      <KPICard
        title="Available Vehicles"
        value={formatNumber(data.availableVehicles.value)}
        trend={data.availableVehicles.trend}
        icon={<Truck className="h-5 w-5 text-green-600" />}
        bgColor="bg-green-100"
      />
      <KPICard
        title="In Maintenance"
        value={formatNumber(data.inMaintenanceVehicles.value)}
        trend={data.inMaintenanceVehicles.trend}
        icon={<Wrench className="h-5 w-5 text-amber-600" />}
        bgColor="bg-amber-100"
      />
      <KPICard
        title="Active Trips"
        value={formatNumber(data.activeTrips.value)}
        trend={data.activeTrips.trend}
        icon={<MapPin className="h-5 w-5 text-blue-600" />}
        bgColor="bg-blue-100"
      />
    </div>
  );
}

export async function DashboardKPIsExtended() {
  const data: DashboardKPIsData = {
    activeVehicles: { value: 42, trend: 5 },
    availableVehicles: { value: 28, trend: -2 },
    inMaintenanceVehicles: { value: 5, trend: 1 },
    activeTrips: { value: 12, trend: 15 },
    pendingTrips: { value: 3, trend: -25 },
    driversOnDuty: { value: 35, trend: 3 },
    fleetUtilization: { value: 67, trend: 4 },
    totalOperationalCost: { value: 125000, trend: -2 },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Active Vehicles"
        value={formatNumber(data.activeVehicles.value)}
        trend={data.activeVehicles.trend}
        icon={<Truck className="h-5 w-5 text-primary" />}
      />
      <KPICard
        title="Available Vehicles"
        value={formatNumber(data.availableVehicles.value)}
        trend={data.availableVehicles.trend}
        icon={<Truck className="h-5 w-5 text-green-600" />}
        bgColor="bg-green-100"
      />
      <KPICard
        title="In Maintenance"
        value={formatNumber(data.inMaintenanceVehicles.value)}
        trend={data.inMaintenanceVehicles.trend}
        icon={<Wrench className="h-5 w-5 text-amber-600" />}
        bgColor="bg-amber-100"
      />
      <KPICard
        title="Active Trips"
        value={formatNumber(data.activeTrips.value)}
        trend={data.activeTrips.trend}
        icon={<MapPin className="h-5 w-5 text-blue-600" />}
        bgColor="bg-blue-100"
      />
      <KPICard
        title="Pending Trips"
        value={formatNumber(data.pendingTrips.value)}
        trend={data.pendingTrips.trend}
        icon={<MapPin className="h-5 w-5 text-purple-600" />}
        bgColor="bg-purple-100"
      />
      <KPICard
        title="Drivers On Duty"
        value={formatNumber(data.driversOnDuty.value)}
        trend={data.driversOnDuty.trend}
        icon={<Users className="h-5 w-5 text-indigo-600" />}
        bgColor="bg-indigo-100"
      />
      <KPICard
        title="Fleet Utilization"
        value={`${data.fleetUtilization.value}%`}
        trend={data.fleetUtilization.trend}
        icon={<TrendingUp className="h-5 w-5 text-teal-600" />}
        bgColor="bg-teal-100"
      />
      <KPICard
        title="Total Op. Cost"
        value={formatCurrency(data.totalOperationalCost.value)}
        trend={data.totalOperationalCost.trend}
        icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
        bgColor="bg-emerald-100"
      />
    </div>
  );
}
