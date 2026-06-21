import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Vyntegra",
  description:
    "Privacy policy for Vyntegra website enquiries, payments, expert bookings, and digital services.",
};

export default function PrivacyPage() {
  return (
    <main className="section-bg-primary">
      <div className="legal-page">
        <h1 className="page-title">Privacy Policy</h1>
        <p className="legal-note">
          This policy explains the information Vyntegra may collect through this
          website and how it is used to respond to enquiries, process payments,
          coordinate bookings, and provide customer support.
        </p>

        <div className="legal-content">
          <section className="legal-section">
            <h2 className="subsection-title">Information Collected</h2>
            <p>
              Vyntegra may collect details submitted through website forms,
              including name, email address, phone or WhatsApp number where
              provided, company or organization name where applicable,
              requirement/message, selected product, selected service/session,
              coupon details, and other information included in an enquiry.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Payment and Booking Information</h2>
            <p>
              For payments, Vyntegra may receive payment-related metadata from
              payment service providers, such as order ID, payment ID, payment
              status, contact details, amount, currency, and timestamps.
              For Talk to Expert sessions, booking-related details may be used
              to confirm and coordinate the consultation.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Crypto Payment Proof</h2>
            <p>
              If a customer submits crypto payment proof, Vyntegra may collect
              the uploaded proof/screenshot, transaction details, customer
              contact information, selected product, coupon details, and related
              payment context for manual verification and support records.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">How Information Is Used</h2>
            <p>
              Information is used to respond to enquiries, process and verify
              payments, send order or booking emails, coordinate expert
              sessions, review custom solution requirements, provide customer
              support, maintain compliance records, and improve service
              communication.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Third-Party Processors</h2>
            <p>
              Vyntegra may use third-party service providers for payment
              processing, email delivery, booking/availability management,
              hosting, analytics, or operational support. These may include
              payment service providers, email service providers, booking providers, and hosting
              providers, depending on the service used.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Data Sharing and Sale</h2>
            <p>
              Vyntegra does not sell personal data. Information may be shared
              with service providers only as needed to operate the website,
              process payments, coordinate bookings, respond to enquiries, or
              comply with applicable operational or legal requirements.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Privacy Requests</h2>
            <p>
              Customers may contact support@vyntegra.in for privacy-related
              requests or questions about information submitted through this
              website.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
