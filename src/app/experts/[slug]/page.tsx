import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { experts } from "@/data/experts";
import ExpertProfileSummary from "@/components/experts/ExpertProfileSummary";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function findExpert(slug: string) {
  return experts.find((expert) => expert.slug === slug);
}

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section>
      <h2 className="subsection-title">{title}</h2>
      <ul style={{ margin: "16px 0 0", paddingLeft: 20 }}>
        {items.map((item) => (
          <li key={item} className="body-standard">
            {item}
          </li>
        ))}
      </ul>
    </section>
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
    <main className="listing-page">
      <div className="listing-container expert-profile-header">
        <div>
          {expert.professionalPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={expert.professionalPhoto}
              alt={`${expert.fullName} professional photograph`}
              style={{
                aspectRatio: "4 / 5",
                width: "100%",
                objectFit: "cover",
                borderRadius: 18,
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            />
          ) : (
            <div
              style={{
                aspectRatio: "4 / 5",
                width: "100%",
                borderRadius: 18,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                background: "#132731",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8F98A0",
                textAlign: "center",
                padding: 20,
              }}
            >
              Professional photo pending
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: 32 }}>
          <header>
            <h1 className="page-title">{expert.fullName}</h1>
            <p className="body-large" style={{ marginTop: 16 }}>
              {expert.currentRole || expert.specialization}
            </p>
            <p className="body-standard" style={{ marginTop: 16 }}>
              {expert.professionalSummary}
            </p>
          </header>

          <ProfileSection title="Areas of Expertise" items={expert.expertiseAreas} />
          <ProfileSection
            title="Relevant Experience"
            items={expert.relevantExperience}
          />
          <ProfileSection title="Qualifications" items={expert.qualifications} />

          {expert.linkedInUrl ? (
            <a
              href={expert.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="body-standard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#E7D2A5",
              }}
            >
              LinkedIn Profile <ExternalLink size={16} strokeWidth={1.75} />
            </a>
          ) : null}

          <ProfileSection
            title="Consultation Topics"
            items={expert.consultationTopics}
          />
        </div>

        <ExpertProfileSummary expert={expert} />
      </div>
    </main>
  );
}
