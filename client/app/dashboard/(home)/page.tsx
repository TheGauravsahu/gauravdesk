import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { getDashboardInitialData } from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const initialData = await getDashboardInitialData()
  return <DashboardShell initialTab="home" initialData={initialData} />
}
