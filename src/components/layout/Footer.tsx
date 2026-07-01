import Link from "next/link";
import { algoTradingCourse } from "@/data/algo-trading-course";
import { getPublicContactDetails } from "@/data/site";

const navigationLinks = [
  { label: "AI Trading Software Agents", href: "/ai-trading-agents" },
  { label: "Algo Trading Course", href: algoTradingCourse.route },
  { label: "Talk to Experts", href: "/experts" },
  { label: "Custom Solutions", href: "/custom-solutions" },
  { label: "Founder", href: "/#founder" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cancellation and Refund Policy", href: "/refund-policy" },
  { label: "Shipping / Delivery Policy", href: "/shipping-delivery" },
];

export default function Footer() {
  const contact = getPublicContactDetails();
  const hasContact = Boolean(contact.email || contact.phone);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/#top" className="wordmark">
              Vyntegra
            </Link>
            <p className="body-compact" style={{ marginTop: 16 }}>
              AI Trading Software Agents and custom software solutions built with clarity, discipline, and risk awareness.
            </p>
          </div>

          <div>
            <h2 className="card-title">Quick Links</h2>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {navigationLinks.map((link) => (
                <Link key={link.href} href={link.href} className="body-compact">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="card-title">Legal</h2>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="body-compact">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="card-title">Support</h2>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {hasContact ? (
                <>
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="body-compact">
                      {contact.email}
                    </a>
                  ) : null}
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="body-compact">
                      {contact.phone}
                    </a>
                  ) : null}
                </>
              ) : (
                <p className="body-compact">Contact details will be added soon.</p>
              )}
              <p className="body-compact">Multiple secure payment methods available.</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom-divider" />
        <p className="body-compact" style={{ marginBottom: 16, color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
          Trading involves risk. Vyntegra does not guarantee profit and is not responsible for trading losses.
        </p>
        <p className="body-compact">
          © {new Date().getFullYear()} Vyntegra. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
