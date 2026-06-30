import {
  CheckCircle2,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { algoTradingCourse } from "@/data/algo-trading-course";
import Button from "@/components/ui/Button";
import AlgoTradingCourseLeadGreeting from "@/components/course/AlgoTradingCourseLeadGreeting";

const WHATSAPP_GROUP_LINK_PLACEHOLDER = "";
const WHATSAPP_PHONE_NUMBER_PLACEHOLDER = "";
const PAYMENT_LINK_PLACEHOLDER = "";
const TALK_WHATSAPP_PREFILLED_MESSAGE =
  "Hi, I watched the Vyntegra Trading Automation Masterclass free lectures. I want to discuss the \u20B928,999 launch offer and course joining process.";

function PlaceholderButton({
  children,
  variant = "secondary",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Button type="button" variant={variant} disabled>
      {children}
    </Button>
  );
}

export default function AlgoTradingCourseAccess() {
  void WHATSAPP_GROUP_LINK_PLACEHOLDER;
  void WHATSAPP_PHONE_NUMBER_PLACEHOLDER;
  void PAYMENT_LINK_PLACEHOLDER;
  void TALK_WHATSAPP_PREFILLED_MESSAGE;

  return (
    <main className="algo-course-page algo-course-access-page">
      <section className="section algo-course-access-hero">
        <div className="container algo-course-access-hero-grid">
          <div className="algo-course-hero-copy">
            <p className="eyebrow">{algoTradingCourse.name}</p>
            <h1 className="hero-title">Your Free Masterclass Access</h1>
            <p className="body-large">
              Watch the intro, Lecture 0 and Lecture 1. Then join the WhatsApp
              group or speak with us before joining the full 3-month program.
            </p>
            <AlgoTradingCourseLeadGreeting />
          </div>

          <div className="depth-panel algo-course-access-summary">
            <div className="algo-course-panel-header">
              <p className="eyebrow">Access Brief</p>
              <h2 className="subsection-title">Free preview unlocked</h2>
              <p className="body-compact">
                Use this page to review the preview lessons and continue to
                the full course only after the learning style is clear.
              </p>
            </div>
            <div className="algo-course-access-summary-grid">
              {algoTradingCourse.stats.map(([label, copy]) => (
                <div key={label}>
                  <strong>{label}</strong>
                  <span>{copy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-bg-secondary">
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Free Lessons</p>
            <h2 className="section-title">Watch the free masterclass preview</h2>
            <p className="body-standard">
              These placeholders are reserved for the intro video, Lecture 0,
              and Lecture 1. Real video links will be added later.
            </p>
          </div>

          <div className="algo-course-access-video-grid">
            {algoTradingCourse.accessLessons.map((lesson, index) => (
              <article key={lesson.title} className="standard-card algo-course-access-video-card">
                <span className="algo-course-card-kicker">
                  Watch {String(index + 1).padStart(2, "0")}
                </span>
                <div className="algo-course-video-placeholder algo-course-access-video-placeholder">
                  <PlayCircle size={34} strokeWidth={1.65} aria-hidden="true" />
                  <span>{lesson.placeholder}</span>
                </div>
                <h3 className="card-title">{lesson.title}</h3>
                <p className="body-compact">{lesson.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-primary">
        <div className="container algo-course-access-action-grid">
          <article className="depth-panel algo-course-access-action-card">
            <MessageCircle
              size={24}
              color="#B8914A"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div>
              <p className="eyebrow">Updates</p>
              <h2 className="subsection-title">Join the Free WhatsApp Group</h2>
              <p className="body-standard">
                Get course updates, reminders, and joining instructions in the
                WhatsApp group.
              </p>
              <p className="body-compact algo-course-placeholder-note">
                WhatsApp group link will be added here.
              </p>
            </div>
            <PlaceholderButton>Join WhatsApp Group</PlaceholderButton>
          </article>

          <article className="depth-panel algo-course-access-action-card">
            <MessageCircle
              size={24}
              color="#B8914A"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div>
              <p className="eyebrow">Conversation</p>
              <h2 className="subsection-title">Want to discuss before joining?</h2>
              <p className="body-standard">
                Speak with the team about the launch offer, batch details, and
                whether the course is right for you.
              </p>
              <p className="body-compact algo-course-placeholder-note">
                WhatsApp contact number will be added here.
              </p>
            </div>
            <PlaceholderButton>Talk to Us on WhatsApp</PlaceholderButton>
          </article>
        </div>
      </section>

      <section className="section section-bg-secondary">
        <div className="container">
          <div className="depth-panel algo-course-pricing-panel algo-course-access-payment-panel">
            <div>
              <p className="eyebrow">Full Program</p>
              <h2 className="section-title">Join the Full 3-Month Program</h2>
              <p className="body-standard">
                Payment link will be added here. For now, use the WhatsApp
                option to discuss joining the launch batch.
              </p>
            </div>
            <div className="algo-course-price-stack">
              <div>
                <span>Course Value</span>
                <strong className="algo-course-price-muted">
                  {algoTradingCourse.pricing.valueLabel}
                </strong>
                <small>Standard program value</small>
              </div>
              <div>
                <span>Launch Batch Offer</span>
                <strong>{algoTradingCourse.pricing.launchOfferLabel}</strong>
                <small>Payment link will be added after final setup</small>
              </div>
              <PlaceholderButton variant="primary">
                Pay {algoTradingCourse.pricing.launchOfferLabel} and Join Full Course
              </PlaceholderButton>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-bg-primary">
        <div className="container algo-course-included-grid">
          <div>
            <p className="eyebrow">Paid Program</p>
            <h2 className="section-title">Included in the full program</h2>
            <p className="body-standard">
              The paid program focuses on weekend training, recordings, support,
              and practical platform-oriented learning.
            </p>
          </div>

          <div className="depth-panel algo-course-included-panel">
            {algoTradingCourse.paidProgramIncluded.map((item) => (
              <div key={item} className="algo-course-included-item">
                <CheckCircle2
                  size={18}
                  color="#B8914A"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-secondary">
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Next Steps</p>
            <h2 className="section-title">How to continue</h2>
          </div>
          <ol className="algo-course-next-steps">
            {algoTradingCourse.accessNextSteps.map((step, index) => (
              <li key={step} className="standard-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-bg-primary algo-course-disclaimer-section">
        <div className="container">
          <div className="algo-course-disclaimer depth-panel">
            <ShieldCheck
              size={22}
              color="#B8914A"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <p>{algoTradingCourse.disclaimer}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
