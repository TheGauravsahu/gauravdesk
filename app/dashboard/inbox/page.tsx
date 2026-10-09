import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { getDashboardInitialData } from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

export default async function DashboardInboxPage() {
  const initialData = await getDashboardInitialData()
  return <DashboardShell initialTab="inbox" initialData={initialData} />
}
