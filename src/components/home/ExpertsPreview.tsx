import { ArrowRight } from "lucide-react";
import { experts } from "@/data/experts";
import ExpertCard from "@/components/experts/ExpertCard";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import SectionIntro from "@/components/ui/SectionIntro";

export default function ExpertsPreview() {
  const featuredExperts = experts
    .filter((expert) => expert.featured && expert.active)
    .slice(0, 3);

  return (
    <section id="talk-to-experts" className="section section-bg-primary">
      <div className="container">
        <SectionIntro
          heading="Talk to Experts"
          copy="Connect with experienced professionals for focused, one-to-one consultations tailored to your requirements."
        />

        {featuredExperts.length > 0 ? (
          <div className="expert-grid">
            {featuredExperts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        ) : (
          <EmptyState
            heading="Expert consultations will be available soon."
            copy="Detailed expert profiles are being prepared."
          />
        )}

        <Button href="/experts" variant="secondary" style={{ marginTop: 28 }}>
          Explore Experts <ArrowRight size={16} strokeWidth={1.75} />
        </Button>
      </div>
    </section>
  );
}
