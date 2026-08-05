"use client";

import {
  BookOpenCheck,
  CircleAlert,
  MessageCircle,
  ShieldCheck,
  LogOut,
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
import AlgoTradingCourseAccessLessonPortal from "@/components/course/AlgoTradingCourseAccessLessonPortal";
import CourseQueryForm from "@/components/course/CourseQueryForm";
import JoinProgramButton from "@/components/course/JoinProgramButton";

type AlgoTradingCourseAccessProps = {
  registrationEmail?: string;
  registrationFullName?: string;
  initialProgress?: boolean[];
};

function WhatsAppIcon({ size = 20, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
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
  initialProgress = [],
}: AlgoTradingCourseAccessProps) {
  let globalLessonIndex = 0;
  const portalModules = algoTradingCourse.courseModules.map((mod) => ({
    title: mod.title,
    description: mod.description,
    lessons: mod.lessons.map((lesson) => {
      const idx = globalLessonIndex++;
      return {
        title: lesson.title,
        copy: lesson.copy,
        videoUrl: getSafeCourseVideoUrl(lesson.videoUrl),
        embedUrl: getSafeCourseVideoEmbedUrl(lesson.videoUrl),
        thumbnail:
          algoTradingCourse.visuals.lessonPreviews[idx] ??
          algoTradingCourse.visuals.lessonPreviews[0],
      };
    }),
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

  function handleLogout() {
    // Clear all vyn_ cookies
    const cookieNames = ["vyn_user_email", "vyn_user_name", "vyn_cookie_consent"];
    cookieNames.forEach((name) => {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    });
    // Also clear any sb- (Supabase) cookies
    document.cookie.split(";").forEach((c) => {
      const name = c.trim().split("=")[0];
      if (name.startsWith("sb-")) {
        document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
      }
    });
    window.location.assign(algoTradingCourse.registerRoute);
  }

  return (
    <main className="algo-course-page algo-course-access-page">
      {/* ── Compact LMS Header ── */}
      <header className="algo-course-lms-header">
        <div className="container algo-course-lms-header-inner">
          <div className="algo-course-lms-header-left">
            <p className="eyebrow">{algoTradingCourse.name}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <AlgoTradingCourseLeadGreeting
                email={registrationEmail}
                fullName={registrationFullName}
              />
              <button
                onClick={handleLogout}
                className="algo-course-access-logout-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#475569",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  transition: "color 0.2s"
                }}
              >
                <LogOut size={15} strokeWidth={2.5} aria-hidden="true" />
                LOG OUT
              </button>
            </div>
          </div>
          {safeWhatsappGroupUrl ? (
            <div className="algo-course-access-logout-panel">
              <Button
                href={safeWhatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                className="algo-course-access-logout-button"
                style={{ color: "#25D366", borderColor: "rgba(37, 211, 102, 0.4)" }}
              >
                <WhatsAppIcon size={18} aria-hidden="true" />
                WhatsApp
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      {/* ── Two-Column LMS Body ── */}
      <div className="container algo-course-lms-body">
        <AlgoTradingCourseAccessLessonPortal
          modules={portalModules}
          whatsappGroupUrl={safeWhatsappGroupUrl}
          initialProgress={initialProgress}
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
            <JoinProgramButton />
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
                <div style={{ width: "100%" }}>
                  <p className="eyebrow">Email Support</p>
                  <h3 className="subsection-title">
                    Got a query?
                  </h3>
                  <p className="body-standard" style={{ marginBottom: "12px" }}>
                    Send us your question below and we will reply to your registered email.
                  </p>
                  <CourseQueryForm 
                    registrationEmail={registrationEmail} 
                    registrationFullName={registrationFullName} 
                  />
                </div>
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
