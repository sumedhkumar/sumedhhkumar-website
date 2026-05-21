import type { Metadata } from "next";
import { Space_Grotesk, Archivo } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Sumedh Kumar | AI Builder & Trading Automation",
  description:
    "Building AI systems before they become mainstream. I document, test and implement AI workflows involving Claude, TradingView, AWS, Pine Script and automation.",
  keywords: [
    "AI Engineer",
    "Trading Automation",
    "Claude Integration",
    "Pine Script",
    "TradingView",
    "AWS",
    "MT5",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${archivo.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
