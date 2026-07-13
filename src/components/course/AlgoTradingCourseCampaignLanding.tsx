"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Play,
  Users,
} from "lucide-react";
import {
  algoTradingCourse,
  getSafeCourseIntroEmbedUrl,
} from "@/data/algo-trading-course";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const registerHref = `${algoTradingCourse.registerRoute}?source=lp-trading-automation-masterclass`;

const ctaLabel = "Register Free";

const VIEWER_STORAGE_KEY = "vyntegra_lp_viewer_count";

const trustPoints = [
  "Free signup",
  "No payment needed",
  "Takes under 60 seconds",
];

const signalItems = [
  "Idea to rules",
  "AI-assisted checks",
  "TradingView / MT5 logic",
  "Review before action",
];

const faqItems = [
  {
    question: "Is it really free?",
    answer:
      "Yes. Lecture 1 and Lecture 2 are completely free after signup. No payment or card required.",
  },
  {
    question: "Do I need coding or trading experience?",
    answer:
      "No. The course is structured for beginners. Basic market familiarity helps but is not required.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. This is an educational program about automation workflows, not investment advice or profit guarantees.",
  },
];

const disclaimer =
  "Educational content only. No investment advice. No profit guarantees. Trading involves risk.";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getBatchLabel() {
  return "August 2026 Batch";
}

function getOrCreateCountdownTarget(): number {
  // Fixed countdown to August 1st, 2026
  return Date.parse("2026-08-01T00:00:00+05:30");
}

function getOrCreateViewerCount(): number {
  if (typeof window === "undefined") return 148;

  const stored = sessionStorage.getItem(VIEWER_STORAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed >= 100 && parsed <= 250) return parsed;
  }

  const count = 120 + Math.floor(Math.random() * 81); // 120–200
  sessionStorage.setItem(VIEWER_STORAGE_KEY, String(count));
  return count;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  return { d, h, m, s };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function CountdownTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = getOrCreateCountdownTarget();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(Math.max(0, target - Date.now()));

    const interval = setInterval(() => {
      const diff = Math.max(0, target - Date.now());
      setRemaining(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (remaining === null) return null;

  const { d, h, m, s } = formatCountdown(remaining);

  if (remaining <= 0) {
    return (
      <span className="cvlp-countdown-text">Registration closing soon</span>
    );
  }

  return (
    <span className="cvlp-countdown-text">
      Closes in{" "}
      <span className="cvlp-countdown-digits">
        {d > 0 && (
          <>
            <span className="cvlp-countdown-unit">{d}d</span>{" "}
          </>
        )}
        <span className="cvlp-countdown-unit">{h}h</span>{" "}
        <span className="cvlp-countdown-unit">{String(m).padStart(2, "0")}m</span>{" "}
        <span className="cvlp-countdown-unit">{String(s).padStart(2, "0")}s</span>
      </span>
    </span>
  );
}

function ViewerCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(getOrCreateViewerCount());
  }, []);

  if (count === null) return null;

  return (
    <p className="cvlp-viewer-count">
      <span className="cvlp-live-dot" aria-hidden="true" />
      <Eye size={14} aria-hidden="true" />
      <span>{count} people viewed this page today</span>
    </p>
  );
}

function CtaButton({
  className = "",
  size = "default",
}: {
  className?: string;
  size?: "default" | "large";
}) {
  return (
    <a
      href={registerHref}
      className={`cvlp-cta-btn ${size === "large" ? "cvlp-cta-btn-lg" : ""} ${className}`.trim()}
    >
      <span>{ctaLabel}</span>
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

function VideoBlock({ embedUrl }: { embedUrl: string }) {
  return (
    <div className="cvlp-video-frame">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Vyntegra Trading Automation Masterclass preview"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="cvlp-video-placeholder">
          <div className="cvlp-play-icon-wrap">
            <Play size={40} aria-hidden="true" />
          </div>
          <span>Watch the masterclass preview</span>
          <strong>Video available after setup</strong>
        </div>
      )}
    </div>
  );
}

