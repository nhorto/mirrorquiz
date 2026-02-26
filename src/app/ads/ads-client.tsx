"use client";

import { useRef, useCallback, useState } from "react";
import { toPng } from "html-to-image";

/* ──────────────────────────── DATA ──────────────────────────── */

const hooks = [
  {
    name: "Identity Challenge",
    slug: "identity",
    text: "You think you know yourself.\nYour friends disagree.",
    primaryTexts: [
      "You rate yourself a 4/5 on humor. Your friends gave you a 2.1. Awkward? Maybe. Eye-opening? Definitely. MirrorQuiz shows you how others actually perceive you across 12 personality traits. Takes 3 minutes. The truth takes longer to process.",
      "Think you know how you come across? MirrorQuiz lets your friends rate you anonymously on 12 traits \u2014 then shows you the gaps between how you see yourself and how they see you. The results might surprise you.",
      "Your self-image has blind spots. Everyone\u2019s does. MirrorQuiz reveals exactly where your perception doesn\u2019t match reality by comparing your self-ratings to honest feedback from friends. Free. 3 minutes. No sugarcoating.",
      "I was so sure I was a great listener. Then my friends rated me a 2.3 out of 5. MirrorQuiz compares your self-perception to how your friends actually see you. It\u2019s free, anonymous, and brutally honest.",
      "What if the way you see yourself is completely wrong? MirrorQuiz asks your friends to rate you on 12 personality traits. Then it shows you where you\u2019re aligned \u2014 and where you\u2019re not even close.",
    ],
    headlines: [
      "See Yourself Through Their Eyes",
      "Your Friends See Someone Different",
      "How Well Do You Really Know Yourself?",
      "The Gap Between You and You",
      "Your Self-Image Has Blind Spots",
    ],
    descriptions: [
      "Free personality quiz with friend feedback",
      "Compare your self-perception to reality",
      "12 traits. Your rating vs. theirs.",
      "Anonymous friend feedback in 3 minutes",
      "Discover what you can\u2019t see about yourself",
    ],
  },
  {
    name: "Curiosity Gap",
    slug: "curiosity",
    text: "I just found out my friends\nsee me completely differently\nthan I see myself.",
    primaryTexts: [
      "I thought I was super empathetic. Turns out my friends rated me way lower than I rated myself. MirrorQuiz compares your self-perception to how friends actually see you. The gaps are... revealing. Try it free.",
      "I always thought I was the funny one in the group. My friends disagree. MirrorQuiz showed me exactly where my self-image doesn\u2019t match how others perceive me. Some results stung. All of them were useful.",
      "My friends and I took MirrorQuiz. I rated myself high on confidence. They gave me a 2.4. Turns out the way I see myself and the way others see me are two very different things.",
      "Turns out I have 3 blind spots I had no idea about. MirrorQuiz compares how you rate yourself to how your friends rate you across 12 traits. The gaps tell you everything. Free to try.",
      "I asked my friends to rate me honestly. What came back was not what I expected. MirrorQuiz reveals the difference between your self-perception and reality. Takes 3 minutes. The results take longer to process.",
    ],
    headlines: [
      "What Do Your Friends Really Think?",
      "I Had No Idea They Saw Me This Way",
      "The Results Were Not What I Expected",
      "My Self-Image Was Way Off",
      "They Rated Me Completely Different",
    ],
    descriptions: [
      "Compare self-perception vs. friend ratings",
      "Your friends see someone you don\u2019t",
      "Find out what you\u2019re missing about yourself",
      "Free quiz \u2014 results in minutes",
      "Anonymous. Honest. Eye-opening.",
    ],
  },
  {
    name: "Social Proof",
    slug: "social",
    text: "My friends nailed 11 out of 12\nthings \u2014 but the one they\nmissed changed everything.",
    primaryTexts: [
      "Out of 12 traits, my friends\u2019 ratings matched mine almost perfectly. But the ONE trait where we disagreed? That\u2019s where the real insight was. MirrorQuiz reveals your blind spots and hidden strengths. Free to start.",
      "My friends know me better than I thought. On 11 out of 12 traits, their ratings matched mine. But the one gap? It explained so much about my relationships. Try MirrorQuiz free.",
      "I got a 73% match score with my friends. That means 27% of how I see myself is different from how they see me. MirrorQuiz shows you exactly where \u2014 and the insights are wild. Free to take.",
      "2 hidden strengths. 3 blind spots. 7 aligned traits. That\u2019s what MirrorQuiz found when it compared my self-ratings to my friends\u2019 anonymous feedback. Took 3 minutes. Changed how I see myself.",
      "My biggest blind spot? I thought I was super creative. My friends gave me a 2.8. But they also rated my empathy way higher than I did. MirrorQuiz shows you what you can\u2019t see. Free.",
    ],
    headlines: [
      "The One Trait That Surprised Me",
      "73% Match \u2014 What About the Other 27%?",
      "My Friends Know Me Better Than I Do",
      "3 Blind Spots I Never Knew I Had",
      "The Results Explained Everything",
    ],
    descriptions: [
      "Discover your blind spots in 3 minutes",
      "See your match score with friends",
      "Find your hidden strengths",
      "12 traits compared \u2014 free quiz",
      "What your friends see that you don\u2019t",
    ],
  },
  {
    name: "Direct Challenge",
    slug: "challenge",
    text: "Don\u2019t take this quiz\nif you\u2019re not ready\nfor the truth.",
    primaryTexts: [
      "Most people think they know how they come across. Most people are wrong. MirrorQuiz asks your friends to rate you on 12 traits, then shows you exactly where your self-image doesn\u2019t match reality. It\u2019s free. But it\u2019s not for the faint-hearted.",
      "This isn\u2019t a feel-good personality quiz. MirrorQuiz compares YOUR self-ratings to ANONYMOUS feedback from your actual friends. No fluff. No horoscope vibes. Just the raw truth about how you\u2019re perceived.",
      "You probably think you\u2019re more self-aware than you are. MirrorQuiz proves it. Your friends rate you on 12 personality traits, and you see exactly where you\u2019re right \u2014 and where you\u2019re way off.",
      "Warning: you might not like what you find. MirrorQuiz reveals the gap between how you see yourself and how your friends actually see you. It\u2019s free, it\u2019s anonymous, and it doesn\u2019t hold back.",
      "Confident you know yourself? Prove it. MirrorQuiz compares your self-ratings to honest friend feedback on 12 traits. Most people are shocked by the results. Takes 3 minutes.",
    ],
    headlines: [
      "How Wrong Are You About Yourself?",
      "Not for the Faint-Hearted",
      "Think You\u2019re Self-Aware? Prove It.",
      "The Truth Hits Different",
      "Ready for Honest Feedback?",
    ],
    descriptions: [
      "The personality quiz that tells the truth",
      "No fluff \u2014 just raw honest feedback",
      "Your friends rate you anonymously",
      "Most people are wrong about themselves",
      "3 minutes to find out who you really are",
    ],
  },
  {
    name: "Stat Attack",
    slug: "stat",
    text: "90% of people think they\nknow themselves.\nOnly 15% are right.",
    primaryTexts: [
      "Most people are confident they know how they come across. Almost none of them are right. MirrorQuiz compares your self-ratings to anonymous feedback from your friends across 12 personality traits. 3 minutes. Zero sugarcoating. Are you in the 15%?",
      "Research shows most people overestimate their self-awareness. MirrorQuiz puts it to the test by comparing how you rate yourself to how your friends actually rate you on 12 traits. Find out if you\u2019re in the 15% who truly know themselves.",
      "You think you know how you come across. But when your friends rate you anonymously on 12 personality traits, the numbers tell a different story. MirrorQuiz shows you the gap. Free. 3 minutes. No sugarcoating.",
      "The average person has 3 blind spots they don\u2019t know about. MirrorQuiz reveals yours by comparing your self-perception to real friend feedback. 12 traits. Anonymous. Honest. Are you ready to see the data?",
      "Only 15% of people accurately predict how others perceive them. The rest have blind spots they don\u2019t even know exist. MirrorQuiz shows you exactly where yours are. It\u2019s free and takes 3 minutes.",
    ],
    headlines: [
      "Are You in the 15%?",
      "Most People Are Wrong About Themselves",
      "The Data Doesn\u2019t Lie",
      "How Accurate Is Your Self-Image?",
      "Find Out What You\u2019re Missing",
    ],
    descriptions: [
      "The quiz that shows you what others really see",
      "Compare self-ratings to friend feedback",
      "12 traits. Real data. Real blind spots.",
      "Free personality perception quiz",
      "See the gap between you and reality",
    ],
  },
];

