import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function Component({ userId = '1' }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        newName: '',
        newEmail: '',
        newDiscordId: '',
        newRank: 'free',
        newCoins: '',
        newPterodactylId: '',
        newResources: {},
        newLimits: {},
    });

    const { flash } = usePage().props;
    const [flashMessage, setFlashMessage] = useState(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [isUserUpdated, setIsUserUpdated] = useState(false); // New state for tracking user update

    useEffect(() => {
        if (userId && initialLoad) {
            const fetchUser = async () => {
                try {
                    const response = await fetch(`/admin/api/users/${userId}`);
                    const userData = await response.json();
                    setData({
                        newName: userData.name,
                        newPterodactylId: userData.pterodactyl_id,
                        newEmail: userData.email,
                        newDiscordId: userData.discord_id,
                        newRank: userData.rank || 'free',
                        newCoins: userData.coins || 0,
                        newResources: userData.resources || {},
                        newLimits: userData.limits || {},
                    });
                    setInitialLoad(false);
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            };

            fetchUser();
        }
    }, [userId, initialLoad, setData]);

    useEffect(() => {
        if (flash.status) {
            setFlashMessage({ message: flash.res, type: flash.status });
            if (flash.status === 'success') {
                setIsUserUpdated(true);  // Mark the user as updated
            } else {
                const timer = setTimeout(() => setFlashMessage(null), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

    useEffect(() => {
        if (isUserUpdated) {  // Show the success dialog if the user has been updated
            setShowSuccessDialog(true);
        }
    }, [isUserUpdated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await put(`/admin/api/users/${userId}/update`);

        } catch (error) {
            console.error('An error occurred while submitting the form.');
        }
    };

    const handleRankChange = (rank) => {
        setData('newRank', rank);
    };

    const handleSuccessClose = () => {
        setShowSuccessDialog(false);
        reset();
        setIsUserUpdated(false); // Reset the user update state
    };

    const renderInputField = (field, label, value, type = 'text') => (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input
                id={field}
                type={type}
                value={value}
                onChange={(e) => setData(field, e.target.value)}
                placeholder={`Enter user's ${label.toLowerCase()}`}
                className={errors[field] ? 'border-red-500' : ''}
            />
            {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
        </div>
    );

    const renderNestedFields = (prefix, fields, label) => (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="grid grid-cols-2 gap-4">
                {Object.keys(fields).map((key) => (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={`${prefix}_${key}`}>{`${key.charAt(0).toUpperCase() + key.slice(1)}`}</Label>
                        <Input
                            id={`${prefix}_${key}`}
                            type="number"
                            value={fields[key]}
                            onChange={(e) => setData(prefix, { ...fields, [key]: e.target.value })}
                            placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} Limit`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Update User</CardTitle>
                    <CardDescription>Update the details for this user</CardDescription>
                </CardHeader>
                <CardContent>
                    {flashMessage && flashMessage.type !== 'success' && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{flashMessage.message}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {renderInputField('newName', 'Name', data.newName)}
                            {renderInputField('newEmail', 'Email', data.newEmail, 'email')}
                            {renderInputField('newPterodactylId', 'Pterodactyl Id', data.newPterodactylId, 'number')}
                            {renderInputField('newDiscordId', 'Discord ID', data.newDiscordId)}
                            {renderInputField('newCoins', 'Coins', data.newCoins, 'number')}
                        </div>

                        <div className="space-y-2">
                            <Label>Rank</Label>
                            <div className="flex gap-2">
                                {['free', 'premium', 'admin'].map((rank) => (
                                    <Button
                                        key={rank}
                                        type="button"
                                        variant={data.newRank === rank ? 'default' : 'outline'}
                                        onClick={() => handleRankChange(rank)}
                                    >
                                        {rank.charAt(0).toUpperCase() + rank.slice(1)}
                                    </Button>
                                ))}
                            </div>
                            {errors.newRank && <p className="text-xs text-red-500">{errors.newRank}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {renderNestedFields('newResources', data.newResources, 'Resources')}
                            {renderNestedFields('newLimits', data.newLimits, 'Limits')}
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update User'
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
                            {flashMessage?.message || 'User details have been successfully updated!'}
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
