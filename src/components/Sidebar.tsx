import { useNavigate, Link } from "@tanstack/react-router"
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "#/components/ui/sidebar"
import { LayoutDashboard, UtensilsCrossed, LogOut } from "lucide-react"
import { authStore, logout as clearAuth } from "#/store/authStore"
import { queryClient } from "#/lib/queryClient"

const navItems = [
  { title: "Dashboard", url: "/recipes", icon: LayoutDashboard },
  { title: "Recipes", url: "/recipes", icon: UtensilsCrossed },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const logout = () => {
    clearAuth()
    queryClient.clear()
    console.log("User after logout:", authStore.state.user)
    localStorage.removeItem("token");
    navigate({ to: "/" })
  }

  return (
    <ShadSidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
            Dashboard
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Logout"
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadSidebar>
  )
}
