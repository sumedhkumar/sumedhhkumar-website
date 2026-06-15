import { ArrowRight } from "lucide-react";
import type { Expert } from "@/types";
import Button from "@/components/ui/Button";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ExpertCard({ expert }: { expert: Expert }) {
  const session = expert.sessions.find((item) => item.active);

  return (
    <article
      className="standard-card clickable-card expert-showcase-card"
      style={{ padding: 0, overflow: "hidden" }}
    >
      {expert.professionalPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="expert-showcase-image"
          src={expert.professionalPhoto}
          alt={`${expert.fullName} professional photograph`}
          style={{
            aspectRatio: "4 / 5",
            width: "100%",
            objectFit: "cover",
            background: "#1B1E23",
          }}
        />
      ) : (
        <div
          className="expert-showcase-image"
          style={{
            aspectRatio: "4 / 5",
            background: "#1B1E23",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA0A7",
            padding: 20,
            textAlign: "center",
          }}
        >
          <span className="body-compact">Professional photo pending</span>
        </div>
      )}

      <div className="expert-showcase-content">
        <p className="eyebrow" style={{ marginBottom: 8 }}>Consultation</p>
        <h3 className="card-title">{expert.fullName}</h3>
        <p className="body-standard" style={{ marginTop: 12 }}>
          Book a focused session to discuss your trading software requirement, automation workflow, or implementation questions.
        </p>
        <p className="body-compact" style={{ marginTop: 12 }}>
          {expert.specialization}
        </p>
        <p className="body-compact" style={{ marginTop: 8 }}>
          {expert.qualifications[0] ?? ""}
        </p>
        <p
          style={{
            marginTop: 18,
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1.2,
            color: "#D8CBA6",
          }}
        >
          {session ? formatUsd(session.feeUsd) : "Consultation slots are being prepared."}
        </p>
        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <Button href={`/experts/${expert.slug}`} variant="secondary">
            View Profile
          </Button>
          <Button
            href={`/experts/${expert.slug}#booking`}
            variant="primary"
          >
            Book Consultation <ArrowRight size={16} strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </article>
  );
}

