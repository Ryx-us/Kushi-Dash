import React, { Suspense, lazy } from 'react';
import { Head, usePage } from '@inertiajs/react';

// Lazy load components
const AuthenticatedLayout = lazy(() => import("@/Layouts/AuthenticatedLayout.jsx"));
const Products = lazy(() => import('../Common/products'));

// Loading fallbacks
const LayoutFallback = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 animate-pulse"></div>
);

const ProductsFallback = () => (
  <div className="mt-6 bg-gray-200 dark:bg-gray-800 rounded-lg h-96 animate-pulse"></div>
);

export default function AdminDashboard() {
    return (
        <Suspense fallback={<LayoutFallback />}>
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Home / Products
                    </h2>
                }
                sidebartab="products"
            >
                <Head title="Products" />

                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                    <div className="text-gray-900 dark:text-gray-100 text-xl">
                       Choose from our wide range of products 😎
                    </div>
                </div>

                <Suspense fallback={<ProductsFallback />}>
                    <Products />
                </Suspense>
            </AuthenticatedLayout>
        </Suspense>
    );
}