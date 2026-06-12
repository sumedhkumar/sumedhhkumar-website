import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Vyntegra",
  description:
    "Draft Vyntegra privacy policy requiring final review before launch.",
};

const sections = [
  "Information Collected",
  "How Information Is Used",
  "Payment Information",
  "Form Submissions",
  "Cookies",
  "Third-Party Services",
  "Data Retention",
  "Contact",
];

export default function PrivacyPage() {
  return (
    <main className="section-bg-primary">
      <div className="legal-page">
        <h1 className="page-title">Privacy Policy</h1>
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
