import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Mail, BarChart3, PieChart, CheckCircle } from "lucide-react";

export default function WelcomeBack() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { props: { companyName } } = usePage(); // Access companyName from shared props

    useEffect(() => {
        // Check localStorage for user preference
        const darkModePreference = localStorage.getItem('dark-mode') === 'true';
        setIsDarkMode(darkModePreference);
        if (darkModePreference) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        const newDarkMode = !isDarkMode;
        localStorage.setItem('dark-mode', newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <>
            <Head title="Welcome Back" />
            <div className={`min-h-screen flex flex-col bg-white text-black dark:bg-[#1a237e] dark:text-white`}>
                {/* Navigation Bar */}
                <nav className="flex items-center justify-between p-4 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-full border border-black/20 text-black/80 dark:border-white/20 dark:text-white/80 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                            HOME
                        </Link>
                        <Link href="/about" className="text-black hover:text-black/80 dark:text-white hover:dark:text-white/80">
                            ABOUT
                        </Link>
                        <Link href="/products" className="text-black hover:text-black/80 dark:text-white hover:dark:text-white/80">
                            PRODUCTS
                        </Link>
                        <Link href="/contacts" className="text-black hover:text-black/80 dark:text-white hover:dark:text-white/80">
                            CONTACTS1
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
                        >
                            <Mail className="text-black dark:text-white" />
                        </Button>
                        <Button
                            asChild
                            className="rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-[#1a237e] dark:hover:bg-white/90"
                        >
                            <Link href="/login">
                                LOGIN
                            </Link>
                        </Button>
                        <Button
                            onClick={toggleTheme}
                            className="rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-[#1a237e] dark:hover:bg-white/90"
                        >
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </Button>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 flex">
                    {/* Left Section */}
                    <div className="w-1/2 p-12 flex flex-col justify-center">
                        <h1 className="text-6xl font-bold mb-6">
                            Welcome to {companyName}
                        </h1>
                        <h2 className="text-3xl mb-4">
                            Let's Deploy your Server Shall we?
                        </h2>
                        <p className="mb-8 max-w-md">
                            {}
                        </p>
                        <Button
                            variant="outline"
                            className="w-fit border border-black/20 text-black hover:bg-black/10 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                        >
                            READ MORE →
                        </Button>

                        <div className="flex gap-4 mt-12">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-16 h-16 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
                            >
                                <BarChart3 className="text-black dark:text-white" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-16 h-16 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
                            >
                                <PieChart className="text-black dark:text-white" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-16 h-16 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
                            >
                                <CheckCircle className="text-black dark:text-white" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="w-1/2 bg-black rounded-l-[4rem] relative overflow-hidden dark:bg-white">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <span className="text-5xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-transparent bg-clip-text">
                                    Welcome back
                                </span>
                                {/* Decorative elements */}
                                <div className="absolute -top-8 -right-8 text-yellow-400">★</div>
                                <div className="absolute -bottom-4 -left-8 text-blue-400">✦</div>
                                <div className="absolute top-0 right-16 text-red-400">✺</div>
                                <div className="absolute -bottom-8 right-8 text-purple-400">●</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
