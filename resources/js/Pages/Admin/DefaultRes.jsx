import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function InitialResources() {
    const { props } = usePage();
    const { resources } = props;

    const { data, setData, post, processing, errors, reset } = useForm({
        INITIAL_CPU: resources.INITIAL_CPU || '',
        INITIAL_MEMORY: resources.INITIAL_MEMORY || '',
        INITIAL_DISK: resources.INITIAL_DISK || '',
        INITIAL_SERVERS: resources.INITIAL_SERVERS || '',
        INITIAL_DATABASES: resources.INITIAL_DATABASES || '',
        INITIAL_BACKUPS: resources.INITIAL_BACKUPS || '',
        INITIAL_ALLOCATIONS: resources.INITIAL_ALLOCATIONS || '',
    });

    const { flash } = usePage().props;
    const [flashMessage, setFlashMessage] = useState(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        if (flash.status) {
            setFlashMessage({ message: flash.res, type: flash.status });
            if (flash.status === 'success') {
                setShowSuccessDialog(true);
            } else {
                const timer = setTimeout(() => setFlashMessage(null), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await post(`/admin/api/ups`);
        } catch (error) {
            console.error('An error occurred while submitting the form.');
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessDialog(false);
        reset();
    };

    const renderInputField = (field, label, value, type = 'text') => (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input
                id={field}
                type={type}
                value={value}
                onChange={(e) => setData(field, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
                className={errors[field] ? 'border-red-500' : ''}
            />
            {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
        </div>
    );

    return (
        <>
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Update Initial Resources</CardTitle>
                    <CardDescription>Update the initial resources for the system</CardDescription>
                </CardHeader>
                <CardContent>
                    {flashMessage && flashMessage.type !== 'success' && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{flashMessage.message}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {renderInputField('INITIAL_CPU', 'CPU', data.INITIAL_CPU, 'number')}
                            {renderInputField('INITIAL_MEMORY', 'Memory', data.INITIAL_MEMORY, 'number')}
                            {renderInputField('INITIAL_DISK', 'Disk', data.INITIAL_DISK, 'number')}
                            {renderInputField('INITIAL_SERVERS', 'Servers', data.INITIAL_SERVERS, 'number')}
                            {renderInputField('INITIAL_DATABASES', 'Databases', data.INITIAL_DATABASES, 'number')}
                            {renderInputField('INITIAL_BACKUPS', 'Backups', data.INITIAL_BACKUPS, 'number')}
                            {renderInputField('INITIAL_ALLOCATIONS', 'Allocations', data.INITIAL_ALLOCATIONS, 'number')}
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Resources'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <AlertDialog open={showSuccessDialog} onOpenChange={handleSuccessClose}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            Success!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {flashMessage?.message || 'Resources have been successfully updated!'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleSuccessClose}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
