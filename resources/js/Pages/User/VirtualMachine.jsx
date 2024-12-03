import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import ServerDisplay from "@/Pages/Dashboard/DisplayServer.jsx";
import FlashbackTester from "@/Pages/Dashboard/flashbacktester.jsx";
import ServerEdit from '../Common/ServerEdit';



export default function AdminDashboard() {
    const { eggs } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                Home / Virtual Machines
                </h2>
            }
            sidebartab="vms"
        >
            <Head title="Dashboard / Server Edit" />

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black mb-6">
                <div className="text-gray-900 dark:text-gray-100 text-xl">
                   Virtual Machines / Remote Desktops
                </div>
            </div>


            <ServerEdit/>



        </AuthenticatedLayout>
    );
}
