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
      <TrackEvent event="purchase_completed" properties={{ quizId }} />
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <svg
            className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold">Payment successful!</h1>
        <p className="mt-3 text-muted-foreground">
          Your detailed report is now unlocked. Discover your blind spots and
          hidden strengths.
        </p>

        <Link
          href={`/dashboard/${quizId}/report`}
          className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View Your Report
        </Link>
      </div>
    </div>
  );
}
