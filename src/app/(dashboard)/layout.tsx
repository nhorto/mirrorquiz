export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-3">
          <span className="text-lg font-bold tracking-tight">
            Mirror<span className="text-primary">Quiz</span>
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
