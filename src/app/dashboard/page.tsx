"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { BarChart3, Loader2, RefreshCw, Truck, Users, Wrench, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";

type ReportSummary = {
  vehicleCount: number;
  driverCount: number;
  activeTrips: number;
  fuelCost: number;
  fuelLiters: number;
  expenseCost: number;
  maintenanceCost: number;
};

type ReportData = {
  summary: ReportSummary;
  vehiclesByStatus: Array<{ status: string; _count: number }>;
  tripsByStatus: Array<{ status: string; _count: number }>;
};

export default function DashboardPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadDashboard() {
    setError("");
    try {
      const response = await fetch("/api/reports", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load dashboard");
      setReport(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
    }
  }

  useEffect(() => {
    startTransition(() => {
      void loadDashboard();
    });
  }, []);

  const summary = report?.summary;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Live overview of fleet operations and cost posture.</p>
          </div>
          <Button variant="outline" onClick={() => void loadDashboard()} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi title="Vehicles" value={summary ? formatNumber(summary.vehicleCount) : "-"} icon={<Truck className="h-5 w-5 text-primary" />} href="/vehicles" />
          <Kpi title="Drivers" value={summary ? formatNumber(summary.driverCount) : "-"} icon={<Users className="h-5 w-5 text-blue-600" />} href="/drivers" />
          <Kpi title="Active Trips" value={summary ? formatNumber(summary.activeTrips) : "-"} icon={<MapPin className="h-5 w-5 text-green-600" />} href="/trips" />
          <Kpi title="Maintenance Cost" value={summary ? formatCurrency(summary.maintenanceCost) : "-"} icon={<Wrench className="h-5 w-5 text-amber-600" />} href="/maintenance" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <StatusPanel title="Vehicle Status" rows={report?.vehiclesByStatus ?? []} />
          <StatusPanel title="Trip Status" rows={report?.tripsByStatus ?? []} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Cost summary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Cost label="Fuel Cost" value={summary?.fuelCost ?? 0} />
            <Cost label="Expense Cost" value={summary?.expenseCost ?? 0} />
            <Cost label="Fuel Liters" value={summary?.fuelLiters ?? 0} numeric />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Kpi({ title, value, icon, href }: { title: string; value: string; icon: React.ReactNode; href: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon}
        </div>
        <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
        <Button asChild variant="link" className="mt-2 h-auto p-0">
          <Link href={href}>Open workspace</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusPanel({ title, rows }: { title: string; rows: Array<{ status: string; _count: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.status} className="flex items-center justify-between rounded-md border p-3">
              <Badge variant="outline" className="rounded-md">{row.status.replaceAll("_", " ")}</Badge>
              <span className="font-semibold tabular-nums">{row._count}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function Cost({ label, value, numeric }: { label: string; value: number; numeric?: boolean }) {
  return (
    <div className="rounded-md border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">
        {numeric ? formatNumber(value) : formatCurrency(value)}
      </p>
    </div>
  );
}
