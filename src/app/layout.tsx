import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SITE } from "@/lib/config";

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "greek"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.fullName}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  icons: {
    icon: "/images/logoc.png",
    shortcut: "/images/logoc.png",
    apple: "/images/logoc.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body className={`${manrope.variable} min-h-screen flex flex-col bg-white antialiased font-sans`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
