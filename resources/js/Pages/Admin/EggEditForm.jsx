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

const EggEditForm = ({ id }) => {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        EggID: '',
        nestId: '',
        imageUrl: '',
        icon: '',
        additional_environmental_variables: [] // Ensure this is always an array
    });

    const { flash } = usePage().props;
    const [flashMessage, setFlashMessage] = useState(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (id && initialLoad) {
            const fetchEgg = async () => {
                try {
                    const response = await fetch(`/api/clientegg/${id}`);
                    const data = await response.json();
                    setData({
                        name: data.name || '',
                        description: data.description || '',
                        EggID: data.EggID || '',
                        nestId: data.nestId || '',
                        imageUrl: data.imageUrl || '',
                        icon: data.icon || '',
                        additional_environmental_variables: data.additional_environmental_variables || []
                    });
                    setInitialLoad(false);
                } catch (error) {
                    console.error('Error fetching egg:', error);
                }
            };

            fetchEgg();
        }
    }, [id, initialLoad, setData]);

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
            await put(`/admin/eggs/update/${id}`);
            reset();
        } catch (error) {
            console.error('An error occurred while submitting the form.');
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessDialog(false);
        reset();
    };

    return (
        <>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Update Egg</CardTitle>
                    <CardDescription>Update the details for this egg configuration</CardDescription>
                </CardHeader>
                <CardContent>
                    {flashMessage && flashMessage.type !== 'success' && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{flashMessage.message}</AlertDescription>
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
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
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
                            {errors.EggID && <p className="text-sm text-red-500">{errors.EggID}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eggId">Pterodactyl Nest ID</Label>
                            <Input
                                id="eggId"
                                type="text"
                                value={data.nestId}
                                onChange={(e) => setData('nestId', e.target.value)}
                                placeholder="Enter egg ID"
                                className={errors.nestId ? 'border-red-500' : ''}
                            />
                            {errors.EggID && <p className="text-sm text-red-500">{errors.EggID}</p>}
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
                            {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl}</p>}
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
                            {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
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
                            {errors.additional_environmental_variables && <p className="text-sm text-red-500">{errors.additional_environmental_variables}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Egg'
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
                        <AlertDialogAction onClick={handleSuccessClose}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default EggEditForm;
