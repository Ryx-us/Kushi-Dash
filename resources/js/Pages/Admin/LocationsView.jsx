import { useState, useEffect } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FaPencil, FaTrash } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LucideLoader2, CheckCircle2, MapPin } from "lucide-react";
import EmptyState from '../Common/NotFound';
import CreateNew from '@/components/CreateNew';

const LocationsView = () => {
    const { flash, locations: initialLocations } = usePage().props;
    const [locations, setLocations] = useState(initialLocations || []);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const { delete: destroy, processing } = useForm();
    const [showSuccess, setShowSuccess] = useState(false);
    const [flashMessage, setFlashMessage] = useState(null);

    useEffect(() => {
        // Check for status message from backend
        if (flash?.status) {
            setFlashMessage(flash.status);
            setShowSuccess(true);
        }
    }, [flash]);

    const handleDelete = () => {
        if (locationToDelete) {
            destroy(route('locations.destroy', locationToDelete.id), {
                onSuccess: () => {
                    setLocationToDelete(null);
                    // Remove deleted location from state
                    setLocations(prevLocations => 
                        prevLocations.filter(loc => loc.id !== locationToDelete.id)
                    );
                },
            });
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
        setFlashMessage(null);
    };

    if (!locations || locations.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CreateNew go="/admin/locations/new" />
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {locations.map((location) => (
                    <motion.div
                        key={location.id}
                        whileHover={{ scale: 1.02 }}
                        className="h-full"
                    >
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5" />
                                    <span className="truncate">{location.name}</span>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-grow">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">Details:</h3>
                                        <ul className="space-y-2">
                                            <li className="flex justify-between text-sm">
                                                <span>Location:</span>
                                                <span className="font-medium">{location.location}</span>
                                            </li>
                                            <li className="flex justify-between text-sm">
                                                <span>Servers:</span>
                                                <span className="font-medium">{location.servers}/{location.maxservers}</span>
                                            </li>
                                            <li className="flex justify-between text-sm">
                                                <span>Required Rank:</span>
                                                <span className="font-medium">{location.requiredRank}</span>
                                            </li>
                                            <li className="flex items-center justify-between text-sm">
                                                <span>Flag:</span>
                                                <img 
                                                    src={location.flag} 
                                                    alt={`${location.name} flag`}
                                                    className="h-6 w-auto"
                                                />
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between mt-auto">
                                <Button 
                                    variant="link"
                                    onClick={() => window.location.href = `/admin/locations/edit/${location.id}`}
                                >
                                    Edit <FaPencil className="ml-2" />
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={() => setLocationToDelete(location)}
                                >
                                    Delete <FaTrash className="ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <AlertDialog open={!!locationToDelete} onOpenChange={() => setLocationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete{' '}
                            <span className="font-semibold">{locationToDelete?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setLocationToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showSuccess} onOpenChange={handleCloseSuccess}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            Success!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {flashMessage || 'Operation completed successfully!'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleCloseSuccess}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default LocationsView;