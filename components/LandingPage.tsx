"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductPlayground } from "@/components/landing/ProductPlayground";
import {
  ChevronDownIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UsersIcon,
  FileTextIcon,
  SparklesIcon,
} from "lucide-react";

interface LandingPageProps {
  initialUser?: { name?: string | null; email?: string | null } | null;
}

export default function LandingPage({ initialUser = null }: LandingPageProps) {
  const [activeNav, setActiveNav] = useState<string>("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState(initialUser);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await authClient.getSession();
        if (res?.data?.user) {
          setUser(res.data.user);
        } else if (res?.data === null) {
          setUser(null);
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
      "How It Works": "workflow-section",
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

  const navItems = ["Home", "Product", "How It Works", "Contact"];

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

              {/* Auth State in Header: Instant check, showing "Dashboard" or "Sign in" */}
              {user ? (
                <Link
                  href="/dashboard"
                  className="shrink-0 flex items-center justify-center bg-[#28282a] text-[#c8c8c8] font-medium rounded-full transition-all duration-200 hover:bg-[#323234] hover:text-white hover:-translate-y-px"
                  style={{
                    height: "clamp(44px, 5.2vw, 48px)",
                    padding: "0 clamp(18px, 2vw, 24px)",
                    fontSize: "clamp(13px, 1.4vw, 15px)",
                    boxShadow: "var(--nav-shadow)",
                  }}
                >
                  Dashboard
                </Link>
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
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 bg-[#28282a] text-[#c8c8c8] hover:text-white hover:bg-[#323234] font-medium rounded-full text-[14px] transition-colors text-center"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 bg-[#28282a] text-[#c8c8c8] hover:text-white hover:bg-[#323234] font-medium rounded-full text-[14px] transition-colors text-center"
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
                <span>Customer support grounded in your docs</span>
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

          <div className="z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs text-white/65 sm:text-sm">
            <span>Document-grounded answers</span>
            <span>Human handoff</span>
            <span>Embeddable chat</span>
          </div>
        </div>
      </section>

      <ProductPlayground />

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
            Keep visitor questions, workspace documents, and operator replies in one support workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheckIcon,
              title: "Knowledge-grounded replies",
              description:
                "Retrieve relevant passages from workspace documents and include source names with supported answers.",
            },
            {
              icon: UsersIcon,
              title: "Human handoff",
              description:
                "Route explicit requests for a person and low-relevance questions to the operator inbox with conversation context.",
            },
            {
              icon: FileTextIcon,
              title: "PDF, Markdown, and text",
              description:
                "Upload supported documents to build a workspace knowledge base used by the assistant.",
            },
            {
              icon: SparklesIcon,
              title: "Embeddable chat widget",
              description:
                "Customize the assistant and install the widget on your site using the generated script snippet.",
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
      <section id="workflow-section" className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs border-white/15 text-[#c4c2c3] bg-white/5">
            Simple 3-Step Setup
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            From documents to live support
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
              desc: "Upload a PDF, Markdown, or plain-text support document to the workspace knowledge base.",
            },
            {
              step: "02",
              title: "Configure Agent Guardrails",
              desc: "Set the assistant name, greeting, accent color, widget position, and allowed domains.",
            },
            {
              step: "03",
              title: "Drop Script & Go Live",
              desc: "Copy the workspace script snippet and add it to your site to receive visitor conversations.",
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
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FAQ ACCORDION (#faq)
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
              q: "What happens when the knowledge base does not cover a question?",
              a: "When no sufficiently relevant document passage is found, the conversation is routed to the operator inbox instead of generating an unsupported answer.",
            },
            {
              q: "Can visitors ask to speak to a person?",
              a: "Yes. Explicit requests for a human operator are marked as waiting and appear in the operator inbox.",
            },
            {
              q: "Where do visitor conversations appear?",
              a: "Conversations and their message history are available in the workspace operator inbox, where an operator can reply or close the conversation.",
            },
            {
              q: "What file formats are currently supported?",
              a: "The knowledge base accepts PDF, Markdown (.md), and plain-text (.txt) files.",
            },
            {
              q: "How do I install the chat widget?",
              a: "Open Widget settings in the dashboard, copy the generated script snippet, and add it to your website.",
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
          SECTION 5: FINAL CTA BANNER (#contact)
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
              onClick={() => scrollToSection("How It Works")}
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
    </div>
  );
}
