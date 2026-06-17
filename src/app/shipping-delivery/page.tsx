import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping / Delivery Policy | Vyntegra",
  description:
    "Digital delivery policy for Vyntegra AI Trading Software Agents, expert consultations, and custom solution enquiries.",
};

export default function ShippingDeliveryPage() {
  return (
    <main className="section-bg-primary">
      <div className="legal-page">
        <h1 className="page-title">Shipping / Delivery Policy</h1>
        <p className="legal-note">
          Vyntegra provides digital software/service products and consultations.
          No physical shipping is involved.
        </p>

        <div className="legal-content">
          <section className="legal-section">
            <h2 className="subsection-title">No Physical Shipping</h2>
            <p>
              Vyntegra does not ship physical goods. AI Trading Software Agents,
              consultation details, and custom solution communications are
              delivered or coordinated digitally.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">AI Trading Software Agents</h2>
            <p>
              After payment verification and internal processing, next
              steps/access/onboarding details for AI Trading Software Agents are
              sent digitally by email to the customer details provided during
              purchase. Product access is not represented as instant delivery
              unless specifically stated in a confirmed order communication.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Talk to Expert Sessions</h2>
            <p>
              Booking details and meeting/session information for Talk to Expert
              consultations are sent digitally by email after successful payment
              and booking confirmation.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Custom Solutions</h2>
            <p>
              Custom Solutions enquiries are reviewed and responded to by email,
              phone, or WhatsApp based on the information submitted by the
              customer. Delivery timelines and deliverables are discussed
              separately after the requirement is reviewed.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Support</h2>
            <p>
              For delivery, access, or booking questions, contact
              support@vyntegra.in.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
