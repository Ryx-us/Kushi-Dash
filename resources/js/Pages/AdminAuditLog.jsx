import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/components/Footer.jsx";
import AuditLogComp from "@/Pages/Admin/AuditLog.jsx";

export default function AdminAuditLog() {
    const { egg } = usePage().props;

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

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                <div className="text-gray-900 dark:text-gray-100">
                    <h3 className="text-lg font-medium">Audit Logs</h3>
                </div>
            </div>

            <div className="mt-6">
                <AuditLogComp />
            </div>

            <Footer/>
        </AdminAuthLayer>
    );
}