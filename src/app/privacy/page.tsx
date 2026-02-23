import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — MirrorQuiz",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Home
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: February 2026
      </p>

      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            What We Collect
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Quiz creators:</strong> Email address (for login via magic
              link), quiz responses, and session data (IP address and browser
              type, used for security).
            </li>
            <li>
              <strong>Friend respondents:</strong> Optional display name, quiz
              responses, a hashed identifier derived from your IP address and
              browser (used solely to prevent duplicate submissions), and a
              browser cookie for deduplication (see Cookies section below). No
              account or email is required.
            </li>
            <li>
              <strong>Everyone:</strong> If you accept analytics cookies, we
              collect anonymized usage data (page views, feature usage) via
              PostHog. No analytics data is collected if you decline cookies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            How We Use It
          </h2>
          <p>
            Your data is used solely to generate perception comparison results
            and to operate the service. We do not sell, share, or monetize your
            personal data. Quiz responses are only visible to the quiz creator
            in aggregate form. Individual friend responses are never attributed
            to identifiable individuals.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Cookies
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Essential cookies:</strong> Authentication session cookies
              (for logged-in users) and a respondent deduplication cookie
              ({`"pq_respondent"`}, lasts up to 1 year, HTTP-only). These are
              strictly necessary for the service to function and do not require
              consent.
            </li>
            <li>
              <strong>Analytics cookies:</strong> If you accept, PostHog sets a
              cookie and localStorage entry to track anonymized usage. You can
              decline analytics cookies via the banner shown on your first visit,
              and no analytics data will be collected.
            </li>
          </ul>
          <p className="mt-2">
            No third-party advertising cookies are used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Data Storage
          </h2>
          <p>
            Data is stored on Cloudflare&apos;s global network (D1 database).
            Payment processing is handled by Stripe &mdash; we never store your
            card details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Access</strong> the personal data we hold about you.
            </li>
            <li>
              <strong>Delete</strong> your account and all associated data.
            </li>
            <li>
              <strong>Opt out</strong> of analytics tracking by declining
              cookies or clearing your browser&apos;s cookies and localStorage.
            </li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, email{" "}
            <a
              href="mailto:support@mirrorquiz.com"
              className="text-primary hover:underline"
            >
              support@mirrorquiz.com
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a
              href="mailto:support@mirrorquiz.com"
              className="text-primary hover:underline"
            >
              support@mirrorquiz.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
