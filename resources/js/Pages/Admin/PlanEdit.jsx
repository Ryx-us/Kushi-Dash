import React, { useEffect, useState } from 'react'; 
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle2, Info, ArrowLeft } from "lucide-react";
import { Link } from '@inertiajs/react';

const PlanEditForm = () => {
    const { plan } = usePage().props;
    
    const { data, setData, put, processing, errors, reset } = useForm({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || 0,
        icon: plan.icon || '',
        image: plan.image || '',
        resources: plan.resources || {
            cpu: 0,
            memory: 0,
            disk: 0,
            databases: 0,
            allocations: 0,
            backups: 0,
            servers: 0
        },
        discount: plan.discount || 0,
        visibility: plan.visibility !== undefined ? plan.visibility : true,
        redirect: plan.redirect || '',
        planType: plan.planType || 'monthly',
        maxUsers: plan.maxUsers || 1,
        stock: plan.stock || 0,
        duration: plan.duration || null
    });

    const { flash } = usePage().props;
    const [flashMessage, setFlashMessage] = useState(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        if (flash.success) {
            setFlashMessage({ message: flash.success, type: 'success' });
            setShowSuccessDialog(true);
        } else if (flash.error) {
            setFlashMessage({ message: flash.error, type: 'error' });
            const timer = setTimeout(() => setFlashMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Auto-set duration based on plan type
    useEffect(() => {
        let newDuration = null;
        switch (data.planType) {
            case 'monthly':
                newDuration = 30;
                break;
            case 'annual':
                newDuration = 365;
                break;
            case 'onetime':
                newDuration = null;
                break;
        }
        if (newDuration !== data.duration) {
            setData('duration', newDuration);
        }
    }, [data.planType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await put(`/admin/plans/${plan.id}`);
            // Success will be handled by flash message
        } catch (error) {
            console.error('An error occurred while updating the plan:', error);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessDialog(false);
        setFlashMessage(null);
        // Redirect to plans index
        window.location.href = '/admin/plans';
    };

    const updateResource = (resource, value) => {
        setData('resources', {
            ...data.resources,
            [resource]: parseInt(value) || 0
        });
    };

    return (
        <>
            <div className="mb-6">
                
            </div>

            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Edit Plan: {plan.name}</CardTitle>
                    <CardDescription>
                        Update plan details, billing cycle, resources, and visibility settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {flashMessage && flashMessage.type === 'error' && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>
                                {flashMessage.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Plan Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Pro Plan, Starter, Enterprise"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price (USD) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className={errors.price ? 'border-red-500' : ''}
                                />
                                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe what this plan includes..."
                                className={errors.description ? 'border-red-500' : ''}
                                rows={3}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        {/* Plan Type and Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="planType">Plan Type *</Label>
                                <Select value={data.planType} onValueChange={(value) => setData('planType', value)}>
                                    <SelectTrigger className={errors.planType ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select plan type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly Subscription</SelectItem>
                                        <SelectItem value="annual">Annual Subscription</SelectItem>
                                        <SelectItem value="onetime">One-time Purchase</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.planType && <p className="text-sm text-red-500">{errors.planType}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (Days)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={data.duration || ''}
                                    onChange={(e) => setData('duration', parseInt(e.target.value) || null)}
                                    placeholder="Auto-set based on type"
                                    disabled={data.planType !== 'onetime'}
                                />
                                <p className="text-xs text-gray-500">
                                    {data.planType === 'monthly' && 'Auto-set to 30 days'}
                                    {data.planType === 'annual' && 'Auto-set to 365 days'}
                                    {data.planType === 'onetime' && 'Leave empty for permanent'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxUsers">Max Users</Label>
                                <Input
                                    id="maxUsers"
                                    type="number"
                                    min="1"
                                    value={data.maxUsers}
                                    onChange={(e) => setData('maxUsers', parseInt(e.target.value) || 1)}
                                    placeholder="1"
                                />
                            </div>
                        </div>

                        {/* Resources Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Label className="text-lg font-semibold">Resources</Label>
                                <Info className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cpu">CPU (%)</Label>
                                    <Input
                                        id="cpu"
                                        type="number"
                                        min="0"
                                        value={data.resources.cpu}
                                        onChange={(e) => updateResource('cpu', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="memory">Memory (MB)</Label>
                                    <Input
                                        id="memory"
                                        type="number"
                                        min="0"
                                        value={data.resources.memory}
                                        onChange={(e) => updateResource('memory', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="disk">Disk (MB)</Label>
                                    <Input
                                        id="disk"
                                        type="number"
                                        min="0"
                                        value={data.resources.disk}
                                        onChange={(e) => updateResource('disk', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="databases">Databases</Label>
                                    <Input
                                        id="databases"
                                        type="number"
                                        min="0"
                                        value={data.resources.databases}
                                        onChange={(e) => updateResource('databases', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="allocations">Allocations</Label>
                                    <Input
                                        id="allocations"
                                        type="number"
                                        min="0"
                                        value={data.resources.allocations}
                                        onChange={(e) => updateResource('allocations', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="backups">Backups</Label>
                                    <Input
                                        id="backups"
                                        type="number"
                                        min="0"
                                        value={data.resources.backups}
                                        onChange={(e) => updateResource('backups', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="servers">Server Slots</Label>
                                    <Input
                                        id="servers"
                                        type="number"
                                        min="0"
                                        value={data.resources.servers}
                                        onChange={(e) => updateResource('servers', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="discount">Discount (%)</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock (0 = unlimited)</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon URL</Label>
                                <Input
                                    id="icon"
                                    type="url"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    placeholder="https://example.com/icon.png"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Image URL</Label>
                                <Input
                                    id="image"
                                    type="url"
                                    value={data.image}
                                    onChange={(e) => setData('image', e.target.value)}
                                    placeholder="https://example.com/image.png"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="redirect">External Redirect URL</Label>
                            <Input
                                id="redirect"
                                type="url"
                                value={data.redirect}
                                onChange={(e) => setData('redirect', e.target.value)}
                                placeholder="https://external-payment-processor.com/checkout"
                            />
                            <p className="text-xs text-gray-500">
                                If provided, users will be redirected to this URL instead of processing internally
                            </p>
                        </div>

                        {/* Visibility Toggle */}
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label htmlFor="visibility" className="text-base">Plan Visibility</Label>
                                <p className="text-sm text-gray-500">
                                    When enabled, this plan will be visible to users
                                </p>
                            </div>
                            <Switch
                                id="visibility"
                                checked={data.visibility}
                                onCheckedChange={(checked) => setData('visibility', checked)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" className="flex-1" size="lg" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating Plan...
                                    </>
                                ) : (
                                    'Update Plan'
                                )}
                            </Button>
                            
                            <Link 
                                href="/admin/plans" 
                                className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <AlertDialog open={showSuccessDialog} onOpenChange={handleSuccessClose}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            Plan Updated Successfully!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {flashMessage?.message || 'Your plan has been updated successfully.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleSuccessClose}>
                            Back to Plans
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default PlanEditForm;