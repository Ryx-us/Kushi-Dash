import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LucideCheckCircle, LucideX } from 'lucide-react';

export default function Shop() {
    const { auth, shop, flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        resource: '',
        quantity: 1
    });

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

    useEffect(() => {
        if (flash.status) {
            setAlertMessage(flash.status);
            if (flash.status.toLowerCase().includes('error')) {
                setAlertType('error');
            } else if (flash.status.toLowerCase().includes('success')) {
                setAlertType('success');
            }
            setAlertOpen(true);
        }
    }, [flash]);

    const resourceTypes = {
        infrastructure: ['servers'],
        performance: ['cpu', 'memory'],
        storage: ['disk', 'backups'],
        networking: ['allocations'],
        database: ['databases']
    };

    const resourceDisplayNames = {
        cpu: 'CPU',
        memory: 'Memory',
        disk: 'Disk',
        backups: 'Backups',
        servers: 'Servers',
        databases: 'Databases',
        allocations: 'Allocations'
    };

    const isResourceDisabled = (resource) => {
        // Only check if resource is enabled in shop prices
        return !shop.prices[resource]?.enabled;
    };
    
    const getDisabledReason = (resource) => {
        if (!shop.prices[resource]?.enabled) {
            return 'Currently unavailable';
        }
        return '';
    };

    const handleChange = (name, value) => {
        setData(name, value);
    };

    const handleSliderChange = (value) => {
        setData('quantity', value[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/shop/purchase');
    };

    const getPrice = (resource, quantity) => {
        if (!resource || !shop.prices[resource]) return 0;
        return shop.prices[resource].cost * quantity;
    };

    const getAmount = (resource, quantity) => {
        if (!resource || !shop.prices[resource]) return 0;
        return shop.prices[resource].amount * quantity;
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-3">
            <Card className='max-w-full'>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Shop</h2>
                    <p className="text-sm text-muted-foreground">
                        Available Coins: {auth.user.coins}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Servers: {auth.user.servers || 0}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="resource">Resource</Label>
                            <Select
                                value={data.resource}
                                onValueChange={(value) => handleChange('resource', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a resource" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(resourceTypes).map(([type, resources]) => (
                                        <SelectGroup key={type}>
                                            <SelectLabel className="capitalize">{type}</SelectLabel>
                                            {resources.map((resource) => (
                                                <SelectItem
                                                    key={resource}
                                                    value={resource}
                                                    disabled={isResourceDisabled(resource)}
                                                >
                                                    <span className="flex justify-between w-full">
                                                        <span>{resourceDisplayNames[resource]}</span>
                                                        {isResourceDisabled(resource) && (
                                                            <span className="text-xs text-muted-foreground">
                                                                ({getDisabledReason(resource)})
                                                            </span>
                                                        )}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.resource && (
                                <p className="text-sm text-destructive">{errors.resource}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="quantity">Quantity</Label>
                            <div className="space-y-4">
                                <Slider
                                    value={[data.quantity]}
                                    onValueChange={handleSliderChange}
                                    min={1}
                                    max={100}
                                    step={1}
                                    className="my-4"
                                    disabled={!data.resource || isResourceDisabled(data.resource)}
                                />
                                <Input
                                    type="number"
                                    value={data.quantity}
                                    onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                                    min="1"
                                    max={100}
                                    disabled={!data.resource || isResourceDisabled(data.resource)}
                                />
                            </div>
                            {errors.quantity && (
                                <p className="text-sm text-destructive">{errors.quantity}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Total Cost:</span>
                                <span>{getPrice(data.resource, data.quantity)} coins</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Amount:</span>
                                <span>{getAmount(data.resource, data.quantity)} {resourceDisplayNames[data.resource]}</span>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={processing || !data.resource || isResourceDisabled(data.resource)}
                        >
                            {processing ? 'Processing...' : 'Purchase'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {alertType === 'error' ? (
                                <div className="flex items-center">
                                    <LucideX className="h-6 w-6 text-red-500 mr-2" />
                                    Error
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <LucideCheckCircle className="h-6 w-6 text-green-500 mr-2" />
                                    Success
                                </div>
                            )}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setAlertOpen(false)}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}