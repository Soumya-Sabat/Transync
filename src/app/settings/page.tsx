import { ModulePage } from "@/components/layout/ModulePage";

export default function SettingsPage() {
  return (
    <ModulePage
      title="Settings"
      description="Review workspace preferences, theme behavior, account controls, and administration entry points."
      primaryAction="Open super admin"
      apiPath="/super-admin"
      features={["Theme toggle in top bar", "Account sign-out menu", "Role-aware navigation", "Super admin user controls"]}
    />
  );
}
