import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
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

        <h1 className="text-3xl font-bold">Thanks!</h1>
        <p className="mt-3 text-muted-foreground">
          Your answers have been recorded anonymously. The quiz creator will be
          notified.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="inline-block rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create Your Own Quiz
          </Link>
          <p className="text-sm text-muted-foreground">
            Curious how others see <em>you</em>?
          </p>
        </div>
      </div>
    </div>
  );
}
