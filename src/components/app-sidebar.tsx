'use client'

import {
  LayoutDashboard,
  ArrowRightLeft,
  Settings,
  FileText,
  Database,
  LogOut
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transaction",
    url: "/transactions/purchases",
    icon: ArrowRightLeft,
  },
  {
    title: "Report",
    url: "/reports/stock-ledger",
    icon: FileText,
  },
  {
    title: "Master",
    url: "/master/items",
    icon: Database,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push('/login')
  }

  // Simplified logic to determine active state since we use specific pages as the root for these sections
  const isActive = (url: string) => {
    if (url === '/dashboard' && pathname === '/dashboard') return true
    if (url !== '/dashboard' && pathname.startsWith(url.split('/')[1] ? `/${url.split('/')[1]}` : url)) return true
    return false
  }

  return (
    <Sidebar className="border-r border-zinc-200 bg-white">
      <SidebarHeader className="p-6 pb-8 border-b border-zinc-100">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">InvManager</h2>
        <p className="text-[11px] text-zinc-500 font-medium">Admin Console</p>
      </SidebarHeader>
      <SidebarContent className="px-3 py-6 bg-white">
        <SidebarMenu className="gap-2">
          {mainItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                render={<Link href={item.url} className="flex items-center gap-3" />}
                isActive={isActive(item.url)}
                className={`py-5 px-4 rounded-none hover:bg-zinc-50 hover:text-zinc-900 transition-colors ${isActive(item.url) ? 'bg-zinc-50 font-bold text-zinc-900 border-l-2 border-black' : 'text-zinc-600 font-medium border-l-2 border-transparent'}`}
              >
                <item.icon className={`h-4 w-4 ${isActive(item.url) ? 'text-zinc-900' : 'text-zinc-500'}`} />
                <span className="text-[13px]">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-white border-t border-zinc-100">
         <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton className="py-4 px-4 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-none transition-colors">
              <Settings className="h-4 w-4 text-zinc-500" />
              <span className="text-[13px] font-medium">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="py-4 px-4 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-none transition-colors">
              <LogOut className="h-4 w-4 text-zinc-500" />
              <span className="text-[13px] font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
