import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Egg, Link, LucideEgg, LucidePencil } from 'lucide-react';
import {FaPencil} from "react-icons/fa6";

const EggsView = () => {
    const [eggs, setEggs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEggs = async () => {
            try {
                const response = await fetch('/admin/api/eggs');
                const data = await response.json();
                setEggs(data);
            } catch (error) {
                console.error('Error fetching eggs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEggs();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                {[...Array(6)].map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-2" />


                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Skeleton className="h-4 w-16" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
            {eggs.map((egg) => (
                <Card key={egg.id} className="cursor-pointer" onClick={() => window.location.href = `/admin/egg/edit/${egg.id}`}>
                    <CardHeader>
                        <CardTitle>{egg.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{egg.description}</p>
                        <div className="flex items-center space-x-2 mt-4">
                            <img src={egg.icon} alt={egg.name} className="w-8 h-8" />
                            <span>{egg.EggID}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Link href={`/admin/egg/edit/${egg.id}`} className="text-white hover:text-gray-400">
                            Edit <FaPencil className="ml-2" aria-hidden="true" />
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default EggsView;
