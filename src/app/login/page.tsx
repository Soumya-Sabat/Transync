"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, Truck } from "lucide-react";

const assurances = [
  "Role-based access for fleet, safety, driver, and finance teams",
  "Dispatch rules enforced before trips leave draft",
  "Expiry reminders for licenses and vehicle documents",
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setFormError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <section className="hidden flex-col justify-between rounded-lg border bg-card p-8 lg:flex">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Truck className="h-5 w-5" />
              </span>
              <span className="text-lg">TransitOps</span>
            </Link>

            <div className="mt-16 max-w-xl">
              <p className="text-sm font-medium text-primary">Secure operations workspace</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">
                Keep dispatch, compliance, and fleet cost decisions under control.
              </h1>
              <p className="mt-4 leading-7 text-muted-foreground">
                Sign in to manage vehicles, drivers, trip status, maintenance, fuel spend, and document reminders from the same operating desk.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {assurances.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border bg-background p-4 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <Button asChild variant="ghost" className="mb-6 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to landing page
              </Link>
            </Button>

            <Card className="w-full">
              <CardHeader>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
                <CardDescription>Sign in to your TransitOps workspace</CardDescription>
              </CardHeader>
              <CardContent>
                {(error || formError) && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {formError || error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-1 border-t text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Demo access</span>
                <span>fleet@transitops.com / password123</span>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
