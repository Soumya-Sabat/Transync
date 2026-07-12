"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Download, Loader2, Plus, RefreshCw, Save, Search, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { hasPermission, type Permission } from "@/lib/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";

type Row = Record<string, unknown>;
type Option = { label: string; value: string; maxLoadCapacity?: number };
type FieldType = "text" | "number" | "date" | "select";
type Field = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: Option[];
  optionSource?: "vehicles" | "drivers" | "trips";
  entityOption?: boolean;
  placeholder?: string;
};
type Column = {
  key: string;
  label: string;
  type?: "text" | "date" | "currency" | "status" | "number";
};
type ResourceConfig = {
  title: string;
  description: string;
  endpoint: string;
  collectionKey: string;
  createTitle: string;
  createPermission?: Permission;
  searchPlaceholder?: string;
  fields: Field[];
  columns: Column[];
  filters?: Field[];
  lookupSources?: Array<"vehicles" | "drivers" | "trips">;
  updateMethod?: "PUT" | "PATCH";
  deleteLabel?: string;
};

type LookupState = {
  vehicles: Option[];
  drivers: Option[];
  trips: Option[];
};

const noneValue = "__NONE__";

const statusOptions = {
  vehicle: ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"],
  driver: ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"],
  trip: ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"],
  maintenance: ["OPEN", "CLOSED"],
};

const statusOptionMap = Object.entries(statusOptions).reduce<Record<string, Option[]>>((acc, [key, values]) => {
  acc[key] = values.map((value) => ({ label: value.replaceAll("_", " "), value }));
  return acc;
}, {});

const documentTypeOptions = [
  "VEHICLE_INSURANCE",
  "VEHICLE_REGISTRATION",
  "VEHICLE_PERMIT",
  "VEHICLE_FITNESS_CERT",
  "DRIVER_LICENSE",
].map((value) => ({ label: value.replaceAll("_", " "), value }));

const entityTypeOptions = ["VEHICLE", "DRIVER"].map((value) => ({ label: value, value }));

