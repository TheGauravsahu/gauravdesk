import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

import { Providers } from "@/components/providers/QueryProvider";
import { GlobalLoaderProvider } from "@/components/ui/GlobalLoader";

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
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark", "h-full", "antialiased", inter.variable, "font-sans", geist.variable)}
    >
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
        {/* Unregister any stale ServiceWorker lingering on localhost:3000 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var r of registrations) {
                    r.unregister();
                  }
                }).catch(function() {});
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 antialiased transition-colors duration-150">
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <GlobalLoaderProvider>
              {children}
            </GlobalLoaderProvider>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
