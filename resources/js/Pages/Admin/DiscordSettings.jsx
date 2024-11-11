// resources/js/Pages/UpdateDiscordSettings.jsx
import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function UpdateDiscordSettings() {
    const { props } = usePage();
    const { discordSettings = {} } = props;

    const { data, setData, post, processing, errors, reset } = useForm({
        DISCORD_CLIENT_ID: discordSettings.DISCORD_CLIENT_ID || '',
        DISCORD_CLIENT_SECRET: discordSettings.DISCORD_CLIENT_SECRET || '',
        DISCORD_REDIRECT_URI: discordSettings.DISCORD_REDIRECT_URI || '',
        DISCORD_SERVER_ID: discordSettings.DISCORD_SERVER_ID || '',
        DISCORD_BOT_TOKEN: discordSettings.DISCORD_BOT_TOKEN || '',
    });

    const { flash } = usePage().props;
    const [flashMessage, setFlashMessage] = useState(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        if (flash.status) {
            setFlashMessage({ message: flash.message, type: flash.status });
            if (flash.status === 'success discord') {
                setShowSuccessDialog(true);
            }
        }
    }, [flash]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        post('/admin/api/update-discord-settings');
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
                placeholder={`Enter ${label}`}
                className={errors[field] ? 'border-red-500' : ''}
            />
            {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
        </div>
    );

    return (
        <>
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Update Discord Settings</CardTitle>
                    <CardDescription>Configure your Discord integration settings</CardDescription>
                </CardHeader>
                <CardContent>
                    {flashMessage && flashMessage.type !== 'success' && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{flashMessage.message}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {renderInputField('DISCORD_CLIENT_ID', 'Client ID', data.DISCORD_CLIENT_ID)}
                            {renderInputField('DISCORD_CLIENT_SECRET', 'Client Secret', data.DISCORD_CLIENT_SECRET)}
                            {renderInputField('DISCORD_REDIRECT_URI', 'Redirect URI', data.DISCORD_REDIRECT_URI, 'url')}
                            {renderInputField('DISCORD_SERVER_ID', 'Server ID', data.DISCORD_SERVER_ID)}
                            {renderInputField('DISCORD_BOT_TOKEN', 'Bot Token', data.DISCORD_BOT_TOKEN)}
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
                            {flashMessage?.message || 'Discord settings have been successfully updated!'}
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