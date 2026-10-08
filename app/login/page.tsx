"use client"

import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="dark grid min-h-svh lg:grid-cols-2 bg-black text-white">
      {/* Left Pane: Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="flex items-center gap-3 font-medium transition-transform hover:scale-105"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-white p-1.5 shadow-sm">
              <img
                src="/assets/logo.svg"
                alt="GauravDesk"
                className="size-full object-contain"
              />
            </div>
            <span className="text-base font-bold font-display tracking-tight text-white">
              GauravDesk
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right Pane: Pure Video Showcase, Nothing Else */}
      <div className="relative hidden bg-black border-l border-white/10 lg:block overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
      </div>
    </div>
  )
}
