import Link from "next/link";
import { getPublicContactDetails } from "@/data/site";

const navigationLinks = [
  { label: "AI Trading Agents", href: "/ai-trading-agents" },
  { label: "Talk to Experts", href: "/experts" },
  { label: "Custom Solutions", href: "/custom-solutions" },
  { label: "About Vyntegra", href: "/#about-vyntegra" },
  { label: "Contact", href: "/#contact" },
];

const legalLinks = [
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund-policy" },
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
              AI trading software agents, expert consultations, and tailored
              digital solutions.
            </p>
          </div>

          <div>
            <h2 className="card-title">Navigation</h2>
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
        <p className="body-compact">
          © {new Date().getFullYear()} Vyntegra. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
