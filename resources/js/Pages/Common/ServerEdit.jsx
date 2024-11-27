import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LucideCheckCircle, LucideX } from 'lucide-react';

const ServerEdit = () => {
    const { server, auth } = usePage().props;
    const { status } = usePage().props.flash;
    const [validationError, setValidationError] = useState(null);
    
    const [formData, setFormData] = useState({
        memory: server.limits.memory,
        cpu: server.limits.cpu,
        disk: server.limits.disk,
        databases: server.feature_limits.databases,
        allocations: server.feature_limits.allocations,
        backups: server.feature_limits.backups,
    });

    console.log(auth.user.limits)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateLimits = () => {
        if (Number(formData.memory) > auth.user.limits.memory) {
            setValidationError("You don't have enough Memory resources");
            return false;
        }
        if (Number(formData.cpu) > auth.user.limits.cpu) {
            setValidationError("You don't have enough CPU resources");
            return false;
        }
        if (Number(formData.disk) > auth.user.limits.disk) {
            setValidationError("You don't have enough Disk resources");
            return false;
        }
        if (Number(formData.databases) > auth.user.limits.databases) {
            setValidationError("You don't have enough Database allocations");
            return false;
        }
        if (Number(formData.allocations) > auth.user.limits.allocations) {
            setValidationError("You don't have enough Port allocations");
            return false;
        }
        if (Number(formData.backups) > auth.user.limits.backups) {
            setValidationError("You don't have enough Backup slots");
            return false;
        }
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateLimits()) {
            router.post(`/server/${server.id}/update`, formData);
        }
    };

    return (
        <Card className="ml-0 mr-auto w-full md:w-[600px]">
            <CardHeader>
                <CardTitle>Edit Server Resources</CardTitle>
            </CardHeader>
            <CardContent>
                {(status || validationError) && (
                    <AlertDialog open={true}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {validationError ? (
                                        <div className="flex items-center">
                                            <LucideX className="h-6 w-6 text-red-500 mr-2" />
                                            Error
                                        </div>
                                    ) : status.startsWith('Success') ? (
                                        <div className="flex items-center">
                                            <LucideCheckCircle className="h-6 w-6 text-green-500 mr-2" />
                                            Success
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <LucideX className="h-6 w-6 text-red-500 mr-2" />
                                            Error
                                        </div>
                                    )}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {validationError || status}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => {
                                    setValidationError(null);
                                    if (status) router.reload();
                                }}>
                                    OK
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="memory">Memory (MB)</Label>
                            <Input
                                id="memory"
                                type="number"
                                name="memory"
                                value={formData.memory}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cpu">CPU (%)</Label>
                            <Input
                                id="cpu"
                                type="number"
                                name="cpu"
                                value={formData.cpu}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="disk">Disk (MB)</Label>
                            <Input
                                id="disk"
                                type="number"
                                name="disk"
                                value={formData.disk}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="databases">Databases</Label>
                            <Input
                                id="databases"
                                type="number"
                                name="databases"
                                value={formData.databases}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allocations">Allocations</Label>
                            <Input
                                id="allocations"
                                type="number"
                                name="allocations"
                                value={formData.allocations}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="backups">Backups</Label>
                            <Input
                                id="backups"
                                type="number"
                                name="backups"
                                value={formData.backups}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Update Server
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default ServerEdit;