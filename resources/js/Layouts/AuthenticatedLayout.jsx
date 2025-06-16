"use client"

import React, { useState, useEffect } from "react"
import { Link, usePage } from "@inertiajs/react"
import {
  Home,
  UserIcon,
  Sun,
  LogOut,
  BarChart3,
  LucideLock,
  LucideMonitorUp,
  Coins,
  Crown,
  LucideShoppingBag,
  LucideHandCoins,
  CogIcon,
  LucideSlidersVertical,
  LucideKeySquare,
  Search,
  Command,
  LucideChevronDown,
  LucideRadio,
  LucideServerCog,
  LucideServer,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ApplicationLogo from "@/components/ApplicationLogo"
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
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Footer from "@/components/Footer"
import { useSearch } from "@/hooks/search"

const searchData = [
  {
    href: '/dashboard',
    name: 'Dashboard',
    description: 'View your account dashboard and statistics'
  },
  {
    href: '/locations',
    name: 'Locations',
    description: 'Browse and manage available server locations'
  },
  {
    href: '/settings',
    name: 'Account Settings',
    description: 'Manage your account preferences and security options'
  },
  {
    href: '/billing',
    name: 'Billing Information',
    description: 'View and update your billing details and subscription'
  },
  // Add more items as needed
];


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
  const [searchFocused, setSearchFocused] = useState(false);

  // Add to the top of your AppSidebar component, near your other state declarations
  const [expandedMenu, setExpandedMenu] = useState(null);
  
  const { SearchComponent, SearchTrigger, openSearch } = useSearch();

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
    <Sidebar variant="sidebar" className="bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <SidebarHeader className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg ">
            <ApplicationLogo className="h-6 w-6 fill-current text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {auth.user.rank === 'admin' ? 'Administration' : 'Hobby'}
            </p>
          </div>
        </div>

        {/* Search Trigger */}
        <div
          className={cn(
            "relative flex items-center rounded-lg border transition-colors cursor-pointer",
            searchFocused
              ? "border-zinc-300 dark:border-zinc-600"
              : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900",
          )}
          onClick={openSearch}
        >
          <Search className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <div 
            className="h-9 pl-9 pr-4 py-2 w-full text-sm text-zinc-400 dark:text-zinc-500 flex items-center justify-between"
          >
            <span>Search...</span>
            <span className="text-xs border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 flex items-center">
              <Command className="h-3 w-3 mr-1" />
              <span>K</span>
            </span>
          </div>
        </div>
        
        {/* Render the search component at the end of the AppSidebar */}
        <SearchComponent />
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* Home */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={sidebartab === "home"}
                  className={cn(
                    "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                    "rounded-lg transition-colors",
                  )}
                >
                  <Link href={route("dashboard")} prefetch cacheFor="20s">
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Deploy */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={sidebartab === "deploy"}
                  className={cn(
                    "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                    "rounded-lg transition-colors",
                  )}
                >
                  <Link href="/deploy" prefetch cacheFor="20s">
                    <LucideMonitorUp className="h-5 w-5" />
                    <span className="font-medium">Deploy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Control Panel */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={sidebartab === "panel"}
                  className={cn(
                    "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                    "rounded-lg transition-colors",
                  )}
                >
                  <Link href="/panel " prefetch cacheFor="10s">
                    <LucideKeySquare className="h-5 w-5" />
                    <span className="font-medium">Control Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Shop */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={sidebartab === "products"}
                  className={cn(
                    "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                    "rounded-lg transition-colors",
                  )}
                >
                  <Link href="/plans" prefetch cacheFor="10s">
                    <LucideShoppingBag className="h-5 w-5" />
                    <span className="font-medium">Shop</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Coin Shop */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={sidebartab === "coinshop"}
                  className={cn(
                    "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                    "rounded-lg transition-colors",
                  )}
                >
                  <Link href="/shop" prefetch cacheFor="10s">
                    <LucideHandCoins className="h-5 w-5" />
                    <span className="font-medium">Coin Shop</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Earn Coins */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={sidebartab === "earn"}
                  className={cn(
                    "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                    "rounded-lg transition-colors",
                  )}
                >
                  <Link href="/earn" prefetch cacheFor="10s">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-medium">Earn Coins</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Profile */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={sidebartab === "profile"}
                  className={cn(
                    "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                    "rounded-lg transition-colors",
                  )}
                >
                  <Link href="/profile" prefetch cacheFor="20s">
                    {auth.user.rank === "premium" ? (
                      <Crown className="h-5 w-5 text-amber-500" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                    <span className="font-medium">Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Broadcast with dropdown */}
<SidebarMenuItem>
  <SidebarMenuButton
    isActive={sidebartab === "broadcast-india" || sidebartab === "broadcast-uk"}
    className={cn(
      "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
      "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
      "rounded-lg transition-colors",
    )}
    onClick={(e) => {
      e.preventDefault();
      setExpandedMenu(expandedMenu === "broadcast" ? null : "broadcast");
    }}
  >
    <div className="flex items-center w-full">
      <LucideRadio className="h-5 w-5 mr-1" />
      <span className="font-medium">Broadcast</span>
      <LucideChevronDown 
        className={cn(
          "h-4 w-4 ml-auto transition-transform", 
          expandedMenu === "broadcast" ? "transform rotate-180" : ""
        )} 
      />
    </div>
  </SidebarMenuButton>
  
  {expandedMenu === "broadcast" && (
    <div className="ml-8 mt-1 space-y-1">
      <SidebarMenuButton
        asChild
        isActive={sidebartab === "broadcast-india"}
        className={cn(
          "h-9 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "data-[active=true]:bg-zinc-200 data-[active=true]:text-zinc-900 dark:data-[active=true]:bg-zinc-800 dark:data-[active=true]:text-zinc-100",
          "rounded-lg transition-colors pl-3",
        )}
      >
        <Link href="/broadcast/india" className="flex items-center">
          <LucideServerCog className="h-2 w-2 mr-2 text-green-500" />
          <span className="text-sm">India</span>
        </Link>
      </SidebarMenuButton>
      
      <SidebarMenuButton
        asChild
        isActive={sidebartab === "broadcast-uk"}
        className={cn(
          "h-9 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "data-[active=true]:bg-zinc-200 data-[active=true]:text-zinc-900 dark:data-[active=true]:bg-zinc-800 dark:data-[active=true]:text-zinc-100",
          "rounded-lg transition-colors pl-3",
        )}
      >
        <Link href="/broadcast/uk" className="flex items-center">
          <LucideServerCog className="h-2 w-2 mr-2 text-blue-500" />
          <span className="text-sm">UK</span>
        </Link>
      </SidebarMenuButton>
    </div>
  )}
</SidebarMenuItem>

              {/* Admin Panel */}
              {auth.user.rank === "admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={sidebartab === "settings"}
                    className={cn(
                      "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                      "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                      "rounded-lg transition-colors",
                    )}
                  >
                    <a href="/admin">
                      <CogIcon className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Admin Panel</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

            {/** * 
              {vmsConfig.enabled && (
                <SidebarMenuItem>
                  {canAccessVMs() ? (
                    <SidebarMenuButton
                      asChild
                      isActive={sidebartab === "vms"}
                      className={cn(
                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                        "rounded-lg transition-colors",
                      )}
                    >
                      <a href="/vms">
                        <LucideSlidersVertical className="h-5 w-5" />
                        <span className="font-medium">Virtual Machines</span>
                      </a>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      disabled
                      className="h-10 text-zinc-400 dark:text-zinc-600 rounded-lg opacity-60 cursor-not-allowed"
                    >
                      <LucideLock className="h-5 w-5" />
                      <span className="font-medium">VMs (Restricted)</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              )} **/}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-zinc-200 dark:border-zinc-800 p-4">
        <SidebarMenu className="space-y-2">
          {/* Coins Display */}
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center">
                <Coins className="h-4 w-4 mr-2 text-amber-500" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Coins: {auth.user.coins || 0}</span>
              </div>
            </div>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Link href={route("logout")} method="post" as="button">
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Theme Toggle */}
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center">
                <Sun className="h-4 w-4 mr-2 text-zinc-500 dark:text-zinc-400" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Light mode</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Avatar className="h-6 w-6">
                  <AvatarImage src={getGravatarUrl(auth.user.email) || "/placeholder.svg"} alt={auth.user.name} />
                  <AvatarFallback
                    className={cn(
                      "text-xs font-medium",
                      auth.user.rank === "premium"
                        ? "bg-amber-600 text-white"
                        : auth.user.rank === "admin"
                          ? "bg-red-600 text-white"
                          : "bg-zinc-600 text-white",
                    )}
                  >
                    {getUserInitials(auth.user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

// Theme Toggle Component
function ThemeToggle() {
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

  return (
    <Switch
      checked={isDarkMode}
      onCheckedChange={toggleTheme}
      className="data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-100"
    />
  )
}

export default function AuthenticatedLayout({ header, children, sidebartab }) {
  const { auth, coins, vmsConfig } = usePage().props

  
  // Parse breadcrumb from header
  const breadcrumbParts = parseBreadcrumb(header)

  return (
    <SidebarProvider>
      <AppSidebar auth={auth} vmsConfig={vmsConfig} sidebartab={sidebartab} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-200 dark:bg-zinc-700" />
            {breadcrumbParts.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbParts.map((part, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem className="hidden md:block">
                        {index === breadcrumbParts.length - 1 ? (
                          <BreadcrumbPage className="text-zinc-900 dark:text-zinc-100 font-medium">
                            {part}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href="#"
                            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            {part}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbParts.length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block text-zinc-400 dark:text-zinc-600" />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-zinc-50 dark:bg-zinc-950">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800">
            {children}
            <Footer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
