import Image from "next/image";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  MonitorCog,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import AlgoTradingCourseRegister from "@/components/course/AlgoTradingCourseRegister";
import {
  algoTradingCourse,
  getSafeCourseIntroEmbedUrl,
} from "@/data/algo-trading-course";
import { site } from "@/data/site";

const heroBenefits = [
  "Lecture 1: Course Roadmap",
  "Lecture 2: First Teaching Session",
  "Free registration. No payment required.",
];

const registerSectionHref = "#register";
const lessonPreviewHref = "#what-you-unlock";
const campaignRiskDisclaimer =
  "This is an educational course. It does not provide investment advice or profit guarantees. Trading involves financial risk.";

const understandingCards = [
  {
    title: "Idea to rules",
    copy: "See how a trading idea becomes conditions, inputs, and review points.",
    icon: BrainCircuit,
  },
  {
    title: "Platform workflow",
    copy: "Understand where TradingView, MT5, Dhan, or Kite fit into an automation flow.",
    icon: MonitorCog,
  },
  {
    title: "Checks before action",
    copy: "Learn where AI can help, where it needs review, and what to verify first.",
    icon: Gauge,
  },
  {
    title: "Risk review",
    copy: "Keep risk, monitoring, and responsible review visible before real capital.",
    icon: ShieldCheck,
  },
];

const freeAccessSteps = [
  {
    title: "Register free",
    copy: "Create your course account with email and password.",
    icon: ClipboardCheck,
  },
  {
    title: "Unlock Lecture 1 + Lecture 2",
    copy: "Both free lessons open immediately after registration.",
    icon: BookOpenCheck,
  },
  {
    title: "Continue from access page",
    copy: "Use the protected page to watch lessons and get support details.",
    icon: PlayCircle,
  },
];

const faqItems = [
  {
    question: "Is this free?",
    answer: "Yes. Registration is free for the two unlocked lessons.",
  },
  {
    question: "What unlocks after registration?",
    answer: "Lecture 1 and Lecture 2 unlock on the protected access page.",
  },
  {
    question: "Is this financial advice?",
    answer: "No. This is educational content, not investment advice.",
  },
  {
    question: "Do I need coding experience?",
    answer: "No. The preview explains workflow thinking in plain language.",
  },
  {
    question: "What happens after registration?",
    answer: "You log in, open the access page, and watch Lecture 1 + Lecture 2.",
  },
];

