import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import ServerDisplay from "@/Pages/Dashboard/DisplayServer.jsx";
import { Cog, Crown, User } from 'lucide-react'; // Using lucide-react icons
import ResourcesView from './Common/Resources';

export default function AdminDashboard() {
    const { auth } = usePage().props; // Get auth user data from Inertia props\
    const { darkMode } = usePage().props;
    const username = auth.user.name;
    console.log(auth)
    const userRank = auth.user.rank; // Assuming rank is passed in auth props

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Home
                </h2>
            }
            sidebartab="home"
        >
            <Head title="Dashboard" />

            <div className="relative h-[100px] w-full mb-6">
                <img
                    src="https://static.vecteezy.com/system/resources/previews/000/549/665/non_2x/abstract-background-dark-and-black-overlaps-004-vector.jpg"
                    alt="Welcome to Dashboard"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center p-5">
                    <h1 className="text-4xl font-bold text-gray-200">
                        Welcome back {username} 👋
                        <span className="ml-2">
                            {userRank === 'admin' ? (
                                <span className="px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white flex items-center max-w-24">
                                    <Cog className="mr-1 h-4 w-4" />
                                    Admin
                                </span>
                            ) : userRank === 'premium' ? (
                                <span className="px-1.5 py-0.5 rounded-full text-xs bg-green-500 text-white flex items-center max-w-24">
                                    <Crown className="mr-1 h-4 w-4" />
                                    Premium
                                </span>
                            ) : (
                                <span className="px-1.5 py-0.5 rounded-full text-xs bg-zinc-500 text-white flex items-center max-w-24">
                                    <User className="mr-1 h-4 w-4" />
                                    Hobby tier
                                </span>
                            )}
                        </span>
                    </h1>
                </div>
            </div>

            <ResourcesView/>

           

            <ServerDisplay />

            

        </AuthenticatedLayout>
    );
}