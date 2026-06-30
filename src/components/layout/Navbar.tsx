"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "AI Trading Software Agents", href: "/ai-trading-agents" },
  { label: "Masterclass", href: "/algo-trading-course" },
  { label: "Talk to Experts", href: "/experts" },
  { label: "Custom Solutions", href: "/custom-solutions" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return href !== "/" && !href.includes("#") && pathname.startsWith(href);
  }

  return (
    <nav className="navbar" aria-label="Primary navigation">
      <div className="navbar-inner">
        <Link href="/#top" className="wordmark" onClick={() => setOpen(false)}>
          Vyntegra
        </Link>

        <div className="desktop-nav">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`nav-link${active ? " nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="navbar-cta">
          <Button href="/custom-solutions" variant="secondary">
            Request a Quote
          </Button>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
        </button>
      </div>

      <div className={`mobile-menu${open ? " mobile-menu-open" : ""}`}>
        <div className="mobile-menu-list">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`nav-link${active ? " nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          <Button
            href="/custom-solutions"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Request a Quote
          </Button>
        </div>
      </div>
    </nav>
  );
}
