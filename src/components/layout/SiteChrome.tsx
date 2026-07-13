import type { ReactNode } from "react";
import AnnouncementBanner from "@/components/layout/AnnouncementBanner";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SiteChromeClient from "./SiteChromeClient";

export default function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <SiteChromeClient
      navbar={<Navbar />}
      footer={<Footer />}
      announcementBanner={<AnnouncementBanner />}
    >
      {children}
    </SiteChromeClient>
  );
}
