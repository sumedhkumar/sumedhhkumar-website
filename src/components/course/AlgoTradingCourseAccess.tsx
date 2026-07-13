import {
  ArrowRight,
  BookOpenCheck,
  CircleAlert,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import {
  algoTradingCourse,
  getSafeCourseVideoEmbedUrl,
  getSafeCourseVideoUrl,
  getSafeCourseWhatsappContactUrl,
  getSafeCourseWhatsappGroupUrl,
} from "@/data/algo-trading-course";
import { getPublicContactDetails } from "@/data/site";
import Button from "@/components/ui/Button";
import AlgoTradingCourseLeadGreeting from "@/components/course/AlgoTradingCourseLeadGreeting";
import AlgoTradingCourseAccessLogout from "@/components/course/AlgoTradingCourseAccessLogout";
import AlgoTradingCourseAccessLessonPortal from "@/components/course/AlgoTradingCourseAccessLessonPortal";

type AlgoTradingCourseAccessProps = {
  registrationEmail?: string;
  registrationFullName?: string;
};

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
}: AlgoTradingCourseAccessProps) {
  const accessLessons = algoTradingCourse.accessLessons.slice(0, 25);
  const portalLessons = accessLessons.map((lesson, index) => ({
    title: lesson.title,
    copy: lesson.copy,
    videoUrl: getSafeCourseVideoUrl(lesson.videoUrl),
    embedUrl: getSafeCourseVideoEmbedUrl(lesson.videoUrl),
    thumbnail:
      algoTradingCourse.visuals.lessonPreviews[index] ??
      algoTradingCourse.visuals.lessonPreviews[0],
  }));
  const safeWhatsappGroupUrl = getSafeCourseWhatsappGroupUrl(
    algoTradingCourse.links.whatsappGroupUrl,
  );
  const safeWhatsappContactUrl = getSafeCourseWhatsappContactUrl(
    algoTradingCourse.links.whatsappPhone,
    algoTradingCourse.support.accessWhatsappPrefilledMessage,
  );
  const supportEmail = getPublicContactDetails().email;
  const supportHref = supportEmail
    ? `mailto:${supportEmail}?subject=${encodeURIComponent(algoTradingCourse.support.accessEmailSubject)}`
    : "/contact";
  const fullCourseHref = supportEmail
    ? `mailto:${supportEmail}?subject=${encodeURIComponent(algoTradingCourse.support.fullCourseInquirySubject)}`
    : "/contact";
  const hasWhatsappSupport = Boolean(
    safeWhatsappGroupUrl || safeWhatsappContactUrl,
  );

  return (
    <main className="algo-course-page algo-course-access-page">
      {/* ── Compact LMS Header ── */}
      <header className="algo-course-lms-header">
        <div className="container algo-course-lms-header-inner">
          <div className="algo-course-lms-header-left">
            <p className="eyebrow">{algoTradingCourse.name}</p>
            <AlgoTradingCourseLeadGreeting
              email={registrationEmail}
              fullName={registrationFullName}
            />
          </div>
          <AlgoTradingCourseAccessLogout email={registrationEmail} />
        </div>
      </header>

      {/* ── Two-Column LMS Body ── */}
      <div className="container algo-course-lms-body">
        <AlgoTradingCourseAccessLessonPortal
          lessons={portalLessons}
          whatsappGroupUrl={safeWhatsappGroupUrl}
        />

        {/* ── Below-fold content inside the right column space ── */}
        <div className="algo-course-lms-below-fold">
          {/* After Watching */}
          <section className="algo-course-lms-section-card">
            <div className="algo-course-lms-section-heading">
              <BookOpenCheck size={20} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="eyebrow">After Watching</p>
                <h2 className="subsection-title">After the lessons, choose your next step</h2>
              </div>
            </div>
            <ul className="algo-course-access-next-list">
              <li>
                Mark the lessons complete when you finish watching them.
              </li>
              <li>
                Join updates or contact support if you need help with access.
              </li>
              <li>
                Ask about the full course only if you want the longer weekend
                learning structure.
              </li>
            </ul>
          </section>

          {/* Full Course CTA */}
          <section className="algo-course-lms-section-card algo-course-lms-full-course">
            <div>
              <p className="eyebrow">Full Program</p>
              <h2 className="subsection-title">
                Want to continue with the full 3-month weekend program?
              </h2>
              <ul className="algo-course-lms-tag-list">
                <li>3-month weekend learning structure</li>
                <li>2-hour sessions</li>
                <li>Recordings and updates</li>
                <li>TradingView / MT5 workflow education</li>
                {safeWhatsappGroupUrl || safeWhatsappContactUrl ? (
                  <li>WhatsApp support and course community updates</li>
                ) : null}
              </ul>
            </div>
            <Button href={fullCourseHref} variant="primary">
              Ask about full course access
              <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </Button>
          </section>

          {/* Support */}
          <section className="algo-course-lms-support-section">
            <div
              className={`algo-course-lms-support-band${
                hasWhatsappSupport ? "" : " is-email-only"
              }`}
            >
              {safeWhatsappGroupUrl ? (
                <div className="algo-course-lms-support-item">
                  <MessageCircle
                    size={22}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="eyebrow">Updates</p>
                    <h3 className="subsection-title">Join lesson updates</h3>
                    <p className="body-standard">
                      Get lesson reminders and course announcements in the
                      student WhatsApp group.
                    </p>
                  </div>
                  <Button
                    href={safeWhatsappGroupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                  >
                    Join WhatsApp group
                  </Button>
                </div>
              ) : null}

              {safeWhatsappContactUrl ? (
                <div className="algo-course-lms-support-item">
                  <MessageCircle
                    size={22}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="eyebrow">Help</p>
                    <h3 className="subsection-title">Message support</h3>
                    <p className="body-standard">
                      Ask for help if you are unable to open lessons or need
                      guidance on the next step.
                    </p>
                  </div>
                  <Button
                    href={safeWhatsappContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                  >
                    Message support
                  </Button>
                </div>
              ) : null}

              <div className="algo-course-lms-support-item">
                <MessageCircle
                  size={22}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div>
                  <p className="eyebrow">Email Support</p>
                  <h3 className="subsection-title">
                    {hasWhatsappSupport
                      ? "Prefer email?"
                      : "Need help with lesson access?"}
                  </h3>
                  <p className="body-standard">
                    Email Vyntegra support for access help, lesson updates, or
                    questions about the course path.
                  </p>
                  {supportEmail ? (
                    <p className="body-compact algo-course-support-email">
                      {supportEmail}
                    </p>
                  ) : null}
                </div>
                <Button href={supportHref} variant="secondary">
                  Email support
                </Button>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="algo-course-disclaimer">
            <ShieldCheck
              size={22}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <p>{algoTradingCourse.disclaimer}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
