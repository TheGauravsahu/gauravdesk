"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
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
import { AlertCircleIcon } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<"password" | "magic-link">("password")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const [errors, setErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [touched, setTouched] = useState<{
    email?: boolean
    password?: boolean
  }>({})

  const validateField = (field: "email" | "password", value: string) => {
    let err = ""
    if (field === "email") {
      if (!value.trim()) {
        err = "Work email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        err = "Please enter a valid work email (e.g. operator@company.com)"
      }
    } else if (field === "password" && authMode === "password") {
      if (!value) {
        err = "Password is required"
      } else if (value.length < 8) {
        err = "Password must be at least 8 characters long"
      }
    }
    setErrors((prev) => ({ ...prev, [field]: err }))
    return !err
  }

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const val = field === "email" ? email : password
    validateField(field, val)
  }

  const handleChange = (field: "email" | "password", val: string) => {
    if (field === "email") setEmail(val)
    if (field === "password") setPassword(val)

    if (touched[field]) {
      validateField(field, val)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setFormError(null)
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign in failed"
      setFormError(msg)
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouched({ email: true, password: true })
    const validEmail = validateField("email", email)
    const validPassword = validateField("password", password)

    if (!validEmail || !validPassword) {
      return
    }

    try {
      setLoading(true)
      setFormError(null)
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/dashboard",
      })
      if (res?.error) {
        setFormError(res.error.message || "Invalid email or password")
      } else {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed"
      setFormError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouched((prev) => ({ ...prev, email: true }))
    const validEmail = validateField("email", email)

    if (!validEmail) {
      return
    }

    try {
      setLoading(true)
      setFormError(null)
      const res = await authClient.signIn.magicLink({
        email: email.trim(),
        callbackURL: "/dashboard",
      })
      if (res?.error) {
        setFormError(res.error.message || "Failed to send magic link")
      } else {
        setMagicLinkSent(true)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send magic link"
      setFormError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      noValidate
      className={cn("flex flex-col gap-6", className)}
      onSubmit={authMode === "password" ? handleEmailSignIn : handleMagicLink}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Welcome to GauravDesk
          </h1>
          <p className="text-sm text-balance text-neutral-400">
            Sign in to access your AI customer support dashboard
          </p>
        </div>

        {formError && (
          <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            {formError}
          </div>
        )}

        {/* Social Login with Google */}
        <Field>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 h-11 rounded-full cursor-pointer bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all font-medium text-sm"
          >
            <i className="fa-brands fa-google text-base" />
            <span>Continue with Google</span>
          </button>
        </Field>

        <FieldSeparator className="text-neutral-400">
          Or continue with email
        </FieldSeparator>

        {/* Toggle between Password and Magic Link */}
        <div className="flex bg-[#18181b] p-1 rounded-full border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password")
              setFormError(null)
            }}
            className={cn(
              "flex-1 py-1.5 rounded-full font-medium transition-all cursor-pointer",
              authMode === "password"
                ? "bg-white text-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("magic-link")
              setFormError(null)
            }}
            className={cn(
              "flex-1 py-1.5 rounded-full font-medium transition-all cursor-pointer",
              authMode === "magic-link"
                ? "bg-white text-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Magic Link
          </button>
        </div>

        {/* Work Email Field */}
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="login-email" className="text-white text-xs font-medium">
            Work Email
          </FieldLabel>
          <Input
            id="login-email"
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

        {/* Password Field (when in password mode) */}
        {authMode === "password" ? (
          <Field data-invalid={!!errors.password}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="login-password" className="text-white text-xs font-medium">
                Password
              </FieldLabel>
            </div>
            <Input
              id="login-password"
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
        ) : magicLinkSent ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
            <p className="text-xs font-semibold text-emerald-400">Magic link sent!</p>
            <p className="text-[11px] text-neutral-300">
              Check {email} to sign in without a password.
            </p>
          </div>
        ) : null}

        <Field>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full font-semibold cursor-pointer bg-white text-black hover:bg-white/90 shadow-md transition-all"
          >
            {loading
              ? "Authenticating..."
              : authMode === "password"
              ? "Sign In"
              : "Email Me a Magic Link"}
          </Button>
        </Field>

        <FieldDescription className="text-center text-xs text-neutral-400">
          Don&apos;t have an operator account?{" "}
          <Link
            href="/signup"
            className="underline underline-offset-4 text-white font-medium hover:text-white/80 transition-colors"
          >
            Sign up
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
