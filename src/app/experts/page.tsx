import type { Metadata } from "next";
import { experts } from "@/data/experts";
import ExpertCard from "@/components/experts/ExpertCard";
import EmptyState from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Talk to Experts | Vyntegra",
  description:
    "Browse experienced professionals, review their expertise, and book a focused one-to-one consultation based on your requirements.",
};

export default function ExpertsPage() {
  const activeExperts = experts.filter((expert) => expert.active);

  return (
    <main className="listing-page">
      <div className="listing-container">
        <header className="listing-hero">
          <h1 className="page-title">Talk to Experts</h1>
          <p className="body-large">
            Book a focused consultation to discuss trading software, automation workflows, platform setup, or custom implementation needs.
          </p>
          <p className="body-standard" style={{ marginTop: 16 }}>
            Use this section if you want expert guidance before choosing an agent, building a custom trading system, or converting your strategy into software. Consultations are for technical and workflow guidance only. They do not guarantee trading results.
          </p>
          <p className="body-standard" style={{ marginTop: 16 }}>
            Live availability is shown during booking. 30-minute expert sessions
            are confirmed only after successful Razorpay payment and successful
            booking creation. If Vyntegra cannot confirm or deliver your paid
            consultation and a mutually acceptable replacement slot cannot be
            arranged, the consultation payment will be refunded.
          </p>
        </header>

        {activeExperts.length > 0 ? (
          <div className="expert-grid">
            {activeExperts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        ) : (
          <EmptyState
            heading="No expert consultations are available at the moment."
            copy="Please check back later."
          />
        )}
      </div>
    </main>
  );
}
