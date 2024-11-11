import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/components/Footer.jsx";
import PlanForm from './Admin/PlansCreate';
import { LoadingScreen } from '@/components/loading-screen';




export default function AdminPlans() {
    const { egg } = usePage().props;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AdminAuthLayer
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin / Plans / Create
                </h2>
            } 
            sidebartab="newplan"
        >
            <Head title="Admin Users"/>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                <div className="text-gray-900 dark:text-gray-100">
                    <h3 className="text-lg font-medium">Create a New Plan</h3>
                </div>
            </div>

            <div className="mt-6">
                {loading ? <LoadingScreen /> : <PlanForm />}
            </div>

            <Footer/>
        </AdminAuthLayer>
    );
}