"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
}

export function ChartContainer({ config: _config, className, children, ...props }: ChartContainerProps) {
  void _config;

  return (
    <div className={cn("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_lines_stroke]:stroke-muted/50 [&_.recharts-curve.recharts-dot[stroke]]:stroke-transparent [&_.recharts-dot[stroke]]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke]]:stroke-muted/50 [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip_cursor]:fill-muted [&_.recharts-reference-line_[stroke]]:stroke-muted [&_.recharts-reference-line_[stroke]]:stroke-muted/50 [&_.recharts-sector[stroke]]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none", className)} {...props}>
      <div style={{ width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
}

interface ChartTooltipProps extends React.ComponentPropsWithoutRef<"div"> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

export function ChartTooltip({ active, payload, label, className, ...props }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "grid gap-1 rounded-lg border bg-background p-2.5 shadow-lg [&>*:first-child]:text-muted-foreground dark:border",
        className
      )}
      {...props}
    >
      {label && <div className="font-medium">{label}</div>}
      {payload.map((entry, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5"
          style={{ color: entry.color }}
        >
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-medium">{entry.name}</span>
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface ChartTooltipContentProps extends React.ComponentPropsWithoutRef<"div"> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
  formatter?: (value: number) => [string, string];
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  formatter,
  ...props
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "grid gap-1 rounded-lg border bg-background p-2.5 shadow-lg [&>*:first-child]:text-muted-foreground dark:border",
        className
      )}
      {...props}
    >
      {label && <div className="font-medium">{label}</div>}
      {payload.map((entry, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5"
          style={{ color: entry.color }}
        >
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-medium">{entry.name}: </span>
          <span className="text-muted-foreground">
            {formatter ? formatter(entry.value)[0] : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartLegend({
  config,
  className,
}: {
  config: ChartConfig;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {Object.entries(config).map(([key, { label, color }]) => (
        <div key={key} className="flex items-center gap-1.5 text-sm">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </div>
      ))}
    </div>
  );
}
