import React from 'react';
import { Head } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/components/Footer.jsx";
import EggForm from "@/Pages/Admin/PterodactylEggs.jsx";
import VmsCreate from './Admin/VMCreate';
import VMSView from './Admin/VMView';

export default function AdminVMView() {
    return (
        <AdminAuthLayer
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin / Virtual Machines (Docker and Proxmox)
                </h2>
            }
            sidebartab="newegg"
        >
            <Head title="Create Eggs"/>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                <div className="text-gray-900 dark:text-gray-100">
                    <h3 className="text-lg font-medium">All configured VM(s) and RDP(s) found in system. </h3>
                </div>
            </div>

            <div className="mt-6">
                <VMSView/>
            </div>

            <Footer/>
        </AdminAuthLayer>
    );
}