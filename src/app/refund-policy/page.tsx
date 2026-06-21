import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation and Refund Policy | Vyntegra",
  description:
    "Cancellation and refund policy for Vyntegra digital products, expert consultations, and custom solution enquiries.",
};

export default function RefundPolicyPage() {
  return (
    <main className="section-bg-primary">
      <div className="legal-page">
        <h1 className="page-title">Cancellation and Refund Policy</h1>
        <p className="legal-note">
          This policy explains how cancellations, refunds, and payment-error
          corrections are handled for Vyntegra services.
        </p>

        <div className="legal-content">
          <section className="legal-section">
            <h2 className="subsection-title">AI Trading Software Agents</h2>
            <p>
              AI Trading Software Agents are digital software/service products.
              Once payment is successfully captured/verified and the order is
              recorded, purchases are non-refundable.
            </p>
            <p>
              Refunds are not provided for trading losses, dissatisfaction with
              trading outcomes, market movement, change of mind, inability to
              generate profit, or user-side configuration/usage decisions. These
              tools do not guarantee profit and do not provide investment
              advice. Customers are responsible for reviewing and understanding
              the product before purchase.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Payment-Error Corrections</h2>
            <p>
              If a duplicate payment, incorrect charge, failed order record, or
              payment captured without a corresponding order/next-step record
              occurs, Vyntegra will review the transaction and correct or refund
              the affected payment as applicable. This is handled as a
              payment-error correction, not a product refund.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Talk to Expert Consultations</h2>
            <p>
              Talk to Expert consultations begin with a booking enquiry. The
              Vyntegra team will contact customers to discuss availability,
              consultation scope, and any applicable next steps.
            </p>
            <p>
              Consultation-specific payment, cancellation, and refund terms, if
              applicable, will be shared during the follow-up process.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Custom Solutions</h2>
            <p>
              Custom Solutions are scoped separately after enquiry. Any
              cancellation, refund, or payment terms for a custom engagement
              should be agreed as part of the specific scope and payment terms
              for that engagement.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Contact</h2>
            <p>
              For refund or payment-error questions, contact support@vyntegra.in
              with your order/payment details and a short description of the
              issue.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
