"use client"

import { useState } from "react"
import { Calendar, Home, Users, Bed, ClipboardList, Settings, Plus, UserPlus, Building } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AddRoomDialog } from "@/components/add-room-dialog"
import { AddGuestDialog } from "@/components/add-guest-dialog"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  // {
  //   title: "Requests",
  //   url: "/requests",
  //   icon: ClipboardList,
  // },
  {
    title: "Rooms",
    url: "/rooms",
    icon: Bed,
  },
  {
    title: "Guests",
    url: "/guests",
    icon: Users,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

const quickActions = [
  {
    title: "Add Room",
    icon: Plus,
    action: "add-room",
  },
  {
    title: "Add Guest",
    icon: UserPlus,
    action: "add-guest",
  },
  {
    title: "New Booking",
    icon: Building,
    action: "new-booking",
  },
]

export function AppSidebar() {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false)

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-room":
        setIsAddRoomOpen(true)
        break
      case "add-guest":
        setIsAddGuestOpen(true)
        break
      case "new-booking":
        // Handle new booking action
        break
      default:
        break
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Building className="h-6 w-6" />
          <span className="font-semibold text-lg">Hotel Dashboard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton onClick={() => handleQuickAction(action.action)}>
                    <action.icon />
                    <span>{action.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <Button variant="outline" className="w-full bg-transparent">
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
      <AddRoomDialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen} />
      <AddGuestDialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen} />
    </Sidebar>
  )
}
