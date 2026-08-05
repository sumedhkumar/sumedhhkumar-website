"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  ExternalLink,
  MessageCircle,
  PlayCircle,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import CoursePaymentPopup from "./CoursePaymentPopup";

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

type AccessModule = {
  title: string;
  description: string;
  lessons: AccessLesson[];
};

type AlgoTradingCourseAccessLessonPortalProps = {
  modules: AccessModule[];
  whatsappGroupUrl?: string;
  initialProgress?: boolean[];
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

/** Build a flat list of all lessons and a mapping from flat index to (moduleIndex, lessonIndex). */
function buildFlatIndex(modules: AccessModule[]) {
  const flatLessons: AccessLesson[] = [];
  const indexMap: { moduleIndex: number; lessonIndex: number }[] = [];

  for (let mi = 0; mi < modules.length; mi++) {
    for (let li = 0; li < modules[mi].lessons.length; li++) {
      flatLessons.push(modules[mi].lessons[li]);
      indexMap.push({ moduleIndex: mi, lessonIndex: li });
    }
  }

  return { flatLessons, indexMap };
}

export default function AlgoTradingCourseAccessLessonPortal({
  modules,
  whatsappGroupUrl = "",
  initialProgress = [],
}: AlgoTradingCourseAccessLessonPortalProps) {
  const { flatLessons, indexMap } = useMemo(() => buildFlatIndex(modules), [modules]);
  const totalLessonCount = flatLessons.length;

  const [completedLessons, setCompletedLessons] = useState<boolean[]>(
    () => Array.from({ length: totalLessonCount }, () => false),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeFlatIndex, setActiveFlatIndex] = useState(0);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(() => new Set([0]));

  useEffect(() => {
    const progressTimer = window.setTimeout(() => {
      // If server provided progress, use it. Otherwise attempt migration from local storage.
      if (initialProgress && initialProgress.length > 0) {
        setCompletedLessons(initialProgress);
      } else {
        const stored = readStoredProgress(totalLessonCount);
        setCompletedLessons(stored);
        
        // If we migrated from local storage and have completed lessons, sync to server
        if (stored.some(Boolean)) {
          fetch("/api/course-registrations/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseSlug: "algo-trading",
              progressState: stored,
            }),
          }).catch(console.error);
        }
      }
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(progressTimer);
  }, [totalLessonCount, initialProgress]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    // Keep localStorage in sync for redundancy
    window.localStorage.setItem(progressStorageKey, JSON.stringify(completedLessons));
  }, [completedLessons, isHydrated]);

  const completedCount = useMemo(
    () => completedLessons.filter(Boolean).length,
    [completedLessons],
  );

  function toggleLesson(index: number) {
    const nextState = completedLessons.map((isComplete, currentIndex) =>
      currentIndex === index ? !isComplete : isComplete,
    );
    setCompletedLessons(nextState);

    // Sync to server in background
    fetch("/api/course-registrations/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug: "algo-trading",
        progressState: nextState,
      }),
    }).catch(console.error);
  }

  function toggleModule(moduleIndex: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleIndex)) {
        next.delete(moduleIndex);
      } else {
        next.add(moduleIndex);
      }
      return next;
    });
  }

  function handleLessonClick(flatIndex: number) {
    if (flatIndex >= 2) {
      setIsPaymentPopupOpen(true);
    } else {
      setActiveFlatIndex(flatIndex);
      // Auto-expand the module containing the clicked lesson
      const { moduleIndex } = indexMap[flatIndex];
      setExpandedModules((prev) => {
        const next = new Set(prev);
        next.add(moduleIndex);
        return next;
      });
    }
  }

  const progressPercent = totalLessonCount > 0
    ? Math.round((completedCount / totalLessonCount) * 100)
    : 0;

  const activeLesson = flatLessons[activeFlatIndex];
  const activeIsComplete = completedLessons[activeFlatIndex] === true;
  const activeCleanTitle = activeLesson
    ? activeLesson.title.replace(/^Lecture\s+\d+\s+-\s+/, "")
    : "";
  const activeHasVideoUrl = Boolean(activeLesson?.videoUrl);
  const activeHasEmbedUrl = Boolean(activeLesson?.embedUrl);
  const activeModuleIndex = indexMap[activeFlatIndex]?.moduleIndex ?? 0;
  const activeModuleTitle = modules[activeModuleIndex]?.title ?? "";

  // Build per-module completion counts
  let flatOffset = 0;

  return (
    <div className="algo-course-lms-layout">
      {/* ── Left Column: Course Navigation ── */}
      <aside className="algo-course-lms-nav">
        <div className="algo-course-lms-nav-scroll">
          <div className="algo-course-lms-nav-header">
            <p className="eyebrow">Course Navigation</p>
            <h2 className="algo-course-lms-nav-title">Course Modules</h2>
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
              {completedCount} of {totalLessonCount} lessons completed
            </p>
          </div>

          {/* Module list */}
          <nav className="algo-course-lms-lesson-list" aria-label="Module navigation">
            {modules.map((mod, moduleIndex) => {
              const moduleLessonCount = mod.lessons.length;
              const moduleStartIndex = flatOffset;
              const isExpanded = expandedModules.has(moduleIndex);

              // Count completed lessons in this module
              let moduleCompleted = 0;
              for (let i = 0; i < moduleLessonCount; i++) {
                if (completedLessons[moduleStartIndex + i] === true) {
                  moduleCompleted++;
                }
              }
              const moduleAllComplete = moduleCompleted === moduleLessonCount;
              const moduleProgressPercent = moduleLessonCount > 0
                ? Math.round((moduleCompleted / moduleLessonCount) * 100)
                : 0;

              const moduleElement = (
                <div
                  key={mod.title}
                  className={[
                    "algo-course-lms-module-group",
                    isExpanded ? "is-expanded" : "",
                    moduleAllComplete ? "is-module-complete" : "",
                  ].filter(Boolean).join(" ")}
                >
                  {/* Module header */}
                  <button
                    type="button"
                    className="algo-course-lms-module-header"
                    onClick={() => toggleModule(moduleIndex)}
                    aria-expanded={isExpanded}
                  >
                    <span className="algo-course-lms-module-number">
                      {moduleAllComplete ? (
                        <CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />
                      ) : (
                        <span>{moduleIndex + 1}</span>
                      )}
                    </span>
                    <span className="algo-course-lms-module-info">
                      <span className="algo-course-lms-module-kicker">Module {moduleIndex + 1}</span>
                      <span className="algo-course-lms-module-title">{mod.title}</span>
                      <span className="algo-course-lms-module-meta">
                        <span className="algo-course-lms-module-progress-mini">
                          <span
                            className="algo-course-lms-module-progress-mini-fill"
                            style={{ width: `${moduleProgressPercent}%` }}
                          />
                        </span>
                        <span className="algo-course-lms-module-progress-text">
                          {moduleCompleted}/{moduleLessonCount}
                        </span>
                      </span>
                    </span>
                    <span className={`algo-course-lms-module-chevron${isExpanded ? " is-open" : ""}`}>
                      <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
                    </span>
                  </button>

                  {/* Module lessons (collapsible) */}
                  {isExpanded && (
                    <div className="algo-course-lms-module-lessons">
                      {mod.lessons.map((lesson, lessonIndex) => {
                        const currentFlatIndex = moduleStartIndex + lessonIndex;
                        const isComplete = completedLessons[currentFlatIndex] === true;
                        const isActive = activeFlatIndex === currentFlatIndex;
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
                            onClick={() => handleLessonClick(currentFlatIndex)}
                            aria-current={isActive ? "true" : undefined}
                          >
                            <span className="algo-course-lms-lesson-number">
                              {isComplete ? (
                                <CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />
                              ) : (
                                <span>{currentFlatIndex + 1}</span>
                              )}
                            </span>
                            <span className="algo-course-lms-lesson-info">
                              <span className="algo-course-lms-lesson-kicker">Lecture {currentFlatIndex + 1}</span>
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
                    </div>
                  )}
                </div>
              );

              flatOffset += moduleLessonCount;
              return moduleElement;
            })}

            {/* Informational step */}
            <div className="algo-course-lms-lesson-item algo-course-lms-step-info">
              <span className="algo-course-lms-lesson-number">
                <span>{totalLessonCount + 1}</span>
              </span>
              <span className="algo-course-lms-lesson-info">
                <span className="algo-course-lms-lesson-kicker">Next Step</span>
                <span className="algo-course-lms-lesson-title">Join updates or ask questions</span>
              </span>
            </div>
          </nav>
        </div>

        {whatsappGroupUrl && (
          <div className="algo-course-lms-nav-footer" style={{ padding: "16px 20px" }}>
            <Button 
              href={whatsappGroupUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="algo-course-lms-whatsapp-btn premium-whatsapp-btn"
              style={{
                background: "linear-gradient(135deg, #128C7E 0%, #25D366 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                width: "100%",
                fontWeight: 600,
                boxShadow: "0 4px 14px rgba(37, 211, 102, 0.3)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}>
              <WhatsAppIcon size={18} aria-hidden="true" />
              JOIN WHATSAPP COMMUNITY
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
                  <span className="algo-course-card-kicker">
                    Module {activeModuleIndex + 1} · Lecture {activeFlatIndex + 1}
                  </span>
                  <p className="algo-course-lms-lesson-module-label">{activeModuleTitle}</p>
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
                  {completedCount} of {totalLessonCount} lessons completed
                </p>
              </div>

              {/* Actions */}
              <div className="algo-course-lms-actions">
                <Button
                  type="button"
                  variant={activeIsComplete ? "secondary" : "primary"}
                  className="algo-course-lms-complete-btn"
                  onClick={() => toggleLesson(activeFlatIndex)}
                >
                  <CheckCircle2 size={17} strokeWidth={1.8} aria-hidden="true" />
                  {activeIsComplete ? "Completed" : "Mark as complete"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="algo-course-lms-resources-btn"
                  disabled
                  style={{ opacity: 0.6 }}
                >
                  <FileText size={16} strokeWidth={1.8} aria-hidden="true" />
                  Notes (PDF)
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="algo-course-lms-resources-btn"
                  disabled
                  style={{ opacity: 0.6 }}
                >
                  <FileText size={16} strokeWidth={1.8} aria-hidden="true" />
                  Summary (PDF)
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
