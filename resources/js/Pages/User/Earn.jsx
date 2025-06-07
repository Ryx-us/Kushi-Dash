import React, { Suspense, lazy } from 'react';
import { Head, usePage } from '@inertiajs/react';

// Lazy load components
const AuthenticatedLayout = lazy(() => import("@/Layouts/AuthenticatedLayout.jsx"));
const Earn = lazy(() => import('../Common/EarnCom'));

// Loading fallbacks
const LayoutFallback = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 animate-pulse"></div>
);

const EarnFallback = () => (
  <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4"></div>
);

export default function AdminDashboard() {
    const { auth } = usePage().props;
    const { darkMode } = usePage().props;
    const username = auth.user.name;
    const userRank = auth.user.rank; 
    
    return (
        <Suspense fallback={<LayoutFallback />}>
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Home / Funds
                    </h2>
                }
                sidebartab="earn"
            >
                <Head title="Earn Funds" />

                <div className="relative h-[100px] w-full mb-6 outline-gray-400 outline rounded-lg ">
                    <img
                        src="https://i.pinimg.com/originals/1b/1b/b5/1b1bb5e2107b007bf4eb7b9eefb072ed.jpg"
                        alt="Earn Funds"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center p-5">
                        <h1 className="text-4xl font-bold text-gray-200">
                            Earn Funds
                        </h1>
                    </div>
                </div>

                <Suspense fallback={<EarnFallback />}>
                    <Earn />
                </Suspense>
            </AuthenticatedLayout>
        </Suspense>
    );
}