"use client";

import Link from "next/link";
import { trackEvent, fbqTrackCustom } from "@/lib/analytics";

/**
 * The respondent-conversion CTA — the second engine of the viral loop.
 * Points straight into the quiz-first funnel (/start) and tracks
 * click-through so the viral coefficient is measurable.
 */
export function CreateYourOwnCta({ slug }: { slug: string }) {
  return (
    <Link
      href="/start?ref=respondent"
      onClick={() => {
        trackEvent("respondent_cta_clicked", { from_quiz: slug });
        fbqTrackCustom("RespondentCta");
      }}
      className="gradient-brand mt-2 inline-block rounded-full px-12 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
    >
      Create Your Own Quiz
    </Link>
  );
}
