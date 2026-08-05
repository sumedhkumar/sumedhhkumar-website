"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function SiteChromeClient({
  navbar,
  footer,
  children,
}: {
  navbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname.startsWith("/lp/");
  const hideFooter =
    pathname === "/courses/algo-trading/register" ||
    pathname === "/courses/algo-trading/access";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <div style={{ height: "var(--navbar-height)" }} aria-hidden="true" />
      {children}
      {hideFooter ? null : footer}
    </>
  );
}
