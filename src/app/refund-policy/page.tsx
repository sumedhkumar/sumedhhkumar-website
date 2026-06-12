import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Vyntegra",
  description:
    "Draft Vyntegra refund policy requiring final review before launch.",
};

const sections = [
  "AI Trading Software Agents",
  "Expert Consultations",
  "Custom Solutions",
  "Crypto Payments",
  "Contact",
];

export default function RefundPolicyPage() {
  return (
    <main className="section-bg-primary">
      <div className="legal-page">
        <h1 className="page-title">Refund Policy</h1>
        <p className="legal-note">
          Draft policy page: final business-owner and legal review is required
          before launch.
        </p>

        <div className="legal-content">
          {sections.map((section) => (
            <section key={section} className="legal-section">
              <h2 className="subsection-title">{section}</h2>
              <p>
                This section requires final business-owner and legal review
                before launch.
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
