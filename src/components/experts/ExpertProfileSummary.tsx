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
          <p>
            Weekdays run from 6 PM to 10 PM IST, and weekends run from 12 PM
            to 8 PM IST. Start times are available every 15 minutes, with each
            session ending inside the booking window.
          </p>
        </div>

        <Button
          href={`/experts/${expert.slug}/checkout`}
          variant="primary"
          disabled={activeSessions.length === 0}
        >
          Book Consultation <ArrowRight size={16} strokeWidth={1.75} />
        </Button>
        <p className="body-compact" style={{ marginTop: 12, color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
          Consultations are for technical and workflow guidance only. They are not financial advice and do not guarantee trading profit.
        </p>
      </div>
    </aside>
  );
}
