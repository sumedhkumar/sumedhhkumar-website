import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Expert } from "@/types";
import { getImageDimensions } from "@/lib/image-metadata";
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
  const session = expert.sessions.find(
    (item) => item.active && item.durationMinutes === 30,
  );
  const photoDimensions = getImageDimensions(expert.professionalPhoto, {
    width: 900,
    height: 900,
  });

  return (
    <article
      className="standard-card clickable-card expert-showcase-card expert-card-profile-treatment"
      style={{ overflow: "hidden" }}
    >
      <div className="expert-card-avatar-stage">
        <div className="expert-avatar-ring expert-card-avatar-ring">
          {expert.professionalPhoto ? (
            <Image
              className="expert-avatar-image expert-card-avatar-image"
              src={expert.professionalPhoto}
              alt={`${expert.fullName} professional photograph`}
              width={photoDimensions.width}
              height={photoDimensions.height}
              sizes="(max-width: 768px) 64vw, 280px"
            />
          ) : (
            <div className="expert-avatar-placeholder expert-card-avatar-image">
              Professional photo pending
            </div>
          )}
        </div>
      </div>

      <div className="expert-showcase-content">
        <p className="eyebrow" style={{ marginBottom: 8 }}>Consultation</p>
        <h3 className="card-title">{expert.fullName}</h3>
        <p className="body-standard" style={{ marginTop: 12 }}>
          Book a focused session to discuss your trading software requirement, automation workflow, or implementation questions.
        </p>
        <p className="body-compact" style={{ marginTop: 12 }}>
          {expert.specialization}
        </p>
        <p className="body-compact" style={{ marginTop: 12 }}>
          Send a booking enquiry and the Vyntegra team will contact you soon
          about availability and next steps.
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
          <Button href={`/experts/${expert.slug}#booking-enquiry`} variant="primary">
            Request Consultation <ArrowRight size={16} strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </article>
  );
}

