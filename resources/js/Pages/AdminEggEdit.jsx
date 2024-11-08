import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/components/Footer.jsx";
import EggEditForm from "@/Pages/Admin/EggEditForm.jsx";

export default function AdminEggsEdit() {
    const { egg } = usePage().props;

    return (
        <AdminAuthLayer
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin / Eggs / Edit
                </h2>
            }
            sidebartab="editegg"
        >
            <Head title="Edit Egg"/>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                <div className="text-gray-900 dark:text-gray-100">
                    <h3 className="text-lg font-medium">Edit Server Software</h3>
                </div>
            </div>

            <div className="mt-6">
                <EggEditForm id={egg.id} />
            </div>

            <Footer/>
        </AdminAuthLayer>
    );
}
