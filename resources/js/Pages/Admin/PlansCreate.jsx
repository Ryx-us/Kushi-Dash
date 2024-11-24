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

const PlanForm = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price: '',
        icon: '',
        image: '',
        Newresources: {
            cpu: 0,
            memory: 0,
            disk: 0,
            databases: 0,
            allocations: 0,
            backups: 0,
            servers: 0
        },
        discount: '',
        visibility: false,
        redirect: '',
        perCustomer: '',
        planType: 'monthly',
        perPerson: 1,
        stock: 0,
        kushiConfig: ''
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
        
        const requiredData = {
            ...data,
            additional_fields: null // Set other values as null as required
        };
        
        try {
            await post('/admin/plans/store', requiredData);
            //console.log ('Data:', requiredData);
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
                    <CardTitle>Create New Plan</CardTitle>
                    <CardDescription>
                        Define a new plan with available billing cycles, visibility, and customer limits.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {flashMessage && flashMessage.type !== 'success' && (
                        <Alert variant="destructive" className="mb-6">
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
                                placeholder="Enter plan name"
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
                                placeholder="Enter plan description"
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price (USD)</Label>
                            <Input
                                id="price"
                                type="text"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                placeholder="Enter price"
                                className={errors.price ? 'border-red-500' : ''}
                            />
                            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
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
                            <Label htmlFor="image">Image</Label>
                            <Input
                                id="image"
                                type="text"
                                value={data.image}
                                onChange={(e) => setData('image', e.target.value)}
                                placeholder="Enter image URL"
                                className={errors.image ? 'border-red-500' : ''}
                            />
                            {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resources">Resources</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cpu">CPU</Label>
                                    <Input
                                        id="cpu"
                                        type="number"
                                        value={data.Newresources.cpu}
                                        onChange={(e) => setData('Newresources', { ...data.Newresources, cpu: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="memory">Memory</Label>
                                    <Input
                                        id="memory"
                                        type="number"
                                        value={data.Newresources.memory}
                                        onChange={(e) => setData('Newresources', { ...data.Newresources, memory: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="disk">Disk</Label>
                                    <Input
                                        id="disk"
                                        type="number"
                                        value={data.Newresources.disk}
                                        onChange={(e) => setData('Newresources', { ...data.Newresources, disk: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="databases">Databases</Label>
                                    <Input
                                        id="databases"
                                        type="number"
                                        value={data.Newresources.databases}
                                        onChange={(e) => setData('Newresources', { ...data.Newresources, databases: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="allocations">Allocations</Label>
                                    <Input
                                        id="allocations"
                                        type="number"
                                        value={data.Newresources.allocations}
                                        onChange={(e) => setData('Newresources', { ...data.Newresources, allocations: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="backups">Backups</Label>
                                    <Input
                                        id="backups"
                                        type="number"
                                        value={data.Newresources.backups}
                                        onChange={(e) => setData('Newresources', { ...data.Newresources, backups: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="servers">Servers</Label>
                                    <Input
                                        id="servers"
                                        type="number"
                                        value={data.Newresources.servers}
                                        onChange={(e) => setData('Newresources', { ...data.Newresources, servers: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discount">Discount</Label>
                            <Input
                                id="discount"
                                type="text"
                                value={data.discount}
                                onChange={(e) => setData('discount', e.target.value)}
                                placeholder="Enter discount"
                                className={errors.discount ? 'border-red-500' : ''}
                            />
                            {errors.discount && <p className="text-sm text-red-500">{errors.discount}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="visibility">Visibility</Label>
                            <input
                                type="checkbox"
                                id="visibility"
                                checked={data.visibility}
                                onChange={(e) => setData('visibility', e.target.checked)}
                                className='k ml-2 rounded-full mb-10'
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="redirect">Redirect</Label>
                            <Input
                                id="redirect"
                                type="text"
                                value={data.redirect}
                                onChange={(e) => setData('redirect', e.target.value)}
                                placeholder="Enter redirect URL"
                                className={errors.redirect ? 'border-red-500' : ''}
                            />
                            {errors.redirect && <p className="text-sm text-red-500">{errors.redirect}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="perCustomer">Per Customer</Label>
                            <Input
                                id="perCustomer"
                                type="text"
                                value={data.perCustomer}
                                onChange={(e) => setData('perCustomer', e.target.value)}
                                placeholder="Enter per customer details"
                                className={errors.perCustomer ? 'border-red-500' : ''}
                            />
                            {errors.perCustomer && <p className="text-sm text-red-500">{errors.perCustomer}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="planType">Plan Type</Label>
                            <select
                                id="planType"
                                value={data.planType}
                                onChange={(e) => setData('planType', e.target.value)}
                                className='text-black ml-2 rounded-full'
                            >
                                <option value="monthly" className="text-black dark:text-black">Monthly</option>
                                <option value="lifetime">Lifetime</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="perPerson">Per Person</Label>
                            <Input
                                id="perPerson"
                                type="number"
                                value={data.perPerson}
                                onChange={(e) => setData('perPerson', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={data.stock}
                                onChange={(e) => setData('stock', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kushiConfig">Kushi Config</Label>
                            <Textarea
                                id="kushiConfig"
                                value={data.kushiConfig}
                                onChange={(e) => setData('kushiConfig', e.target.value)}
                                placeholder="Enter kushi config"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Plan'
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
                            {flashMessage?.message || 'Plan configuration has been successfully saved!'}
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

export default PlanForm;