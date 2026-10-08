import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GauravDesk — AI Customer Support Grounded in Truth",
  description:
    "An Intercom-style customer support platform with document-grounded AI agent, strict guardrails, and real-time human handoff.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
      <head>
        {/* Preload Geist Pixel Circle display font */}
        <link
          rel="preload"
          href="/fonts/GeistPixel-Circle.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Font Awesome 6.5.2 for enterprise brand logos */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-full bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
