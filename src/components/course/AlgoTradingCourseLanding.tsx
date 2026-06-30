import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  MonitorCog,
  ShieldCheck,
  Video,
} from "lucide-react";
import { algoTradingCourse } from "@/data/algo-trading-course";
import Button from "@/components/ui/Button";
import AlgoTradingCourseLeadForm from "@/components/course/AlgoTradingCourseLeadForm";

const learningIcons = [
  GraduationCap,
  MonitorCog,
  ClipboardCheck,
  BookOpenCheck,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
];

export default function AlgoTradingCourseLanding() {
  return (
    <main className="algo-course-page">
      <section className="section algo-course-hero">
        <div className="container algo-course-hero-grid">
          <div className="algo-course-hero-copy">
            <p className="eyebrow">{algoTradingCourse.eyebrow}</p>
            <h1 className="hero-title">{algoTradingCourse.name}</h1>
            <p className="body-large">{algoTradingCourse.subheading}</p>
            <p className="body-standard algo-course-hero-support">
              {algoTradingCourse.supportingLine}
            </p>
            <div className="hero-actions algo-course-actions">
              <Button href="#course-registration" variant="primary">
                {algoTradingCourse.primaryCta}
              </Button>
              <Button href="#course-curriculum" variant="secondary">
                {algoTradingCourse.secondaryCta}
              </Button>
            </div>
            <div className="algo-course-hero-offer" aria-label="Course summary">
              <div>
                <span>Free before payment</span>
                <strong>Intro + Lecture 0 + Lecture 1</strong>
              </div>
              <div>
                <span>Launch batch offer</span>
                <strong>{algoTradingCourse.pricing.launchOfferLabel}</strong>
              </div>
              <div>
                <span>Program format</span>
                <strong>3 months, weekends</strong>
              </div>
            </div>
          </div>

          <div className="depth-panel algo-course-hero-panel" aria-label="Program brief">
            <div className="algo-course-panel-header">
              <p className="eyebrow">Program Brief</p>
              <h2 className="subsection-title">
                A structured preview path before the full batch
              </h2>
              <p className="body-compact">
                Review the orientation and first teaching sessions, then decide
                whether the 3-month weekend program fits your learning goals.
              </p>
            </div>
            <dl className="algo-course-brief-list">
              <div>
                <dt>Free Preview</dt>
                <dd>Intro, Lecture 0, Lecture 1</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>3-month weekend program</dd>
              </div>
              <div>
                <dt>Platforms</dt>
                <dd>MT5 and TradingView workflows</dd>
              </div>
              <div>
                <dt>Support</dt>
                <dd>Live classes, recordings, WhatsApp support</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section section-bg-secondary">
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Free Preview</p>
            <h2 className="section-title">
              Start with the free intro, Lecture 0 and Lecture 1
            </h2>
            <p className="body-standard">
              The intro video gives orientation. Lecture 0 explains the roadmap,
              tools, course structure, and what students get. Lecture 1 gives
              the first real teaching session before payment.
            </p>
          </div>

          <div className="algo-course-preview-grid">
            {algoTradingCourse.previewLessons.map((lesson, index) => (
              <article key={lesson.title} className="standard-card algo-course-preview-card">
                <span className="algo-course-card-kicker">
                  Free preview {String(index + 1).padStart(2, "0")}
                </span>
                <div className="algo-course-video-placeholder">
                  <Video size={26} strokeWidth={1.75} aria-hidden="true" />
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
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">What You Will Learn</p>
            <h2 className="section-title">Practical automation literacy</h2>
            <p className="body-standard">
              The program focuses on clear workflow thinking, platform setup,
              testing discipline, and risk-aware monitoring.
            </p>
          </div>

          <div className="algo-course-learning-grid">
            {algoTradingCourse.learningOutcomes.map((outcome, index) => {
              const Icon = learningIcons[index] ?? CheckCircle2;

              return (
                <article key={outcome} className="standard-card algo-course-learning-card">
                  <Icon
                    size={20}
                    strokeWidth={1.75}
                    color="#B8914A"
                    aria-hidden="true"
                  />
                  <h3 className="card-title">{outcome}</h3>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="course-curriculum"
        className="section section-bg-secondary"
      >
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Curriculum</p>
            <h2 className="section-title">Three months, one structured path</h2>
          </div>

          <div className="algo-course-curriculum-grid">
            {algoTradingCourse.curriculum.map((month, index) => (
              <article key={month.title} className="standard-card algo-course-month-card">
                <span className="algo-course-card-kicker">
                  Month {index + 1}
                </span>
                <h3 className="card-title">{month.title}</h3>
                <ul className="pdp-checklist">
                  {month.items.map((item) => (
                    <li key={item} className="body-standard pdp-checklist-item">
                      <CheckCircle2
                        size={16}
                        color="#B8914A"
                        strokeWidth={1.75}
                        className="pdp-checklist-icon"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-primary">
        <div className="container algo-course-included-grid">
          <div>
            <p className="eyebrow">Included</p>
            <h2 className="section-title">What is included</h2>
            <p className="body-standard">
              Everything in this version stays focused on education, support,
              recordings, and practical platform-oriented learning.
            </p>
          </div>

          <div className="depth-panel algo-course-included-panel">
            {algoTradingCourse.included.map((item) => (
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
          <div className="depth-panel algo-course-pricing-panel">
            <div>
              <p className="eyebrow">Launch Batch</p>
              <h2 className="section-title">Start with free access first</h2>
              <p className="body-standard">
                Payment details and batch joining instructions are shown after
                free access.
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
                <small>Shown after free access and joining instructions</small>
              </div>
              <Button href="#course-registration" variant="primary">
                Get Free Access First
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="course-registration"
        className="section section-bg-primary"
      >
        <div className="container algo-course-registration-grid">
          <div>
            <p className="eyebrow">Registration</p>
            <h2 className="section-title">Get Free Access</h2>
            <p className="body-standard">
              Share your details to open the free preview. The access page will
              include the intro video, Lecture 0, and Lecture 1.
            </p>
            <ol className="algo-course-registration-notes">
              <li>
                <span>01</span>
                <div>
                  <strong>Submit your details</strong>
                  <p>Use the form to open the free access page.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Review the free lessons</strong>
                  <p>Watch the intro, Lecture 0, and Lecture 1 before payment.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Continue only if it fits</strong>
                  <p>Use the access page for joining instructions once ready.</p>
                </div>
              </li>
            </ol>
          </div>
          <AlgoTradingCourseLeadForm />
        </div>
      </section>

      <section className="section section-bg-secondary">
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">FAQ</p>
            <h2 className="section-title">Questions before you begin</h2>
          </div>
          <div className="algo-course-faq-grid">
            {algoTradingCourse.faqs.map((faq) => (
              <article key={faq.question} className="standard-card">
                <h3 className="card-title">{faq.question}</h3>
                <p className="body-compact">{faq.answer}</p>
              </article>
            ))}
          </div>
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
