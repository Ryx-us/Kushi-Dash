import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from '@inertiajs/react';
import { Sun, Moon } from 'lucide-react';

export default function Login({ companyName = "craftwork" }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const darkModePreference = localStorage.getItem('dark-mode') === 'true';
        setIsDarkMode(darkModePreference);
        if (darkModePreference) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem('dark-mode', newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen w-full flex dark:bg-black">
                {/* Left Section - Login Form */}
                <div className="w-full md:w-[480px] flex flex-col items-center justify-center p-8 bg-white dark:bg-black">
                    <div className="w-full max-w-[360px] space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-xl font-semibold dark:text-white">Log in to</h1>
                            <p className="text-2xl font-bold dark:text-white">{companyName}</p>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 font-normal border-zinc-200 dark:border-zinc-600"
                            onClick={() => window.location.href = '/auth/discord'}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276c-.598.3428-1.2205.6447-1.8733.8923a.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
                                    fill="#5865F2"
                                />
                            </svg>
                            Login with Discord
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t dark:border-zinc-600"/>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-black  px-2 text-muted-foreground dark:text-zinc-400">
                                    or
                                </span>
                            </div>
                        </div>

                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    className="h-12 dark:bg-black  dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="Your Password"
                                    className="h-12 dark:bg-black dark:text-white"
                                />
                            </div>
                            <span className="ms-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Email Login is usually reserved for Administators
                            </span>
                            <Button type="submit"
                                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-neutral-600">
                                Log in
                            </Button>
                        </form>


                    </div>
                </div>

                {/* Right Section - Background Image */}
                <div className="hidden md:block flex-1 relative bg-zinc-900">
                    <div
                        className="absolute inset-0 bg-[url('https://wallpapers.com/images/featured/minecraft-shaders-nza2zw15kpjof2qk.jpg')] bg-cover bg-center"
                        style={{
                            backgroundBlendMode: 'multiply',
                        }}
                    />
                </div>
            </div>

            <div className="fixed bottom-4 right-4">
                <Button onClick={toggleTheme} className="p-2 rounded-full bg-zinc-900 dark:bg-zinc-700">
                    {isDarkMode ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-white" />}
                </Button>
            </div>
        </>
    );
}
