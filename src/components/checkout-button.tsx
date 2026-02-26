"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function CheckoutButton({ quizId }: { quizId: string }) {
  return (
    <Link
      href={`/api/stripe/checkout?quizId=${quizId}`}
      onClick={() => trackEvent("checkout_started", { quizId })}
      className="gradient-brand mt-6 inline-block rounded-full px-10 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
    >
      Unlock Full Report — $7.99
    </Link>
  );
}