const configs: Record<string, ResourceConfig> = {
  vehicles: {
    title: "Vehicles",
    description: "Create, filter, update, and retire fleet assets with live status and capacity data.",
    endpoint: "/api/vehicles",
    collectionKey: "vehicles",
    createTitle: "Add vehicle",
    createPermission: "vehicles:create",
    searchPlaceholder: "Registration, name, or type",
    fields: [
      { key: "registrationNo", label: "Registration No", required: true },
      { key: "name", label: "Name / Model", required: true },
      { key: "type", label: "Type", required: true, placeholder: "Van, Truck, Trailer" },
      { key: "maxLoadCapacity", label: "Max Load", type: "number", required: true },
      { key: "odometer", label: "Odometer", type: "number" },
      { key: "acquisitionCost", label: "Acquisition Cost", type: "number" },
      { key: "status", label: "Status", type: "select", options: statusOptionMap.vehicle },
    ],
    filters: [{ key: "status", label: "Status", type: "select", options: statusOptionMap.vehicle }],
    columns: [
      { key: "registrationNo", label: "Registration" },
      { key: "name", label: "Name" },
      { key: "type", label: "Type" },
      { key: "status", label: "Status", type: "status" },
      { key: "maxLoadCapacity", label: "Max Load", type: "number" },
      { key: "odometer", label: "Odometer", type: "number" },
      { key: "acquisitionCost", label: "Acq. Cost", type: "currency" },
    ],
    updateMethod: "PUT",
    deleteLabel: "Retire",
  },
  drivers: {
    title: "Drivers",
    description: "Manage driver identity, license validity, safety score, and duty status.",
    endpoint: "/api/drivers",
    collectionKey: "drivers",
    createTitle: "Add driver",
    createPermission: "drivers:create",
    searchPlaceholder: "Name, license, or phone",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "licenseNumber", label: "License No", required: true },
      { key: "licenseCategory", label: "License Category", required: true },
      { key: "licenseExpiry", label: "License Expiry", type: "date", required: true },
      { key: "contactNumber", label: "Contact Number", required: true },
      { key: "safetyScore", label: "Safety Score", type: "number" },
      { key: "status", label: "Status", type: "select", options: statusOptionMap.driver },
    ],
    filters: [{ key: "status", label: "Status", type: "select", options: statusOptionMap.driver }],
    columns: [
      { key: "name", label: "Name" },
      { key: "licenseNumber", label: "License" },
      { key: "licenseCategory", label: "Class" },
      { key: "licenseExpiry", label: "Expiry", type: "date" },
      { key: "contactNumber", label: "Contact" },
      { key: "safetyScore", label: "Safety", type: "number" },
      { key: "status", label: "Status", type: "status" },
    ],
    updateMethod: "PUT",
    deleteLabel: "Suspend",
  },
  trips: {
    title: "Trips",
    description: "Create trips, dispatch valid drafts, complete active runs, and cancel when needed.",
    endpoint: "/api/trips",
    collectionKey: "trips",
    createTitle: "Create trip",
    createPermission: "trips:create",
    searchPlaceholder: "Source or destination",
    fields: [
      { key: "source", label: "Source", required: true },
      { key: "destination", label: "Destination", required: true },
      { key: "cargoWeight", label: "Cargo Weight", type: "number", required: true },
      { key: "plannedDistance", label: "Planned Distance", type: "number", required: true },
      { key: "vehicleId", label: "Vehicle", type: "select", optionSource: "vehicles", required: true },
      { key: "driverId", label: "Driver", type: "select", optionSource: "drivers", required: true },
    ],
    filters: [{ key: "status", label: "Status", type: "select", options: statusOptionMap.trip }],
    columns: [
      { key: "source", label: "Source" },
      { key: "destination", label: "Destination" },
      { key: "vehicle.name", label: "Vehicle" },
      { key: "driver.name", label: "Driver" },
      { key: "cargoWeight", label: "Cargo", type: "number" },
      { key: "status", label: "Status", type: "status" },
    ],
    updateMethod: "PATCH",
    deleteLabel: "Delete",
  },
  maintenance: {
    title: "Maintenance",
    description: "Open shop records, track cost and odometer, and close maintenance back to availability.",
    endpoint: "/api/maintenance",
    collectionKey: "logs",
    createTitle: "Open maintenance",
    createPermission: "maintenance:create",
    fields: [
      { key: "vehicleId", label: "Vehicle", type: "select", optionSource: "vehicles", required: true },
      { key: "type", label: "Maintenance Type", required: true },
      { key: "cost", label: "Cost", type: "number", required: true },
      { key: "date", label: "Date", type: "date" },
      { key: "odometer", label: "Odometer", type: "number", required: true },
      { key: "notes", label: "Notes" },
      { key: "status", label: "Status", type: "select", options: statusOptionMap.maintenance },
    ],
    filters: [{ key: "status", label: "Status", type: "select", options: statusOptionMap.maintenance }],
    columns: [
      { key: "vehicle.name", label: "Vehicle" },
      { key: "type", label: "Type" },
      { key: "cost", label: "Cost", type: "currency" },
      { key: "date", label: "Date", type: "date" },
      { key: "odometer", label: "Odometer", type: "number" },
      { key: "status", label: "Status", type: "status" },
    ],
    updateMethod: "PUT",
    deleteLabel: "Delete",
  },
  documents: {
    title: "Documents",
    description: "Add compliance document records, expiry dates, versions, and source URLs.",
    endpoint: "/api/documents",
    collectionKey: "documents",
    createTitle: "Add document",
    createPermission: "documents:create",
    fields: [
      { key: "entityType", label: "Entity Type", type: "select", options: entityTypeOptions, required: true },
      { key: "entityId", label: "Entity", type: "select", entityOption: true, required: true },
      { key: "type", label: "Document Type", type: "select", options: documentTypeOptions, required: true },
      { key: "fileUrl", label: "File URL", required: true },
      { key: "expiryDate", label: "Expiry Date", type: "date" },
    ],
    filters: [
      { key: "entityType", label: "Entity Type", type: "select", options: entityTypeOptions },
      { key: "type", label: "Document Type", type: "select", options: documentTypeOptions },
    ],
    columns: [
      { key: "entityType", label: "Entity", type: "status" },
      { key: "entityId", label: "Entity ID" },
      { key: "type", label: "Type" },
      { key: "version", label: "Version", type: "number" },
      { key: "expiryDate", label: "Expiry", type: "date" },
      { key: "uploadedBy.name", label: "Uploaded By" },
    ],
    lookupSources: ["vehicles", "drivers"],
    deleteLabel: "Delete",
  },
};

