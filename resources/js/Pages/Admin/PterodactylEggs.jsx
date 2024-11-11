import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle2 } from "lucide-react";

const EggForm = ({ egg = {} }) => {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: egg.name || '',
        description: egg.description || '',
        EggID: egg.EggID || '',
        imageUrl: egg.imageUrl || '',
        icon: egg.icon || '',
        additional_environmental_variables: egg.additional_environmental_variables || [] // Ensure this is always an array
    });

    const { flash } = usePage().props;
    const [flashMessage, setFlashMessage] = useState(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        console.log('Flash object:', flash); // Log the flash object to inspect its contents
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

        // Validation checks
        if (!/^\d+$/.test(data.EggID)) {
            alert('Pterodactyl Egg ID must be an integer.');
            return;
        }
        if (data.imageUrl && !/^https:\/\//.test(data.imageUrl)) {
            alert('Image URL must start with https.');
            return;
        }
        if (data.icon && !/^https:\/\//.test(data.icon)) {
            alert('Icon URL must start with https.');
            return;
        }
        if (!Array.isArray(data.additional_environmental_variables)) {
            alert('Additional Environmental Variables must be an array.');
            return;
        }

        try {
            if (egg.id) {
                await put(`/admin/eggs/${egg.id}`); // add the delte thing aND ETC YOU j
            } else {
                await post('/admin/eggs/store');
            }
            reset();
        } catch (error) {
            console.error('An error occurred while submitting the form.');
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessDialog(false);
        if (!egg.id) {
            reset();
        }
    };

    return (
        <>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>{egg.id ? 'Update Egg' : 'Create New Egg'}</CardTitle>
                    <CardDescription>
                        {egg.id
                            ? 'Update the details for this egg configuration'
                            : 'Please note that, the egg must be configured in Pterodactyl panel before creating it here. If the egg has any errors it will result in problems as well!'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {flashMessage && flashMessage.type !== 'success' && (
                        <Alert
                            variant="destructive"
                            className="mb-6"
                        >
                            <AlertDescription>
                                {flashMessage.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter egg name"
                                className={errors.name ? 'border-red-500' : ''}
                            />

                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Enter egg description"
                                className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eggId">Pterodactyl Egg ID</Label>
                            <Input
                                id="eggId"
                                type="text"
                                value={data.EggID}
                                onChange={(e) => setData('EggID', e.target.value)}
                                placeholder="Enter egg ID"
                                className={errors.EggID ? 'border-red-500' : ''}
                            />
                            {errors.EggID && (
                                <p className="text-sm text-red-500">{errors.EggID}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image</Label>
                            <Input
                                id="imageUrl"
                                type="text"
                                value={data.imageUrl}
                                onChange={(e) => setData('imageUrl', e.target.value)}
                                placeholder="Enter image URL"
                                className={errors.imageUrl ? 'border-red-500' : ''}
                            />
                            {errors.imageUrl && (
                                <p className="text-sm text-red-500">{errors.imageUrl}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon</Label>
                            <Input
                                id="icon"
                                type="text"
                                value={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                placeholder="Enter icon URL"
                                className={errors.icon ? 'border-red-500' : ''}
                            />
                            {errors.icon && (
                                <p className="text-sm text-red-500">{errors.icon}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="additional_environmental_variables">Additional Environmental Variables</Label>
                            <Textarea
                                id="additional_environmental_variables"
                                value={(data.additional_environmental_variables || []).join('\n')}
                                onChange={(e) => setData('additional_environmental_variables', e.target.value.split('\n'))}
                                placeholder="Enter additional environmental variables, one per line"
                                className={errors.additional_environmental_variables ? 'border-red-500' : ''}
                            />
                            {errors.additional_environmental_variables && (
                                <p className="text-sm text-red-500">{errors.additional_environmental_variables}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {egg.id ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                egg.id ? 'Update Egg' : 'Create Egg'
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
                            {flashMessage?.message || 'Egg configuration has been successfully saved!'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleSuccessClose}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default EggForm;
