"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { ProductPlayground } from "@/components/landing/ProductPlayground";
import { Loader2 } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

interface LandingPageProps {
  initialUser?: { name?: string | null; email?: string | null } | null;
}

export default function LandingPage({ initialUser = null }: LandingPageProps) {
  const [activeNav, setActiveNav] = useState<string>("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState(initialUser);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(!initialUser);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        if (!initialUser) setIsCheckingAuth(true);
        const res = await authClient.getSession();
        if (!isMounted) return;
        if (res?.data?.user) {
          setUser(res.data.user);
        } else if (res?.data === null) {
          setUser(null);
        }
      } catch (err) {
        console.error("Session check error", err);
      } finally {
        if (isMounted) setIsCheckingAuth(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [initialUser]);

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
      {/* HERO REGION (Full Viewport) */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black pointer-events-none" />
        </div>

        {/* Page Container Inside Hero */}
        <div
          className="relative z-10 w-full flex-1 flex flex-col justify-between items-center"
          style={{
            padding: "clamp(16px, 2.4vh, 28px) clamp(14px, 3vw, 32px)",
          }}
        >
          {/* Header Navigation Component */}
          <LandingHeader
            navItems={navItems}
            activeNav={activeNav}
            onNavigate={scrollToSection}
            user={user}
            isCheckingAuth={isCheckingAuth}
            onSignOut={handleSignOut}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Hero Content */}
          <section className="flex-1 w-full max-w-[920px] flex flex-col items-center justify-center text-center my-auto px-2 z-10 py-10">
            {/* Trust Pill */}
            <div
              className="inline-flex items-center anim"
              style={{
                marginBottom: "clamp(16px, 2.5vh, 26px)",
                animation: "reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: "0.05s",
                ["--trust-size" as string]: "clamp(36px, 4.5vw, 42px)",
              }}
            >
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

            {/* CTA Button */}
            <div
              className="anim flex items-center justify-center"
              style={{
                animation: "reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: "0.40s",
              }}
            >
              {isCheckingAuth ? (
                <div
                  className="inline-flex items-center justify-center bg-white/10 text-white font-medium rounded-full gap-2 border border-white/20"
                  style={{
                    fontSize: "clamp(13.5px, 1.5vw, 14.5px)",
                    padding: "clamp(11px, 1.6vh, 13px) clamp(26px, 3.2vw, 32px)",
                  }}
                >
                  <Loader2 className="size-4 animate-spin text-blue-400" />
                  <span className="text-white/80">Loading...</span>
                </div>
              ) : (
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
              )}
            </div>
          </section>

          <div className="z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs text-white/65 sm:text-sm">
            <span>Document-grounded answers</span>
            <span>Human handoff</span>
            <span>Embeddable chat</span>
          </div>
        </div>
      </section>

      {/* Product Interactive Playground */}
      <ProductPlayground />

      {/* Features & 3-Step Setup */}
      <LandingFeatures />

      {/* FAQ Accordion */}
      <LandingFaq />

      {/* CTA Section */}
      <LandingCta user={user} isCheckingAuth={isCheckingAuth} />

      {/* Comprehensive Footer */}
      <LandingFooter onNavigate={scrollToSection} />
    </div>
  );
}
