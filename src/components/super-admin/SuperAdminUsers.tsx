"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { AlertCircle, Loader2, RefreshCw, Save, Shield, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { dbRoles, formatRole, type DbRole } from "@/lib/roles";

type ManagedUser = {
  id: string;
  email: string;
  name: string;
  role: DbRole;
  createdAt: string;
  updatedAt: string;
};

type EditableUser = ManagedUser & {
  draftName: string;
  draftRole: DbRole;
  draftPassword: string;
};

type CreateForm = {
  name: string;
  email: string;
  password: string;
  role: DbRole;
};

const emptyCreateForm: CreateForm = {
  name: "",
  email: "",
  password: "",
  role: "FLEET_MANAGER",
};

export function SuperAdminUsers() {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const totals = useMemo(() => {
    return dbRoles.map((role) => ({
      role,
      count: users.filter((user) => user.role === role).length,
    }));
  }, [users]);

  async function loadUsers() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/super-admin/users", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load users");
      setUsers(
        data.users.map((user: ManagedUser) => ({
          ...user,
          draftName: user.name,
          draftRole: user.role,
          draftPassword: "",
        }))
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => {
      void loadUsers();
    });
  }, []);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setIsCreating(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/super-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create user");
      setCreateForm(emptyCreateForm);
      setMessage(`Created ${data.user.email}`);
      await loadUsers();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  }

  async function updateUser(user: EditableUser) {
    setBusyUserId(user.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/super-admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: user.draftName,
          role: user.draftRole,
          password: user.draftPassword || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update user");
      setMessage(`Updated ${data.user.email}`);
      await loadUsers();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update user");
    } finally {
      setBusyUserId(null);
    }
  }

  async function deleteUser(user: EditableUser) {
    const confirmed = window.confirm(`Delete ${user.email}? This cannot be undone.`);
    if (!confirmed) return;

    setBusyUserId(user.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/super-admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete user");
      setMessage(`Deleted ${user.email}`);
      await loadUsers();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete user");
    } finally {
      setBusyUserId(null);
    }
  }

  function patchUser(id: string, patch: Partial<EditableUser>) {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {totals.map(({ role, count }) => (
          <Card key={role}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{formatRole(role)}</p>
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(message || error) && (
        <div
          className={`flex items-center gap-2 rounded-md border p-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          {error || message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Create user
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="grid gap-4 md:grid-cols-[1fr_1.2fr_1fr_1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                value={createForm.name}
                onChange={(event) => setCreateForm((form) => ({ ...form, name: event.target.value }))}
                placeholder="Fleet Manager"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={createForm.email}
                onChange={(event) => setCreateForm((form) => ({ ...form, email: event.target.value }))}
                placeholder="user@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={createForm.password}
                onChange={(event) => setCreateForm((form) => ({ ...form, password: event.target.value }))}
                placeholder="8+ characters"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(role) => setCreateForm((form) => ({ ...form, role: role as DbRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dbRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Users</CardTitle>
          <Button variant="outline" size="sm" onClick={() => void loadUsers()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading users
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Password reset</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          value={user.draftName}
                          onChange={(event) => patchUser(user.id, { draftName: event.target.value })}
                          aria-label={`Name for ${user.email}`}
                        />
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={user.draftRole} onValueChange={(role) => patchUser(user.id, { draftRole: role as DbRole })}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dbRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {formatRole(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Badge variant="outline" className="mt-2 rounded-md">
                        Current: {formatRole(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Input
                        type="password"
                        value={user.draftPassword}
                        onChange={(event) => patchUser(user.id, { draftPassword: event.target.value })}
                        placeholder="Leave blank"
                        aria-label={`New password for ${user.email}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => void updateUser(user)} disabled={busyUserId === user.id}>
                          {busyUserId === user.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void deleteUser(user)}
                          disabled={busyUserId === user.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
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
