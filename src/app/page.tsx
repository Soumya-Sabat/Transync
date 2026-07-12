import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  FileText,
  Fuel,
  Gauge,
  MapPin,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const metrics = [
  { label: "Active vehicles", value: "42", trend: "+5%" },
  { label: "On-time trips", value: "91%", trend: "+8%" },
  { label: "Cost visibility", value: "$125k", trend: "-2%" },
  { label: "Open maintenance", value: "5", trend: "1 urgent" },
];

const operations = [
  {
    icon: Truck,
    title: "Fleet registry",
    copy: "Track load capacity, odometer, acquisition cost, documents, and live availability from one dense operating view.",
  },
  {
    icon: MapPin,
    title: "Dispatch control",
    copy: "Block overloaded cargo, expired-license assignments, and double-booked vehicles before a trip can leave draft.",
  },
  {
    icon: Wrench,
    title: "Maintenance flow",
    copy: "Opening a maintenance log removes the vehicle from dispatch automatically, then returns it when the job closes.",
  },
  {
    icon: Fuel,
    title: "Fuel and expense tracking",
    copy: "Capture fuel, tolls, maintenance cost, and operational spend against trips and vehicles for usable reporting.",
  },
];

const rules = [
  "No retired or in-shop vehicles in dispatch",
  "No suspended or expired-license drivers",
  "No vehicle or driver double-booking",
  "Cargo weight checked against max load",
  "Status transitions logged for audit context",
];

const tableRows = [
  ["Van-05", "On Trip", "John Smith", "Warehouse A -> Client Site B", "08:00"],
  ["Truck-01", "Available", "Unassigned", "Distribution Center", "Ready"],
  ["Van-02", "In Shop", "Maintenance", "Brake inspection", "3h"],
  ["Truck-03", "Available", "Unassigned", "Port Terminal", "Ready"],
];

const statusClass: Record<string, string> = {
  "On Trip": "border-blue-200 bg-blue-50 text-blue-700",
  Available: "border-green-200 bg-green-50 text-green-700",
  "In Shop": "border-amber-200 bg-amber-50 text-amber-700",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="h-5 w-5" />
            </span>
            <span className="text-lg">TransitOps</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#operations" className="hover:text-foreground">Operations</a>
            <a href="#controls" className="hover:text-foreground">Controls</a>
            <a href="#analytics" className="hover:text-foreground">Analytics</a>
          </nav>
          <Button asChild>
            <Link href="/login">
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="border-b">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="mb-5 w-fit rounded-md border-primary/30 bg-primary/5 text-primary">
              Fleet operations management
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              Run dispatch, maintenance, compliance, and fleet cost from one operating desk.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              TransitOps replaces spreadsheet coordination with role-based workflows, enforced dispatch rules, document expiry reminders, and real-time cost visibility for transport teams.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">
                  Open workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#operations">View operating model</a>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Server-side RBAC
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Expiry reminders
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                KPI visibility
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Fleet command center</p>
                  <p className="text-xs text-muted-foreground">Live dispatch and compliance view</p>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-md border bg-background p-3">
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <p className="text-2xl font-semibold tabular-nums">{metric.value}</p>
                      <span className="text-xs text-primary">{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 border-t p-4 lg:grid-cols-[1fr_0.78fr]">
                <div className="rounded-md border bg-background">
                  <div className="flex items-center justify-between border-b px-3 py-2">
                    <p className="text-sm font-medium">Dispatch board</p>
                    <span className="text-xs text-muted-foreground">Sortable, filtered rows</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-muted/50 text-xs text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">Vehicle</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 font-medium">Driver</th>
                          <th className="px-3 py-2 font-medium">Route / Job</th>
                          <th className="px-3 py-2 font-medium">ETA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map(([vehicle, status, driver, route, eta]) => (
                          <tr key={vehicle} className="border-t">
                            <td className="px-3 py-3 font-medium">{vehicle}</td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex rounded-md border px-2 py-1 text-xs ${statusClass[status]}`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{driver}</td>
                            <td className="px-3 py-3 text-muted-foreground">{route}</td>
                            <td className="px-3 py-3 text-muted-foreground">{eta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-md border bg-background p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium">Utilization</p>
                      <span className="text-xs text-muted-foreground">7 months</span>
                    </div>
                    <div className="flex h-36 items-end gap-2">
                      {[64, 68, 72, 70, 76, 79, 82].map((height, index) => (
                        <div key={index} className="flex flex-1 flex-col items-center gap-2">
                          <div
                            className="w-full rounded-t-sm bg-primary"
                            style={{ height: `${height}%`, opacity: 0.45 + index * 0.07 }}
                          />
                          <span className="text-[10px] text-muted-foreground">{["J", "F", "M", "A", "M", "J", "J"][index]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-md border bg-background p-4">
                    <p className="text-sm font-medium">Expiry alerts</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Vehicle insurance</span>
                        <Badge variant="warning">8 days</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Driver license</span>
                        <Badge variant="danger">3 days</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="operations" className="border-b py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">Operating model</p>
            <h2 className="mt-3 text-3xl font-semibold">Built around the full transport lifecycle.</h2>
            <p className="mt-3 text-muted-foreground">
              Vehicle registry, driver readiness, trip dispatch, maintenance, fuel, expenses, analytics, and document reminders all live in the same workflow.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {operations.map((item) => (
              <article key={item.title} className="rounded-lg border bg-card p-5">
                <item.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="controls" className="border-b bg-muted/25 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-medium text-primary">Business rules</p>
            <h2 className="mt-3 text-3xl font-semibold">Dispatch checks enforced before work reaches the road.</h2>
            <p className="mt-4 text-muted-foreground">
              TransitOps treats constraints as backend rules, not form hints. The result is fewer preventable dispatch failures and cleaner audit history.
            </p>
          </div>
          <div className="grid gap-3">
            {rules.map((rule) => (
              <div key={rule} className="flex items-center gap-3 rounded-md border bg-card p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="analytics" className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="rounded-lg border bg-card p-6">
            <Gauge className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-semibold">Fleet utilization</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Track availability, active trips, downtime, and utilization trends without rebuilding spreadsheets every week.</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-semibold">Reports and exports</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Prepare cost, fuel efficiency, ROI, and dispatch artifacts for finance, safety, and fleet stakeholders.</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-semibold">Role-based workspaces</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Fleet managers, drivers, safety officers, and financial analysts see the tools and data they are allowed to use.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
