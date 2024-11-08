// Powered by Kushi Engine

import { usePage } from '@inertiajs/react';

export default function ApplicationLogo(props) {
    const { props: { companyLogo, companyName } } = usePage();

    return (
        <div className="flex items-center">
            <img
                {...props}
                src={companyLogo}
                alt="Company Logo"
                className="h-9 w-auto"
            />
            <span className="ml-2 text-gray-800 dark:text-gray-200">{companyName}</span>
        </div>
    );
}
