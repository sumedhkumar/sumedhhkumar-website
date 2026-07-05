"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";

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
}: AlgoTradingCourseAccessLessonPortalProps) {
  const [completedLessons, setCompletedLessons] = useState<boolean[]>(
    () => Array.from({ length: lessons.length }, () => false),
  );
  const [isHydrated, setIsHydrated] = useState(false);

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

  return (
    <div className="algo-course-access-portal">
      <div className="algo-course-access-progress-shell">
        <div className="algo-course-access-progress-copy">
          <p className="eyebrow">Progress Path</p>
          <h2 className="subsection-title">Complete the free lessons in order</h2>
          <p className="body-standard">
            {completedCount} of {lessons.length} lessons completed
          </p>
        </div>

        <ol className="algo-course-access-progress-list" aria-label="Lesson progress path">
          {lessons.map((lesson, index) => {
            const isComplete = completedLessons[index] === true;

            return (
              <li key={lesson.title} className={isComplete ? "is-complete" : undefined}>
                <span>{isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : index + 1}</span>
                <p>
                  Watch Lecture {index + 1}: {lesson.title.replace(/^Lecture\s+\d+\s+-\s+/, "")}
                </p>
              </li>
            );
          })}
          <li>
            <span>3</span>
            <p>Join updates or ask questions</p>
          </li>
        </ol>
      </div>

      <div className="algo-course-access-video-grid">
        {lessons.map((lesson, index) => {
          const isComplete = completedLessons[index] === true;
          const cleanTitle = lesson.title.replace(/^Lecture\s+\d+\s+-\s+/, "");
          const hasVideoUrl = Boolean(lesson.videoUrl);
          const hasEmbedUrl = Boolean(lesson.embedUrl);

          return (
            <article
              key={lesson.title}
              className={`standard-card algo-course-access-video-card${isComplete ? " is-complete" : ""}`}
            >
              <div className="algo-course-access-video-thumb">
                {hasEmbedUrl ? (
                  <iframe
                    src={lesson.embedUrl}
                    title={`${lesson.title} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <Image
                      src={lesson.thumbnail.src}
                      alt={lesson.thumbnail.alt}
                      width={720}
                      height={420}
                      unoptimized
                    />
                    <div className="algo-course-access-video-placeholder">
                      <PlayCircle size={34} strokeWidth={1.65} aria-hidden="true" />
                      <span>
                        Lesson video will appear here when configured.
                      </span>
                    </div>
                  </>
                )}
                <span className="algo-course-access-status-badge">
                  {isComplete ? (
                    <CheckCircle2 size={15} strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <Circle size={15} strokeWidth={1.8} aria-hidden="true" />
                  )}
                  {isComplete ? "Completed" : "Unlocked"}
                </span>
              </div>

              <div className="algo-course-access-video-body">
                <div className="algo-course-access-lesson-meta">
                  <span className="algo-course-card-kicker">Lecture {index + 1}</span>
                  {lesson.duration ? <span>{lesson.duration}</span> : null}
                </div>
                <h3 className="card-title">{cleanTitle}</h3>
                <p className="body-compact">{lesson.copy}</p>
                <div className="algo-course-access-video-actions">
                  {hasVideoUrl && !hasEmbedUrl ? (
                    <Button
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                    >
                      <PlayCircle size={17} strokeWidth={1.8} aria-hidden="true" />
                      Watch lesson
                    </Button>
                  ) : null}
                  {hasVideoUrl && hasEmbedUrl ? (
                    <Button
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                    >
                      <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
                      Open in new tab
                    </Button>
                  ) : (
                    hasVideoUrl ? null : (
                      <p className="algo-course-access-video-note">
                        The lesson slot is ready. The video will appear here
                        when it is available.
                      </p>
                    )
                  )}
                  <Button
                    type="button"
                    variant={isComplete ? "secondary" : "primary"}
                    className="algo-course-access-complete-button"
                    onClick={() => toggleLesson(index)}
                  >
                    <CheckCircle2 size={17} strokeWidth={1.8} aria-hidden="true" />
                    {isComplete ? "Completed" : "Mark as complete"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
