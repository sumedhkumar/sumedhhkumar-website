"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Play,
  Star,
  Users,
} from "lucide-react";
import {
  algoTradingCourse,
  getSafeCourseIntroEmbedUrl,
} from "@/data/algo-trading-course";
import { experts } from "@/data/experts";

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

const instructorCredibility = [
  { label: "AI AUTOMATION", value: "8 Years" },
  { label: "TRADING EXPERIENCE", value: "9 Years" },
  { label: "FOCUS", value: "AI & Algo Trading" },
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

const workshopReviews = [
  {
    name: "Darpan Bhagat",
    rating: 5,
    topic: "Strategy to Algo Automation Workflow",
    comment: "Excellent session done by Sumedhji . Good learning.",
  },
  {
    name: "Sagar Sugriv Dadhe",
    rating: 4,
    topic: "Live Bot Demo and Agent Walkthrough",
    comment: "Good",
  },
  {
    name: "Jigar patel",
    rating: 5,
    topic: "Strategy to Algo Automation Workflow",
    comment: "Apke efforts ko selute hey.aapne ache se smjaya.thank you sumedhh ji",
  },
  {
    name: "Shoaibmushtaq",
    rating: 4,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "Great job done",
  },
  {
    name: "Sagar",
    rating: 5,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "You did Excellent job, keep growing and motivating like this❤️",
  },
  {
    name: "Mudaseer Abdar",
    rating: 5,
    topic: "Strategy to Algo Automation Workflow",
    comment: "Valueable on content creator appricate you brother lot of love form Karnataka basavakalyan",
  },
  {
    name: "NITIN TANEJA",
    rating: 5,
    topic: "Live Bot Demo and Agent Walkthrough",
    comment: "very nice good exposure it opens up door for my algo trading more clearly",
  },
  {
    name: "Darpan Bhagat",
    rating: 5,
    topic: "Strategy to Algo Automation Workflow",
    comment: "Excellent session and good knowledge shared",
  },
  {
    name: "Reeyaj gulabhusen sande",
    rating: 4,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "Good ",
  },
  {
    name: "Ashpak Patankar",
    rating: 5,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "Session achcha tha",
  },
  {
    name: "Harsha Vardhan",
    rating: 4,
    topic: "Strategy to Algo Automation Workflow",
    comment: "Very Good Webinar ",
  },
  {
    name: "Shyam Mishra",
    rating: 5,
    topic: "Live Bot Demo and Agent Walkthrough",
    comment: "You are doing good job, helping people and educating them, please keep it up",
  },
  {
    name: "Praval Patel",
    rating: 5,
    topic: "AI Integration with TradingView and MT5",
    comment: "Thank you bhaiii",
  },
  {
    name: "Mohit Barak",
    rating: 5,
    topic: "AI Integration with TradingView and MT5",
    comment: "Over all good session motivated to work smartly now",
  },
  {
    name: "Manish",
    rating: 5,
    topic: "AI Integration with TradingView and MT5",
    comment: "Excellent workshop ",
  },
  {
    name: "Hemant Bharali",
    rating: 5,
    topic: "AI Integration with TradingView and MT5",
    comment: "Please need pine script ",
  },
  {
    name: "Jyotiranjan mahanand",
    rating: 5,
    topic: "Live Bot Demo and Agent Walkthrough",
    comment: "Very good session but some time sound is not clear",
  },
  {
    name: "Hemant Kumar",
    rating: 5,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "I want more information ",
  },
  {
    name: "ASHISH PANCHAL",
    rating: 5,
    topic: "AI Integration with TradingView and MT5",
    comment: "Please add in course how to make a bot and ea and pine scripts profitable. ",
  },
  {
    name: "Ronak Tumma",
    rating: 5,
    topic: "Strategy to Algo Automation Workflow",
    comment: "Need integration demo with real accounts",
  },
  {
    name: "Patel Hetkumar Satishbhai",
    rating: 5,
    topic: "AI Integration with TradingView and MT5",
    comment: "Sir one more live session deeply knowledge of algo tqrd startgeis and backtest details ",
  },
  {
    name: "Sanju Devi",
    rating: 5,
    topic: "Strategy to Algo Automation Workflow",
    comment: "Automatically algo mt5 Trading view like",
  },
  {
    name: "Chandan Kumar Saw",
    rating: 5,
    topic: "",
    comment: "",
  },
  {
    name: "Chethan",
    rating: 5,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "",
  },
  {
    name: "Sarfaraz Khan",
    rating: 5,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "",
  },
  {
    name: "Ali Raza",
    rating: 5,
    topic: "Strategy to Algo Automation Workflow",
    comment: "",
  },
  {
    name: "Rushikesh Palande",
    rating: 5,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "",
  },
  {
    name: "MIAN HABIB",
    rating: 5,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "",
  },
  {
    name: "Tanish Singh",
    rating: 5,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "",
  },
  {
    name: "Raj Khanna",
    rating: 5,
    topic: "Strategy to Algo Automation Workflow",
    comment: "",
  },
  {
    name: "Dhiren Pradhan",
    rating: 5,
    topic: "AI Integration with TradingView and MT5",
    comment: "",
  },
  {
    name: "Pratik Dhamdhere",
    rating: 5,
    topic: "AI Integration with TradingView and MT5",
    comment: "",
  },
  {
    name: "Karan kumar",
    rating: 5,
    topic: "Live Bot Demo and Agent Walkthrough",
    comment: "",
  },
  {
    name: "Pinal Shah",
    rating: 5,
    topic: "Algo Trading Concepts (Basic to Advanced)",
    comment: "",
  },
  {
    name: "M Fahim",
    rating: 5,
    topic: "",
    comment: "",
  },
  {
    name: "Karan kumar",
    rating: 5,
    topic: "Strategy to Algo Automation Workflow",
    comment: "",
  },
];

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
  label = ctaLabel,
}: {
  className?: string;
  size?: "default" | "large";
  label?: string;
}) {
  return (
    <a
      href={registerHref}
      className={`cvlp-cta-btn ${size === "large" ? "cvlp-cta-btn-lg" : ""} ${className}`.trim()}
    >
      <span>{label}</span>
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

function ReviewCard({
  name,
  rating,
  topic,
  comment,
}: {
  name: string;
  rating: number;
  topic: string;
  comment: string;
}) {
  return (
    <article className="cvlp-review-card h-full">
      <div className="cvlp-review-stars" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? "cvlp-star-filled" : "cvlp-star-empty"}
            aria-hidden="true"
          />
        ))}
      </div>
      {comment && <p className="cvlp-review-comment">&ldquo;{comment}&rdquo;</p>}
      <div className="cvlp-review-footer">
        <span className="cvlp-review-name">{name}</span>
        <span className="cvlp-review-topic">{topic}</span>
      </div>
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

  const reviewsScrollRef = useRef<HTMLDivElement>(null);

  const scrollReviews = (direction: "left" | "right") => {
    if (!reviewsScrollRef.current) return;
    const scrollAmount = 340; // Approx card width + gap
    reviewsScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

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
              Learn to build, backtest, and deploy automated trading strategies using industry-standard tools-without spending years figuring it out on your own.
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
      <section className="cvlp-section cvlp-instructor-section" aria-labelledby="cvlp-founder-heading">
        <div className="cvlp-shell">
          <div className="cvlp-founder-card">
            <div className="cvlp-instructor-identity">
              <div className="cvlp-instructor-avatar-ring">
                <Image
                  src={experts[0]?.professionalPhoto || algoTradingCourse.visuals.founderPortrait}
                  alt="Sumedh Kumar Bhalerao - course instructor"
                  width={180}
                  height={180}
                  className="cvlp-instructor-avatar-img"
                />
              </div>
              <div className="cvlp-instructor-name-block">
                <p className="cvlp-instructor-eyebrow">Your Instructor</p>
                <h2 id="cvlp-founder-heading">Sumedhhkumar Bhalerao</h2>
                <p className="cvlp-instructor-role">Expert, Vyntegra · Data Scientist</p>
              </div>
            </div>

            <div className="cvlp-instructor-credibility-grid">
              {instructorCredibility.map((item) => (
                <div key={item.label} className="cvlp-instructor-credibility-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="cvlp-founder-copy">
              <p>
                Data Scientist with hands-on experience across generative AI, conversational AI, NLP, machine learning, and cloud platforms. Professional background includes Builder.ai, Reliance Retail, and multiple operations-led companies.
              </p>
              <ul className="cvlp-founder-points">
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>BE from MGM&apos;s JNEC · MBA in AI from DY Patil University</span>
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Certified in Azure, AWS SageMaker, Kubernetes, Docker &amp; Lean Six Sigma</span>
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Practical AI automation and trading workflow education</span>
                </li>

              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Workshop Reviews ---- */}
      <section className="cvlp-section" aria-labelledby="cvlp-reviews-heading">
        <div className="cvlp-shell">
          <div className="cvlp-section-header">
            <h2 id="cvlp-reviews-heading">What our students say</h2>
            <p>
              Real feedback from attendees who experienced the workshop firsthand.
            </p>
          </div>
          <div className="cvlp-reviews-summary">
            <div className="cvlp-reviews-avg">
              <span className="cvlp-reviews-avg-number">4.5</span>
              <div className="cvlp-reviews-avg-stars" aria-label="4.5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < 4 ? "cvlp-star-filled" : i === 4 ? "cvlp-star-half" : "cvlp-star-empty"}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="cvlp-reviews-count">Based on 75+ reviews</span>
            </div>
          </div>
          <div className="relative group">
            <button
              onClick={() => scrollReviews("left")}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <ArrowLeft size={20} />
            </button>

            <div 
              ref={reviewsScrollRef}
              className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {workshopReviews.map((review) => (
                <div key={review.name} className="flex-none w-[320px] max-w-[85vw] snap-start h-full">
                  <ReviewCard
                    name={review.name}
                    rating={review.rating}
                    topic={review.topic}
                    comment={review.comment}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollReviews("right")}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

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
          <CtaButton size="large" label="Claim Your Free Access" className="cvlp-cta-btn-final" />
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
