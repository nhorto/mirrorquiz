"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function CheckoutButton({ quizId }: { quizId: string }) {
  return (
    <Link
      href={`/dashboard/${quizId}/report`}
      onClick={() => trackEvent("checkout_started", { quizId })}
      className="mt-4 inline-block rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Unlock Full Report — $7.99
    </Link>
  );
}
