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
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Quiz creators:</strong> Email address (for login via magic
              link) and quiz responses.
            </li>
            <li>
              <strong>Friend respondents:</strong> Optional display name and quiz
              responses. No account or email required.
            </li>
            <li>
              <strong>Everyone:</strong> Basic analytics (page views, anonymized)
              via PostHog.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            How We Use It
          </h2>
          <p>
            Your data is used solely to generate perception comparison results.
            We do not sell, share, or monetize your personal data. Quiz responses
            are only visible to the quiz creator in aggregate form.
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
            Account Deletion
          </h2>
          <p>
            You can request complete deletion of your account and all associated
            data by emailing{" "}
            <a
              href="mailto:support@mirrorquiz.com"
              className="text-primary hover:underline"
            >
              support@mirrorquiz.com
            </a>
            . We will process deletion requests within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
          <p>
            We use essential cookies for authentication sessions and respondent
            deduplication. No third-party advertising cookies are used.
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
