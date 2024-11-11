import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/components/Footer.jsx";
import EggForm from "@/Pages/Admin/PterodactylEggs.jsx";
import { LoadingScreen } from '@/components/loading-screen';

export default function AdminEggsCreate() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleLoad = () => {
            setLoading(false);
        };

        // Listen for the window load event
        window.addEventListener('load', handleLoad);

        // Ensure the loading screen disappears after a maximum of 2000ms
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        // Cleanup the event listener and timer on component unmount
        return () => {
            window.removeEventListener('load', handleLoad);
            clearTimeout(timer);
        };
    }, []);

    return (
        <AdminAuthLayer
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin / Eggs / Create
                </h2>
            }
            sidebartab="newegg"
        >
            <Head title="Create Eggs"/>

            {loading ? (
                <LoadingScreen />
            ) : (
                <>
                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                        <div className="text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-medium">Add new Server Software</h3>
                        </div>
                    </div>

                    <div className="mt-6">
                        <EggForm />
                    </div>

                    <Footer/>
                </>
            )}
        </AdminAuthLayer>
    );
}