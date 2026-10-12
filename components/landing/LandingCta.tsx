"use client";

import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

interface LandingCtaProps {
  user: { name?: string | null; email?: string | null } | null;
}

export function LandingCta({ user }: LandingCtaProps) {
  return (
    <section
      id="contact-section"
      className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 z-10"
    >
      <div className="relative rounded-3xl bg-gradient-to-b from-[#18181c] to-[#0c0c0e] border border-white/15 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[240px] bg-white/[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            Ground Your Customer Support in Truth
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Add your support documents, configure the widget, and connect visitors with your team.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-full px-8 py-3.5 text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-[1.02] cursor-pointer"
            >
              <span>{user ? "Go to Operator Dashboard" : "Create a workspace"}</span>
              <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 hover:bg-white/15 text-white font-medium rounded-full border border-white/15 px-6 py-3.5 text-sm transition-colors cursor-pointer"
            >
              Sign in to Existing Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
