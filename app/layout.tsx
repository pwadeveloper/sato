import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSite } from "@/lib/content";
import "./globals.css";

/**
 * One family. `wdth` is loaded as a variable axis so headings can use the
 * expanded widths without a second file. Self-hosted by next/font, so the
 * static export makes no third-party font request.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

const site = getSite();

export const metadata: Metadata = {
  // Relative image paths in page metadata resolve against this.
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" className={archivo.variable}>
      <body className="min-h-dvh bg-concrete text-asphalt antialiased">
        <SiteHeader site={site} />
        <main id="main">{children}</main>
        <SiteFooter site={site} year={new Date().getFullYear()} />
      </body>
    </html>
  );
}
