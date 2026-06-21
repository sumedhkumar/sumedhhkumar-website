import type { Expert } from "@/types";
import ExpertBookingEnquiryForm from "@/components/experts/ExpertBookingEnquiryForm";

export default function ExpertProfileSummary({ expert }: { expert: Expert }) {
  const activeSessions = expert.sessions.filter(
    (session) => session.active && session.durationMinutes === 30,
  );
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

        <div className="expert-availability-block">
          <h2 className="card-title">Booking enquiry</h2>
          <p>
            Send a consultation request and the Vyntegra team will contact you soon
            to discuss availability and the next steps.
          </p>
        </div>

        <ExpertBookingEnquiryForm
          expertName={expert.fullName}
          expertSlug={expert.slug}
          disabled={activeSessions.length === 0}
        />
        <p className="body-compact" style={{ marginTop: 12, color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
          Consultations are for technical and workflow guidance only. They are not financial advice and do not guarantee trading profit.
        </p>
      </div>
    </aside>
  );
}
