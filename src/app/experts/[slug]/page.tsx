import type { Metadata } from "next";
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
    label: "Primary Role",
    value: "Data Scientist",
  },
  {
    label: "Recent Experience",
    value: "Builder.ai",
  },
  {
    label: "Core Focus",
    value: "AI, NLP, SQL",
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

  return (
    <main className="listing-page expert-page">
      <div className="listing-container expert-shell">
        <section className="expert-hero-card depth-panel">
          <div className="expert-hero-main">
            <div className="expert-identity-lockup">
              <div className="expert-avatar-ring">
                {expert.professionalPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={expert.professionalPhoto}
                    alt={`${expert.fullName} professional photograph`}
                    className="expert-avatar-image"
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
              Book a focused consultation to discuss your requirement and understand the right technical direction before implementation.
            </p>

            <div className="expert-credibility-grid" aria-label="Expert highlights">
              {credibility.map((item) => (
                <div key={item.label} className="expert-credibility-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
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
                Best suited for founders, operators, and teams who need AI work
                scoped into practical software, workflows, and implementation
                roadmaps.
              </p>
              <ExpertiseGrid items={expert.expertiseAreas} />
            </ExpertPanel>

            <ExpertPanel
              title="Professional Track"
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
                "Trading software workflow planning",
                "Strategy-to-automation feasibility",
                "Platform connection requirements",
                "AI tool usage for trading workflows",
                "Custom agent or software implementation",
                "Technical doubts before purchasing an agent"
              ]} compact />
            </ExpertPanel>
          </aside>
        </div>
      </div>
    </main>
  );
}
