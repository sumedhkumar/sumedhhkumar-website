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
    <aside
      style={{
        background: "#132731",
        border: "1px solid rgba(199, 165, 106, 0.32)",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 18px 50px rgba(0, 0, 0, 0.28)",
      }}
    >
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <h2 className="card-title">Available Sessions</h2>
          {activeSessions.length > 0 ? (
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <p className="body-standard" style={{ fontWeight: 700 }}>
                    {session.label}
                  </p>
                  <p className="body-compact">
                    {session.durationMinutes} minutes
                  </p>
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
          <p className="product-price">{formatUsd(firstSession.feeUsd)}</p>
        ) : null}

        <div>
          <h2 className="card-title">General Availability</h2>
          <p className="body-compact" style={{ marginTop: 12 }}>
            {availabilityText}
          </p>
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
