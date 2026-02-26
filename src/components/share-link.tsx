"use client";

import { useState, useCallback, useEffect } from "react";
import { trackEvent, fbqTrackCustom } from "@/lib/analytics";

const SHARE_TEXT = "How well do you actually know me? Take this 2-min quiz and find out";

export function ShareLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = origin ? `${origin}/quiz/${slug}` : `/quiz/${slug}`;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    trackEvent("link_shared", { method: "copy", slug });
    fbqTrackCustom("ShareLink");
    setTimeout(() => setCopied(false), 2000);
  }, [url, slug]);

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title: "MirrorQuiz", text: SHARE_TEXT, url });
      trackEvent("link_shared", { method: "native_share", slug });
      fbqTrackCustom("ShareLink");
    } catch {
      // User cancelled or share failed — fall through silently
    }
  }, [url, slug]);

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${url}`)}`;
  const smsUrl = `sms:?&body=${encodeURIComponent(`${SHARE_TEXT} ${url}`)}`;

  return (
    <div className="mt-2 space-y-3">
      {/* Link + Copy */}
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-sm">
          {url}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Share buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {hasNativeShare && (
          <button
            onClick={handleNativeShare}
            className="gradient-brand inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            <ShareIcon className="h-4 w-4" />
            Share
          </button>
        )}

        <a
          href={smsUrl}
          onClick={() => trackEvent("link_shared", { method: "sms", slug })}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <MessageIcon className="h-4 w-4" />
          Text
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("link_shared", { method: "whatsapp", slug })}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp
        </a>

        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("link_shared", { method: "twitter", slug })}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <XIcon className="h-4 w-4" />
          Post
        </a>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("link_shared", { method: "facebook", slug })}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <FacebookIcon className="h-4 w-4" />
          Share
        </a>

        <a
          href={`https://www.instagram.com/`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            navigator.clipboard.writeText(url);
            trackEvent("link_shared", { method: "instagram", slug });
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          title="Link copied! Paste it in your Instagram story"
        >
          <InstagramIcon className="h-4 w-4" />
          Instagram
        </a>
      </div>
    </div>
  );
}

/* ─── Icons (inline SVGs to avoid extra dependencies) ─── */

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.01a9.876 9.876 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 012.15 12.01C2.15 6.554 6.587 2.12 12.05 2.12a9.84 9.84 0 016.963 2.887 9.83 9.83 0 012.887 6.96c-.003 5.456-4.44 9.89-9.9 9.89l.05-.072zM20.52 3.449A11.81 11.81 0 0012.05.074C5.495.074.16 5.407.157 11.96a11.834 11.834 0 001.587 5.945L0 24l6.305-1.654a11.88 11.88 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.52 3.449z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
