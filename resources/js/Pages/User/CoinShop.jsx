import React, { Suspense, lazy } from 'react';
import { Head, usePage } from '@inertiajs/react';

// Lazy load components
const AuthenticatedLayout = lazy(() => import("@/Layouts/AuthenticatedLayout.jsx"));
const Shop = lazy(() => import('../Common/Shop'));

// Loading fallbacks
const LayoutFallback = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 animate-pulse"></div>
);

const ShopFallback = () => (
  <div className="mt-6 bg-gray-200 dark:bg-gray-800 rounded-lg h-96 animate-pulse"></div>
);

export default function AdminDashboard() {
    const { eggs } = usePage().props;

    return (
        <Suspense fallback={<LayoutFallback />}>
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Home / Coin-Shop
                    </h2>
                }
                sidebartab="coinshop"
            >
                <Head title="Coin Shop" />

                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                    <div className="text-gray-900 dark:text-gray-100 text-xl">
                       Coin Shop
                    </div>
                </div>

                <Suspense fallback={<ShopFallback />}>
                    <Shop />
                </Suspense>
            </AuthenticatedLayout>
        </Suspense>
    );
}