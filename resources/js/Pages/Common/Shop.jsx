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
import { CoinsIcon, Database, HardDrive, LucideArchive, LucideCheckCircle, LucideCoins, LucideCpu, LucideMemoryStick, LucideNetwork, LucideServer, LucideX } from 'lucide-react';

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
        infrastructure: [{ name: 'servers', icon: LucideServer }],
        performance: [
            { name: 'cpu', icon: LucideCpu },
            { name: 'memory', icon: LucideMemoryStick }
        ],
        storage: [
            { name: 'disk', icon: HardDrive },
            { name: 'backups', icon: LucideArchive}
        ],
        networking: [{ name: 'allocations', icon: LucideNetwork }],
        database: [{ name: 'databases', icon: Database }]
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 mt-3">
            <Card className='max-w-full'>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Shop</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <CoinsIcon className="h-4 w-4" />
                        Available Coins: {auth.user.coins}
                    </p>
                    <p className="text-sm text-red-500 font-bold">
                        You cannot refund any purchases made in the shop.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Resource</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(resourceTypes).map(([type, resources]) => (
                                    <React.Fragment key={type}>
                                        {resources.map((resource) => (
                                            <div
                                                key={resource.name}
                                                className={`
                                                    p-3 border rounded-lg cursor-pointer transition-all
                                                    ${data.resource === resource.name ? 'border-primary bg-primary/10' : 'border-border'}
                                                    ${isResourceDisabled(resource.name) ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
                                                `}
                                                onClick={() => !isResourceDisabled(resource.name) && handleChange('resource', resource.name)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <resource.icon className="h-5 w-5" />
                                                    <span>{resourceDisplayNames[resource.name]}</span>
                                                </div>
                                                {isResourceDisabled(resource.name) && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {getDisabledReason(resource.name)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                            {errors.resource && (
                                <p className="text-sm text-destructive">{errors.resource}</p>
                            )}
                        </div>

                        {/* Keep existing quantity slider and input */}
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
                            <div className="flex justify-between text-sm items-center">
                                <span>Total Cost:</span>
                                <span className="flex items-center gap-1">
                                    <LucideCoins className="h-4 w-4" />
                                    {getPrice(data.resource, data.quantity)} coins
                                </span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
    <span>Amount:</span>
    <span className="flex items-center gap-1">
        {data.resource && (() => {
            const resourceType = Object.keys(resourceTypes).find(type => 
                resourceTypes[type].some(r => r.name === data.resource)
            );
            const ResourceIcon = resourceTypes[resourceType]?.find(r => 
                r.name === data.resource
            )?.icon;
            return ResourceIcon && <ResourceIcon className="h-4 w-4" />;
        })()}
        {getAmount(data.resource, data.quantity)} {resourceDisplayNames[data.resource]}
    </span>
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