export function OperationsWorkspace({ module }: { module: keyof typeof configs }) {
  const config = configs[module];
  return (
    <DashboardLayout>
      <ResourcePanel config={config} />
    </DashboardLayout>
  );
}

export function FuelExpensesWorkspace() {
  return (
    <DashboardLayout>
      <Tabs defaultValue="fuel" className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel & Expenses</h1>
          <p className="text-muted-foreground">Capture fuel logs and operating expenses against vehicles and trips.</p>
        </div>
        <TabsList>
          <TabsTrigger value="fuel">Fuel logs</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="fuel">
          <ResourcePanel
            config={{
              title: "Fuel logs",
              description: "Record liters, cost, odometer readings, and optional trip association.",
              endpoint: "/api/fuel-expenses",
              collectionKey: "logs",
              createTitle: "Add fuel log",
              createPermission: "fuel:create",
              fields: [
                { key: "vehicleId", label: "Vehicle", type: "select", optionSource: "vehicles", required: true },
                { key: "tripId", label: "Trip", type: "select", optionSource: "trips" },
                { key: "liters", label: "Liters", type: "number", required: true },
                { key: "cost", label: "Cost", type: "number", required: true },
                { key: "date", label: "Date", type: "date" },
                { key: "odometer", label: "Odometer", type: "number", required: true },
              ],
              filters: [{ key: "vehicleId", label: "Vehicle", type: "select", optionSource: "vehicles" }],
              columns: [
                { key: "vehicle.name", label: "Vehicle" },
                { key: "trip.source", label: "Trip Source" },
                { key: "liters", label: "Liters", type: "number" },
                { key: "cost", label: "Cost", type: "currency" },
                { key: "date", label: "Date", type: "date" },
                { key: "odometer", label: "Odometer", type: "number" },
              ],
            }}
          />
        </TabsContent>
        <TabsContent value="expenses">
          <ResourcePanel
            config={{
              title: "Expenses",
              description: "Track tolls, permits, and other operating costs.",
              endpoint: "/api/expenses",
              collectionKey: "expenses",
              createTitle: "Add expense",
              createPermission: "expenses:create",
              fields: [
                { key: "vehicleId", label: "Vehicle", type: "select", optionSource: "vehicles" },
                { key: "tripId", label: "Trip", type: "select", optionSource: "trips" },
                { key: "type", label: "Expense Type", required: true },
                { key: "amount", label: "Amount", type: "number", required: true },
                { key: "date", label: "Date", type: "date", required: true },
                { key: "description", label: "Description" },
              ],
              columns: [
                { key: "type", label: "Type" },
                { key: "amount", label: "Amount", type: "currency" },
                { key: "vehicle.name", label: "Vehicle" },
                { key: "trip.source", label: "Trip Source" },
                { key: "date", label: "Date", type: "date" },
                { key: "createdBy.name", label: "Created By" },
              ],
            }}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

export function ReportsWorkspace() {
  const [report, setReport] = useState<Row | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadReport() {
    setError("");
    try {
      const response = await fetch("/api/reports", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load report");
      setReport(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load report");
    }
  }

  useEffect(() => {
    startTransition(() => {
      void loadReport();
    });
  }, []);

  const summary = (report?.summary ?? {}) as Row;

  function exportCsv() {
    const rows = Object.entries(summary).map(([key, value]) => `${key},${value ?? ""}`).join("\n");
    const blob = new Blob([`metric,value\n${rows}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transitops-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Live DB-backed fleet, cost, and trip summaries.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void loadReport()} disabled={isPending}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={exportCsv} disabled={!report}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        {error && <Message error={error} />}
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(summary).map(([key, value]) => (
            <Card key={key}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{key.replaceAll(/([A-Z])/g, " $1")}</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums">{formatCell(value, key.includes("Cost") ? "currency" : "number")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ResourcePanel({ config }: { config: ResourceConfig }) {
  const { data: session } = useSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Row>({});
  const [filters, setFilters] = useState<Row>({});
  const [lookups, setLookups] = useState<LookupState>({ vehicles: [], drivers: [], trips: [] });
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [, startTransition] = useTransition();

  const allFields = useMemo(() => [...config.fields, ...(config.filters ?? [])], [config.fields, config.filters]);
  const canCreate = !config.createPermission || hasPermission(session?.user?.role, config.createPermission);
  const filteredLookups = useMemo(() => {
    if (config.collectionKey !== "trips") return lookups;

    const cargoWeight = Number(form.cargoWeight);
    if (!Number.isFinite(cargoWeight) || cargoWeight <= 0) return lookups;

    return {
      ...lookups,
      vehicles: lookups.vehicles.filter((vehicle) => {
        if (vehicle.maxLoadCapacity === undefined) return false;
        return vehicle.maxLoadCapacity >= cargoWeight;
      }),
    };
  }, [config.collectionKey, form.cargoWeight, lookups]);

  const loadLookups = useCallback(async () => {
    const needs = new Set([
      ...allFields.map((field) => field.optionSource).filter(Boolean),
      ...(config.lookupSources ?? []),
    ]);
    const entries = await Promise.all(
      [...needs].map(async (source) => {
        const endpoint = source === "vehicles" ? "/api/vehicles?limit=100" : source === "drivers" ? "/api/drivers?limit=100" : "/api/trips?limit=100";
        const response = await fetch(endpoint, { cache: "no-store" });
        const data = await response.json();
        const collection = source === "vehicles" ? data.vehicles : source === "drivers" ? data.drivers : data.trips;
        if (!response.ok || !Array.isArray(collection)) {
          return [source, []] as const;
        }

        const options = collection.map((item: Row) => ({
          value: String(item.id),
          maxLoadCapacity: source === "vehicles" ? Number(item.maxLoadCapacity ?? Number.NaN) : undefined,
          label:
            source === "vehicles"
              ? `${String(item.registrationNo ?? "")} ${String(item.name ?? "")}`.trim()
              : source === "drivers"
                ? String(item.name ?? item.id)
                : `${String(item.source ?? "")} -> ${String(item.destination ?? "")}`.trim(),
        }));
        return [source, options] as const;
      })
    );
    setLookups((current) => ({ ...current, ...Object.fromEntries(entries) }));
  }, [allFields, config.lookupSources]);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      await loadLookups();
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, String(value));
      });
      const response = await fetch(`${config.endpoint}?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to load ${config.title}`);
      setRows((data[config.collectionKey] ?? []) as Row[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : `Failed to load ${config.title}`);
    } finally {
      setIsLoading(false);
    }
  }, [config.collectionKey, config.endpoint, config.title, filters, loadLookups, search]);

  useEffect(() => {
    startTransition(() => {
      void loadRows();
    });
  }, [loadRows]);

  async function createRow(event: FormEvent) {
    event.preventDefault();
    setIsCreating(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Create failed");
      setForm({});
      setMessage(`${config.createTitle} succeeded`);
      await loadRows();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Create failed");
    } finally {
      setIsCreating(false);
    }
  }

  async function updateRow(row: Row, patch: Row) {
    if (!row.id || !config.updateMethod) return;
    setBusyId(String(row.id));
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${config.endpoint}/${row.id}`, {
        method: config.updateMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");
      setMessage("Update succeeded");
      await loadRows();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Update failed");
    } finally {
      setBusyId("");
    }
  }

  async function deleteRow(row: Row) {
    if (!row.id || !config.deleteLabel) return;
    if (!window.confirm(`${config.deleteLabel} this record?`)) return;
    setBusyId(String(row.id));
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${config.endpoint}/${row.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");
      setMessage(`${config.deleteLabel} succeeded`);
      await loadRows();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <Button variant="outline" onClick={() => void loadRows()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {(message || error) && <Message message={message} error={error} />}

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {config.createTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createRow} className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
              {config.fields.map((field) => {
                const resolvedField = resolveField(field, form);
                return (
                  <FieldControl
                    key={field.key}
                    field={resolvedField}
                    value={form[field.key]}
                    lookups={filteredLookups}
                    onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
                  />
                );
              })}
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={config.searchPlaceholder ?? "Search"}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(config.filters ?? []).map((field) => (
                <div key={field.key} className="w-48">
                  <FieldControl
                    compact
                    field={field}
                    value={filters[field.key]}
                    lookups={lookups}
                    onChange={(value) => setFilters((current) => ({ ...current, [field.key]: value }))}
                  />
                </div>
              ))}
              <Button onClick={() => void loadRows()}>
                Apply
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading {config.title.toLowerCase()}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {config.columns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={String(row.id ?? JSON.stringify(row))}>
                    {config.columns.map((column) => (
                      <TableCell key={column.key}>{renderCell(getPath(row, column.key), column.type)}</TableCell>
                    ))}
                    <TableCell>
                      <RowActions
                        row={row}
                        config={config}
                        busy={busyId === String(row.id)}
                        onUpdate={updateRow}
                        onDelete={deleteRow}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FieldControl({
  field,
  value,
  lookups,
  onChange,
  compact,
}: {
  field: Field;
  value: unknown;
  lookups: LookupState;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const options = field.options ?? (field.optionSource ? lookups[field.optionSource] : undefined);
  const id = `${field.key}-${field.label}`;
  return (
    <div className={compact ? "" : "space-y-2"}>
      {!compact && <Label htmlFor={id}>{field.label}</Label>}
      {field.type === "select" ? (
        <Select value={String(value || noneValue)} onValueChange={(next) => onChange(next === noneValue ? "" : next)}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={field.label} />
          </SelectTrigger>
          <SelectContent>
            {!field.required && <SelectItem value={noneValue}>None</SelectItem>}
            {(options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={field.type ?? "text"}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder ?? field.label}
          required={field.required}
        />
      )}
    </div>
  );
}

function resolveField(field: Field, form: Row): Field {
  if (!field.entityOption) return field;

  const entityType = form.entityType === "DRIVER" ? "drivers" : "vehicles";
  return {
    ...field,
    optionSource: entityType,
  };
}

function RowActions({
  row,
  config,
  busy,
  onUpdate,
  onDelete,
}: {
  row: Row;
  config: ResourceConfig;
  busy: boolean;
  onUpdate: (row: Row, patch: Row) => Promise<void>;
  onDelete: (row: Row) => Promise<void>;
}) {
  const status = String(row.status ?? "");
  return (
    <div className="flex justify-end gap-2">
      {config.title === "Trips" && status === "DRAFT" && (
        <Button size="sm" onClick={() => void onUpdate(row, { status: "DISPATCHED" })} disabled={busy}>
          Dispatch
        </Button>
      )}
      {config.title === "Trips" && status === "DISPATCHED" && (
        <Button size="sm" onClick={() => void onUpdate(row, { status: "COMPLETED", completedAt: new Date().toISOString() })} disabled={busy}>
          Complete
        </Button>
      )}
      {config.title === "Maintenance" && status === "OPEN" && (
        <Button size="sm" onClick={() => void onUpdate(row, { status: "CLOSED" })} disabled={busy}>
          <Save className="mr-2 h-4 w-4" />
          Close
        </Button>
      )}
      {config.title === "Trips" && status !== "COMPLETED" && status !== "CANCELLED" && (
        <Button size="sm" variant="outline" onClick={() => void onUpdate(row, { status: "CANCELLED" })} disabled={busy}>
          Cancel
        </Button>
      )}
      {config.deleteLabel && (
        <Button size="sm" variant="destructive" onClick={() => void onDelete(row)} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          {config.deleteLabel}
        </Button>
      )}
    </div>
  );
}

function Message({ message, error }: { message?: string; error?: string }) {
  return (
    <div className={`rounded-md border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
      {error || message}
    </div>
  );
}

function getPath(row: Row, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) {
      return (value as Row)[key];
    }
    return undefined;
  }, row);
}

function renderCell(value: unknown, type?: Column["type"]) {
  if (type === "status") {
    return <Badge variant="outline" className="rounded-md">{String(value ?? "-").replaceAll("_", " ")}</Badge>;
  }
  return formatCell(value, type);
}

function formatCell(value: unknown, type?: Column["type"]) {
  if (value === null || value === undefined || value === "") return "-";
  if (type === "date") return formatDate(String(value));
  if (type === "currency") return formatCurrency(Number(value));
  if (type === "number") return new Intl.NumberFormat("en-US").format(Number(value));
  return String(value).replaceAll("_", " ");
}
