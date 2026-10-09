"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth/client"

export interface ProfileUser {
  name: string | null
  email: string
  image: string | null
  emailVerified: boolean
  createdAtLabel: string
}

function initials(name: string | null, email: string) {
  const value = name?.trim() || email
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
}

export function ProfileSettings({ user }: { user: ProfileUser }) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)

    try {
      const result = await authClient.signOut()
      if (result.error) {
        throw new Error(result.error.message || "Could not sign out")
      }

      router.replace("/login")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
      toast.error(
        error instanceof Error ? error.message : "Could not sign out"
      )
      setIsSigningOut(false)
    }
  }

  return (
    <main className="h-full flex-1 overflow-y-auto bg-background p-5 text-foreground sm:p-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header>
          <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your account details and sign out of GauravDesk.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>
              Your identity and sign-in information.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name || "Profile"} />
                ) : null}
                <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">
                  {user.name?.trim() || "Your profile"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <Badge
                variant={user.emailVerified ? "secondary" : "outline"}
                className="ml-auto shrink-0"
              >
                {user.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>

            <dl className="grid gap-4 border-t pt-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Email address
                  </dt>
                  <dd className="mt-1 break-all text-sm">{user.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 text-muted-foreground" />
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Member since
                  </dt>
                  <dd className="mt-1 text-sm">{user.createdAtLabel}</dd>
                </div>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Sign out to end this browser session.
            </p>
            <Button
              type="button"
              variant="destructive"
              disabled={isSigningOut}
              onClick={handleSignOut}
            >
              <LogOut data-icon="inline-start" />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
