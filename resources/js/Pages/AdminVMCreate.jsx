import React from 'react';
import { Head } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/components/Footer.jsx";
import EggForm from "@/Pages/Admin/PterodactylEggs.jsx";
import VmsCreate from './Admin/VMCreate';

export default function AdminEggsCreate() {
    return (
        <AdminAuthLayer
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin / Virtual Machine / New
                </h2>
            }
            sidebartab="newvm"
        >
            <Head title="Create a Virtual Machine"/>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                <div className="text-gray-900 dark:text-gray-100">
                    <h3 className="text-lg font-medium">Add a new VM configuration</h3>
                </div>
            </div>

            <div className="mt-6">
                <VmsCreate/>
            </div>

            <Footer/>
        </AdminAuthLayer>
    );
}