import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "GauravDesk Chat Widget",
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 w-full h-full bg-transparent overflow-hidden select-none">
      <style>{`
        html, body {
          background: transparent !important;
          background-color: transparent !important;
          overflow: hidden !important;
          height: 100% !important;
          max-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Hide any dev/auth badges in iframe */
        neon-auth-badge,
        [class*="neon-auth"],
        [id*="neon-auth"],
        #neon-badge,
        div[class*="neon-"],
        div[id*="neon-"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }
        /* Custom slim scrollbar */
        .widget-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .widget-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .widget-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
        }
        .widget-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
        }
      `}</style>
      {children}
    </div>
  )
}
