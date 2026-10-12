"use client";

import React from "react";
import Link from "next/link";

interface LandingFooterProps {
  onNavigate: (item: string) => void;
}

export function LandingFooter({ onNavigate }: LandingFooterProps) {
  return (
    <footer className="w-full border-t border-white/10 bg-black/80 py-12 px-4 sm:px-8 z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#8e8e8e]">
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-full bg-white grid place-items-center p-1">
            <img
              src="/assets/logo.svg"
              alt="GauravDesk"
              className="size-full object-contain"
            />
          </div>
          <span className="font-semibold text-white font-display text-sm">
            GauravDesk
          </span>
          <span className="text-[#555]">|</span>
          <span>Customer Support Grounded in Truth</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("Home")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => onNavigate("Product")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Product
          </button>
          <button
            onClick={() => onNavigate("How It Works")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <Link href="/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-white transition-colors">
            Sign Up
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#666]">
        <p>© {new Date().getFullYear()} GauravDesk, Inc. All rights reserved.</p>
        <p className="font-display">GROUNDED IN TRUTH</p>
      </div>
    </footer>
  );
}
