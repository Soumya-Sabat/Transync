import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SuperAdminUsers } from "@/components/super-admin/SuperAdminUsers";
import { requireSuperAdmin } from "@/lib/rbac";

export default async function SuperAdminPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
          <p className="text-muted-foreground">
            Manage platform users, assign roles, and access every operational workspace.
          </p>
        </div>
        <SuperAdminUsers />
      </div>
    </DashboardLayout>
  );
}
