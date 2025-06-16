import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    Sun,
    Moon,
    LogOut,
    LucideEgg,
    ScrollText,
    Wallet,
    FileText,
    LineChart,
    LucidePlus,
    LucideGlobe2,
    LucideDownloadCloud,
    LucideDollarSign,
    LucideIdCard,
    LucideUserX2,
    LucideFileUp,
    Command,
    Search,
    UserIcon,
    Crown,
    Settings,
    Coins,
    Laptop2Icon
} from 'lucide-react';
import { FaLaptopCode } from 'react-icons/fa6';
import ApplicationLogo from '@/components/ApplicationLogo';
import { Button } from '@/components/ui/button';

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
} from "@/components/ui/sidebar";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import { useSearch } from "@/hooks/search";

// Parse breadcrumb from header
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
    if (!name) return "A"
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
}

// Admin Sidebar Component
function AdminSidebar({ auth, sidebartab }) {
    const { SearchComponent, SearchTrigger, openSearch } = useSearch();

    return (
        <Sidebar variant="sidebar" className="bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <SidebarHeader className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                        <ApplicationLogo className="h-6 w-6 fill-current text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Admin Panel</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Administration
                        </p>
                    </div>
                </div>

                {/* Search Trigger */}
                <div
                    className={cn(
                        "relative flex items-center rounded-lg border transition-colors cursor-pointer",
                        "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900",
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
                
                {/* Render the search component */}
                <SearchComponent />
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent className="px-4 py-6">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {/* Client Home */}
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
                                    <Link href={route("dashboard")}>
                                        <Home className="h-5 w-5" />
                                        <span className="font-medium">Client Home</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Server Software */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "eggs"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/eggs/">
                                        <LucideEgg className="h-5 w-5" />
                                        <span className="font-medium">Server Software</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* New Server Software */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "newegg"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/eggs/new">
                                        <LucidePlus className="h-5 w-5" />
                                        <span className="font-medium">New Server Software</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Locations */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "location"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/locations">
                                        <LucideGlobe2 className="h-5 w-5" />
                                        <span className="font-medium">Locations</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* New Location */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "newlocation"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/locations/new">
                                        <LucideDownloadCloud className="h-5 w-5" />
                                        <span className="font-medium">New Location</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Inbuilt CDN */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "cdn"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/cdn">
                                        <LucideFileUp className="h-5 w-5" />
                                        <span className="font-medium">Inbuilt CDN</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* System Settings */}
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
                                    <Link href="/admin/settings">
                                        <Settings className="h-5 w-5" />
                                        <span className="font-medium">System Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* User Management */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "users"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/users">
                                        <LucideUserX2 className="h-5 w-5" />
                                        <span className="font-medium">User Management</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Plan Management */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "plans"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/plans">
                                        <LucideDollarSign className="h-5 w-5" />
                                        <span className="font-medium">Plan Management</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* New Plan */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "newplan"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/plans/new">
                                        <LucideIdCard className="h-5 w-5" />
                                        <span className="font-medium">New Plan</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Audit Log */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "audit-log"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/audit">
                                        <ScrollText className="h-5 w-5" />
                                        <span className="font-medium">Audit Log</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Earning Methods */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "earning-methods"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/earning-methods">
                                        <Wallet className="h-5 w-5" />
                                        <span className="font-medium">Earning Methods</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Invoices */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "invoices"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/invoices">
                                        <FileText className="h-5 w-5" />
                                        <span className="font-medium">Invoices</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Insights */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={sidebartab === "insights"}
                                    className={cn(
                                        "h-10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-100 dark:data-[active=true]:text-zinc-900",
                                        "rounded-lg transition-colors",
                                    )}
                                >
                                    <Link href="/admin/insights">
                                        <LineChart className="h-5 w-5" />
                                        <span className="font-medium">Insights</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
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

                    {/* User Info */}
                    <SidebarMenuItem>
                        <div className="flex items-center justify-between px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="flex items-center">
                                <Crown className="h-4 w-4 mr-2 text-amber-500" />
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{auth.user.name}</span>
                            </div>
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={getGravatarUrl(auth.user.email) || "/placeholder.svg"} alt={auth.user.name} />
                                <AvatarFallback
                                    className="bg-red-600 text-white text-xs font-medium"
                                >
                                    {getUserInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
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
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}

// Theme Toggle Component
function ThemeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const darkModePreference = localStorage.getItem("dark-mode") === "true";
        setIsDarkMode(darkModePreference);
        if (darkModePreference) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem("dark-mode", newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <Switch
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-100"
        />
    );
}

export default function AdminAuthLayer({ header, children, sidebartab }) {
    const { auth, coins } = usePage().props;
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [confettiScript, setConfettiScript] = useState(null);
    
    useEffect(() => {
        // Check if this is the first visit
        const hasVisited = localStorage.getItem('admin-first-visit');
        if (!hasVisited && auth.user.rank === 'admin') {
            setIsFirstVisit(true);
            localStorage.setItem('admin-first-visit', 'true');

            // Load confetti script
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/canvas-confetti/1.6.0/confetti.browser.min.js';
            script.async = true;
            script.onload = () => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            };
            document.body.appendChild(script);
            setConfettiScript(script);
        }

        return () => {
            if (confettiScript) {
                document.body.removeChild(confettiScript);
            }
        };
    }, []);

    // Parse breadcrumb from header
    const breadcrumbParts = parseBreadcrumb(header);

    return (
        <SidebarProvider>
            <AdminSidebar auth={auth} sidebartab={sidebartab} />
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
                    <div className="ml-auto flex items-center gap-2 px-4">
                        <ThemeToggle />
                    </div>
                </header>
                
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-zinc-50 dark:bg-zinc-950">
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800">
                        {children}
                        <Footer />
                    </div>
                </div>
                
                {/* Confetti effect for first admin login */}
                {isFirstVisit && (
                    <div className="fixed inset-0 pointer-events-none z-50">
                        <canvas id="confetti-canvas" className="w-full h-full" />
                    </div>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}