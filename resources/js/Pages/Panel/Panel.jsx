// resources/js/Pages/Panel/Panel.jsx

import React, { Suspense, lazy } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PterodactylAccountContainer from '../Profile/Partials/PterodactylAccountContainer';

// Lazy load components
const AuthenticatedLayout = lazy(() => import('@/Layouts/AuthenticatedLayout'));
//const PterodactylContainer = lazy(() => import("@/Pages/Panel/Components/PterodactylContainer.jsx"));
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
                        Home / Panel
                    </h2>
                }
                sidebartab="panel"
            >
                <Head title="Panel"/>

                <div className="py-1">
                    <div className="relative h-[100px] w-full mb-6 outline-gray-400 outline rounded-lg ">
                        <img
                            src="https://i.pinimg.com/originals/1b/1b/b5/1b1bb5e2107b007bf4eb7b9eefb072ed.jpg"
                            alt="Server Deployments"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center p-5">
                            <h1 className="text-4xl font-bold text-gray-200">
                                Pterodactyl Panel Settings 
                            </h1>
                        </div>
                    </div>

                    
                       
                        <div className='space-y-4'>
                            <PterodactylAccountContainer className="max-w-xl py-4 "/>
                            
                            
                            
                                <PasswordResetFormPterodactyl className="max-w-xl py-4 mt-5"/>
                            
                            
                            <Card className="max-w-xl py-4">
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