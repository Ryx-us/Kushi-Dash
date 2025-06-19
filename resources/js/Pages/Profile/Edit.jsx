import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';

import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import PterodactylAccountContainer from "@/Pages/Profile/Partials/PterodactylAccountContainer.jsx";
import PasswordResetFormPterodactyl from '../Panel/Components/PasswordReset';


export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                   Home /  Profile
                </h2>
            }
            sidebartab="profile"
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl "
                        />



                    {/*<PasswordResetFormPterodactyl/>*/}
                    <PterodactylAccountContainer className="max-w-xl mt-4" />


                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
