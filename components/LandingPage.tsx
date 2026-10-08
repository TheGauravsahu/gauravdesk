"use client";

import React, { useEffect, useState, useRef } from "react";

interface StatItem {
  glyph: string;
  target: number;
  suffix: string;
  decimals: number;
  label: string;
  delay: string;
  duration: number;
  startOffset: number;
}

const STATS: StatItem[] = [
  {
    glyph: "<",
    target: 120,
    suffix: "ms",
    decimals: 0,
    label: "Inference Time",
    delay: "0.5s",
    duration: 1500,
    startOffset: 480,
  },
  {
    glyph: "%",
    target: 99.99,
    suffix: "%",
    decimals: 2,
    label: "Platform Uptime",
    delay: "0.58s",
    duration: 1580,
    startOffset: 570,
  },
  {
    glyph: "*",
    target: 24,
    suffix: "/7",
    decimals: 0,
    label: "Autonomous Runtime",
    delay: "0.66s",
    duration: 1660,
    startOffset: 660,
  },
  {
    glyph: "#",
    target: 2.4,
    suffix: "M",
    decimals: 1,
    label: "Context Windows",
    delay: "0.74s",
    duration: 1740,
    startOffset: 750,
  },
];

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function StatCounter({ stat, isVisible }: { stat: StatItem; isVisible: boolean }) {
  const [currentValue, setCurrentValue] = useState<number>(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number | null = null;
    let frameId: number;

    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / stat.duration, 1);
        const eased = easeOutCubic(progress);
        const value = eased * stat.target;

        setCurrentValue(value);

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setCurrentValue(stat.target);
        }
      };
      frameId = requestAnimationFrame(step);
    }, stat.startOffset);

    return () => {
      clearTimeout(timer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isVisible, stat]);

  const formattedValue = stat.decimals > 0
    ? currentValue.toFixed(stat.decimals)
    : Math.round(currentValue).toString();

  return (
    <div
      className="flex flex-col items-center justify-center text-center anim"
      style={{
        animation: "reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: stat.delay,
      }}
    >
      <div className="flex items-center justify-center gap-1.5 md:gap-2">
        <span
          className="font-display text-white select-none leading-none inline-block"
          style={{ fontSize: "clamp(22px, 3vw, 33px)" }}
        >
          {stat.glyph}
        </span>
        <span
          className="font-semibold text-white tracking-[-0.025em] tabular-nums leading-none inline-block"
          style={{ fontSize: "clamp(18px, 2.2vw, 26px)" }}
        >
          {formattedValue}
          <span className="text-white/90">{stat.suffix}</span>
        </span>
      </div>
      <span
        className="mt-1.5 text-[#8e8e8e] tracking-tight"
        style={{ fontSize: "clamp(11px, 1.2vw, 12.5px)" }}
      >
        {stat.label}
      </span>
    </div>
  );
}

