import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Vyntegra",
  description:
    "Draft Vyntegra terms and risk disclaimer requiring final review before launch.",
};

const placeholder =
  "This section requires final business-owner and legal review before launch.";

export default function TermsPage() {
  return (
    <main className="section-bg-primary">
      <div className="legal-page">
        <h1 className="page-title">Terms and Conditions</h1>
        <p className="legal-note">
          Draft policy page: final business-owner and legal review is required
          before launch.
        </p>

        <div className="legal-content">
          <section className="legal-section">
            <h2 className="subsection-title">Terms and Conditions</h2>
            <p>{placeholder}</p>
          </section>

          <section
            id="ai-trading-software-agents-risk-disclaimer"
            className="legal-section"
          >
            <h2 className="subsection-title">
              AI Trading Software Agents — Risk Disclaimer
            </h2>
            <p>
              Trading and investing involve substantial financial risk. The
              purchase, installation, configuration, or use of any AI Trading
              Software Agent provided by Vyntegra does not guarantee profits,
              returns, or the avoidance of losses. Market conditions can change
              rapidly, and the software may generate trades, actions, or signals
              that result in partial or complete loss of the capital deployed.
            </p>
            <p>
              Any historical results, backtesting data, simulations,
              illustrations, screenshots, examples, or other performance-related
              material shown on this website are provided only for informational
              purposes. They do not represent a promise, assurance, or guarantee
              of future performance. Actual results may differ materially due to
              market volatility, liquidity, slippage, spreads, execution delays,
              platform limitations, broker conditions, technical failures,
              software configuration, user decisions, and other factors outside
              Vyntegra’s control.
            </p>
            <p>
              Vyntegra provides software tools only. Vyntegra does not provide
              investment advice, financial advice, portfolio-management services,
              or any assurance that a particular product is suitable for your
              financial circumstances. You are solely responsible for reviewing
              the software, configuring it appropriately, monitoring its
              operation, evaluating the associated risks, and deciding whether to
              use it.
            </p>
            <p>
              By purchasing, installing, configuring, or using an AI Trading
              Software Agent, you acknowledge that you are doing so entirely at
              your own risk. Vyntegra, its founder, team members, affiliates, and
              service providers shall not be responsible for any trading loss,
              loss of capital, loss of profit, missed opportunity, or direct or
              indirect financial loss arising from the purchase, installation,
              configuration, or use of the software.
            </p>
            <p>
              Use only capital that you can afford to lose. Where appropriate,
              seek advice from a qualified and independent financial professional
              before making any trading or investment decision.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Payments</h2>
            <p>{placeholder}</p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Expert Consultations</h2>
            <p>{placeholder}</p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Custom Solutions</h2>
            <p>{placeholder}</p>
          </section>

          <section className="legal-section">
            <h2 className="subsection-title">Contact</h2>
            <p>{placeholder}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
