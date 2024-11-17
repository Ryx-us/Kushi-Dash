import React from 'react';
import { usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import {LucideMemoryStick, LucideHardDrive, LucideCpu, LucideServer } from 'lucide-react';

const ResourceView = () => {
    const { auth } = usePage().props;
    const { limits, resources } = auth.user;

    const resourceTypes = [
        { key: 'cpu', label: 'CPU', unit: '%', icon: LucideCpu },
        { key: 'memory', label: 'Memory', unit: 'MB', icon: LucideMemoryStick },
        { key: 'disk', label: 'Disk', unit: 'MB', icon: LucideHardDrive },
        { key: 'servers', label: 'Servers', unit: '', icon: LucideServer }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {resourceTypes.map((type) => {
                const Icon = type.icon;
                return (
                    <Card key={type.key} className="w-full">
                        <CardHeader className="p-3">
                            <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4" />
                                <CardTitle className="text-sm">{type.label}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{resources[type.key]}/{limits[type.key]} {type.unit}</span>
                                    <span>{((resources[type.key] / limits[type.key]) * 100).toFixed(0)}%</span>
                                </div>
                                <Progress 
                                    value={(resources[type.key] / limits[type.key]) * 100}
                                    className="h-1.5"
                                />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default ResourceView;