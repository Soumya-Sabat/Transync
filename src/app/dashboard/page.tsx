"use client";

import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { RecentTrips } from "@/components/dashboard/RecentTrips";
import { ExpiringDocuments } from "@/components/dashboard/ExpiringDocuments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your fleet operations</p>
        </div>

        {/* KPI Cards */}
        <Suspense fallback={<KPISkeleton />}>
          <DashboardKPIs />
        </Suspense>

        {/* Charts & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<ChartsSkeleton />}>
            <DashboardCharts />
          </Suspense>

          <div className="space-y-6">
            <Suspense fallback={<Skeleton className="h-80 w-full" />}>
              <RecentTrips />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <ExpiringDocuments />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function KPISkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-3/4 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="col-span-1 lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Fleet Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}