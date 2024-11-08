import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Button } from "@/components/ui/button"

import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function PterodactylAccountContainer({
                                                        mustVerifyEmail,
                                                        status,
                                                        className = '',
                                                    }) {
    const user = usePage().props.auth.user;

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

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <Button disabled={processing} variant="destructive" className="bg-red-900">Read only</Button>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Why click on this?
                        </p>
                    </Transition>
                </div>
            </form>
        </div>
    );
}
