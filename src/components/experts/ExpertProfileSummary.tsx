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
  const activeSessions = expert.sessions.filter(
    (session) => session.active && session.durationMinutes === 30,
  );
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
          <h2 className="card-title">Booking and refund policy</h2>
          <p>
            Your 30-minute consultation is confirmed after successful Razorpay
            payment and booking confirmation. If Vyntegra cannot confirm or
            deliver the paid consultation, we will offer a replacement slot or
            provide a 100% refund. Refunds are processed to the original payment
            method as per payment gateway and banking timelines.
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
