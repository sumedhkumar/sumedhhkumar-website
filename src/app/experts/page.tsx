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
            Browse experienced professionals, review their expertise, and book a
            focused one-to-one consultation based on your requirements.
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
            heading="Expert consultations will be available soon."
            copy="Detailed expert profiles are being prepared."
          />
        )}
      </div>
    </main>
  );
}
