import { ArrowRight } from "lucide-react";
import type { Expert } from "@/types";
import { availabilityText } from "@/data/site";
import Button from "@/components/ui/Button";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ExpertProfileSummary({ expert }: { expert: Expert }) {
  const activeSessions = expert.sessions.filter((session) => session.active);
  const firstSession = activeSessions[0];

  return (
    <aside className="expert-summary-card">
      <div className="expert-summary-stack">
        <div className="expert-summary-header">
          <p>Consultation</p>
          <h2 className="card-title">Available Sessions</h2>
        </div>

        <div>
          {activeSessions.length > 0 ? (
            <div className="expert-session-list">
              {activeSessions.map((session) => (
                <div key={session.id} className="expert-session-row">
                  <strong>{session.label}</strong>
                  <span>
                    {session.durationMinutes} minutes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="body-compact" style={{ marginTop: 12 }}>
              Consultation slots are being prepared.
            </p>
          )}
        </div>

        {firstSession ? (
          <div className="expert-price-row">
            <span>Starting at</span>
            <strong>{formatUsd(firstSession.feeUsd)}</strong>
          </div>
        ) : null}

        <div className="expert-availability-block">
          <h2 className="card-title">General Availability</h2>
          <p>{availabilityText}</p>
        </div>

        <Button
          href={`/experts/${expert.slug}/checkout`}
          variant="primary"
          disabled={activeSessions.length === 0}
        >
          Book a Consultation <ArrowRight size={16} strokeWidth={1.75} />
        </Button>
      </div>
    </aside>
  );
}
