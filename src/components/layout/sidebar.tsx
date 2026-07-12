"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { getNavItemsForRole } from "@/lib/navigation";
import { useTheme } from "next-themes";
import { LayoutDashboard, Truck, Users, MapPin, Wrench, Fuel, BarChart3, FileText, LogOut, X, ChevronRight, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { SUPER_ADMIN_ROLE } from "@/lib/roles";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard,
    Truck,
    Users,
    MapPin,
    Wrench,
    Fuel,
    BarChart3,
    FileText,
    Settings,
    User,
  };

  const navItems = getNavItemsForRole(session?.user.role ?? SUPER_ADMIN_ROLE);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X className="h-5 w-5" />
      </Button>

      <aside
        id="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex h-14 items-center justify-between border-b px-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold">
              <Truck className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline">TransitOps</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3" role="navigation" aria-label="Main">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = icons[item.icon] || Truck;
              
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
                  onClick={onClose}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 border-t p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            </div>

            <Separator />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left truncate">
                    <p className="text-sm font-medium">User</p>
                    <p className="text-xs text-muted-foreground capitalize">Fleet Manager</p>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  user@example.com
                </div>
                <Separator className="my-1" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" onClick={onClose}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" onClick={onClose}>Settings</Link>
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
