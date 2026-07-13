import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { experts } from "@/data/experts";
import { getImageDimensions } from "@/lib/image-metadata";
import ExpertProfileSummary from "@/components/experts/ExpertProfileSummary";
import SocialIcon from "@/components/ui/SocialIcon";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function findExpert(slug: string) {
  return experts.find((expert) => expert.slug === slug);
}

const credibility = [
  {
    label: "AI AUTOMATION EXPERIENCE",
    value: "8 Years",
  },
  {
    label: "TRADING EXPERIENCE",
    value: "9 Years",
  },
  {
    label: "SKILLS FOCUS",
    value: "AI, Algo Trading, Automation",
  },
];

function ExpertBulletList({
  items,
  compact = false,
}: {
  items: string[];
  compact?: boolean;
}) {
  return (
    <ul
      className={
        compact
          ? "expert-bullet-list expert-bullet-list-compact"
          : "expert-bullet-list"
      }
    >
      {items.map((item) => {
        const [label, ...details] = item.split(": ");
        const detail = details.join(": ");

        return (
          <li key={item} className="expert-bullet-item">
            <span className="expert-bullet-icon" aria-hidden="true">
              <CheckCircle2 size={16} strokeWidth={1.8} />
            </span>
            {detail ? (
              <span className="expert-bullet-copy">
                <strong>{label}</strong>
                <span>{detail}</span>
              </span>
            ) : (
              <span>{item}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ExpertPanel({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <section className="expert-panel">
      <div className="expert-panel-heading">
        <span className="expert-panel-icon" aria-hidden="true">
          {icon}
        </span>
        <h2 className="subsection-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ExpertiseGrid({ items }: { items: string[] }) {
  return (
    <div className="expertise-card-grid">
      {items.map((item) => (
        <article key={item} className="expertise-mini-card">
          <span aria-hidden="true">
            <Sparkles size={15} strokeWidth={1.8} />
          </span>
          <p>{item}</p>
        </article>
      ))}
    </div>
  );
}

function Timeline({ items }: { items: string[] }) {
  return (
    <ol className="expert-timeline">
      {items.map((item) => {
        const [headline, ...details] = item.split(": ");
        const detail = details.join(": ");

        return (
          <li key={item}>
            <span className="expert-timeline-marker" aria-hidden="true" />
            <p>
              <strong>{headline}</strong>
              {detail ? <span>{detail}</span> : null}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function generateStaticParams() {
  return experts.map((expert) => ({ slug: expert.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const expert = findExpert(slug);

  if (!expert) {
    return {
      title: "Talk to Experts | Vyntegra",
    };
  }

  return {
    title: `${expert.fullName} | Vyntegra`,
    description: expert.professionalSummary,
  };
}

export default async function ExpertProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const expert = findExpert(slug);

  if (!expert) {
    notFound();
  }

  const photoDimensions = getImageDimensions(expert.professionalPhoto, {
    width: 900,
    height: 900,
  });

  return (
    <main className="listing-page expert-page">
      <div className="listing-container expert-shell">
        <section className="expert-hero-card depth-panel">
          <div className="expert-hero-main">
            <div className="expert-identity-lockup">
              <div className="expert-avatar-ring">
                {expert.professionalPhoto ? (
                  <Image
                    src={expert.professionalPhoto}
                    alt={`${expert.fullName} professional photograph`}
                    width={photoDimensions.width}
                    height={photoDimensions.height}
                    sizes="(max-width: 768px) 48vw, 180px"
                    className="expert-avatar-image"
                    priority
                  />
                ) : (
                  <div className="expert-avatar-placeholder">
                    Professional photo pending
                  </div>
                )}
              </div>

              <div className="expert-identity-copy">
                <p className="eyebrow">Vyntegra Expert</p>
                <h1 className="page-title">{expert.fullName}</h1>
                <p className="body-large">
                  {expert.currentRole || expert.specialization}
                </p>
              </div>
            </div>

            <p className="expert-summary-lede">
              Get practical guidance on using AI, automation, and rule-based systems for trading workflows — from strategy logic and backtesting to TradingView, MT5, and broker API execution planning.
            </p>

            <div className="expert-credibility-grid" aria-label="Expert highlights">
              {credibility.map((item) => (
                <div key={item.label} className="expert-credibility-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div
              className="expert-credibility-grid"
              aria-label="Consultation availability"
            >
              <div className="expert-credibility-item">
                <span>Consultation availability</span>
                <strong>Live slots during booking</strong>
              </div>
              <div className="expert-credibility-item">
                <span>Weekdays</span>
                <strong>6 PM - 10 PM IST</strong>
              </div>
              <div className="expert-credibility-item">
                <span>Weekends</span>
                <strong>12 PM - 8 PM IST</strong>
              </div>
            </div>

            {expert.socialLinks?.length ? (
              <div className="expert-link-list" aria-label="Professional links">
                {expert.socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="expert-link"
                  >
                    <SocialIcon label={link.label} size={17} />
                    {link.label}
                    <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <ExpertProfileSummary expert={expert} />
        </section>

        <div className="expert-content-layout">
          <div className="expert-content-primary">
            <ExpertPanel
              title="Advisory Areas"
              icon={<Sparkles size={18} strokeWidth={1.8} />}
            >
              <p className="expert-panel-intro">
                Best suited for traders, founders, and teams who want practical
                guidance on AI trading workflows, algo strategy planning,
                automation paths, and risk-aware implementation choices.
              </p>
              <ExpertiseGrid items={expert.expertiseAreas} />
            </ExpertPanel>

            <ExpertPanel
              title="What the consultation can help with"
              icon={<BriefcaseBusiness size={18} strokeWidth={1.8} />}
            >
              <Timeline items={expert.relevantExperience} />
            </ExpertPanel>
          </div>

          <aside className="expert-content-secondary">
            <ExpertPanel
              title="Credentials"
              icon={<GraduationCap size={18} strokeWidth={1.8} />}
            >
              <ExpertBulletList items={expert.qualifications} compact />
            </ExpertPanel>

            <ExpertPanel
              title="What you can discuss"
              icon={<Award size={18} strokeWidth={1.8} />}
            >
              <ExpertBulletList items={[
                "Traders who want to convert a manual strategy into clear rule-based logic",
                "Beginners who want to understand how algo trading and AI tools fit together",
                "Users exploring TradingView, Pine Script, MT5, Dhan, Kite, or broker API workflows",
                "Teams evaluating whether to use a ready-made agent or build a custom trading system",
                "People who want a practical review of trading automation ideas before development"
              ]} compact />
            </ExpertPanel>
          </aside>
        </div>
      </div>
    </main>
  );
}
