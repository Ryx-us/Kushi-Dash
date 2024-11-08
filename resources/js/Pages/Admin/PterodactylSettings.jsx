// kushi-dash/resources/js/Pages/UpdatePterodactylSettings.jsx
import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function UpdatePterodactylSettings() {
    const { props } = usePage();
    const { pterodactylSettings = {} } = props; // Default to an empty object if secerts is undefined
    console.log( pterodactylSettings.PTERODACTYL_API_KEY)
    const { data, setData, post, processing, errors, reset } = useForm({
        PTERODACTYL_API_URL: pterodactylSettings.PTERODACTYL_API_URL || '',
        PTERODACTYL_API_KEY: pterodactylSettings.PTERODACTYL_API_KEY || '',
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
            await post(`/admin/api/update-pterodactyl-settings`);
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
                    <CardTitle>Update Pterodactyl Settings</CardTitle>
                    <CardDescription>Update the Pterodactyl API settings</CardDescription>
                </CardHeader>
                <CardContent>
                    {flashMessage && flashMessage.type !== 'success' && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{flashMessage.message}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {renderInputField('PTERODACTYL_API_URL', 'API URL', data.PTERODACTYL_API_URL, 'url')}
                            {renderInputField('PTERODACTYL_API_KEY', 'API Key', data.PTERODACTYL_API_KEY, 'text')}
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Settings'
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
                            {flashMessage?.message || 'Settings have been successfully updated!'}
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
