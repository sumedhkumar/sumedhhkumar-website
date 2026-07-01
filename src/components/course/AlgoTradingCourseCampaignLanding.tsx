import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  MonitorCog,
  PlayCircle,
  ShieldCheck,
  Video,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  algoTradingCourse,
  getSafeCourseIntroEmbedUrl,
} from "@/data/algo-trading-course";

const approvedTestimonials = algoTradingCourse.testimonials.filter(
  (testimonial) => testimonial.displayApproved,
);

const painPoints = [
  "They keep collecting tutorials instead of building a workflow.",
  "They know indicators, but not rule structure.",
  "They cannot connect TradingView alerts with execution thinking.",
  "They jump into tools before understanding risk controls.",
  "They do not have a practice path.",
];

const freeLessonCards = [
  {
    title: "Continue with Lecture 1 + Lecture 2",
    copy: "Create your free account to unlock the next two preview lessons.",
    label: "After registration",
  },
];

const understandingCards = [
  {
    title: "Strategy rules",
    copy: "Turn scattered ideas into clearer rules, conditions, review points, and operating steps.",
    icon: ClipboardCheck,
  },
  {
    title: "Alerts and workflows",
    copy: "Understand how TradingView alerts can fit into a practical decision and execution process.",
    icon: Gauge,
  },
  {
    title: "MT5 basics",
    copy: "See the role MT5 plays before trying to connect tools or automate a workflow.",
    icon: MonitorCog,
  },
  {
    title: "TradingView automation thinking",
    copy: "Learn how alert logic, signal flow, and operating steps connect in a structured workflow.",
    icon: PlayCircle,
  },
  {
    title: "AI-assisted planning/debugging",
    copy: "Use AI-assisted thinking for documentation, debugging, and setup review without treating it as a trading promise.",
    icon: BrainCircuit,
  },
  {
    title: "Risk-control thinking",
    copy: "Build a risk-aware operating mindset before execution, monitoring, or deployment decisions.",
    icon: ShieldCheck,
  },
];

