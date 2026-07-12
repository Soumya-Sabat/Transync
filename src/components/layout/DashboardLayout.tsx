"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Fuel,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { getRoleColor, getInitials } from "@/lib/utils";
import { AppRole, SUPER_ADMIN_ROLE, formatRole } from "@/lib/roles";
import { getNavItemsForRole } from "@/lib/navigation";

const icons = {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Fuel,
  BarChart3: FileText,
  FileText: FolderOpen,
  Settings,
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = session?.user?.role ?? SUPER_ADMIN_ROLE;
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  const filteredNav = getNavItemsForRole(userRole);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 max-w-sm">
          <SidebarContent
            filteredNav={filteredNav}
            pathname={pathname}
            userRole={userRole}
            userName={userName}
            userEmail={userEmail}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-60 lg:flex lg:flex-col">
        <SidebarContent
          filteredNav={filteredNav}
          pathname={pathname}
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full gap-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="bg-primary/20 text-primary font-medium">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getRoleColor(userRole)}`}>
                    {formatRole(userRole)}
                  </span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  filteredNav,
  pathname,
  userRole,
  userName,
  userEmail,
  onClose,
}: {
  filteredNav: ReturnType<typeof getNavItemsForRole>;
  pathname: string;
  userRole: AppRole;
  userName: string;
  userEmail: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
        <Truck className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">TransitOps</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {(() => {
                  const Icon = icons[item.icon as keyof typeof icons] ?? LayoutDashboard;
                  return <Icon className="h-4 w-4 shrink-0" />;
                })()}
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User info */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <span className={`mt-2 inline-block max-w-full truncate px-2 py-0.5 text-xs rounded-full ${getRoleColor(userRole)}`}>
          {formatRole(userRole)}
        </span>

        {onClose && (
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={onClose}
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Close Menu
          </Button>
        )}
      </div>
    </div>
  );
}
