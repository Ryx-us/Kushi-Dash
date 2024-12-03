'use client'

import React, { useState, useEffect } from 'react'
import { Link, usePage } from '@inertiajs/react'
import {
    Home,
    User as UserIcon,
    Sun,
    Moon,
    Menu,
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronDown,
    CreditCard,
    Users,
    BarChart3,
    Box,
    HelpCircle,
    LucideServer,
    LucideLock,
    LucideMonitorUp,
    Coins,
    Crown,
    X,
    HammerIcon,
    LucideCoins,
    LucideShoppingBag,
    LucideHandCoins,
    CogIcon,
    LucideSlidersVertical
} from 'lucide-react'
import ApplicationLogo from '@/components/ApplicationLogo'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Footer from '@/components/Footer'

const MenuItem = ({ icon: Icon, label, href, isActive = false }) => (
    <Link
        href={href}
        className={cn(
            "flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800",
            isActive && "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white",
            !isActive && "text-zinc-600 dark:text-zinc-400"
        )}
    >
        <Icon className="mr-3 h-4 w-4" />
        <span>{label}</span>
    </Link>
)

const MenuSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger className="flex items-center w-full px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <ChevronDown className={cn(
                    "h-4 w-4 mr-1 transition-transform",
                    isOpen && "-rotate-180"
                )} />
                {title}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 px-1">
                {children}
            </CollapsibleContent>
        </Collapsible>
    )
}

export default function AuthenticatedLayout({ header, children, sidebartab }) {
    const { auth, coins, vmsConfig } = usePage().props
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        const darkModePreference = localStorage.getItem('dark-mode') === 'true'
        setIsDarkMode(darkModePreference)
        if (darkModePreference) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [])

    const toggleTheme = () => {
        const newDarkMode = !isDarkMode
        setIsDarkMode(newDarkMode)
        localStorage.setItem('dark-mode', newDarkMode)
        if (newDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    const canAccessVMs = () => {
        if (!vmsConfig.enabled) return false;
    
        const accessLevel = vmsConfig.accessLevel;
        const userRank = auth.user.rank;
    
        if (accessLevel === null ) return true;
        if (accessLevel === 'premium' && (userRank === 'premium' || userRank === 'admin')) return true;
        if (accessLevel === 'admin' && userRank === 'admin') return true;
    
        return false;
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    return (
        <div className="flex h-screen w-screen bg-zinc-400 rounded-md dark:">
            {/* Sidebar */}
            <Card className={cn(
                "fixed inset-y-0 left-0 z-50 rounded-none w-64 transform transition-transform duration-300 ease-in-out flex flex-col",
                "lg:relative lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <CardHeader className="p-4 border-b flex justify-between items-center">
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo className="h-8 w-auto fill-current text-black dark:text-white" />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
                        <X className="h-6 w-6" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-2 space-y-4">
                    <MenuItem
                        icon={Home}
                        label="Home"
                        href={route('dashboard')}
                        isActive={sidebartab === 'home'}
                    />

                    <MenuSection title="COMPUTING">
                        <MenuItem
                            icon={LucideMonitorUp}
                            label="Deploy"
                            href="/deploy"
                            isActive={sidebartab === 'deploy'}
                        />
                        
                        <MenuItem
                            icon={LucideLock}
                            label="Control Panel"
                            href="/panel"
                            isActive={sidebartab === 'customers'}
                        />
                    </MenuSection>

                    <MenuSection title="PRODUCTS">
                        <MenuItem
                            icon={LucideShoppingBag}
                            label="Shop"
                            href="/plans"
                            isActive={sidebartab === 'products'}
                        />

                        <MenuItem
                            icon={LucideHandCoins}
                            label="Coin Shop"
                            href="/shop"
                            isActive={sidebartab === 'coinshop'}
                        />
                        <MenuItem
                            icon={BarChart3}
                            label="Earn Coins"
                            href="/earn"
                            isActive={sidebartab === 'earn'}
                        />
                        
                    </MenuSection>
                    <MenuSection title="USER">
                        <MenuItem
                            icon={auth.user.rank === 'premium' ? Crown : UserIcon}
                            label="Profile"
                            href="/profile"
                            isActive={sidebartab === 'profile'}
                        />
                    </MenuSection>

                    {auth.user.rank === 'admin' && (
                        <MenuSection title="BUSINESS SETTINGS">
                            <MenuItem
                                icon={CogIcon}
                                label="Admin Panel"
                                href="/admin"
                                isActive={sidebartab === 'settings'}
                            />
                        </MenuSection>
                    )}

{vmsConfig.enabled && (
            <MenuSection title="VIRTUAL MACHINES">
              {canAccessVMs() ? (
                <MenuItem
                  icon={LucideSlidersVertical}
                  label="Virtual Machines"
                  href="/vms"
                  isActive={sidebartab === 'vms'}
                />
              ) : (
                <div className="flex items-center p-4 text-gray-500">
                  <LucideLock className="h-5 w-5 mr-2" />
                  <span>VMs (Access Restricted)</span>
                </div>
              )}
            </MenuSection>
          )}


                </CardContent>
                <CardFooter className="p-2 border-t">
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-between px-3 py-2 text-sm">
                            <div className="flex items-center">
                                <Coins className="h-4 w-4 mr-2"/>
                                <span>Coins: {auth.user.coins||0}</span>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        auth.user.rank === 'premium' && "bg-amber-100 hover:bg-amber-200 dark:bg-amber-600 dark:hover:bg-amber-800"
                                    )}
                                >
                                    {auth.user.rank === 'premium' ? (
    <Crown className="mr-3 h-4 w-4 text-amber-500"/>
) : auth.user.rank === 'admin' ? (
    <HammerIcon className="mr-3 h-4 w-4 text-red-500 "/>
) : (
    <UserIcon className="mr-3 h-4 w-4"/>
)}
{auth.user.name}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 bg-white dark:bg-black"
                                align="start"
                            >
                                <DropdownMenuItem className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <Link href={route('profile.edit')} className="flex items-center w-full">
                                        <Settings className="mr-2 h-4 w-4"/>
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-red-900  dark:hover:bg-rose-950">
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center w-full"
                                    >
                                        <LogOut className="mr-2 h-4 w-4"/>
                                        Log Out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardFooter>
            </Card>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Card className="rounded-none border-b bg-white dark:bg-black">
                    <CardContent className="p-0">
                        <div className="flex h-16 items-center justify-between px-4">
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4 lg:hidden">
                                    <Menu className="h-6 w-6"/>
                                </Button>
                                {header}
                            </div>
                            <div className="flex items-center space-x-4">
                                <Switch
                                    checked={isDarkMode}
                                    onCheckedChange={toggleTheme}
                                    className="data-[state=checked]:bg-zinc-600"
                                />
                                <span className="text-zinc-600 dark:text-zinc-400">
                                    {isDarkMode ? (
                                        <Moon className="h-4 w-4"/>
                                    ) : (
                                        <Sun className="h-4 w-4"/>
                                    )}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                    <div className="h-full overflow-y-auto p-4">
                        <div className="mx-auto ">
                            {children}
                            <Footer/>
                        </div>
                    </div>
                    

                </div>
            </div>

           
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
    )
}