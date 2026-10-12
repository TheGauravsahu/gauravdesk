"use client"

import * as React from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  MessageSquareIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  Settings2Icon,
  CircleHelpIcon,
  FileTextIcon,
  FileCodeIcon,
} from "lucide-react"

const gauravDeskData = {
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Live Conversations",
      url: "#conversations",
      icon: <MessageSquareIcon />,
    },
    {
      title: "Knowledge Base (RAG)",
      url: "#knowledge-base",
      icon: <BookOpenIcon />,
    },
    {
      title: "AI Guardrails",
      url: "#guardrails",
      icon: <ShieldCheckIcon />,
    },
    {
      title: "Deflection Analytics",
      url: "#analytics",
      icon: <ChartBarIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Documentation & Help",
      url: "#help",
      icon: <CircleHelpIcon />,
    },
  ],
  documents: [
    {
      name: "Product-Knowledge.pdf",
      url: "#",
      icon: <FileTextIcon />,
    },
    {
      name: "API-Reference.md",
      url: "#",
      icon: <FileCodeIcon />,
    },
    {
      name: "Troubleshooting-FAQ.txt",
      url: "#",
      icon: <FileTextIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentUser, setCurrentUser] = React.useState({
    name: "Operator",
    email: "operator@gauravdesk.com",
    avatar: "/assets/logo.svg",
  })

  React.useEffect(() => {
    async function loadUser() {
      try {
        const res = await authClient.getSession()
        if (res?.data?.user) {
          setCurrentUser({
            name: res.data.user.name || "Operator",
            email: res.data.user.email || "operator@gauravdesk.com",
            avatar: res.data.user.image || "/assets/logo.svg",
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadUser()
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <Link
                  href="/"
                  className="flex items-center gap-2.5 font-semibold text-white group"
                />
              }
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
                <img
                  src="/assets/logo.svg"
                  alt="GauravDesk"
                  className="size-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold font-display tracking-tight text-white leading-tight">
                  GauravDesk
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Customer Support AI
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={gauravDeskData.navMain} />
        <NavDocuments items={gauravDeskData.documents} />
        <NavSecondary items={gauravDeskData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
