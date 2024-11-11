import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/components/Footer.jsx";
import AuditLogComp from "@/Pages/Admin/AuditLog.jsx";
import { LoadingScreen } from '@/components/loading-screen';

export default function AdminAuditLog() {
    const { egg } = usePage().props;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleLoad = () => {
            setLoading(false);
        };

        // Listen for the window load event
        window.addEventListener('load', handleLoad);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    return (
        <AdminAuthLayer
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin / Audit Log
                </h2>
            }
            sidebartab="audit-log"
        >
            <Head title="Audit Log"/>

            {loading ? (
                <LoadingScreen />
            ) : (
                <>
                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                        <div className="text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-medium">Audit Logs</h3>
                        </div>
                    </div>

                    <div className="mt-6">
                        <AuditLogComp />
                    </div>

                    <Footer/>
                </>
            )}
        </AdminAuthLayer>
    );
}