function IntroVideoCard({ introEmbedUrl }: { introEmbedUrl: string }) {
  return (
    <article className="algo-campaign-video-panel" aria-label="Masterclass video">
      {introEmbedUrl ? (
        <div className="algo-campaign-video-card">
          <iframe
            src={introEmbedUrl}
            title="Vyntegra Trading Automation Masterclass video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div className="algo-campaign-video-card algo-campaign-video-card-preview">
          <Image
            src={algoTradingCourse.visuals.heroWorkflowSlide.src}
            alt={algoTradingCourse.visuals.heroWorkflowSlide.alt}
            width={960}
            height={540}
            priority
            unoptimized
          />
        </div>
      )}
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
        <p className="algo-campaign-header-trust">Educational content only</p>
        <Button href={registerSectionHref} variant="primary">
          Register Free
        </Button>
      </header>

      <section id="top" className="algo-campaign-hero">
        <div className="algo-campaign-shell algo-campaign-hero-grid">
          <div className="algo-campaign-hero-copy">
            <h1>Learn the workflow behind AI-assisted trading automation — free.</h1>
            <p>
              Register free to unlock Lecture 1 + Lecture 2. The lessons show
              how trading ideas move into rules, checks, platform workflow, and
              risk review without hype.
            </p>
          </div>

          <IntroVideoCard introEmbedUrl={introEmbedUrl} />

          <div className="algo-campaign-actions">
            <Button href={registerSectionHref} variant="primary">
              Get Free Access
              <ArrowRight size={16} strokeWidth={1.85} aria-hidden="true" />
            </Button>
            <Button href={lessonPreviewHref} variant="secondary">
              See What You&apos;ll Learn
            </Button>
            <p>Educational content only. No profit guarantees.</p>
          </div>

          <div className="algo-campaign-chip-grid" aria-label="Free masterclass benefits">
            {heroBenefits.map((benefit) => (
              <span key={benefit}>{benefit}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="what-you-unlock" className="algo-campaign-section">
        <div className="algo-campaign-shell algo-campaign-learning-layout">
          <div className="algo-campaign-section-heading">
            <p className="eyebrow">What You Unlock</p>
            <h2>Two free lessons before any payment step</h2>
            <p>Start with the roadmap, then watch the first teaching session.</p>
          </div>

          <div className="algo-campaign-lesson-grid">
            {algoTradingCourse.accessLessons.map((lesson, index) => {
              const visual = algoTradingCourse.visuals.lessonPreviews[index];
              const previewLabel =
                index === 0 ? "Lecture 1 preview" : "Lecture 2 preview";

              return (
                <article key={lesson.title} className="algo-campaign-card algo-campaign-lesson-card">
                  {visual ? (
                    <div className="algo-campaign-lecture-image">
                      <span>{previewLabel}</span>
                      <Image
                        src={visual.src}
                        alt={visual.alt}
                        width={720}
                        height={420}
                        loading="eager"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span>{previewLabel}</span>
                  )}
                  <h3>{lesson.title}</h3>
                  <p>{lesson.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="algo-campaign-section algo-campaign-muted-section">
        <div className="algo-campaign-shell algo-campaign-learning-layout">
          <div className="algo-campaign-section-heading">
            <p className="eyebrow">What You Will Understand</p>
            <h2>How the trading automation workflow fits together</h2>
            <p>Idea - Rules - Check - Execute - Review.</p>
          </div>

          <div className="algo-campaign-learning-list">
            {understandingCards.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="algo-campaign-learning-item">
                  <span>
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="algo-campaign-section algo-campaign-cta-band-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-mid-cta">
            <div>
              <p className="eyebrow">Free Access</p>
              <h2>Ready to unlock Lecture 1 + Lecture 2?</h2>
              <p>Register free. No payment required.</p>
            </div>
            <Button href={registerSectionHref} variant="primary">
              Unlock Free Lessons
              <ArrowRight size={16} strokeWidth={1.85} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section className="algo-campaign-section algo-campaign-muted-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-section-heading">
            <p className="eyebrow">How Free Access Works</p>
            <h2>Three simple steps</h2>
          </div>

          <div className="algo-campaign-free-flow" aria-label="Free access flow">
            {freeAccessSteps.map((step, index) => (
              <div key={step.title} className="algo-campaign-free-flow-item">
                <span>{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="algo-campaign-section algo-campaign-muted-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-truth-panel algo-campaign-founder-panel">
            <div className="algo-campaign-founder-image">
              <Image
                src={algoTradingCourse.visuals.founderPortrait}
                alt={`Founder portrait of ${site.founderName}`}
                width={900}
                height={1089}
                loading="eager"
                sizes="(max-width: 719px) 160px, 220px"
                unoptimized
              />
            </div>
            <div className="algo-campaign-founder-copy">
              <ShieldCheck size={22} strokeWidth={1.75} aria-hidden="true" />
              <p className="eyebrow">Founder / Expert Context</p>
              <h2 className="subsection-title">{site.founderName}</h2>
              <h3>{site.founderSubtitle}</h3>
              <p>{algoTradingCourse.founderContext.copy}</p>
              <ul className="algo-campaign-credibility-list">
                {algoTradingCourse.founderContext.credibilityPoints.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="algo-campaign-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-section-heading">
            <p className="eyebrow">FAQ</p>
            <h2>Before you register</h2>
          </div>

          <div className="algo-campaign-faq-list">
            {faqItems.map((item) => (
              <article key={item.question} className="algo-campaign-faq-row">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="register" className="algo-campaign-section algo-campaign-register-section">
        <div className="algo-campaign-shell algo-campaign-register-shell">
          <div className="algo-campaign-section-heading">
            <p className="eyebrow">Free Account Access</p>
            <h2>Register free to unlock Lecture 1 + Lecture 2</h2>
            <p>Create your account or log in to continue to the protected access page. No payment required.</p>
          </div>

          <AlgoTradingCourseRegister
            embedded
            className="algo-campaign-register-card"
            attributionSource="lp-trading-automation-masterclass"
            defaultNext={algoTradingCourse.accessRoute}
            heading="Create account or log in"
            subheading="Use the same course account flow. WhatsApp is collected only for course updates and support."
          />

          <p className="algo-campaign-register-fallback">
            Prefer the full registration page?{" "}
            <a href={algoTradingCourse.registerRoute}>Open registration page.</a>
          </p>
        </div>
      </section>

      <section className="algo-campaign-section algo-campaign-final-section">
        <div className="algo-campaign-shell">
          <div className="algo-campaign-final-card">
            <BookOpenCheck size={26} strokeWidth={1.75} aria-hidden="true" />
            <h2>Register free and unlock Lecture 1 + Lecture 2.</h2>
            <p>Educational content only. No profit guarantees.</p>
            <Button href={registerSectionHref} variant="primary">
              Get Free Access
            </Button>
          </div>

          <div className="algo-campaign-disclaimer">
            <ShieldCheck size={20} strokeWidth={1.75} aria-hidden="true" />
            <p>{campaignRiskDisclaimer}</p>
          </div>
        </div>
      </section>

      <div className="algo-campaign-sticky-cta">
        <span>Unlock Lecture 1 + Lecture 2</span>
        <Button href={registerSectionHref} variant="primary">
          Get Free Access
        </Button>
      </div>
    </main>
  );
}