export default function LandingPage() {
  const [activeNav, setActiveNav] = useState<string>("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [statsVisible, setStatsVisible] = useState<boolean>(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intersection observer for stats count-up trigger
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    } else {
      // Fallback
      setStatsVisible(true);
    }

    return () => observer.disconnect();
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu on resize > 720px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 720 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  const navItems = ["Home", "Product", "Case Studies", "Contact"];

  return (
    <main className="relative w-full h-[100vh] h-[100dvh] overflow-hidden bg-black text-white select-none">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden bg-black pointer-events-none z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-90"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
        {/* Subtle dark vignette to maximize contrast */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      </div>

      {/* Page Container: 3 vertical regions */}
      <div
        className="relative z-10 w-full h-full flex flex-col justify-between items-center"
        style={{
          padding:
            "clamp(16px, 2.4vh, 28px) clamp(14px, 3vw, 32px)",
        }}
      >
        {/* 1) HEADER REGION */}
        <header
          className="w-full flex justify-center items-center shrink-0 z-30"
          style={{
            animation: "slideDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          {/* Desktop Header Row (max-width 720px) */}
          <div
            className="w-full max-w-[720px] hidden md:flex items-center justify-between"
            style={{ gap: "clamp(18px, 2.8vw, 28px)" }}
          >
            {/* Logo */}
            <a
              href="#"
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
                  alt=""
                  width={52}
                  height={52}
                  className="w-full h-full object-contain"
                />
              </div>
            </a>

            {/* Nav Pill (White) */}
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
                    onClick={() => setActiveNav(item)}
                    className={`relative px-3 py-1 text-[#2e2e2e] font-medium tracking-[-0.01em] transition-opacity duration-200 ${
                      isActive ? "nav-pill-active opacity-100" : "opacity-50 hover:opacity-75"
                    }`}
                    style={{ fontSize: "clamp(13px, 1.4vw, 15px)" }}
                  >
                    {item}
                  </button>
                );
              })}
            </nav>

            {/* Sign in Pill */}
            <a
              href="#signin"
              className="shrink-0 flex items-center justify-center bg-[#28282a] text-[#c8c8c8] font-medium rounded-full transition-all duration-200 hover:bg-[#323234] hover:text-white hover:-translate-y-px"
              style={{
                height: "clamp(44px, 5.2vw, 48px)",
                padding: "0 clamp(18px, 2vw, 24px)",
                fontSize: "clamp(13px, 1.4vw, 15px)",
                boxShadow: "var(--nav-shadow)",
              }}
            >
              Sign in
            </a>
          </div>

          {/* Mobile Header Row (<= 720px) */}
          <div className="w-full flex md:hidden items-center justify-between">
            {/* Mobile Logo */}
            <a
              href="#"
              aria-label="GauravDesk Home"
              className="shrink-0 flex items-center justify-center bg-white rounded-full transition-transform active:scale-95"
              style={{
                width: "48px",
                height: "48px",
                boxShadow: "var(--nav-shadow)",
              }}
            >
              <div className="w-[72%] h-[72%] grid place-items-center">
                <img
                  src="/assets/logo.svg"
                  alt=""
                  width={52}
                  height={52}
                  className="w-full h-full object-contain"
                />
              </div>
            </a>

            {/* Circular Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className={`relative shrink-0 w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
                mobileMenuOpen
                  ? "bg-white shadow-lg text-black"
                  : "bg-[#28282a] text-white hover:bg-[#323234]"
              }`}
              style={{ boxShadow: "var(--nav-shadow)" }}
            >
              <span
                className={`w-[18px] h-[1.5px] rounded-full transition-all duration-250 ${
                  mobileMenuOpen
                    ? "bg-black translate-y-[1.5px] rotate-45"
                    : "bg-white -translate-y-[4.5px]"
                }`}
              />
              <span
                className={`w-[18px] h-[1.5px] rounded-full transition-all duration-200 ${
                  mobileMenuOpen ? "opacity-0" : "bg-white"
                }`}
              />
              <span
                className={`w-[18px] h-[1.5px] rounded-full transition-all duration-250 ${
                  mobileMenuOpen
                    ? "bg-black -translate-y-[1.5px] -rotate-45"
                    : "bg-white translate-y-[4.5px]"
                }`}
              />
            </button>
          </div>
        </header>

        {/* Mobile Fullscreen Overlay & Menu Sheet */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center pt-24 px-6 md:hidden"
            style={{
              backgroundColor: "rgba(0,0,0,0.62)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              animation: "overlayIn 0.28s ease-out forwards",
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            {/* White Sheet Menu */}
            <div
              className="w-full max-w-[340px] bg-white rounded-[28px] p-[22px_18px_20px] text-center flex flex-col gap-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
              style={{
                animation: "menuIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => {
                const isActive = activeNav === item;
                return (
                  <button
                    key={item}
                    onClick={() => {
                      setActiveNav(item);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative py-2.5 text-[15px] font-medium transition-colors ${
                      isActive
                        ? "mobile-nav-pill-active"
                        : "text-[#555555] hover:text-[#111111]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}

              <div className="w-full h-px bg-neutral-200 my-1" />

              <a
                href="#signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-[#28282a] text-[#c8c8c8] hover:text-white hover:bg-[#323234] font-medium rounded-full text-[14px] transition-colors"
              >
                Sign in
              </a>
            </div>
          </div>
        )}

        {/* 2) HERO REGION (Center) */}
        <section className="flex-1 w-full max-w-[900px] flex flex-col items-center justify-center text-center my-auto px-2 z-10">
          {/* Trust Row ("Trusted by 2000+ Enterprises") */}
          <div
            className="inline-flex items-center anim"
            style={{
              marginBottom: "clamp(16px, 2.5vh, 26px)",
              animation: "reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
              animationDelay: "0.05s",
              ["--trust-size" as string]: "clamp(36px, 4.5vw, 42px)",
            }}
          >
            {/* 3 Overlapping Avatar Rings */}
            <div className="flex items-center">
              {/* Avatar 1: Microsoft */}
              <div
                className="group relative rounded-full bg-[#28282a] flex items-center justify-center p-[5px] transition-transform duration-350 hover:-translate-y-[2px]"
                style={{
                  width: "var(--trust-size)",
                  height: "var(--trust-size)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  zIndex: 1,
                }}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <i
                    className="fa-brands fa-microsoft text-[#111]"
                    style={{ fontSize: "calc(var(--trust-size) * 0.34)" }}
                  />
                </div>
              </div>

              {/* Avatar 2: Amazon */}
              <div
                className="group relative rounded-full bg-[#28282a] flex items-center justify-center p-[5px] transition-transform duration-350 hover:-translate-y-[4px]"
                style={{
                  width: "var(--trust-size)",
                  height: "var(--trust-size)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  marginLeft: "calc(var(--trust-size) * -0.42)",
                  zIndex: 2,
                }}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <i
                    className="fa-brands fa-amazon text-[#111]"
                    style={{ fontSize: "calc(var(--trust-size) * 0.34)" }}
                  />
                </div>
              </div>

              {/* Avatar 3: Google */}
              <div
                className="group relative rounded-full bg-[#28282a] flex items-center justify-center p-[5px] transition-transform duration-350 hover:-translate-y-[2px]"
                style={{
                  width: "var(--trust-size)",
                  height: "var(--trust-size)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  marginLeft: "calc(var(--trust-size) * -0.42)",
                  zIndex: 4,
                }}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <i
                    className="fa-brands fa-google text-[#111]"
                    style={{ fontSize: "calc(var(--trust-size) * 0.34)" }}
                  />
                </div>
              </div>
            </div>

            {/* Trust Pill (Overlaps last avatar) */}
            <div
              className="flex items-center rounded-full bg-[#28282a] text-[#c4c2c3] font-medium"
              style={{
                height: "var(--trust-size)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                marginLeft: "calc(var(--trust-size) * -0.42)",
                paddingLeft: "calc(var(--trust-size) * 0.58)",
                paddingRight: "clamp(14px, 2vw, 18px)",
                fontSize: "clamp(12px, 1.4vw, 13.5px)",
              }}
            >
              <span>Trusted by 2000+ Enterprises</span>
            </div>
          </div>

          {/* Headline: Exact 2 Lines in Retro Dot-Matrix Display Font */}
          <h1 className="headline text-white font-display select-none overflow-hidden my-0">
            <span
              className="block overflow-hidden whitespace-nowrap leading-[1.12] sm:leading-[1.12]"
              style={{
                fontSize: "clamp(28px, 6.2vw, 80px)",
                letterSpacing: "clamp(-0.08em, -0.04em, -0.04em)",
                animation: "headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: "0.12s",
              }}
            >
              CUSTOMER SUPPORT
            </span>
            <span
              className="block overflow-hidden whitespace-nowrap leading-[1.12] sm:leading-[1.12]"
              style={{
                fontSize: "clamp(28px, 6.2vw, 80px)",
                letterSpacing: "clamp(-0.08em, -0.04em, -0.04em)",
                animation: "headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: "0.30s",
              }}
            >
              GROUNDED IN TRUTH
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="anim mx-auto text-[#d0d0d0] opacity-80 font-normal leading-[1.55]"
            style={{
              maxWidth: "min(540px, 92%)",
              marginTop: "clamp(12px, 2vh, 20px)",
              marginBottom: "clamp(20px, 3.2vh, 32px)",
              fontSize: "clamp(calc(13.5px + 2pt), calc(1.55vw + 2pt), calc(16.5px + 2pt))",
              animation: "reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
              animationDelay: "0.28s",
            }}
          >
            Drop a chat widget on your site. Deliver instant, document-grounded AI
            answers with strict guardrails and seamless real-time human handoff.
          </p>

          {/* CTA Button */}
          <div
            className="anim"
            style={{
              animation: "revealPulse 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
              animationDelay: "0.40s",
            }}
          >
            <a
              href="#get-started"
              className="inline-flex items-center justify-center bg-white text-black font-semibold rounded-full transition-all duration-300 hover:-translate-y-[2px] hover:scale-[1.02] cursor-pointer"
              style={{
                fontSize: "clamp(13.5px, 1.5vw, 14.5px)",
                padding: "clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)",
              }}
            >
              Get Started
            </a>
          </div>
        </section>

        {/* 3) STATS FOOTER REGION (Bottom, exact 4 metrics) */}
        <footer
          ref={statsRef}
          className="w-full max-w-[920px] shrink-0 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 md:gap-6 z-10"
          style={{
            paddingTop: "clamp(8px, 1.5vh, 16px)",
          }}
        >
          {STATS.map((stat) => (
            <StatCounter
              key={stat.label}
              stat={stat}
              isVisible={statsVisible}
            />
          ))}
        </footer>
      </div>
    </main>
  );
}
