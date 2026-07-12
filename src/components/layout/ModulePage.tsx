import Link from "next/link";
import { ArrowRight, Database, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

type ModulePageProps = {
  title: string;
  description: string;
  primaryAction: string;
  apiPath: string;
  features: string[];
};

export function ModulePage({ title, description, primaryAction, apiPath, features }: ModulePageProps) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 rounded-md">Workspace</Badge>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href={apiPath}>
                {primaryAction}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Available controls
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="rounded-md border bg-background p-4 text-sm">
                  {feature}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                API endpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The backend route for this workspace is available and protected by RBAC.
              </p>
              <code className="block rounded-md border bg-muted p-3 text-sm">{apiPath}</code>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
