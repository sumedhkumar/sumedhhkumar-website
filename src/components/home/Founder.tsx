import { CheckCircle2 } from "lucide-react";
import { site } from "@/data/site";
import SectionIntro from "@/components/ui/SectionIntro";
import SocialIcon from "@/components/ui/SocialIcon";

export default function Founder() {
  return (
    <section id="founder" className="section section-bg-primary">
      <div className="container founder-grid">
        <div
          className="founder-portrait depth-panel"
          style={{
            aspectRatio: "4 / 5",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.founderPhoto}
            alt={`${site.founderName} professional portrait`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        <div className="founder-copy-panel depth-panel">
          <SectionIntro heading="Founder" />
          <h3 className="subsection-title">Sumedh Kumar</h3>
          <p className="body-standard" style={{ marginTop: 24 }}>
            Sumedh Kumar leads Vyntegra with a focus on building practical trading technology, AI-assisted workflows, and custom software systems for serious users.
          </p>
          <p className="body-standard" style={{ marginTop: 16 }}>
            Vyntegra was created to bring more structure, clarity, and technical discipline into trading software and automation. The focus is not on hype or profit promises, but on building systems that users can understand, review, and operate responsibly.
          </p>
          <div style={{ marginTop: 24 }}>
            <a href="/experts" className="button button-secondary">
              Connect with Sumedh
            </a>
          </div>
          <div style={{ marginTop: 40 }}>
            <h4 className="body-standard" style={{ fontWeight: 700 }}>Follow and connect</h4>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {site.founderSocialLinks.map((link) => {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="social-button"
                >
                  <SocialIcon label={link.label} size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

