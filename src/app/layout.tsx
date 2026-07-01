import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import SiteChrome from "@/components/layout/SiteChrome";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Vyntegra | AI Trading Software Agents, Expert Consultations & Custom Solutions",
  description:
    "Explore AI trading software agents, book consultations with experienced professionals, and request tailored websites, software systems, workflow automation, and AI-enabled solutions from Vyntegra.",
  openGraph: {
    title:
      "Vyntegra | AI Trading Software Agents, Expert Consultations & Custom Solutions",
    description:
      "Explore AI trading software agents, expert consultations, and tailored digital solutions from Vyntegra.",
    siteName: "Vyntegra",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${manrope.variable}`}
    >
      <body className={`${cormorantGaramond.variable} ${manrope.variable}`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