function IntroVideoCard({ introEmbedUrl }: { introEmbedUrl: string }) {
  return (
    <article className="algo-campaign-video-panel" aria-label="Intro video">
      <div className="algo-campaign-video-card">
        {introEmbedUrl ? (
          <iframe
            src={introEmbedUrl}
            title="Vyntegra Trading Automation Masterclass intro video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="algo-campaign-video-placeholder">
            <Video size={34} strokeWidth={1.65} aria-hidden="true" />
            <span>Video will be available here soon.</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function AlgoTradingCourseCampaignLanding() {
  const introEmbedUrl = getSafeCourseIntroEmbedUrl(
    algoTradingCourse.links.introVideoUrl,
  );

  return (
    <main className="algo-campaign-page">
      <header className="algo-campaign-header">
        <a className="algo-campaign-brand" href="#top" aria-label="Vyntegra">
          <span>Vyntegra</span>
          <small>Masterclass</small>
        </a>
        <Button href={algoTradingCourse.registerRoute} variant="primary">
          Register Free
        </Button>
      </header>

      <section id="top" className="algo-campaign-hero">
        <div className="algo-campaign-shell algo-campaign-hero-grid">
          <div className="algo-campaign-hero-copy">
            <h1>Still stuck watching random trading tutorials?</h1>
            <p>
              Start with a free preview of how trading automation workflows are
              actually structured for MT5 and TradingView.
            </p>
          </div>

          <IntroVideoCard introEmbedUrl={introEmbedUrl} />

          <div className="algo-campaign-actions">
            <Button href={algoTradingCourse.registerRoute} variant="primary">
              Register Free
              <ArrowRight size={16} strokeWidth={1.85} aria-hidden="true" />
            </Button>
            <p>Register free to continue with Lecture 1 + Lecture 2.</p>
          </div>

          <div className="algo-campaign-chip-grid" aria-label="Course highlights">
            <span>3-month weekend program</span>
            <span>MT5 + TradingView</span>
            <span>Live sessions</span>
          </div>
        </div>
      </section>

      <section className="algo-campaign-section algo-campaign-pain-section">
        <div className="algo-campaign-shell algo-campaign-split">
          <div className="algo-campaign-section-heading">
            <p className="eyebrow">The Problem</p>
            <h2>Why most traders never reach automation</h2>
          </div>

          <ul className="algo-campaign-pain-list">
            {painPoints.map((point) => (
              <li key={point}>
                <AlertTriangle size={17} strokeWidth={1.75} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="algo-campaign-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-section-heading">
            <p className="eyebrow">Free Access</p>
            <h2>Continue with Lecture 1 + Lecture 2</h2>
            <p>Create your free account to unlock the next two preview lessons.</p>
          </div>

          <div className="algo-campaign-lesson-grid">
            {freeLessonCards.map((lesson) => (
              <article key={lesson.title} className="algo-campaign-card">
                <span>{lesson.label}</span>
                <h3>{lesson.title}</h3>
                <p>{lesson.copy}</p>
              </article>
            ))}
          </div>

          <div className="algo-campaign-section-cta">
            <Button href={algoTradingCourse.registerRoute} variant="primary">
              Register Free
            </Button>
          </div>
        </div>
      </section>

      <section className="algo-campaign-section algo-campaign-muted-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-section-heading">
            <p className="eyebrow">Proof</p>
            <h2>Learn from the preview before the full program begins</h2>
          </div>

          {approvedTestimonials.length > 0 ? (
            <div className="algo-campaign-testimonial-grid">
              {approvedTestimonials.map((testimonial) => (
                <article key={testimonial.quote} className="algo-campaign-card">
                  <p>{testimonial.quote}</p>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.roleOrContext}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="algo-campaign-truth-panel">
              <ShieldCheck size={22} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <h3>Verified participant feedback will be added after the first cohort.</h3>
                <p>
                  For now, use the free preview lessons to understand the
                  teaching style and workflow structure.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="algo-campaign-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-section-heading">
            <p className="eyebrow">What You Will Understand</p>
            <h2>Build the workflow thinking before the tools</h2>
          </div>

          <div className="algo-campaign-card-grid">
            {understandingCards.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="algo-campaign-card">
                  <Icon size={21} strokeWidth={1.75} aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="algo-campaign-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-program-card">
            <div>
              <p className="eyebrow">Program Context</p>
              <h2>{algoTradingCourse.name}</h2>
              <p>
                A focused weekend program for understanding practical MT5 and
                TradingView automation workflows.
              </p>
            </div>

            <div className="algo-campaign-program-list">
              <div>
                <span>Duration</span>
                <strong>3 months</strong>
              </div>
              <div>
                <span>Schedule</span>
                <strong>2 hours every weekend</strong>
              </div>
            </div>

            <ul className="algo-campaign-included-list">
              <li>
                <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>Live sessions</span>
              </li>
              <li>
                <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>Recordings</span>
              </li>
              <li>
                <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>WhatsApp support</span>
              </li>
              <li>
                <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>MT5 + TradingView workflows</span>
              </li>
            </ul>

            <Button href={algoTradingCourse.registerRoute} variant="primary">
              Register Free
            </Button>
          </div>
        </div>
      </section>

      <section className="algo-campaign-section algo-campaign-final-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-final-card">
            <BookOpenCheck size={26} strokeWidth={1.75} aria-hidden="true" />
            <h2>Create your free account to continue.</h2>
            <Button href={algoTradingCourse.registerRoute} variant="primary">
              Register Free
            </Button>
          </div>
          <div className="algo-campaign-disclaimer">
            <ShieldCheck size={20} strokeWidth={1.75} aria-hidden="true" />
            <p>{algoTradingCourse.disclaimer}</p>
          </div>
        </div>
      </section>

      <div className="algo-campaign-sticky-cta">
        <span>Preview access</span>
        <Button href={algoTradingCourse.registerRoute} variant="primary">
          Register Free
        </Button>
      </div>
    </main>
  );
}
