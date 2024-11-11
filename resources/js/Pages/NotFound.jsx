import React from 'react';
import { Link } from '@inertiajs/react';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-gray-800">404</h1>
            <p className="text-2xl text-gray-600 mt-4">Oops! Page not found.</p>
            <p className="text-gray-500 mt-2">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
            <Link href="/" className="mt-6 inline-block bg-blue-500 text-white px-4 py-2 rounded">
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFound;