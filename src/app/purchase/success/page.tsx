import Link from "next/link";
import { redirect } from "next/navigation";
import { TrackEvent } from "@/components/track-event";

interface Props {
  searchParams: Promise<{ quizId?: string }>;
}

export default async function PurchaseSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const quizId = params.quizId;

  if (!quizId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <TrackEvent
        event="purchase_completed"
        properties={{ quizId }}
        fbq={{ event: "Purchase", params: { value: 7.99, currency: "USD" } }}
      />

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative w-full max-w-md text-center">
        {/* Celebration icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet/20 to-fuchsia/20 ring-4 ring-violet/10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg
              className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">
          You&rsquo;re <span className="gradient-brand-text">in!</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your detailed report is now unlocked. Discover your perception profile,
          blind spots, hidden strengths, and more.
        </p>

        <Link
          href={`/dashboard/${quizId}/report`}
          className="gradient-brand mt-8 inline-block rounded-full px-10 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          View Your Report
        </Link>

        <p className="mt-4 text-xs text-muted-foreground">
          Your report is available anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
