"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ZapIcon,
  UsersIcon,
  FileTextIcon,
  BarChart3Icon,
  LockIcon,
  SparklesIcon,
  CheckCircle2Icon,
  SendIcon,
  RefreshCwIcon,
} from "lucide-react";

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

  const formattedValue =
    stat.decimals > 0
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

// Preset simulator queries
const DEMO_PRESETS = [
  {
    question: "What is your uptime SLA guarantee on Enterprise?",
    answer:
      "GauravDesk guarantees 99.99% monthly service uptime under our Enterprise Master Services Agreement. If availability drops below this threshold, automated service credits are issued according to Section 4.2 of our SLA schedule.",
    source: "Enterprise_SLA_2026.pdf (p. 8)",
    latency: "94ms",
    confidence: "99.8%",
  },
  {
    question: "How does bi-directional human handoff trigger?",
    answer:
      "When a visitor's query requests human supervisor assistance, or if sentiment detection identifies dissatisfaction, the conversation is routed into the Operator Inbox. The human agent receives the visitor's history and relevant document context instantly.",
    source: "Operator_Workflow_Guide.md (Sec 3)",
    latency: "112ms",
    confidence: "100%",
  },
  {
    question: "Can I connect my Notion workspace and Zendesk tickets?",
    answer:
      "Yes. GauravDesk provides native 1-click OAuth connectors for Notion databases, Zendesk past ticket resolutions, Confluence, and custom webhook feeds. Embeddings sync automatically on an hourly cron schedule.",
    source: "Integrations_Manual_v3.pdf (p. 21)",
    latency: "105ms",
    confidence: "99.4%",
  },
];

