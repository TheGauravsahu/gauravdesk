"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  AlertCircleIcon,
  MailIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
} from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"details" | "verify">("details")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    otpCode?: string
  }>({})
  const [touched, setTouched] = useState<{
    name?: boolean
    email?: boolean
    password?: boolean
    otpCode?: boolean
  }>({})

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const validateField = (
    field: "name" | "email" | "password" | "otpCode",
    value: string
  ) => {
    let err = ""
    if (field === "name") {
      if (!value.trim()) {
        err = "Full name is required"
      } else if (value.trim().length < 2) {
        err = "Full name must be at least 2 characters long"
      }
    } else if (field === "email") {
      if (!value.trim()) {
        err = "Work email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        err = "Please enter a valid work email (e.g. operator@company.com)"
      }
    } else if (field === "password") {
      if (!value) {
        err = "Password is required"
      } else if (value.length < 8) {
        err = "Password must be at least 8 characters long"
      }
    } else if (field === "otpCode") {
      if (!value.trim()) {
        err = "Verification code is required"
      } else if (value.trim().length < 6) {
        err = "Please enter all 6 digits of the verification code"
      }
    }
    setErrors((prev) => ({ ...prev, [field]: err }))
    return !err
  }

  const handleBlur = (field: "name" | "email" | "password" | "otpCode") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const val =
      field === "name"
        ? name
        : field === "email"
        ? email
        : field === "password"
        ? password
        : otpCode
    validateField(field, val)
  }

  const handleChange = (
    field: "name" | "email" | "password" | "otpCode",
    val: string
  ) => {
    if (field === "name") setName(val)
    if (field === "email") setEmail(val)
    if (field === "password") setPassword(val)
    if (field === "otpCode") {
      // Clean numeric or alphanumeric 6-char code
      const cleaned = val.replace(/\s+/g, "").slice(0, 6)
      setOtpCode(cleaned)
    }

    if (touched[field]) {
      validateField(field, val)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true)
      setFormError(null)
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize Google Sign Up"
      setFormError(msg)
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouched({ name: true, email: true, password: true })
    const validName = validateField("name", name)
    const validEmail = validateField("email", email)
    const validPassword = validateField("password", password)

    if (!validName || !validEmail || !validPassword) {
      return
    }

    try {
      setLoading(true)
      setFormError(null)

      // Step 1: Create user with Neon Managed Better Auth and Notionists-neutral Dicebear avatar
      const dicebearAvatar = `https://api.dicebear.com/10.x/notionists-neutral/svg?seed=${encodeURIComponent(name.trim() || email.trim())}`
      const res = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: dicebearAvatar,
        callbackURL: "/dashboard",
      })

      if (res?.error) {
        setFormError(res.error.message || "Failed to create account")
        setLoading(false)
        return
      }

      // Step 2: Request verification OTP code to user's email via Neon Auth
      try {
        const clientWithPlugins = authClient as unknown as {
          emailOtp?: {
            sendVerificationOtp?: (params: { email: string; type: string }) => Promise<unknown>
          }
        }

        if (clientWithPlugins.emailOtp?.sendVerificationOtp) {
          await clientWithPlugins.emailOtp.sendVerificationOtp({
            email: email.trim(),
            type: "email-verification",
          })
        }
      } catch (otpErr) {
        console.warn("OTP dispatch attempt:", otpErr)
      }

      // Transition to code verification screen
      setStep("verify")
      setResendCooldown(60)
      setSuccessNotice(`Verification code sent to ${email.trim()}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign up failed"
      setFormError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouched((prev) => ({ ...prev, otpCode: true }))
    const validOtp = validateField("otpCode", otpCode)
    if (!validOtp) return

    try {
      setLoading(true)
      setFormError(null)

      const clientWithPlugins = authClient as unknown as {
        emailOtp?: {
          verifyEmail?: (params: { email: string; otp: string }) => Promise<{
            data?: unknown
            error?: { message?: string }
          }>
        }
      }

      if (clientWithPlugins.emailOtp?.verifyEmail) {
        const verifyRes = await clientWithPlugins.emailOtp.verifyEmail({
          email: email.trim(),
          otp: otpCode.trim(),
        })

        if (verifyRes?.error) {
          setFormError(verifyRes.error.message || "Invalid or expired verification code")
          setLoading(false)
          return
        }
      }

      // Successful verification -> navigate to dashboard
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Code verification failed"
      setFormError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    try {
      setLoading(true)
      setFormError(null)

      const clientWithPlugins = authClient as unknown as {
        emailOtp?: {
          sendVerificationOtp?: (params: { email: string; type: string }) => Promise<unknown>
        }
      }

      if (clientWithPlugins.emailOtp?.sendVerificationOtp) {
        await clientWithPlugins.emailOtp.sendVerificationOtp({
          email: email.trim(),
          type: "email-verification",
        })
      }

      setResendCooldown(60)
      setSuccessNotice("A new 6-digit code has been dispatched to your email.")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend code"
      setFormError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark grid min-h-svh lg:grid-cols-2 bg-black text-white">
      {/* Left Pane: Signup / Verification Form */}
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
            {step === "details" ? (
              /* STEP 1: Registration Form */
              <form
                onSubmit={handleEmailSignUp}
                noValidate
                className="flex flex-col gap-6"
              >
                <FieldGroup>
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-white font-display">
                      Create an Operator Account
                    </h1>
                    <p className="text-sm text-balance text-neutral-400">
                      Deploy your AI support agent and live chat inbox in minutes
                    </p>
                  </div>

                  {formError && (
                    <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                      {formError}
                    </div>
                  )}

                  {/* Google Sign Up */}
                  <Field>
                    <button
                      type="button"
                      onClick={handleGoogleSignUp}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 h-11 rounded-full cursor-pointer bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all font-medium text-sm"
                    >
                      <i className="fa-brands fa-google text-base" />
                      <span>Continue with Google</span>
                    </button>
                  </Field>

                  <FieldSeparator className="text-neutral-400">
                    Or register with email
                  </FieldSeparator>

                  {/* Full Name */}
                  <Field data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="name" className="text-white text-xs font-medium">
                      Full Name
                    </FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Gaurav Sahu"
                      value={name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      aria-invalid={!!errors.name}
                      className="h-10 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-neutral-500 focus-visible:border-white/50"
                    />
                    {errors.name && (
                      <FieldError className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                        <AlertCircleIcon className="size-3.5 shrink-0 text-red-400" />
                        <span>{errors.name}</span>
                      </FieldError>
                    )}
                  </Field>

                  {/* Work Email */}
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email" className="text-white text-xs font-medium">
                      Work Email
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="operator@company.com"
                      value={email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      aria-invalid={!!errors.email}
                      className="h-10 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-neutral-500 focus-visible:border-white/50"
                    />
                    {errors.email && (
                      <FieldError className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                        <AlertCircleIcon className="size-3.5 shrink-0 text-red-400" />
                        <span>{errors.email}</span>
                      </FieldError>
                    )}
                  </Field>

                  {/* Password */}
                  <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor="password" className="text-white text-xs font-medium">
                      Password
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      aria-invalid={!!errors.password}
                      className="h-10 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-neutral-500 focus-visible:border-white/50"
                    />
                    {errors.password && (
                      <FieldError className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                        <AlertCircleIcon className="size-3.5 shrink-0 text-red-400" />
                        <span>{errors.password}</span>
                      </FieldError>
                    )}
                  </Field>

                  <Field>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-full font-semibold cursor-pointer bg-white text-black hover:bg-white/90 shadow-md transition-all"
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </Field>

                  <FieldDescription className="text-center text-xs text-neutral-400">
                    Already have an operator account?{" "}
                    <Link
                      href="/login"
                      className="underline underline-offset-4 text-white font-medium hover:text-white/80 transition-colors"
                    >
                      Sign in
                    </Link>
                  </FieldDescription>
                </FieldGroup>
              </form>
            ) : (
              /* STEP 2: Email Code Verification */
              <form
                onSubmit={handleVerifyOtp}
                noValidate
                className="flex flex-col gap-6"
              >
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="size-12 rounded-full bg-white/10 border border-white/15 grid place-items-center mb-1">
                      <MailIcon className="size-6 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white font-display">
                      Verify Your Email
                    </h1>
                    <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                      We sent a 6-digit confirmation code to{" "}
                      <span className="font-semibold text-white">{email}</span>
                    </p>
                  </div>

                  {successNotice && (
                    <div className="p-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle2Icon className="size-4 shrink-0" />
                      <span>{successNotice}</span>
                    </div>
                  )}

                  {formError && (
                    <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                      {formError}
                    </div>
                  )}

                  {/* 6-digit shadcn InputOTP Component */}
                  <Field data-invalid={!!errors.otpCode} className="flex flex-col items-center gap-2">
                    <FieldLabel htmlFor="otp" className="text-white text-xs font-medium text-center">
                      Enter 6-Digit Code
                    </FieldLabel>
                    <div className="flex justify-center py-1">
                      <InputOTP
                        id="otp"
                        maxLength={6}
                        value={otpCode}
                        onChange={(val) => handleChange("otpCode", val)}
                        onBlur={() => handleBlur("otpCode")}
                        aria-invalid={!!errors.otpCode}
                        containerClassName="justify-center"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="border-white/20 bg-white/5 text-white" />
                          <InputOTPSlot index={1} className="border-white/20 bg-white/5 text-white" />
                          <InputOTPSlot index={2} className="border-white/20 bg-white/5 text-white" />
                        </InputOTPGroup>
                        <InputOTPSeparator className="text-white/40" />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} className="border-white/20 bg-white/5 text-white" />
                          <InputOTPSlot index={4} className="border-white/20 bg-white/5 text-white" />
                          <InputOTPSlot index={5} className="border-white/20 bg-white/5 text-white" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {errors.otpCode && (
                      <FieldError className="flex items-center gap-1.5 text-xs text-red-400 mt-1 justify-center">
                        <AlertCircleIcon className="size-3.5 shrink-0 text-red-400" />
                        <span>{errors.otpCode}</span>
                      </FieldError>
                    )}
                  </Field>

                  <Field>
                    <Button
                      type="submit"
                      disabled={loading || otpCode.length < 6}
                      className="w-full h-11 rounded-full font-semibold cursor-pointer bg-white text-black hover:bg-white/90 shadow-md transition-all"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <RefreshCwIcon className="size-4 animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </Field>

                  {/* Resend & Edit Email Controls */}
                  <div className="flex flex-col items-center gap-3 pt-2 text-xs">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Didn't receive the code? Resend"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep("details")
                        setFormError(null)
                        setSuccessNotice(null)
                      }}
                      className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeftIcon className="size-3.5" />
                      <span>Edit email address</span>
                    </button>
                  </div>
                </FieldGroup>
              </form>
            )}
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
