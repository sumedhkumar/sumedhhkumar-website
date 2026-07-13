"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function SiteChromeClient({
  navbar,
  footer,
  announcementBanner,
  children,
}: {
  navbar: ReactNode;
  footer: ReactNode;
  announcementBanner: ReactNode;
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
      {announcementBanner}
      {navbar}
      {children}
      {hideFooter ? null : footer}
    </>
  );
}
