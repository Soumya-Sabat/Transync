"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TooltipValue = string | number | readonly (string | number)[] | undefined;

const utilizationData = [
  { month: "Jan", utilization: 65, target: 75 },
  { month: "Feb", utilization: 68, target: 75 },
  { month: "Mar", utilization: 72, target: 75 },
  { month: "Apr", utilization: 70, target: 75 },
  { month: "May", utilization: 74, target: 75 },
  { month: "Jun", utilization: 76, target: 75 },
  { month: "Jul", utilization: 78, target: 75 },
];

const costData = [
  { month: "Jan", fuel: 25000, maintenance: 12000, other: 8000 },
  { month: "Feb", fuel: 26500, maintenance: 11500, other: 7500 },
  { month: "Mar", fuel: 27200, maintenance: 13000, other: 8200 },
  { month: "Apr", fuel: 28100, maintenance: 14000, other: 9000 },
  { month: "May", fuel: 29500, maintenance: 12500, other: 8800 },
  { month: "Jun", fuel: 31000, maintenance: 15000, other: 9500 },
  { month: "Jul", fuel: 32500, maintenance: 16000, other: 10000 },
];

const fuelEfficiencyData = [
  { vehicle: "Van-01", efficiency: 12.5, target: 13.0 },
  { vehicle: "Van-02", efficiency: 11.8, target: 13.0 },
  { vehicle: "Van-03", efficiency: 13.2, target: 13.0 },
  { vehicle: "Van-04", efficiency: 12.0, target: 13.0 },
  { vehicle: "Van-05", efficiency: 12.8, target: 13.0 },
  { vehicle: "Truck-01", efficiency: 8.5, target: 9.0 },
  { vehicle: "Truck-02", efficiency: 8.2, target: 9.0 },
  { vehicle: "Truck-03", efficiency: 8.8, target: 9.0 },
];

export function DashboardCharts() {
  return (
    <div className="space-y-6">
      {/* Fleet Utilization Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Utilization Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis domain={[50, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="utilization"
                stroke="#0f6e6e"
                strokeWidth={2}
                dot={{ fill: "#0f6e6e", strokeWidth: 2 }}
                name="Actual Utilization %"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target (75%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" />
              <YAxis dataKey="month" type="category" width={60} />
              <Tooltip
                formatter={(value: TooltipValue) => value !== undefined ? [`$${value.toLocaleString()}`, "Cost"] : ["$0", "Cost"]}
              />
              <Legend />
              <Bar dataKey="fuel" fill="#0f6e6e" name="Fuel" radius={[0, 4, 4, 0]} />
              <Bar dataKey="maintenance" fill="#f59e0b" name="Maintenance" radius={[0, 4, 4, 0]} />
              <Bar dataKey="other" fill="#6b7280" name="Other" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fuel Efficiency by Vehicle */}
      <Card>
        <CardHeader>
          <CardTitle>Fuel Efficiency by Vehicle (km/L)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuelEfficiencyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" />
              <YAxis dataKey="vehicle" type="category" width={80} />
              <Tooltip
                formatter={(value: TooltipValue) => value !== undefined ? [`${value} km/L`, "Efficiency"] : ["0 km/L", "Efficiency"]}
              />
              <Legend />
              <Bar dataKey="efficiency" fill="#0f6e6e" name="Actual" radius={[4, 0, 0, 4]} />
              <Bar dataKey="target" fill="#9ca3af" name="Target" radius={[4, 0, 0, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
