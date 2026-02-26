import type { PerceptionProfile } from "@/lib/insights";

interface PerceptionProfileCardProps {
  profile: PerceptionProfile;
}

export function PerceptionProfileCard({ profile }: PerceptionProfileCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-violet/30 bg-gradient-to-br from-violet/5 via-fuchsia/5 to-transparent p-8 text-center">
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-violet/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-fuchsia/10 blur-2xl" />

      <div className="relative">
        <span className="text-5xl">{profile.icon}</span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight gradient-brand-text">
          {profile.label}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground leading-relaxed">
          {profile.description}
        </p>
      </div>
    </div>
  );
}
