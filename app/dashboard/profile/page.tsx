import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { auth } from "@/lib/auth/server"

export const dynamic = "force-dynamic"

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
        emailVerified: user.emailVerified,
        createdAtLabel: new Intl.DateTimeFormat("en", {
          dateStyle: "long",
          timeZone: "UTC",
        }).format(user.createdAt),
      }}
    />
  )
}
