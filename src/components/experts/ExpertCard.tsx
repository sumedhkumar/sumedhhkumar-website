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
      className="standard-card clickable-card"
      style={{ padding: 0, overflow: "hidden" }}
    >
      {expert.professionalPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={expert.professionalPhoto}
          alt={`${expert.fullName} professional photograph`}
          style={{
            aspectRatio: "4 / 5",
            width: "100%",
            objectFit: "cover",
            background: "#132731",
          }}
        />
      ) : (
        <div
          style={{
            aspectRatio: "4 / 5",
            background: "#132731",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8F98A0",
            padding: 20,
            textAlign: "center",
          }}
        >
          <span className="body-compact">Professional photo pending</span>
        </div>
      )}

      <div style={{ padding: 24 }}>
        <h3 className="card-title">{expert.fullName}</h3>
        <p className="body-standard" style={{ marginTop: 8 }}>
          {expert.specialization}
        </p>
        <p className="body-compact" style={{ marginTop: 12 }}>
          {expert.relevantExperience[0] ?? ""}
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
            color: "#E7D2A5",
          }}
        >
          {session ? formatUsd(session.feeUsd) : "Consultation slots are being prepared."}
        </p>
        <Button
          href={`/experts/${expert.slug}`}
          variant="secondary"
          style={{ marginTop: 20 }}
        >
          View Profile <ArrowRight size={16} strokeWidth={1.75} />
        </Button>
      </div>
    </article>
  );
}
