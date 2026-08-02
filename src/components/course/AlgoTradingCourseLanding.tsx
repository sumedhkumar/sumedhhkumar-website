import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  MessageCircle,
  MonitorCog,
  PlayCircle,
  Route,
  ShieldCheck,
  Target,
  UserRoundCheck,
  Video,
} from "lucide-react";
import { algoTradingCourse } from "@/data/algo-trading-course";
import Button from "@/components/ui/Button";

const resultIcons = [
  MonitorCog,
  MessageCircle,
  ClipboardCheck,
  BookOpenCheck,
  ShieldCheck,
  Route,
];

const approvedTestimonials = algoTradingCourse.testimonials.filter(
  (testimonial) => testimonial.displayApproved,
);

export default function AlgoTradingCourseLanding() {
  return (
    <main className="algo-course-page algo-course-conversion-page">
      <section className="section algo-course-hero">
        <div className="container algo-course-hero-grid">
          <div className="algo-course-hero-copy">
            <p className="eyebrow">{algoTradingCourse.eyebrow}</p>
            <h1 className="hero-title">{algoTradingCourse.name}</h1>
            <p className="body-large">
              Learn MT5 and TradingView automation workflows through a
              structured 3-month weekend program.
            </p>
            <p className="body-standard algo-course-hero-support">
              Start with free Lecture 1 + Lecture 2 before
              deciding whether to join the full launch batch.
            </p>
            <div className="hero-actions algo-course-actions">
              <Button href={algoTradingCourse.registerRoute} variant="primary">
                Get Free Access
              </Button>
              <Button href="#course-curriculum" variant="secondary">
                See Course Roadmap
              </Button>
            </div>
            <div className="algo-course-hero-offer" aria-label="Course summary">
              <div>
                <span>Free before payment</span>
                <strong>Lecture 1 + Lecture 2</strong>
              </div>
              <div>
                <span>Launch batch offer</span>
                <strong>{algoTradingCourse.pricing.launchOfferLabel}</strong>
              </div>
              <div>
                <span>Course value</span>
                <strong>{algoTradingCourse.pricing.valueLabel}</strong>
              </div>
            </div>
          </div>

          <div className="depth-panel algo-course-hero-panel" aria-label="Program brief">
            <div className="algo-course-panel-header">
              <p className="eyebrow">Program Brief</p>
              <h2 className="subsection-title">
                A practical path into trading automation workflows
              </h2>
              <p className="body-compact">
                Built for learners who want clear setup thinking, platform
                orientation, testing discipline, and risk-aware monitoring.
              </p>
            </div>
            <dl className="algo-course-brief-list">
              <div>
                <dt>Duration</dt>
                <dd>3 months</dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd>2 hours every weekend</dd>
              </div>
              <div>
                <dt>Platforms</dt>
                <dd>MT5 and TradingView</dd>
              </div>
              <div>
                <dt>Included</dt>
                <dd>Live sessions, recordings, WhatsApp support</dd>
              </div>
            </dl>
            <div className="algo-course-hero-proof-note">
              <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
              <p>
                Education-first program. No investment advice or profit
                promises.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-bg-primary">
        <div className="container algo-course-problem-grid">
          <div>
            <p className="eyebrow">Why This Course Exists</p>
            <h2 className="section-title">
              Automation needs structure before speed
            </h2>
            <p className="body-standard">
              Many traders jump into tools before they understand the workflow:
              rules, alerts, testing, risk checks, monitoring, and operational
              discipline. This course focuses on that missing structure.
            </p>
          </div>
          <div className="algo-course-problem-list">
            {[
              "MT5 and TradingView can feel confusing without a step-by-step setup path.",
              "Automation without testing and risk checks creates avoidable mistakes.",
              "Scattered strategy notes need to become clear rule-based workflows.",
            ].map((item) => (
              <div key={item} className="depth-panel algo-course-problem-item">
                <Target size={20} strokeWidth={1.75} aria-hidden="true" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-secondary">
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Free Access</p>
            <h2 className="section-title">
              Watch Lecture 1 + Lecture 2 first
            </h2>
            <p className="body-standard">
              Review the course roadmap and first teaching
              session before any payment decision.
            </p>
          </div>

          <div className="algo-course-preview-grid">
            {algoTradingCourse.previewLessons.map((lesson, index) => (
              <article key={lesson.title} className="standard-card algo-course-preview-card">
                <span className="algo-course-card-kicker">
                  Free lesson {String(index + 1).padStart(2, "0")}
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

          <div className="algo-course-section-cta">
            <Button href={algoTradingCourse.registerRoute} variant="primary">
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      <section className="section section-bg-primary">
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Practical Results</p>
            <h2 className="section-title">
              What you should be able to set up by the end
            </h2>
            <p className="body-standard">
              Results here refer to learning outcomes and workflow setup
              ability, not trading profits.
            </p>
          </div>

          <div className="algo-course-results-grid">
            {algoTradingCourse.practicalResults.map((result, index) => {
              const Icon = resultIcons[index] ?? CheckCircle2;

              return (
                <article key={result.title} className="standard-card algo-course-result-card">
                  <Icon size={21} strokeWidth={1.75} aria-hidden="true" />
                  <h3 className="card-title">{result.title}</h3>
                  <p className="body-compact">{result.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-bg-secondary">
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Workflow Transformation</p>
            <h2 className="section-title">
              From scattered setup to clearer operating discipline
            </h2>
          </div>

          <div className="algo-course-transform-grid">
            {algoTradingCourse.workflowTransformations.map((item) => (
              <article key={item.before} className="depth-panel algo-course-transform-card">
                <div>
                  <span>Before</span>
                  <p>{item.before}</p>
                </div>
                <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <span>After</span>
                  <p>{item.after}</p>
                </div>
                <small>{item.copy}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="course-curriculum"
        className="section section-bg-primary"
      >
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Course Roadmap</p>
            <h2 className="section-title">Six modules, one structured path</h2>
            <p className="body-standard">
              The curriculum moves through foundations, platform setup, strategy
              logic, automation workflows, testing, and deployment discipline.
            </p>
          </div>

          <div className="algo-course-curriculum-grid">
            {algoTradingCourse.curriculum.map((mod, index) => (
              <article key={mod.title} className="standard-card algo-course-month-card">
                <span className="algo-course-card-kicker">
                  Module {index + 1}
                </span>
                <h3 className="card-title">{mod.title}</h3>
                <ul className="pdp-checklist">
                  {mod.items.map((item) => (
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

      <section className="section section-bg-secondary">
        <div className="container algo-course-included-grid">
          <div>
            <p className="eyebrow">Value Stack</p>
            <h2 className="section-title">What is included</h2>
            <p className="body-standard">
              Everything shown here is focused on education, recordings,
              support, and practical platform-oriented learning.
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

      <section className="section section-bg-primary">
        <div className="container">
          <div className="section-intro">
            <p className="eyebrow">Participant Feedback</p>
            <h2 className="section-title">Verified feedback will appear here</h2>
            <p className="body-standard">
              Only approved, verified participant feedback will be displayed.
            </p>
          </div>

          {approvedTestimonials.length > 0 ? (
            <div className="algo-course-testimonial-grid">
              {approvedTestimonials.map((testimonial) => (
                <article key={testimonial.quote} className="standard-card algo-course-testimonial-card">
                  <p className="body-standard">{testimonial.quote}</p>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>
                      {testimonial.roleOrContext}
                      {testimonial.location ? `, ${testimonial.location}` : ""}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="depth-panel algo-course-feedback-empty">
              <UserRoundCheck size={24} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <h3 className="card-title">Launch batch feedback pending</h3>
                <p className="body-standard">
                  Verified participant feedback will be added after the first
                  launch batch. No placeholder testimonials or outcome claims
                  are displayed.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section-bg-secondary">
        <div className="container algo-course-audience-grid">
          <div className="depth-panel algo-course-audience-panel">
            <p className="eyebrow">Who This Is For</p>
            <h2 className="subsection-title">A good fit if you want structure</h2>
            <ul className="algo-course-simple-list">
              {algoTradingCourse.audienceFit.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={17} strokeWidth={1.75} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="depth-panel algo-course-audience-panel algo-course-audience-panel-muted">
            <p className="eyebrow">Not For</p>
            <h2 className="subsection-title">Not a shortcut or advice product</h2>
            <ul className="algo-course-simple-list">
              {algoTradingCourse.audienceNotFit.map((item) => (
                <li key={item}>
                  <ShieldCheck size={17} strokeWidth={1.75} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-bg-primary">
        <div className="container">
          <div className="depth-panel algo-course-pricing-panel">
            <div>
              <p className="eyebrow">Launch Batch</p>
              <h2 className="section-title">Create your free account first</h2>
              <p className="body-standard">
                Watch Lecture 1 + Lecture 2 before deciding
                whether to join the full program.
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
              <Button href={algoTradingCourse.registerRoute} variant="primary">
                Create Free Account First
              </Button>
            </div>
          </div>
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

      <section className="section section-bg-primary">
        <div className="container">
          <div className="depth-panel algo-course-final-cta">
            <PlayCircle size={28} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="eyebrow">Start With The Free Lessons</p>
              <h2 className="section-title">
                Ready to start with the free lessons?
              </h2>
              <p className="body-standard">
                Create your free account and watch Lecture 1 + Lecture 2.
              </p>
            </div>
            <Button href={algoTradingCourse.registerRoute} variant="primary">
              Get Free Access
            </Button>
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
