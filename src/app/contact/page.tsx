import type { Metadata } from "next";
import Contact from "@/components/home/Contact";

export const metadata: Metadata = {
  title: "Contact Us | Vyntegra",
  description:
    "Contact Vyntegra for AI Trading Software Agents, expert consultations, custom software requirements, and support.",
};

export default function ContactPage() {
  return (
    <main className="section-bg-primary">
      <div className="legal-page" style={{ paddingBottom: 24 }}>
        <h1 className="page-title">Contact Us</h1>
        <p className="legal-note">
          For product questions, expert consultations, custom solution
          requirements, or support, use the contact form below or email
          Vyntegra.
        </p>

        <div className="legal-content">
          <section className="legal-section">
            <h2 className="subsection-title">Email</h2>
            <p>
              Support: <a href="mailto:support@vyntegra.in">support@vyntegra.in</a>
            </p>
            <p>
              Sales: <a href="mailto:sales@vyntegra.in">sales@vyntegra.in</a>
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Response Timeline</h2>
            <p>
              Vyntegra aims to respond to submitted enquiries within 24 hours.
            </p>
          </section>
        </div>
      </div>
      <Contact />
    </main>
  );
}