function TransformationItem({
  before,
  after,
  copy,
}: {
  before: string;
  after: string;
  copy: string;
}) {
  return (
    <article className="cvlp-transform-item">
      <div className="cvlp-transform-row">
        <div className="cvlp-transform-state">
          <span className="cvlp-transform-badge cvlp-badge-before">Before</span>
          <span className="cvlp-transform-text-before">{before}</span>
        </div>
        <ArrowRight className="cvlp-transform-arrow" size={16} aria-hidden="true" />
        <div className="cvlp-transform-state">
          <span className="cvlp-transform-badge cvlp-badge-after">After</span>
          <span className="cvlp-transform-text-after">{after}</span>
        </div>
      </div>
      <p className="cvlp-transform-copy">{copy}</p>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export default function AlgoTradingCourseCampaignLanding() {
  const introEmbedUrl = useMemo(
    () => getSafeCourseIntroEmbedUrl(algoTradingCourse.links.introVideoUrl),
    [],
  );

  const batchLabel = useMemo(() => getBatchLabel(), []);

  return (
    <main className="cvlp-page">
      {/* ---- Sticky Header ---- */}
      <header className="cvlp-header">
        <a className="cvlp-brand" href="#top" aria-label="Vyntegra">
          <span>Vyntegra</span>
          <small>Masterclass</small>
        </a>
      </header>

      {/* ---- Info / Urgency Bar ---- */}
      <div className="cvlp-info-bar" role="status" aria-live="polite">
        <div className="cvlp-info-bar-inner">
          <span className="cvlp-batch-label">
            <Clock size={14} aria-hidden="true" />
            {batchLabel} · Limited seats
          </span>
          <span className="cvlp-info-sep" aria-hidden="true">·</span>
          <CountdownTimer />
        </div>
      </div>

      {/* ---- Hero: Video First ---- */}
      <section id="top" className="cvlp-hero">
        <div className="cvlp-shell cvlp-hero-inner">
          <div className="cvlp-hero-copy">
            <p className="cvlp-badge">Free preview access</p>
            <h1>Stop Watching Charts. Start Building Trading Systems.</h1>
            <p className="cvlp-hero-sub">
              Learn to build, backtest, and deploy automated trading strategies using industry-standard tools—without spending years figuring it out on your own.
            </p>
          </div>

          <VideoBlock embedUrl={introEmbedUrl} />

          <div className="cvlp-hero-copy">
            <ul className="cvlp-trust-list" aria-label="Why register">
              {trustPoints.map((point) => (
                <li key={point}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <CtaButton size="large" />
            <ViewerCount />
          </div>
        </div>
      </section>

      {/* ---- Signal Strip ---- */}
      <div className="cvlp-signal-strip" aria-label="Automation workflow signals">
        <div className="cvlp-shell cvlp-signal-grid">
          {signalItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      {/* ---- Before → After Transformations ---- */}
      <section className="cvlp-section" aria-labelledby="cvlp-transform-heading">
        <div className="cvlp-shell">
          <div className="cvlp-section-header">
            <h2 id="cvlp-transform-heading">What changes after this course</h2>
            <p>
              Practical workflow shifts you can expect from the masterclass.
            </p>
          </div>
          <div className="cvlp-transform-list">
            {algoTradingCourse.workflowTransformations.map((t) => (
              <TransformationItem
                key={t.before}
                before={t.before}
                after={t.after}
                copy={t.copy}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---- Program Stats ---- */}
      <div className="cvlp-stats-strip">
        <div className="cvlp-shell cvlp-stats-grid">
          {algoTradingCourse.stats.map(([value, label]) => (
            <div key={value} className="cvlp-stat-item">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Founder / Instructor ---- */}
      <section className="cvlp-section" aria-labelledby="cvlp-founder-heading">
        <div className="cvlp-shell">
          <div className="cvlp-founder-card">
            <div className="cvlp-founder-photo-wrap">
              <Image
                src={algoTradingCourse.visuals.founderPortrait}
                alt="Sumedh Kumar Bhalerao — course instructor"
                width={320}
                height={400}
                className="cvlp-founder-photo"
              />
            </div>
            <div className="cvlp-founder-copy">
              <h2 id="cvlp-founder-heading">About the instructor</h2>
              <p>{algoTradingCourse.founderContext.copy}</p>
              <ul className="cvlp-founder-points">
                {algoTradingCourse.founderContext.credibilityPoints.map(
                  (point) => (
                    <li key={point}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Mid-page CTA ---- */}
      <section className="cvlp-mid-cta">
        <div className="cvlp-shell cvlp-mid-cta-inner">
          <h2>Ready to see the workflow?</h2>
          <p>
            Create your free account and unlock Lecture 1 + Lecture 2 instantly.
          </p>
          <CtaButton size="large" />
        </div>
      </section>

      {/* ---- Mini FAQ ---- */}
      <section
        className="cvlp-section"
        aria-labelledby="cvlp-faq-heading"
      >
        <div className="cvlp-shell cvlp-faq-wrap">
          <h2 id="cvlp-faq-heading">Quick answers</h2>
          <div className="cvlp-faq-list">
            {faqItems.map((item) => (
              <article key={item.question} className="cvlp-faq-row">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="cvlp-final-cta">
        <div className="cvlp-shell cvlp-final-cta-inner">
          <Users size={32} aria-hidden="true" className="cvlp-final-icon" />
          <h2>Still thinking?</h2>
          <p>The first 2 lectures are completely free. No payment needed.</p>
          <CtaButton size="large" />
          <p className="cvlp-disclaimer">{disclaimer}</p>
        </div>
      </section>

      {/* ---- Mobile Sticky Bar ---- */}
      <div className="cvlp-sticky-bar">
        <span>Free · No payment needed</span>
        <a href={registerHref} className="cvlp-sticky-btn">
          {ctaLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    </main>
  );
}
