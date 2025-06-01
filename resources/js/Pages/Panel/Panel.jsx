// resources/js/Pages/Panel/Panel.jsx

import React, { Suspense, lazy } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Lazy load components
const AuthenticatedLayout = lazy(() => import('@/Layouts/AuthenticatedLayout'));
const PterodactylContainer = lazy(() => import("@/Pages/Panel/Components/PterodactylContainer.jsx"));
const PasswordResetFormPterodactyl = lazy(() => import("@/Pages/Panel/Components/PasswordReset.jsx"));

// Loading fallbacks
const LayoutFallback = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 animate-pulse"></div>
);

const ComponentFallback = () => (
  <div className="p-6 mb-4 bg-gray-200 dark:bg-gray-800 rounded-lg h-32 animate-pulse"></div>
);

export default function Panel() {
    const props = usePage().props;
    
    return (
        <Suspense fallback={<LayoutFallback />}>
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
                        <Suspense fallback={<ComponentFallback />}>
                            <PterodactylContainer className="max-w-xl"/>
                        </Suspense>
                        
                        <Suspense fallback={<ComponentFallback />}>
                            <PasswordResetFormPterodactyl className="max-w-xl"/>
                        </Suspense>
                        
                        <Card className="max-w-xl">
                            <CardHeader> Pterodactyl Panel </CardHeader>
                            <CardContent>
                                <Button 
                                    onClick={() => window.location.href = props.pterodactyl_URL} 
                                    variant="primary" 
                                    className="bg-green-900"
                                >
                                    Open Panel 
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AuthenticatedLayout>
        </Suspense>
    );
}