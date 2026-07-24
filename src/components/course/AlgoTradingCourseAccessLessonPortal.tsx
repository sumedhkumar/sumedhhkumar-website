"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  MessageCircle,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import CoursePaymentPopup from "./CoursePaymentPopup";

type AccessLesson = {
  title: string;
  copy: string;
  videoUrl: string;
  embedUrl: string;
  thumbnail: {
    src: string;
    alt: string;
  };
  duration?: string;
};

type AlgoTradingCourseAccessLessonPortalProps = {
  lessons: AccessLesson[];
  whatsappGroupUrl?: string;
};

const progressStorageKey = "vyntegra-algo-course-free-lesson-progress-v1";

function readStoredProgress(lessonCount: number) {
  try {
    const storedValue = window.localStorage.getItem(progressStorageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    if (!Array.isArray(parsedValue)) {
      return Array.from({ length: lessonCount }, () => false);
    }

    return Array.from({ length: lessonCount }, (_, index) => parsedValue[index] === true);
  } catch {
    return Array.from({ length: lessonCount }, () => false);
  }
}

export default function AlgoTradingCourseAccessLessonPortal({
  lessons,
  whatsappGroupUrl = "",
}: AlgoTradingCourseAccessLessonPortalProps) {
  const [completedLessons, setCompletedLessons] = useState<boolean[]>(
    () => Array.from({ length: lessons.length }, () => false),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

  useEffect(() => {
    const progressTimer = window.setTimeout(() => {
      setCompletedLessons(readStoredProgress(lessons.length));
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(progressTimer);
  }, [lessons.length]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(progressStorageKey, JSON.stringify(completedLessons));
  }, [completedLessons, isHydrated]);

  const completedCount = useMemo(
    () => completedLessons.filter(Boolean).length,
    [completedLessons],
  );

  function toggleLesson(index: number) {
    setCompletedLessons((currentValue) =>
      currentValue.map((isComplete, currentIndex) =>
        currentIndex === index ? !isComplete : isComplete,
      ),
    );
  }

  const progressPercent = lessons.length > 0
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const activeLesson = lessons[activeLessonIndex];
  const activeIsComplete = completedLessons[activeLessonIndex] === true;
  const activeCleanTitle = activeLesson
    ? activeLesson.title.replace(/^Lecture\s+\d+\s+-\s+/, "")
    : "";
  const activeHasVideoUrl = Boolean(activeLesson?.videoUrl);
  const activeHasEmbedUrl = Boolean(activeLesson?.embedUrl);

  return (
    <div className="algo-course-lms-layout">
      {/* ── Left Column: Course Navigation ── */}
      <aside className="algo-course-lms-nav">
        <div className="algo-course-lms-nav-scroll">
          <div className="algo-course-lms-nav-header">
            <p className="eyebrow">Course Navigation</p>
            <h2 className="algo-course-lms-nav-title">Free Lessons</h2>
          </div>

          {/* Progress bar */}
          <div className="algo-course-lms-progress-section">
            <div className="algo-course-lms-progress-label">
              <span>Course Progress</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="algo-course-lms-progress-track">
              <div
                className="algo-course-lms-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="algo-course-lms-progress-count">
              {completedCount} of {lessons.length} lessons completed
            </p>
          </div>

          {/* Lesson list */}
          <nav className="algo-course-lms-lesson-list" aria-label="Lesson navigation">
            {lessons.map((lesson, index) => {
              const isComplete = completedLessons[index] === true;
              const isActive = activeLessonIndex === index;
              const cleanTitle = lesson.title.replace(/^Lecture\s+\d+\s+-\s+/, "");

              return (
                <button
                  key={lesson.title}
                  type="button"
                  className={[
                    "algo-course-lms-lesson-item",
                    isActive ? "is-active" : "",
                    isComplete ? "is-complete" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => {
                    if (index >= 2) {
                      setIsPaymentPopupOpen(true);
                    } else {
                      setActiveLessonIndex(index);
                    }
                  }}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="algo-course-lms-lesson-number">
                    {isComplete ? (
                      <CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>
                  <span className="algo-course-lms-lesson-info">
                    <span className="algo-course-lms-lesson-kicker">Lecture {index + 1}</span>
                    <span className="algo-course-lms-lesson-title">{cleanTitle}</span>
                    {lesson.duration ? (
                      <span className="algo-course-lms-lesson-duration">
                        <Clock size={12} aria-hidden="true" />
                        {lesson.duration}
                      </span>
                    ) : null}
                  </span>
                  <span className="algo-course-lms-lesson-status">
                    {isActive && !isComplete ? (
                      <PlayCircle size={18} strokeWidth={1.6} aria-hidden="true" />
                    ) : isComplete ? (
                      <CheckCircle2 size={18} strokeWidth={1.6} aria-hidden="true" />
                    ) : (
                      <Circle size={18} strokeWidth={1.6} aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}

            {/* Informational step */}
            <div className="algo-course-lms-lesson-item algo-course-lms-step-info">
              <span className="algo-course-lms-lesson-number">
                <span>{lessons.length + 1}</span>
              </span>
              <span className="algo-course-lms-lesson-info">
                <span className="algo-course-lms-lesson-kicker">Next Step</span>
                <span className="algo-course-lms-lesson-title">Join updates or ask questions</span>
              </span>
            </div>
          </nav>
        </div>

        {whatsappGroupUrl && (
          <div className="algo-course-lms-nav-footer">
            <Button 
              href={whatsappGroupUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="algo-course-lms-whatsapp-btn"
            >
              <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
              Join WhatsApp Community
            </Button>
          </div>
        )}
      </aside>

      {/* ── Right Column: Learning Area ── */}
      <main className="algo-course-lms-main">
        {/* Large video player */}
        {activeLesson ? (
          <>
            <div className="algo-course-lms-video-frame">
              {activeHasEmbedUrl ? (
                <iframe
                  src={activeLesson.embedUrl}
                  title={`${activeLesson.title} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <>
                  <Image
                    src={activeLesson.thumbnail.src}
                    alt={activeLesson.thumbnail.alt}
                    width={720}
                    height={420}
                    priority
                  />
                  <div className="algo-course-lms-video-placeholder">
                    <PlayCircle size={48} strokeWidth={1.4} aria-hidden="true" />
                    <span>
                      Lesson video will appear here when configured.
                    </span>
                  </div>
                </>
              )}

              <span className="algo-course-lms-status-badge">
                {activeIsComplete ? (
                  <CheckCircle2 size={15} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Circle size={15} strokeWidth={1.8} aria-hidden="true" />
                )}
                {activeIsComplete ? "Completed" : "Unlocked"}
              </span>
            </div>

            {/* Lesson information */}
            <div className="algo-course-lms-lesson-detail">
              <div className="algo-course-lms-lesson-detail-header">
                <div>
                  <span className="algo-course-card-kicker">Lecture {activeLessonIndex + 1}</span>
                  <h2 className="algo-course-lms-lesson-detail-title">{activeCleanTitle}</h2>
                </div>
                <div className="algo-course-lms-lesson-meta-row">
                  <span>Instructor: <strong>Sumedh Kumar</strong></span>
                  {activeLesson.duration ? (
                    <span>
                      <Clock size={13} aria-hidden="true" />
                      {activeLesson.duration}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="body-standard">{activeLesson.copy}</p>

              {/* Inline progress */}
              <div className="algo-course-lms-inline-progress">
                <div className="algo-course-lms-progress-label">
                  <span>Course Progress</span>
                  <strong>{progressPercent}%</strong>
                </div>
                <div className="algo-course-lms-progress-track">
                  <div
                    className="algo-course-lms-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="algo-course-lms-progress-count">
                  {completedCount} of {lessons.length} lessons completed
                </p>
              </div>

              {/* Actions */}
              <div className="algo-course-lms-actions">
                {activeHasVideoUrl && !activeHasEmbedUrl ? (
                  <Button
                    href={activeLesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                  >
                    <PlayCircle size={17} strokeWidth={1.8} aria-hidden="true" />
                    Watch lesson
                  </Button>
                ) : null}
                {activeHasVideoUrl && activeHasEmbedUrl ? (
                  <Button
                    href={activeLesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                  >
                    <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
                    Open in new tab
                  </Button>
                ) : (
                  activeHasVideoUrl ? null : (
                    <p className="algo-course-lms-video-note">
                      The lesson slot is ready. The video will appear here
                      when it is available.
                    </p>
                  )
                )}
                <Button
                  type="button"
                  variant={activeIsComplete ? "secondary" : "primary"}
                  className="algo-course-lms-complete-btn"
                  onClick={() => toggleLesson(activeLessonIndex)}
                >
                  <CheckCircle2 size={17} strokeWidth={1.8} aria-hidden="true" />
                  {activeIsComplete ? "Completed" : "Mark as complete"}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </main>

      <CoursePaymentPopup
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
      />
    </div>
  );
}
