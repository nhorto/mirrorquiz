"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function OnboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      await authClient.updateUser({ name: trimmed });
      router.push("/dashboard");
    } catch {
      setError("Failed to save your name. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="relative w-full max-w-sm">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-fuchsia/20 blur-3xl" />

        <div className="relative rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="text-center">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Mirror<span className="gradient-brand-text">Quiz</span>
            </Link>
            <h1 className="mt-6 text-2xl font-bold">One last thing</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              What should we call you? This shows up on your quiz so friends know
              who they&rsquo;re answering about.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your first name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                maxLength={50}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full gradient-brand text-white border-0" disabled={loading || !name.trim()}>
              {loading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
