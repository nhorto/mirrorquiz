"use client";

import { useState } from "react";
import { trackEvent, fbqTrackCustom } from "@/lib/analytics";

/**
 * "Share to story / Download" for the generated result-card image.
 * Instagram has no share-URL intent, so the mechanic is: generate a PNG,
 * hand it to the native share sheet (Web Share API Level 2 with files),
 * and fall back to a download where that's unsupported.
 */
export function ShareResultCard({ quizId }: { quizId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCard(): Promise<File> {
    const res = await fetch(`/api/share-card?quizId=${quizId}`);
    if (!res.ok) throw new Error("Failed to generate image");
    const blob = await res.blob();
    return new File([blob], "mirrorquiz-results.png", { type: "image/png" });
  }

  async function handleShare() {
    setBusy(true);
    setError(null);
    try {
      const file = await fetchCard();

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "My MirrorQuiz results",
            text: "How well do you actually know me? Rate me anonymously:",
          });
          trackEvent("share_card_shared", { quizId, method: "native_share" });
          fbqTrackCustom("ShareCard");
          return;
        } catch (err) {
          // User cancelled the sheet — not an error, and don't force a download
          if (err instanceof DOMException && err.name === "AbortError") return;
          // Sharing failed for another reason — fall through to download
        }
      }

      downloadFile(file);
      trackEvent("share_card_shared", { quizId, method: "download" });
      fbqTrackCustom("ShareCard");
    } catch {
      setError("Couldn't create your share image. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    setBusy(true);
    setError(null);
    try {
      downloadFile(await fetchCard());
      trackEvent("share_card_shared", { quizId, method: "download" });
      fbqTrackCustom("ShareCard");
    } catch {
      setError("Couldn't create your share image. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function downloadFile(file: File) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={handleShare}
          disabled={busy}
          className="gradient-brand inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet/20 transition-transform hover:scale-105 disabled:opacity-60"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
          </svg>
          {busy ? "Creating image…" : "Share to Story"}
        </button>
        <button
          onClick={handleDownload}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-60"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        A result-card image with your radar chart and quiz link — made for
        Instagram stories.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
