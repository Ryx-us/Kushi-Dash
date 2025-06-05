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

        </div>
    );
}