export default function LandingPage() {
  const [activeNav, setActiveNav] = useState<string>("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [statsVisible, setStatsVisible] = useState<boolean>(false);
  const [user, setUser] = useState<{ name?: string | null; email?: string | null } | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Demo simulator state
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [demoChat, setDemoChat] = useState<{
    question: string;
    answer: string;
    source: string;
    latency: string;
    confidence: string;
  }>(DEMO_PRESETS[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await authClient.getSession();
        if (res?.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Session check error", err);
      }
    }
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  useEffect(() => {
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
      setStatsVisible(true);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 720 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  const scrollToSection = (sectionName: string) => {
    setActiveNav(sectionName);
    setMobileMenuOpen(false);
    if (sectionName === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const targetMap: Record<string, string> = {
      Product: "product-section",
      "Case Studies": "case-studies-section",
      Contact: "contact-section",
    };
    const elementId = targetMap[sectionName];
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSelectDemoPreset = (index: number) => {
    setSelectedDemoIndex(index);
    setIsSimulating(true);
    setTimeout(() => {
      setDemoChat(DEMO_PRESETS[index]);
      setIsSimulating(false);
    }, 280);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    setIsSimulating(true);
    const q = customQuestion;
    setCustomQuestion("");
    setTimeout(() => {
      setDemoChat({
        question: q,
        answer: `GauravDesk grounded query resolver verified against your connected docs: "${q}". All responses are restricted to vector-indexed snippets with zero hallucination.`,
        source: "UserGuide_v2.pdf (p. 14)",
        latency: "108ms",
        confidence: "99.9%",
      });
      setIsSimulating(false);
    }, 450);
  };

  const navItems = ["Home", "Product", "Case Studies", "Contact"];

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-white/20">
      {/* =========================================================================
          HERO REGION (Full Viewport)
          ========================================================================= */}
      <section className="relative w-full min-h-screen flex flex-col justify-between items-center overflow-hidden">
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
          {/* Subtle gradient vignette to transition seamlessly to the lower sections */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black pointer-events-none" />
        </div>

        {/* Page Container Inside Hero */}
        <div
          className="relative z-10 w-full flex-1 flex flex-col justify-between items-center"
          style={{
            padding: "clamp(16px, 2.4vh, 28px) clamp(14px, 3vw, 32px)",
          }}
        >
          {/* 1) HEADER ROW */}
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
              {/* Logo with Link */}
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
                      onClick={() => scrollToSection(item)}
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

              {/* Auth State in Header */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        className="shrink-0 flex items-center gap-2 bg-[#28282a] hover:bg-[#323234] text-white px-3.5 rounded-full transition-all duration-200 cursor-pointer border border-white/10"
                        style={{
                          height: "clamp(44px, 5.2vw, 48px)",
                          boxShadow: "var(--nav-shadow)",
                        }}
                      />
                    }
                  >
                    <div className="size-6 rounded-full bg-white text-black font-semibold text-xs grid place-items-center">
                      {user.name ? user.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : "U"}
                    </div>
                    <span className="text-xs font-medium max-w-[90px] truncate text-[#c8c8c8]">
                      {user.name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDownIcon className="size-3 text-[#8e8e8e]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    className="min-w-48 bg-[#18181b] border border-white/10 text-white rounded-xl p-1.5 shadow-2xl"
                  >
                    <div className="px-2.5 py-1.5 border-b border-white/10">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.name || "Operator"}
                      </p>
                      <p className="text-[11px] text-[#8e8e8e] truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem className="cursor-pointer text-xs p-2 rounded-lg hover:bg-white/10 mt-1">
                      <Link href="/dashboard" className="flex items-center gap-2 w-full text-white">
                        <LayoutDashboardIcon className="size-3.5" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-xs p-2 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-2 w-full"
                    >
                      <LogOutIcon className="size-3.5" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className="shrink-0 flex items-center justify-center bg-[#28282a] text-[#c8c8c8] font-medium rounded-full transition-all duration-200 hover:bg-[#323234] hover:text-white hover:-translate-y-px"
                  style={{
                    height: "clamp(44px, 5.2vw, 48px)",
                    padding: "0 clamp(18px, 2vw, 24px)",
                    fontSize: "clamp(13px, 1.4vw, 15px)",
                    boxShadow: "var(--nav-shadow)",
                  }}
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile Header Row */}
            <div className="w-full flex md:hidden items-center justify-between">
              <Link
                href="/"
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
                    alt="GauravDesk"
                    width={52}
                    height={52}
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>

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

          {/* Mobile Overlay Menu */}
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
                      onClick={() => scrollToSection(item)}
                      className={`relative py-2.5 text-[15px] font-medium transition-colors cursor-pointer ${
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

                {user ? (
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="px-2 text-center">
                      <p className="text-xs font-semibold text-black truncate">
                        {user.name || "Operator"}
                      </p>
                      <p className="text-[11px] text-[#666] truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 font-medium rounded-full text-[13px] transition-colors"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2 text-red-600 hover:text-red-700 text-xs font-medium cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 bg-[#28282a] text-[#c8c8c8] hover:text-white hover:bg-[#323234] font-medium rounded-full text-[14px] transition-colors"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* 2) HERO REGION */}
          <section className="flex-1 w-full max-w-[920px] flex flex-col items-center justify-center text-center my-auto px-2 z-10 py-10">
            {/* Trust Row */}
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

              {/* Trust Pill */}
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

            {/* Headline */}
            <h1 className="headline text-white font-display select-none overflow-hidden my-0">
              <span
                className="block overflow-hidden whitespace-nowrap leading-[1.12]"
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
                className="block overflow-hidden whitespace-nowrap leading-[1.12]"
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
              className="anim mx-auto text-[#d0d0d0] opacity-85 font-normal leading-[1.6]"
              style={{
                maxWidth: "min(560px, 92%)",
                marginTop: "clamp(14px, 2vh, 22px)",
                marginBottom: "clamp(24px, 3.5vh, 36px)",
                fontSize: "clamp(15px, 1.6vw, 18px)",
                animation: "reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: "0.28s",
              }}
            >
              Drop a chat widget on your site. Deliver instant, document-grounded AI
              answers with strict guardrails and seamless real-time human handoff.
            </p>

            {/* CTA Button without any wrapper box-shadow rectangle */}
            <div
              className="anim flex items-center justify-center"
              style={{
                animation: "reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: "0.40s",
              }}
            >
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="inline-flex items-center justify-center bg-white text-black font-semibold rounded-full transition-all duration-300 hover:-translate-y-[2px] hover:scale-[1.02] active:translate-y-0 cursor-pointer"
                style={{
                  fontSize: "clamp(13.5px, 1.5vw, 14.5px)",
                  padding: "clamp(11px, 1.6vh, 13px) clamp(26px, 3.2vw, 32px)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)",
                }}
              >
                {user ? "Open Dashboard" : "Get Started"}
              </Link>
            </div>
          </section>

          {/* 3) STATS FOOTER REGION */}
          <footer
            ref={statsRef}
            className="w-full max-w-[920px] shrink-0 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 md:gap-6 z-10"
            style={{
              paddingTop: "clamp(8px, 1.5vh, 16px)",
            }}
          >
            {STATS.map((stat) => (
              <StatCounter key={stat.label} stat={stat} isVisible={statsVisible} />
            ))}
          </footer>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: INTERACTIVE PRODUCT SIMULATOR & RAG SANDBOX (#product)
          ========================================================================= */}
      <section
        id="product-section"
        className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 z-10"
      >
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
            Interactive Live Sandbox
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            See GauravDesk in Action
          </h2>
          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base leading-relaxed">
            Experience real-time document grounding. The agent extracts verified snippets from ingested PDFs and policies, citing source metadata with zero hallucination.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="grid lg:grid-cols-12 gap-6 bg-[#0e0e11] border border-white/10 rounded-2xl p-4 sm:p-8 backdrop-blur-2xl shadow-2xl">
          {/* Left Column: Preset Test Queries & Connected Docs */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8e8e8e]">
                <FileTextIcon className="size-3.5 text-white/70" />
                <span>Connected Knowledge Base</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {[
                  { name: "Enterprise_SLA_2026.pdf", chunks: "148 chunks", status: "Indexed" },
                  { name: "Operator_Workflow_Guide.md", chunks: "84 chunks", status: "Indexed" },
                  { name: "Integrations_Manual_v3.pdf", chunks: "212 chunks", status: "Indexed" },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      <span className="font-mono text-white/90 truncate">{doc.name}</span>
                    </div>
                    <span className="text-[10px] text-[#8e8e8e] shrink-0">{doc.chunks}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8e8e8e]">
                <SparklesIcon className="size-3.5 text-emerald-400" />
                <span>Click a Query to Test Grounding</span>
              </div>
              <div className="space-y-2">
                {DEMO_PRESETS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDemoPreset(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedDemoIndex === idx
                        ? "bg-white/10 border-white/30 text-white shadow-md"
                        : "bg-white/[0.03] border-white/5 text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <p className="font-medium truncate">{item.question}</p>
                    <p className="text-[11px] text-emerald-400/90 mt-0.5 font-mono">
                      Cites: {item.source}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomSubmit} className="relative">
              <input
                type="text"
                placeholder="Ask your own question..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3.5 pr-10 text-xs text-white placeholder:text-muted-foreground outline-none focus:border-white/40 transition-colors"
              />
              <button
                type="submit"
                aria-label="Send query"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white text-black hover:bg-white/90 transition-transform active:scale-95 cursor-pointer"
              >
                <SendIcon className="size-3.5" />
              </button>
            </form>
          </div>

          {/* Right Column: Live Chat Visualizer */}
          <div className="lg:col-span-7 bg-[#141418] border border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-white text-black grid place-items-center font-bold text-xs">
                  G
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">GauravDesk Autonomous Core</p>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    Deterministic RAG Pipeline • Active
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-[#8e8e8e]">
                  <ZapIcon className="size-3 text-amber-400" />
                  <span>{demoChat.latency}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-emerald-400">
                  <ShieldCheckIcon className="size-3" />
                  <span>{demoChat.confidence}</span>
                </div>
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-4 py-2 min-h-[220px]">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-white/10 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs text-white">
                  {demoChat.question}
                </div>
              </div>

              {/* Agent response with citation */}
              <div className="flex flex-col gap-2.5 items-start">
                <div className="max-w-[92%] bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-xs text-[#e0e0e0] leading-relaxed">
                  {isSimulating ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RefreshCwIcon className="size-3.5 animate-spin" />
                      <span>Retrieving chunks & verifying guardrails...</span>
                    </div>
                  ) : (
                    demoChat.answer
                  )}
                </div>

                {!isSimulating && (
                  <div className="flex items-center gap-2 text-[11px] text-[#8e8e8e] px-1">
                    <span className="font-semibold text-white/80">Source Grounding:</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-emerald-400">
                      {demoChat.source}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Guardrail Indicator */}
            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2Icon className="size-3.5 text-emerald-400" />
                Zero ungrounded speculation permitted
              </span>
              <Link
                href="/signup"
                className="text-white hover:underline flex items-center gap-1 font-medium"
              >
                Deploy this to your app <ArrowRightIcon className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: CORE CAPABILITIES & ARCHITECTURE (#features)
          ========================================================================= */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs border-white/15 text-[#c4c2c3] bg-white/5">
            Architecture
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            Engineered for Grounded Accuracy
          </h2>
          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base leading-relaxed">
            Every layer of GauravDesk is built to remove guesswork, maintain strict data privacy, and deliver enterprise-grade performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheckIcon,
              title: "Deterministic RAG Grounding",
              description:
                "Prevents hallucinated facts with strict similarity thresholds. The agent only responds using indexed knowledge chunks from your uploaded manuals.",
            },
            {
              icon: ZapIcon,
              title: "Sub-120ms Vector Inference",
              description:
                "Streaming responses powered by optimized edge models and vector caching. Customers receive instant help without sluggish wait spinners.",
            },
            {
              icon: UsersIcon,
              title: "Real-Time Operator Handoff",
              description:
                "Instant escalation when a visitor needs human attention. Seamless handoff into the operator dashboard preserves full conversational context.",
            },
            {
              icon: FileTextIcon,
              title: "Universal Ingestion Engine",
              description:
                "Upload PDFs, Word docs, Markdown files, or point to Notion databases and website URLs. Automatic continuous re-indexing keeps answers fresh.",
            },
            {
              icon: LockIcon,
              title: "Enterprise PII Redaction",
              description:
                "Built-in token anonymization scrubs credit cards, social security numbers, and sensitive client information before reaching the model.",
            },
            {
              icon: BarChart3Icon,
              title: "Deflection & CSAT Analytics",
              description:
                "Track autonomous ticket deflection rate, response latency, resolution rates, and identify gaps where documentation needs updates.",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="bg-[#0e0e11] border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 rounded-2xl p-6"
            >
              <CardContent className="p-0 space-y-3">
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-white">
                  <feature.icon className="size-5 text-white/90" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW IT WORKS (3-STEP ONBOARDING)
          ========================================================================= */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs border-white/15 text-[#c4c2c3] bg-white/5">
            Simple 3-Step Setup
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            Deploy in Under 5 Minutes
          </h2>
          <p className="max-w-xl text-muted-foreground text-sm sm:text-base">
            No machine learning experience or complex vector DB setup required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {[
            {
              step: "01",
              title: "Upload Knowledge Base",
              desc: "Drag and drop your user guides, troubleshooting sheets, or connect Google Drive and Notion.",
            },
            {
              step: "02",
              title: "Configure Agent Guardrails",
              desc: "Set escalation triggers, brand persona, confidence thresholds, and authorized operator seats.",
            },
            {
              step: "03",
              title: "Drop Script & Go Live",
              desc: "Add a single HTML <script> tag to your web app, or use our standalone customer support portal.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col justify-between space-y-4 overflow-hidden"
            >
              <div className="text-3xl font-bold font-display text-white/20">
                {item.step}
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-2 text-xs text-emerald-400 font-mono">
                ✓ Ready in 60s
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CASE STUDIES & METRICS (#case-studies)
          ========================================================================= */}
      <section
        id="case-studies-section"
        className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 z-10"
      >
        <div className="flex flex-col items-center text-center space-y-4 mb-14">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs border-white/15 text-[#c4c2c3] bg-white/5">
            Enterprise Proof
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            Proven Autonomous Deflection
          </h2>
          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base leading-relaxed">
            Leading engineering and support teams reduce support backlog by over 40% within their first 7 days on GauravDesk.
          </p>
        </div>

        {/* Big Impact Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {[
            { value: "48%", label: "First-Contact Resolution", sub: "Without human intervention" },
            { value: "< 1.2m", label: "Average Resolution Time", sub: "Down from 3.8 hours" },
            { value: "98.9%", label: "CSAT Positive Feedback", sub: "Across 140k+ conversations" },
            { value: "$165k", label: "Annual Cost Savings", sub: "Per 12-seat support team" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0e0e11] border border-white/10 text-center space-y-2"
            >
              <div className="text-3xl sm:text-4xl font-bold font-display text-white">
                {item.value}
              </div>
              <p className="text-xs sm:text-sm font-medium text-white/90">{item.label}</p>
              <p className="text-[11px] text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11] border border-white/10 space-y-4">
            <p className="text-xs sm:text-sm text-[#d0d0d0] leading-relaxed italic">
              &ldquo;Before GauravDesk, our technical support engineers spent 60% of their workday answering repetitive questions already documented in our API guides. Now, the agent resolves those instantly with exact section references, leaving our team free to handle complex integrations.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="size-9 rounded-full bg-white text-black font-bold text-xs grid place-items-center">
                M
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Marcus Vance</p>
                <p className="text-[11px] text-muted-foreground">VP of Customer Experience, HyperScale</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11] border border-white/10 space-y-4">
            <p className="text-xs sm:text-sm text-[#d0d0d0] leading-relaxed italic">
              &ldquo;Hallucinations were our #1 fear with AI chatbots. GauravDesk&apos;s strict knowledge grounding solved that completely. If something isn&apos;t in our uploaded docs, it cleanly routes to our human operators rather than guessing.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="size-9 rounded-full bg-white text-black font-bold text-xs grid place-items-center">
                S
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sarah Chen</p>
                <p className="text-[11px] text-muted-foreground">Head of Support Engineering, CloudCore</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FAQ ACCORDION (#faq)
          ========================================================================= */}
      <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 py-20 z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs border-white/15 text-[#c4c2c3] bg-white/5">
            Got Questions?
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does GauravDesk guarantee zero hallucinations?",
              a: "GauravDesk operates on a strict deterministic retrieval protocol. The AI cannot answer using open-ended assumptions. It only synthesizes answers directly quoting and attributing vector chunks from your uploaded documentation.",
            },
            {
              q: "Can my human operators intervene during a live chat?",
              a: "Yes. The GauravDesk Operator Dashboard streams visitor conversations in real-time. Any human agent can take over a conversation with a single click, pausing AI autonomy instantly.",
            },
            {
              q: "Do you train foundation models on our uploaded docs?",
              a: "Never. Your proprietary documents, knowledge base articles, and visitor chat transcripts are strictly isolated within your private Lakebase Postgres partition and are never used for model training.",
            },
            {
              q: "What file formats are currently supported?",
              a: "GauravDesk natively ingests PDF, Markdown, DOCX, TXT, JSON, HTML sitemaps, and direct integrations with Notion, Confluence, and Zendesk.",
            },
            {
              q: "How long does it take to deploy the chat widget?",
              a: "Under 5 minutes. After creating an account and uploading your initial documents, you receive a single-line JavaScript snippet that you can embed in any web framework (React, Next.js, Webflow, Shopify, WordPress).",
            },
          ].map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="border border-white/10 rounded-xl bg-[#0c0c0e] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="text-sm sm:text-base font-medium text-white">
                    {faq.q}
                  </span>
                  <ChevronDownIcon
                    className={`size-4 text-[#8e8e8e] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: FINAL CTA BANNER (#contact)
          ========================================================================= */}
      <section
        id="contact-section"
        className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 z-10"
      >
        <div className="relative rounded-3xl bg-gradient-to-b from-[#18181c] to-[#0c0c0e] border border-white/15 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          {/* Radial ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[240px] bg-white/[0.06] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
              Ground Your Customer Support in Truth
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Deploy GauravDesk today. Deliver instant answers, eliminate hallucinations, and give your support team superhuman resolution capabilities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-full px-8 py-3.5 text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-[1.02] cursor-pointer"
              >
                <span>{user ? "Go to Operator Dashboard" : "Start Free 14-Day Trial"}</span>
                <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 hover:bg-white/15 text-white font-medium rounded-full border border-white/15 px-6 py-3.5 text-sm transition-colors cursor-pointer"
              >
                Sign in to Existing Account
              </Link>
            </div>

            <p className="text-[11px] text-[#8e8e8e] pt-2">
              No credit card required • Instant onboarding • Unlimited documents on Enterprise
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: COMPREHENSIVE FOOTER
          ========================================================================= */}
      <footer className="w-full border-t border-white/10 bg-black/80 py-12 px-4 sm:px-8 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#8e8e8e]">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-full bg-white grid place-items-center p-1">
              <img src="/assets/logo.svg" alt="GauravDesk" className="size-full object-contain" />
            </div>
            <span className="font-semibold text-white font-display text-sm">GauravDesk</span>
            <span className="text-[#555]">|</span>
            <span>Customer Support Grounded in Truth</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollToSection("Home")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("Product")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection("Case Studies")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Case Studies
            </button>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              Sign Up
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] text-[#aaa]">All Systems Operational</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#666]">
          <p>© {new Date().getFullYear()} GauravDesk, Inc. All rights reserved.</p>
          <p className="font-display">GROUNDED IN TRUTH</p>
        </div>
      </footer>
    </div>
  );
}
