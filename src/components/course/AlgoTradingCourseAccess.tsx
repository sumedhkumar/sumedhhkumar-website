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
  const accessLessons = algoTradingCourse.accessLessons.slice(0, 2);
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
      <section className="section algo-course-access-hero">
        <div className="container algo-course-access-hero-stack">
          <div className="algo-course-hero-copy">
            <p className="eyebrow">{algoTradingCourse.name}</p>
            <h1 className="hero-title">Your free lesson portal is ready.</h1>
            <p className="body-large">
              Start with the roadmap, continue to the first teaching session,
              and mark each lesson complete as you go.
            </p>
            <AlgoTradingCourseLeadGreeting
              email={registrationEmail}
              fullName={registrationFullName}
            />
            <div className="algo-course-access-hero-actions">
              <Button href="#course-lessons" variant="primary">
                Start Lecture 1
                <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </Button>
            </div>
            <AlgoTradingCourseAccessLogout email={registrationEmail} />
          </div>

          <div className="algo-course-access-summary" aria-label="Student access summary">
            <span>Student Access</span>
            <strong>Lecture 1 - Course Roadmap</strong>
            <strong>Lecture 2 - First Teaching Session</strong>
            <span>Free lessons unlocked</span>
          </div>
        </div>
      </section>

      <section id="course-lessons" className="section algo-course-access-lessons-section">
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Lesson Watch Area</p>
            <h2 className="section-title">Watch Lecture 1 and Lecture 2</h2>
            <p className="body-standard">
              Follow the compact path, open the lessons, and save your progress
              on this device.
            </p>
          </div>

          <AlgoTradingCourseAccessLessonPortal lessons={portalLessons} />
        </div>
      </section>

      <section className="section algo-course-access-next-section">
        <div className="container">
          <div className="algo-course-access-next-band">
            <div className="algo-course-access-section-heading">
              <BookOpenCheck size={22} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="eyebrow">After Watching</p>
                <h2 className="subsection-title">After both lessons, choose your next step</h2>
              </div>
            </div>
            <ul className="algo-course-access-next-list">
              <li>
                Mark both lessons complete when you finish watching them.
              </li>
              <li>
                Join updates or contact support if you need help with access.
              </li>
              <li>
                Ask about the full course only if you want the longer weekend
                learning structure.
              </li>
            </ul>
          </div>

          <div className="algo-course-access-full-course-cta">
            <div>
              <p className="eyebrow">Full Program</p>
              <h2 className="subsection-title">
                Want to continue with the full 3-month weekend program?
              </h2>
              <ul>
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
          </div>
        </div>
      </section>

      <section className="section algo-course-access-support-section">
        <div className="container">
          <div
            className={`algo-course-access-support-band${
              hasWhatsappSupport ? "" : " is-email-only"
            }`}
          >
            {safeWhatsappGroupUrl ? (
              <div className="algo-course-access-support-item">
                <MessageCircle
                  size={24}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div>
                  <p className="eyebrow">Updates</p>
                  <h2 className="subsection-title">Join lesson updates</h2>
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
              <div className="algo-course-access-support-item">
                <MessageCircle
                  size={24}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div>
                  <p className="eyebrow">Help</p>
                  <h2 className="subsection-title">Message support</h2>
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

            <div className="algo-course-access-support-item">
              <MessageCircle
                size={24}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div>
                <p className="eyebrow">Email Support</p>
                <h2 className="subsection-title">
                  {hasWhatsappSupport
                    ? "Prefer email?"
                    : "Need help with lesson access?"}
                </h2>
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
        </div>
      </section>

      <section className="section algo-course-disclaimer-section">
        <div className="container">
          <div className="algo-course-disclaimer">
            <ShieldCheck
              size={22}
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
