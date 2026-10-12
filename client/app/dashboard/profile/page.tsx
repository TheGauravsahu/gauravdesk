import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { auth } from "@/lib/auth/server"

export const dynamic = "force-dynamic"

function formatCreatedDate(createdAt: unknown): string {
  if (!createdAt) return "Recently joined"
  const date =
    typeof createdAt === "string" || typeof createdAt === "number"
      ? new Date(createdAt)
      : createdAt instanceof Date
      ? createdAt
      : new Date()
  if (isNaN(date.getTime())) return "Recently joined"
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(date)
  } catch {
    return "Recently joined"
  }
}

export default async function ProfilePage() {
  const session = await auth.getSession()
  const user = session?.data?.user

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardShell
      initialTab="profile"
      profileUser={{
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        emailVerified: Boolean(user.emailVerified),
        createdAtLabel: formatCreatedDate(user.createdAt),
      }}
    />
  )
}
