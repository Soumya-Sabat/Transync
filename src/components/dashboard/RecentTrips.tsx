"use client";

import type { ComponentProps } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MapPin, Clock, Truck, User } from "lucide-react";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

const statusVariant: Record<string, BadgeVariant> = {
  DRAFT: "outline",
  DISPATCHED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const recentTrips = [
  {
    id: "trip-001",
    vehicle: "Van-05",
    driver: "John Smith",
    source: "Warehouse A",
    destination: "Client Site B",
    status: "DISPATCHED",
    startTime: "2024-07-12T08:00:00",
    cargoWeight: 450,
    plannedDistance: 45,
  },
  {
    id: "trip-002",
    vehicle: "Truck-01",
    driver: "Mike Johnson",
    source: "Distribution Center",
    destination: "Retail Store #3",
    status: "COMPLETED",
    startTime: "2024-07-12T06:30:00",
    endTime: "2024-07-12T10:45:00",
    cargoWeight: 1200,
    plannedDistance: 85,
  },
  {
    id: "trip-003",
    vehicle: "Van-02",
    driver: "Sarah Williams",
    source: "Warehouse B",
    destination: "Client Site A",
    status: "DISPATCHED",
    startTime: "2024-07-12T09:15:00",
    cargoWeight: 380,
    plannedDistance: 32,
  },
  {
    id: "trip-004",
    vehicle: "Van-08",
    driver: "David Brown",
    source: "Warehouse A",
    destination: "Client Site C",
    status: "CANCELLED",
    startTime: "2024-07-12T07:00:00",
    cargoWeight: 520,
    plannedDistance: 28,
  },
  {
    id: "trip-005",
    vehicle: "Truck-02",
    driver: "Lisa Anderson",
    source: "Port Terminal",
    destination: "Warehouse C",
    status: "DRAFT",
    startTime: "2024-07-12T14:00:00",
    cargoWeight: 2100,
    plannedDistance: 15,
  },
];

export function RecentTrips() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Trips</CardTitle>
        <a href="/trips" className="text-sm text-primary hover:underline">View all</a>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip ID</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTrips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell className="font-mono text-sm">{trip.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    {trip.vehicle}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {trip.driver}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[150px]">
                      {trip.source} → {trip.destination}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[trip.status] ?? "default"}>
                    {trip.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(trip.startTime)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
