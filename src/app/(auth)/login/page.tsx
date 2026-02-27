"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") ?? "/dashboard";
  // Prevent open redirect: only allow relative paths, reject protocol-relative URLs
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await authClient.signIn.magicLink({
      email,
      callbackURL: next,
    });

    if (authError) {
      setError(authError.message ?? "Failed to send magic link");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia/20 blur-3xl" />

        <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet/10">
            <svg className="h-8 w-8 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-2 text-muted-foreground">
            We sent a sign-in link to <strong>{email}</strong>. Click the link to
            continue.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Didn&apos;t receive it?{" "}
            <button
              onClick={() => setSent(false)}
              className="text-violet font-medium underline-offset-4 hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia/20 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="text-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Mirror<span className="gradient-brand-text">Quiz</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a sign-in link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full gradient-brand text-white border-0" disabled={loading}>
            {loading ? "Sending..." : "Continue with Email"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No password needed. We&apos;ll email you a secure sign-in link.
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
