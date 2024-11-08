import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/Components/Footer.jsx";
import EggEditForm from "@/Pages/Admin/EggEditForm.jsx";
import FlashbackTester from "@/Pages/Dashboard/flashbacktester.jsx";
import UsersView from "@/Pages/Admin/UsersView.jsx";

export default function AdminEggsEdit() {
    const { egg } = usePage().props;

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
                <UsersView/>
            </div>

            <Footer/>
        </AdminAuthLayer>
    );
}
