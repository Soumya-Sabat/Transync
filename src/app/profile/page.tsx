import { ModulePage } from "@/components/layout/ModulePage";

export default function ProfilePage() {
  return (
    <ModulePage
      title="Profile"
      description="View the current signed-in operator context and use the account menu to sign out or move into settings."
      primaryAction="Open settings"
      apiPath="/settings"
      features={["Session-backed identity", "Role badge display", "Protected workspace access", "Account menu controls"]}
    />
  );
}
