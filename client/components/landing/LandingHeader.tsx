"use client";

import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

interface LandingHeaderProps {
  navItems: string[];
  activeNav: string;
  onNavigate: (item: string) => void;
  user: { name?: string | null; email?: string | null } | null;
  onSignOut: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function LandingHeader({
  navItems,
  activeNav,
  onNavigate,
  user,
  onSignOut,
  mobileMenuOpen,
  setMobileMenuOpen,
}: LandingHeaderProps) {
  return (
    <>
      <header
        className="w-full flex justify-center items-center shrink-0 z-30"
        style={{
          animation: "slideDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Desktop Header Row */}
        <div
          className="w-full max-w-[720px] hidden md:flex items-center justify-between"
          style={{ gap: "clamp(18px, 2.8vw, 28px)" }}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="GauravDesk Home"
            className="group shrink-0 flex items-center justify-center bg-white rounded-full transition-transform duration-200 hover:scale-[1.04]"
            style={{
              width: "clamp(40px, 4.4vw, 46px)",
              height: "clamp(40px, 4.4vw, 46px)",
              boxShadow: "var(--nav-shadow)",
            }}
          >
            <div className="w-[72%] h-[72%] grid place-items-center">
              <img
                src="/assets/logo.svg"
                alt="GauravDesk"
                width={52}
                height={52}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Nav Pill */}
          <nav
            className="flex-1 max-w-[430px] bg-white rounded-full flex items-center justify-around px-2 py-1 shadow-sm transition-all"
            style={{
              height: "clamp(44px, 5.2vw, 48px)",
              boxShadow: "var(--nav-shadow)",
            }}
          >
            {navItems.map((item) => {
              const isActive = activeNav === item;
              return (
                <button
                  key={item}
                  onClick={() => onNavigate(item)}
                  className={`relative px-3 py-1 text-[#2e2e2e] font-medium tracking-[-0.01em] transition-opacity duration-200 cursor-pointer ${
                    isActive ? "nav-pill-active opacity-100" : "opacity-50 hover:opacity-75"
                  }`}
                  style={{ fontSize: "clamp(13px, 1.4vw, 15px)" }}
                >
                  {item}
                </button>
              );
            })}
          </nav>

          {/* Right Action */}
          <div className="shrink-0 flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="bg-white text-black font-semibold rounded-full px-5 py-2.5 text-xs transition-transform duration-200 hover:scale-[1.03] shadow-md flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRightIcon className="size-3.5" />
                </Link>
                <button
                  onClick={onSignOut}
                  className="text-white/60 hover:text-white text-xs px-3 py-2 cursor-pointer transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/signup"
                className="bg-white text-black font-semibold rounded-full px-6 py-2.5 text-xs transition-transform duration-200 hover:scale-[1.03] shadow-md"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="w-full flex md:hidden items-center justify-between px-2">
          <Link
            href="/"
            className="size-10 bg-white rounded-full grid place-items-center"
          >
            <img src="/assets/logo.svg" alt="Logo" className="size-6 object-contain" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="px-4 py-2 bg-white/10 text-white rounded-full text-xs font-medium border border-white/15"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-6 space-y-6 md:hidden">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">GauravDesk</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/70 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col space-y-4 pt-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => onNavigate(item)}
                className="text-left text-xl font-medium text-white/80 py-2 border-b border-white/10"
              >
                {item}
              </button>
            ))}
            <div className="pt-6 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-white text-black font-semibold py-3 rounded-full text-sm"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center text-white/70 py-2 text-sm"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-white text-black font-semibold py-3 rounded-full text-sm"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center border border-white/20 text-white font-medium py-3 rounded-full text-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
