import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function FlashbackTester({ className = '' }) {
    const user = usePage().props.auth.user;
    const [flashMessage, setFlashMessage] = useState(null);

    const { get, processing } = useForm();

    const fetchServers = (e) => {
        e.preventDefault();

        get(`/admin/api/users`, {
            onSuccess: (page) => {
                if (page.props.flash) {
                    console.log('Response from server fetch:', page.props.flash); // interia flash back is now here
                    setFlashMessage(page.props.flash);
                } else {
                    console.error('No servers found in the response');
                }
            },
            onError: (error) => {
                console.error('Failed to send request:', error);
            },
        });
    };

    return (
        <div className={`p-6 bg-white dark:bg-black rounded-lg shadow-md ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Fetch Servers
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Click the button below to fetch servers.
                </p>
            </header>

            <button onClick={fetchServers} className="mt-6 bg-blue-500 text-white p-2 rounded" disabled={processing}>
                Fetch Servers
            </button>

            {flashMessage && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
                    <p>{flashMessage}</p>
                </div>
            )}
        </div>
    );
}
