import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.user.name?.trim()) redirect("/onboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            Mirror<span className="gradient-brand-text">Quiz</span>
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:block">
            {session.user.name}
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