const styles = ["gradient", "results", "split"] as const;
type Style = (typeof styles)[number];
const styleLabels: Record<Style, string> = {
  gradient: "Bold Text on Gradient",
  results: "Results Screenshot",
  split: "Before / After Split",
};

/* ──────────────── SHARED CREATIVE COMPONENTS ────────────────── */

function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textClass =
    size === "lg"
      ? "text-[42px]"
      : size === "md"
        ? "text-[32px]"
        : "text-[24px]";
  return (
    <span className={`${textClass} font-extrabold tracking-tight text-white`}>
      Mirror
      <span
        style={{
          background: "linear-gradient(135deg, #a78bfa, #e879f9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Quiz
      </span>
    </span>
  );
}

function BottomBar({ showCta }: { showCta: boolean }) {
  if (!showCta) {
    return (
      <span className="text-[28px] font-medium tracking-wide text-white/50">
        mirrorquiz.com
      </span>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="text-[32px] font-bold"
        style={{
          background: "linear-gradient(135deg, #a78bfa, #e879f9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Take the Free Quiz
      </span>
      <span className="text-[22px] font-medium tracking-wide text-white/40">
        mirrorquiz.com
      </span>
    </div>
  );
}

/* ──────────── STYLE A: Bold text on gradient ──────────── */

function GradientCreative({
  hook,
  format,
  showCta,
}: {
  hook: (typeof hooks)[number];
  format: "feed" | "story";
  showCta: boolean;
}) {
  const w = 1080;
  const h = format === "feed" ? 1080 : 1920;
  return (
    <div
      className="relative flex flex-col items-center justify-between overflow-hidden"
      style={{
        width: w,
        height: h,
        background: "linear-gradient(135deg, #7c3aed, #d946ef)",
        padding: format === "feed" ? "80px 64px" : "140px 64px 100px",
      }}
    >
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: 500,
          height: 500,
          top: -120,
          right: -120,
          background: "#fff",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute rounded-full opacity-15"
        style={{
          width: 400,
          height: 400,
          bottom: -100,
          left: -100,
          background: "#fbbf24",
          filter: "blur(100px)",
        }}
      />
      <div className="z-10">
        <Logo size="lg" />
      </div>
      <div className="z-10 text-center">
        {hook.text.split("\n").map((line, i) => (
          <div
            key={i}
            className="font-extrabold leading-[1.1] text-white"
            style={{ fontSize: format === "feed" ? 72 : 80 }}
          >
            {line}
          </div>
        ))}
      </div>
      <div className="z-10">
        <BottomBar showCta={showCta} />
      </div>
    </div>
  );
}

/* ──────────── STYLE B: Fake results screenshot ──────────── */

function ResultsCreative({
  hook,
  format,
  showCta,
}: {
  hook: (typeof hooks)[number];
  format: "feed" | "story";
  showCta: boolean;
}) {
  const w = 1080;
  const h = format === "feed" ? 1080 : 1920;
  const cardPad = format === "feed" ? 48 : 64;

  return (
    <div
      className="relative flex flex-col items-center justify-between overflow-hidden"
      style={{
        width: w,
        height: h,
        background: "#0f0d1a",
        padding: `${cardPad}px`,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.15), transparent 70%)",
        }}
      />
      <div className="z-10 flex w-full flex-col items-center gap-6">
        <Logo size="md" />
        <p
          className="text-center font-bold leading-tight text-white/90"
          style={{ fontSize: 36 }}
        >
          {hook.text.replace(/\n/g, " ")}
        </p>
      </div>
      <div
        className="z-10 flex w-full flex-col items-center gap-8 rounded-[32px] border border-white/10 p-12"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div className="relative flex items-center justify-center">
          <svg
            width={format === "feed" ? 260 : 300}
            height={format === "feed" ? 260 : 300}
            viewBox="0 0 260 260"
          >
            <polygon
              points="130,30 220,75 220,165 130,210 40,165 40,75"
              fill="rgba(167,139,250,0.25)"
              stroke="rgba(167,139,250,0.4)"
              strokeWidth="2"
              style={{ filter: "blur(6px)" }}
            />
            <polygon
              points="130,60 190,90 190,150 130,180 70,150 70,90"
              fill="rgba(233,121,249,0.2)"
              stroke="rgba(233,121,249,0.35)"
              strokeWidth="2"
              style={{ filter: "blur(4px)" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className="font-extrabold text-white"
              style={{ fontSize: 64 }}
            >
              73%
            </span>
            <span className="text-[20px] font-medium text-white/60">
              Match Score
            </span>
          </div>
        </div>
        <div className="flex w-full justify-around">
          <Stat value="3" label="Blind Spots" color="#f59e0b" />
          <Stat value="2" label="Hidden Strengths" color="#2dd4bf" />
          <Stat value="7" label="Aligned" color="#a78bfa" />
        </div>
      </div>
      <div className="z-10">
        <BottomBar showCta={showCta} />
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-extrabold" style={{ fontSize: 48, color }}>
        {value}
      </span>
      <span className="text-[18px] font-medium text-white/60">{label}</span>
    </div>
  );
}

/* ──────────── STYLE C: Before / After Split ──────────── */

const splitTraits = [
  { trait: "Humor", self: 2.0, friends: 4.2 },
  { trait: "Empathy", self: 4.5, friends: 3.1 },
  { trait: "Confidence", self: 3.0, friends: 4.6 },
  { trait: "Creativity", self: 4.8, friends: 4.7 },
];

function SplitCreative({
  hook,
  format,
  showCta,
}: {
  hook: (typeof hooks)[number];
  format: "feed" | "story";
  showCta: boolean;
}) {
  const w = 1080;
  const h = format === "feed" ? 1080 : 1920;

  return (
    <div
      className="relative flex flex-col items-center justify-between overflow-hidden"
      style={{
        width: w,
        height: h,
        background: "#0f0d1a",
        padding: format === "feed" ? "60px 48px" : "100px 48px 80px",
      }}
    >
      <div className="z-10 flex w-full flex-col items-center gap-4">
        <Logo size="md" />
        <p
          className="text-center font-bold leading-tight text-white/90"
          style={{ fontSize: 32 }}
        >
          {hook.text.replace(/\n/g, " ")}
        </p>
      </div>
      <div className="z-10 flex w-full gap-6">
        <div
          className="flex flex-1 flex-col gap-6 rounded-[28px] border border-white/10 p-8"
          style={{ background: "rgba(167,139,250,0.08)" }}
        >
          <div className="text-center text-[26px] font-bold text-white/70">
            How I See Myself
          </div>
          {splitTraits.map((t) => (
            <TraitBar
              key={t.trait}
              trait={t.trait}
              score={t.self}
              color="#a78bfa"
            />
          ))}
        </div>
        <div
          className="flex flex-1 flex-col gap-6 rounded-[28px] border border-white/10 p-8"
          style={{ background: "rgba(233,121,249,0.08)" }}
        >
          <div className="text-center text-[26px] font-bold text-white/70">
            How Friends See Me
          </div>
          {splitTraits.map((t) => (
            <TraitBar
              key={t.trait}
              trait={t.trait}
              score={t.friends}
              color="#e879f9"
            />
          ))}
        </div>
      </div>
      <div className="z-10">
        <BottomBar showCta={showCta} />
      </div>
    </div>
  );
}

function TraitBar({
  trait,
  score,
  color,
}: {
  trait: string;
  score: number;
  color: string;
}) {
  const pct = (score / 5) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[20px] font-medium text-white/80">{trait}</span>
        <span className="text-[20px] font-bold" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
      <div
        className="h-[14px] w-full overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ──────────── CREATIVE RENDERER MAP ──────────── */

function Creative({
  hook,
  style,
  format,
  showCta,
}: {
  hook: (typeof hooks)[number];
  style: Style;
  format: "feed" | "story";
  showCta: boolean;
}) {
  switch (style) {
    case "gradient":
      return <GradientCreative hook={hook} format={format} showCta={showCta} />;
    case "results":
      return <ResultsCreative hook={hook} format={format} showCta={showCta} />;
    case "split":
      return <SplitCreative hook={hook} format={format} showCta={showCta} />;
  }
}

/* ──────────── DOWNLOAD BUTTON ──────────── */

function DownloadButton({
  targetRef,
  filename,
  width,
  height,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
  width: number;
  height: number;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!targetRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(targetRef.current, {
        width,
        height,
        pixelRatio: 1,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [targetRef, filename, width, height]);

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="mt-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 disabled:opacity-50"
    >
      {downloading ? "Generating..." : "Download PNG"}
    </button>
  );
}

/* ──────────── CREATIVE CARD WITH DOWNLOAD ──────────── */

function CreativeCard({
  hook,
  style,
  format,
  showCta,
}: {
  hook: (typeof hooks)[number];
  style: Style;
  format: "feed" | "story";
  showCta: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const w = 1080;
  const h = format === "feed" ? 1080 : 1920;
  const previewW = format === "feed" ? 360 : 270;
  const previewH = format === "feed" ? 360 : 480;
  const scale = previewW / w;
  const label =
    format === "feed"
      ? "Feed \u2014 1080 \u00d7 1080"
      : "Story / Reel \u2014 1080 \u00d7 1920";
  const ctaSuffix = showCta ? "-cta" : "";
  const filename = `mirrorquiz-${hook.slug}-${style}-${format}${ctaSuffix}.png`;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-white/40">{label}</p>
      <div
        style={{
          width: previewW,
          height: previewH,
          overflow: "hidden",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div ref={ref}>
            <Creative
              hook={hook}
              style={style}
              format={format}
              showCta={showCta}
            />
          </div>
        </div>
      </div>
      <DownloadButton
        targetRef={ref}
        filename={filename}
        width={w}
        height={h}
      />
    </div>
  );
}

/* ──────────────────────── PAGE ──────────────────────── */

export function AdsClient() {
  const [showCta, setShowCta] = useState(false);
  let variationNum = 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-8 py-12 text-white">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-extrabold">
            Mirror
            <span
              style={{
                background: "linear-gradient(135deg, #a78bfa, #e879f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Quiz
            </span>{" "}
            Ad Creatives
          </h1>
          <p className="text-lg text-white/60">
            {hooks.length * styles.length} variations &times; 2 formats ={" "}
            {hooks.length * styles.length * 2} total creatives. Click
            &quot;Download PNG&quot; to save at full 1080px resolution.
          </p>
        </div>

        {/* CTA Toggle */}
        <div className="mb-12 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <button
            onClick={() => setShowCta(false)}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
              !showCta
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-white/50 hover:text-white/80"
            }`}
          >
            Clean (URL only)
          </button>
          <button
            onClick={() => setShowCta(true)}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
              showCta
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-white/50 hover:text-white/80"
            }`}
          >
            With CTA Button
          </button>
          <span className="text-sm text-white/40">
            {showCta
              ? 'Shows "Take the Free Quiz" button in each creative'
              : "Shows mirrorquiz.com only \u2014 relies on Meta\u2019s own CTA button"}
          </span>
        </div>

        {/* Creative Grid */}
        {hooks.map((hook) =>
          styles.map((style) => {
            variationNum++;
            return (
              <section
                key={`${hook.name}-${style}`}
                className="mb-16 rounded-2xl border border-white/10 bg-white/[0.02] p-8"
              >
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="rounded-full bg-violet-600/30 px-4 py-1 text-sm font-bold text-violet-300">
                    #{variationNum}
                  </span>
                  <h2 className="text-2xl font-bold">{hook.name}</h2>
                  <span className="text-white/40">&middot;</span>
                  <span className="text-lg text-white/60">
                    {styleLabels[style]}
                  </span>
                </div>

                <div className="flex flex-wrap items-start gap-8">
                  <CreativeCard
                    hook={hook}
                    style={style}
                    format="feed"
                    showCta={showCta}
                  />
                  <CreativeCard
                    hook={hook}
                    style={style}
                    format="story"
                    showCta={showCta}
                  />

                  {/* Ad Copy Variations */}
                  <div className="min-w-[300px] max-w-[500px] flex-1">
                    <p className="mb-1 text-sm font-medium text-white/40">
                      Ad Copy (5 variations each \u2014 paste into Meta Ads Manager)
                    </p>
                    <div className="space-y-4">
                      {/* Primary Texts */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="mb-2 text-sm font-medium text-violet-300">
                          Primary Text Variations
                        </p>
                        {hook.primaryTexts.map((text, i) => (
                          <p
                            key={i}
                            className="mb-2 border-b border-white/5 pb-2 text-sm leading-relaxed text-white/80 last:mb-0 last:border-0 last:pb-0"
                          >
                            <span className="mr-1.5 text-xs font-bold text-violet-400">
                              {i + 1}.
                            </span>
                            {text}
                          </p>
                        ))}
                      </div>
                      {/* Headlines */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="mb-2 text-sm font-medium text-fuchsia-300">
                          Headline Variations
                        </p>
                        {hook.headlines.map((h, i) => (
                          <p
                            key={i}
                            className="mb-1 text-sm text-white/80 last:mb-0"
                          >
                            <span className="mr-1.5 text-xs font-bold text-fuchsia-400">
                              {i + 1}.
                            </span>
                            {h}
                          </p>
                        ))}
                      </div>
                      {/* Descriptions */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="mb-2 text-sm font-medium text-amber-300">
                          Description Variations
                        </p>
                        {hook.descriptions.map((d, i) => (
                          <p
                            key={i}
                            className="mb-1 text-sm text-white/80 last:mb-0"
                          >
                            <span className="mr-1.5 text-xs font-bold text-amber-400">
                              {i + 1}.
                            </span>
                            {d}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }),
        )}

        {/* Ad Copy Summary */}
        <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="mb-6 text-2xl font-bold">
            All Ad Copy Variations (for Meta Ads Manager)
          </h2>
          <div className="space-y-6">
            {hooks.map((hook, i) => (
              <div
                key={hook.name}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-full bg-violet-600/30 px-3 py-0.5 text-xs font-bold text-violet-300">
                    Hook {i + 1}
                  </span>
                  <span className="font-bold text-white/90">{hook.name}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="mb-2 text-sm font-medium text-violet-300">
                      Primary Texts
                    </p>
                    {hook.primaryTexts.map((t, j) => (
                      <p
                        key={j}
                        className="mb-2 border-b border-white/5 pb-2 text-sm leading-relaxed text-white/70 last:mb-0 last:border-0 last:pb-0"
                      >
                        <span className="mr-1 text-xs font-bold text-violet-400">
                          {j + 1}.
                        </span>
                        {t}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-fuchsia-300">
                      Headlines
                    </p>
                    {hook.headlines.map((h, j) => (
                      <p
                        key={j}
                        className="mb-1 text-sm text-white/70 last:mb-0"
                      >
                        <span className="mr-1 text-xs font-bold text-fuchsia-400">
                          {j + 1}.
                        </span>
                        {h}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-amber-300">
                      Descriptions
                    </p>
                    {hook.descriptions.map((d, j) => (
                      <p
                        key={j}
                        className="mb-1 text-sm text-white/70 last:mb-0"
                      >
                        <span className="mr-1 text-xs font-bold text-amber-400">
                          {j + 1}.
                        </span>
                        {d}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
