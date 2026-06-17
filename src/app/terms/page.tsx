import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Vyntegra",
  description:
    "Terms for Vyntegra AI Trading Software Agents, Talk to Expert consultations, and Custom Solutions.",
};

export default function TermsPage() {
  return (
    <main className="section-bg-primary">
      <div className="legal-page">
        <h1 className="page-title">Terms and Conditions</h1>
        <p className="legal-note">
          These terms explain how Vyntegra provides digital software products,
          expert consultations, and custom solution enquiries through this
          website. Please read them before placing an order or submitting an
          enquiry.
        </p>

        <div className="legal-content">
          <section className="legal-section">
            <h2 className="subsection-title">Services Provided</h2>
            <p>
              Vyntegra provides AI Trading Software Agents, Talk to Expert
              consultations, and Custom Solutions. AI Trading Software Agents
              are digital software/service products intended to support trading
              workflows, automation planning, review, and structured usage.
              Talk to Expert sessions are educational and informational
              consultations. Custom Solutions are discussed and scoped separately
              after an enquiry.
            </p>
          </section>

          <section
            id="ai-trading-software-agents-risk-disclaimer"
            className="legal-section"
          >
            <h2 className="subsection-title">
              AI Trading Software Agents - Risk Disclaimer
            </h2>
            <p>
              Trading and investing involve substantial financial risk. AI
              Trading Software Agents are software tools only. They are not
              financial advice, investment advice, portfolio-management
              services, trading calls, or a guarantee of profit, accuracy, or
              returns.
            </p>
            <p>
              Any examples, screenshots, simulations, backtests, or
              performance-related material are provided for informational
              purposes only. Actual results can differ due to market volatility,
              liquidity, slippage, spreads, execution delays, platform
              limitations, broker conditions, data issues, technical failures,
              software configuration, user decisions, and other factors.
            </p>
            <p>
              You are responsible for understanding the tool before purchase,
              configuring it appropriately, monitoring its use, and making your
              own trading decisions. Do not use capital that you cannot afford
              to lose.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Talk to Expert Consultations</h2>
            <p>
              Talk to Expert sessions are for educational, informational, and
              workflow-planning purposes only. They may cover AI trading
              workflows, algo-trading logic, platform options, backtesting
              basics, risk-control considerations, and implementation planning.
              They do not include financial advice, investment recommendations,
              buy/sell advice, account management, or profit guarantees.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Payments and Order Processing</h2>
            <p>
              Payments are processed through available payment methods shown on
              the website. AI Trading Software Agent next steps/access or
              onboarding information are sent digitally after payment
              verification and internal processing. Talk to Expert booking
              details are sent after payment and booking confirmation.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Third-Party Platforms</h2>
            <p>
              Some services may require technical setup, third-party platforms,
              broker APIs, exchange or market-data services, or user-provided
              credentials/configuration where applicable. Vyntegra is not
              responsible for third-party platform outages, broker API issues,
              market-data issues, exchange outages, payment gateway issues, or
              user-side misconfiguration.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Custom Solutions</h2>
            <p>
              Custom Solutions enquiries are reviewed separately. Scope,
              deliverables, timelines, pricing, and support expectations are
              discussed based on the submitted requirement before any separate
              custom engagement is confirmed.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Contact</h2>
            <p>
              For questions about these terms, purchases, consultations, or
              support, contact Vyntegra at support@vyntegra.in.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
