import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminAuthLayer from "@/Layouts/AdminAuthLayer.jsx";
import Footer from "@/components/Footer.jsx";
import PlansView from './Admin/PlansView';
import CreateLocation from './Admin/LocationCreate';

export default function AdminPlansView() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('/admin/api/locations');
                const data = await response.json();
                setPlans(data.plans); // Access plans array from response
            } catch (error) {
                console.error('Error fetching plans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    return (
        <AdminAuthLayer
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin / Locations / Create
                </h2>
            }
            sidebartab="newlocation"
        >
            <Head title="Admin Create new Location"/>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-black">
                <div className="text-gray-900 dark:text-gray-100">
                    <h3 className="text-lg font-medium">Create a new location.</h3>
                </div>
            </div>

            <div className="mt-6">
                <CreateLocation/>
            </div>

            <Footer/>
        </AdminAuthLayer>
    );
}