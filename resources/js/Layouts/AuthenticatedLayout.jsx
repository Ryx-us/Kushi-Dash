"use client"

import React, { useState, useEffect } from "react"
import { Link, usePage } from "@inertiajs/react"
import {
  Home,
  UserIcon,
  Sun,
  Moon,
  Settings,
  LogOut,
  BarChart3,
  LucideLock,
  LucideMonitorUp,
  Coins,
  Crown,
  HammerIcon,
  LucideShoppingBag,
  LucideHandCoins,
  CogIcon,
  LucideSlidersVertical,
  LucideKeySquare,
  MoreHorizontal,
} from "lucide-react"
import ApplicationLogo from "@/components/ApplicationLogo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Footer from "@/components/Footer"


// Helper function to parse breadcrumb from header
const parseBreadcrumb = (header) => {
  if (!header) return []

  // If header is a string, parse it directly
  if (typeof header === "string") {
    return header
      .split(" / ")
      .map((part) => part.trim())
      .filter(Boolean)
  }

  // If header is a React component, try to extract the text content
  if (React.isValidElement(header)) {
    // Get text content from header props or children
    const headerText = header.props?.children || ""

    // If we found text content with separators
    if (typeof headerText === "string" && headerText.includes("/")) {
      return headerText
        .split(" / ")
        .map((part) => part.trim())
        .filter(Boolean)
    }

    // Return the header as a single item if we couldn't extract parts
    return [header]
  }

  return []
}

// Generate Gravatar URL
const getGravatarUrl = (email, size = 40) => {
  const hash = btoa(email?.toLowerCase().trim() || "default@example.com")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`
}

// Get user initials for fallback
const getUserInitials = (name) => {
  if (!name) return "U"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// App Sidebar Component
function AppSidebar({ auth, vmsConfig, sidebartab }) {
  const canAccessVMs = () => {
    if (!vmsConfig.enabled) return false

    const accessLevel = vmsConfig.accessLevel
    const userRank = auth.user.rank

    if (accessLevel === null) return true
    if (accessLevel === "premium" && (userRank === "premium" || userRank === "admin")) return true
    if (accessLevel === "admin" && userRank === "admin") return true

    return false
  }

  return (
    <Sidebar variant="inset" className="border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                  <ApplicationLogo className="h-6 w-6 " />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Dashboard</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {auth.user.rank === "admin"
                      ? "Administrator"
                      : auth.user.rank === "premium"
                        ? "Premium User"
                        : "User"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Overview Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={sidebartab === "home"}>
                  <Link href={route("dashboard")}>
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Computing Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Computing</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={sidebartab === "deploy"}>
                  <Link href="/deploy">
                    <LucideMonitorUp />
                    <span>Deploy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={sidebartab === "customers"}>
                  <Link href="/panel">
                    <LucideKeySquare />
                    <span>Control Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Products Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Products</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={sidebartab === "products"}>
                  <Link href="/plans">
                    <LucideShoppingBag />
                    <span>Shop</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={sidebartab === "coinshop"}>
                  <Link href="/shop">
                    <LucideHandCoins />
                    <span>Coin Shop</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={sidebartab === "earn"}>
                  <Link href="/earn">
                    <BarChart3 />
                    <span>Earn Coins</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={sidebartab === "profile"}>
                  <Link href="/profile">
                    {auth.user.rank === "premium" ? <Crown /> : <UserIcon />}
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {auth.user.rank === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Business Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={sidebartab === "settings"}>
                    <Link href='/admin'>
                      <CogIcon />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Virtual Machines Section */}
        {vmsConfig.enabled && (
          <SidebarGroup>
            <SidebarGroupLabel>Virtual Machines</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  {canAccessVMs() ? (
                    <SidebarMenuButton asChild isActive={sidebartab === "vms"}>
                      <Link href='/vms'>
                        <LucideSlidersVertical />
                        <span>Virtual Machines</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton disabled>
                      <LucideLock />
                      <span>VMs (Restricted)</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings with Badge */}
        
      </SidebarContent>

      {/* User Profile Section */}
      <SidebarFooter>
        <div className="border-t border-sidebar-border pt-2">
          <SidebarMenu>
            {/* Coins Display */}
            <SidebarMenuItem>
              <div className="flex items-center justify-between px-2 py-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Coins className="h-4 w-4 mr-2 text-amber-500" />
                  <span>Coins: {auth.user.coins || 0}</span>
                </div>
              </div>
            </SidebarMenuItem>

            {/* User Profile */}
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className={cn(
                      "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                      auth.user.rank === "premium" &&
                        "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50",
                      auth.user.rank === "admin" &&
                        "bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/50",
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getGravatarUrl(auth.user.email) || "/placeholder.svg"} alt={auth.user.name} />
                      <AvatarFallback
                        className={cn(
                          "text-xs font-medium",
                          auth.user.rank === "premium"
                            ? "bg-amber-600 text-white"
                            : auth.user.rank === "admin"
                              ? "bg-red-600 text-white"
                              : "bg-gray-600 text-white",
                        )}
                      >
                        {getUserInitials(auth.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{auth.user.name}</span>
                      <span className="truncate text-xs capitalize text-muted-foreground">
                        {auth.user.rank === "premium" && <Crown className="inline h-3 w-3 mr-1 text-amber-500" />}
                        {auth.user.rank === "admin" && <HammerIcon className="inline h-3 w-3 mr-1 text-red-500" />}
                        {auth.user.rank}
                      </span>
                    </div>
                    <MoreHorizontal className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem>
                    <Link href={route("profile.edit")} className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 dark:text-red-400">
                    <Link href={route("logout")} method="post" as="button" className="flex items-center w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>

            {/* Logout Button */}
            
          </SidebarMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default function AuthenticatedLayout({ header, children, sidebartab }) {
  const { auth, coins, vmsConfig } = usePage().props
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const darkModePreference = localStorage.getItem("dark-mode") === "true"
    setIsDarkMode(darkModePreference)
    if (darkModePreference) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem("dark-mode", newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Parse breadcrumb from header
  const breadcrumbParts = parseBreadcrumb(header)

  return (
    <SidebarProvider>
      <AppSidebar auth={auth} vmsConfig={vmsConfig} sidebartab={sidebartab} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbParts.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbParts.map((part, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem className="hidden md:block">
                        {index === breadcrumbParts.length - 1 ? (
                          <BreadcrumbPage>{part}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href="#">{part}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbParts.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
          <div className="ml-auto flex items-center space-x-4 px-4">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch checked={isDarkMode} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-primary" />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-4">
            {children}
            <Footer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
