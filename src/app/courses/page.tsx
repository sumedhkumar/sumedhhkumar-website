import type { Metadata } from "next";
import { ArrowRight, GraduationCap } from "lucide-react";
import Button from "@/components/ui/Button";
import { algoTradingCourse } from "@/data/algo-trading-course";

export const metadata: Metadata = {
  title: "Courses | Vyntegra",
  description:
    "Explore Vyntegra education programs, including the Trading Automation Masterclass.",
};

export default function CoursesPage() {
  return (
    <main className="algo-course-page vyntegra-courses-page">
      <section className="section algo-course-register-hero">
        <div className="container vyntegra-courses-shell">
          <div className="section-intro vyntegra-courses-intro">
            <p className="eyebrow">Vyntegra Education</p>
            <h1 className="hero-title">Vyntegra Courses</h1>
            <p className="body-large">
              Practical education programs from Vyntegra for trading
              automation, AI workflows, and applied systems.
            </p>
          </div>

          <article className="depth-panel vyntegra-course-card">
            <div className="algo-course-register-cta-icon">
              <GraduationCap size={24} strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div>
              <p className="eyebrow">Algo Trading / Trading Automation</p>
              <h2 className="subsection-title">{algoTradingCourse.name}</h2>
              <p className="body-standard">
                3-month weekend program focused on MT5 and TradingView
                automation workflows.
              </p>
            </div>
            <Button href={algoTradingCourse.route} variant="primary">
              View Course
              <ArrowRight size={16} strokeWidth={1.85} aria-hidden="true" />
            </Button>
          </article>
        </div>
      </section>
    </main>
  );
}
