import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Cog, Crown, User } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios';
import http from '@/lib/http';

// Lazy load components
const AuthenticatedLayout = lazy(() => import("@/Layouts/AuthenticatedLayout.jsx"));
const ServerDisplay = lazy(() => import("@/Pages/Dashboard/DisplayServer.jsx"));
const ResourcesView = lazy(() => import('./Common/Resources'));
const SpinningGlobe = lazy(() => import('@/components/SpinningGlobe'));

// Loading fallbacks
const LayoutFallback = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 animate-pulse"></div>
);

const ComponentFallback = () => (
  <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4"></div>
);

export default function AdminDashboard() {
    const { auth } = usePage().props;
    const { darkMode } = usePage().props;
    const username = auth.user.name;
    const userRank = auth.user.rank;
    const pterodactylId = auth.user.pterodactyl_id;
    const companyDesc = auth.companyDesc;

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [activeProjects, setActiveProjects] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchActiveProjects = async () => {
            try {
                const response = await http.get(`/pterodactyl/servers/${pterodactylId}`);
                setActiveProjects(response.servers.length);
            } catch (error) {
                console.error('Error fetching active projects:', error);
            }
        };

        fetchActiveProjects();
    }, [pterodactylId]);

    const getRankBadge = () => {
        switch (userRank) {
            case 'admin':
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-500 text-white flex items-center">
                        <Cog className="mr-1 h-4 w-4" />
                        Admin
                    </span>
                );
            case 'premium':
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500 text-white flex items-center">
                        <Crown className="mr-1 h-4 w-4" />
                        Premium
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-zinc-500 text-white flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        Hobby tier
                    </span>
                );
        }
    };

    return (
        <Suspense fallback={<LayoutFallback />}>
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Home
                    </h2>
                }
                sidebartab="home"
            >
                <Head title="Dashboard" />

                <Card className="w-full mb-6 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="relative h-[300px] w-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-400 to-stone-00 dark:from-purple-800 dark:to-zinc-800 opacity-80" />
                            <img
                                src="https://cdn.dribbble.com/users/2433051/screenshots/4872252/media/93fa4ea6accf793c6c64b4d7f20786ac.gif"
                                alt="Dashboard Banner"
                                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-center justify-between p-6">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <h1 className="text-6xl font-bold font-doto dark:text-white text-white !opacity-100 mb-2">
                                            Welcome back, {username}!
                                        </h1>
                                        <span className="dark:text-white text-2xl font-doto mb-4 z-50 text-zinc-50 !opacity-100">{currentTime}</span>
                                        <div className="flex items-center space-x-2 mt-2">
                                            {getRankBadge()}
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center space-x-4">
                                    <div className="dark:text-white text-black text-right z-50 !opacity-100">
                                        <p className="text-2xl font-bold font-doto">{activeProjects}</p>
                                        <p className="text-xl font-bold font-doto">Active Project(s)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Suspense fallback={<ComponentFallback />}>
                    <ResourcesView />
                </Suspense>

                <Suspense fallback={<ComponentFallback />}>
                    <ServerDisplay />
                </Suspense>
            </AuthenticatedLayout>
        </Suspense>
    );
}