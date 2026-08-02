import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SiteChromeClient from "./SiteChromeClient";

export default function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <SiteChromeClient
      navbar={<Navbar />}
      footer={<Footer />}
    >
      {children}
    </SiteChromeClient>
  );
}
