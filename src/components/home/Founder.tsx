import { site } from "@/data/site";
import SectionIntro from "@/components/ui/SectionIntro";

const socialLabels = {
  YouTube: "YT",
  Instagram: "IG",
  LinkedIn: "in",
};

export default function Founder() {
  return (
    <section id="founder" className="section section-bg-primary">
      <div className="container founder-grid">
        <div
          style={{
            aspectRatio: "4 / 5",
            borderRadius: 18,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            background: "#132731",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8F98A0",
            textAlign: "center",
            padding: 20,
          }}
        >
          Founder photograph pending
        </div>

        <div>
          <SectionIntro heading="Founder" />
          <h3 className="subsection-title">{site.founderName}</h3>
          <p className="body-standard" style={{ marginTop: 8 }}>
            {site.founderSubtitle}
          </p>
          <p className="body-standard" style={{ marginTop: 24 }}>
            {site.founderTemporaryCopy}
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            {site.founderSocialLinks.map((link) => {
              const label = socialLabels[link.label as keyof typeof socialLabels];

              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="social-button"
                >
                  <span className="tag">{label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
