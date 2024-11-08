// resources/js/Pages/Panel/Panel.jsx

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
;
import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm.jsx";

import DeleteUserForm from "@/Pages/Profile/Partials/DeleteUserForm.jsx";
import PterodactylContainer from "@/Pages/Panel/Components/PterodactylContainer.jsx";
import PasswordResetFormPterodactyl from "@/Pages/Panel/Components/PasswordReset.jsx";

export default function Panel() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Panel
                </h2>
            }
            sidebartab="panel"
        >
            <Head title="Panel"/>

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">




                    <PterodactylContainer className="max-w-xl"/>
                    <PasswordResetFormPterodactyl className="max-w-xl"/>



                </div>
            </div>
        </AuthenticatedLayout>
    );
}
