"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AnnouncementBanner from "@/components/layout/AnnouncementBanner";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function SiteChrome({ children }: { children: ReactNode }) {
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
      <AnnouncementBanner />
      <Navbar />
      {children}
      {hideFooter ? null : <Footer />}
    </>
  );
}
