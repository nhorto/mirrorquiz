import { redirect } from "next/navigation";
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
        <div className="mx-auto max-w-5xl px-6 py-3">
          <span className="text-lg font-bold tracking-tight">
            Mirror<span className="gradient-brand-text">Quiz</span>
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
