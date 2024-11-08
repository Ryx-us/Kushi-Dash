import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/components/Footer.jsx";

import UserEditForm from "@/Pages/Admin/UserEdit.jsx";

export default function AdminUserEdit() {
    const { userId } = usePage().props;

    return (
        <AdminAuthLayer
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin / Users
                </h2>
            }
            sidebartab="users"
        >
            <Head title="Admin Users"/>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                <div className="text-gray-900 dark:text-gray-100">
                    <h3 className="text-lg font-medium">All Users found</h3>
                </div>
            </div>

            <div className="mt-6">
                <UserEditForm userId={userId} />
            </div>

            <Footer/>
        </AdminAuthLayer>
    );
}
