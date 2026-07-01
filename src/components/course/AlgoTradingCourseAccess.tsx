import {
  CheckCircle2,
  CircleAlert,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  algoTradingCourse,
  getSafeCoursePaymentUrl,
  getSafeCourseVideoUrl,
  getSafeCourseWhatsappContactUrl,
  getSafeCourseWhatsappGroupUrl,
} from "@/data/algo-trading-course";
import Button from "@/components/ui/Button";
import AlgoTradingCourseLeadGreeting from "@/components/course/AlgoTradingCourseLeadGreeting";

type AlgoTradingCourseAccessProps = {
  registrationEmail?: string;
  registrationFullName?: string;
  registrationAccessStatus?: "free_access" | "paid";
  registrationPaymentStatus?: "unpaid" | "paid" | "manual_verification";
};

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

export function AlgoTradingCourseAccessBlocked() {
  return (
    <main className="algo-course-page algo-course-access-page">
      <section className="section algo-course-access-hero">
        <div className="container algo-course-reset-shell">
          <div className="depth-panel algo-course-reset-card algo-course-blocked-card">
            <div className="algo-course-reset-icon algo-course-blocked-icon">
              <CircleAlert size={24} strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div className="algo-course-auth-header">
              <p className="eyebrow">Access Support</p>
              <h1 className="section-title">Course access needs review</h1>
              <p className="body-standard">
                Your course access is currently unavailable. Please contact
                Vyntegra support so the team can review your registration.
              </p>
            </div>
            <div className="algo-course-register-trust">
              <ShieldCheck size={19} strokeWidth={1.75} aria-hidden="true" />
              <p>{algoTradingCourse.disclaimer}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function AlgoTradingCourseAccess({
  registrationEmail = "",
  registrationFullName = "",
  registrationAccessStatus = "free_access",
  registrationPaymentStatus = "unpaid",
}: AlgoTradingCourseAccessProps) {
  const safeWhatsappGroupUrl = getSafeCourseWhatsappGroupUrl(
    algoTradingCourse.links.whatsappGroupUrl,
  );
  const safeWhatsappContactUrl = getSafeCourseWhatsappContactUrl(
    algoTradingCourse.links.whatsappPhone,
    algoTradingCourse.links.whatsappPrefilledMessage,
  );
  const safePaymentUrl = getSafeCoursePaymentUrl(
    algoTradingCourse.links.paymentLink,
  );
  const isPaidRegistration =
    registrationPaymentStatus === "paid" || registrationAccessStatus === "paid";
  const isManualVerification =
    registrationPaymentStatus === "manual_verification" && !isPaidRegistration;
  const showPaymentCta = !isPaidRegistration && !isManualVerification;

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
            <AlgoTradingCourseLeadGreeting
              email={registrationEmail}
              fullName={registrationFullName}
            />
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
            {algoTradingCourse.accessLessons.map((lesson, index) => {
              const safeVideoUrl = getSafeCourseVideoUrl(lesson.videoUrl);

              return (
                <article key={lesson.title} className="standard-card algo-course-access-video-card">
                  <span className="algo-course-card-kicker">
                    Watch {String(index + 1).padStart(2, "0")}
                  </span>
                  {safeVideoUrl ? (
                    <a
                      className="algo-course-video-placeholder algo-course-video-link algo-course-access-video-placeholder"
                      href={safeVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PlayCircle size={34} strokeWidth={1.65} aria-hidden="true" />
                      <span>Open lesson video</span>
                    </a>
                  ) : (
                    <div className="algo-course-video-placeholder algo-course-access-video-placeholder">
                      <PlayCircle size={34} strokeWidth={1.65} aria-hidden="true" />
                      <span>{lesson.placeholder}</span>
                    </div>
                  )}
                  <h3 className="card-title">{lesson.title}</h3>
                  <p className="body-compact">{lesson.copy}</p>
                </article>
              );
            })}
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
                {safeWhatsappGroupUrl
                  ? "The configured WhatsApp group opens in a new tab."
                  : "WhatsApp group link will be added here."}
              </p>
            </div>
            {safeWhatsappGroupUrl ? (
              <Button
                href={safeWhatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                Join WhatsApp Group
              </Button>
            ) : (
              <PlaceholderButton>Join WhatsApp Group</PlaceholderButton>
            )}
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
                {safeWhatsappContactUrl
                  ? "WhatsApp opens with the approved joining message."
                  : "WhatsApp contact number will be added here."}
              </p>
            </div>
            {safeWhatsappContactUrl ? (
              <Button
                href={safeWhatsappContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                Talk to Us on WhatsApp
              </Button>
            ) : (
              <PlaceholderButton>Talk to Us on WhatsApp</PlaceholderButton>
            )}
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
                {safePaymentUrl
                  ? algoTradingCourse.paymentInstructions.activeCopy
                  : algoTradingCourse.paymentInstructions.placeholderCopy}
              </p>
              {isPaidRegistration ? (
                <div className="algo-course-payment-status-panel algo-course-payment-status-paid">
                  <CheckCircle2 size={20} strokeWidth={1.75} aria-hidden="true" />
                  <p>{algoTradingCourse.paidStatusCopy}</p>
                </div>
              ) : null}
              {isManualVerification ? (
                <div className="algo-course-payment-status-panel algo-course-payment-status-manual">
                  <CircleAlert size={20} strokeWidth={1.75} aria-hidden="true" />
                  <p>{algoTradingCourse.manualVerificationStatusCopy}</p>
                </div>
              ) : null}
              <div className="algo-course-after-payment-panel">
                <h3 className="card-title">After payment</h3>
                <ol>
                  {algoTradingCourse.afterPaymentSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p>{algoTradingCourse.manualVerificationNote}</p>
              </div>
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
                <small>
                  {safePaymentUrl
                    ? algoTradingCourse.paymentInstructions.configuredLabel
                    : algoTradingCourse.paymentInstructions.pendingLabel}
                </small>
              </div>
              {showPaymentCta && safePaymentUrl ? (
                <Button
                  href={safePaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                >
                  Pay {algoTradingCourse.pricing.launchOfferLabel} and Join Full Course
                </Button>
              ) : showPaymentCta ? (
                <PlaceholderButton variant="primary">
                  Pay {algoTradingCourse.pricing.launchOfferLabel} and Join Full Course
                </PlaceholderButton>
              ) : (
                <PlaceholderButton variant="primary">
                  Payment review in progress
                </PlaceholderButton>
              )}
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
