import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import { Button } from "@/components/ui/button"

import TextInput from '@/components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';

/**
 * 
 * This is teh p
 */


export default function PterodactylAccountContainer({
                                                        mustVerifyEmail,
                                                        status,
                                                        className = '',
                                                    }) {
    const user = usePage().props.auth.user;

    const props = usePage().props;

    console.log(props);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <div className={`p-6 bg-white dark:bg-black rounded-lg shadow-md ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                   Pterodactyl Information
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Read your Pterodactyl account's information.
                </p>
            </header>
            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="pterodactyl_id" value="Pterodactyl ID" />
                    <TextInput
                        id="pterodactyl_id"
                        className="mt-1 block w-full bg-white text-black dark:bg-black dark:text-white"
                        value={user.pterodactyl_id}
                        readOnly
                    />
                </div>
                <div>
                    <InputLabel htmlFor="pterodactyl_email" value="Pterodactyl Email" />
                    <TextInput
                        id="pterodactyl_email"
                        type="email"
                        className="mt-1 block w-full bg-white text-black dark:bg-black dark:text-white"
                        value={user.pterodactyl_email}
                        readOnly
                    />
                </div>

                
                <div className="flex items-center gap-4">

                    <Badge className={`bg-red-600 text-white dark:bg-green-700`}>
                        These are your Pterodactyl account details.
                    </Badge>
                    
                </div>
                
            </form>
        </div>
    );
}
