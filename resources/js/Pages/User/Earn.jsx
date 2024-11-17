import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import ServerDisplay from "@/Pages/Dashboard/DisplayServer.jsx";
import { Cog, Crown, User } from 'lucide-react'; // Using lucide-react icons
import ServerCreate from '../Common/ServerCreate';
import Earn from '../Common/EarnCom';

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
                    Home / Funds
                </h2>
            }
            sidebartab="deploy"
        >
            <Head title="New Server" />

            <div className="relative h-[100px] w-full mb-6 outline-gray-400 outline rounded-lg ">
                <img
                    src="https://i.pinimg.com/originals/1b/1b/b5/1b1bb5e2107b007bf4eb7b9eefb072ed.jpg"
                    alt="Welcome to Dashboard"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center p-5">
                    <h1 className="text-4xl font-bold text-gray-200">
                        Earn Funds
                       
                    </h1>
                </div>
            </div>

           

            <Earn/>
            
        </AuthenticatedLayout>
    );
}