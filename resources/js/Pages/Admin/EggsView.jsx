import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FaPencil, FaTrash } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm, usePage} from '@inertiajs/react';
import { CheckCircle2, LucideLoader2 } from "lucide-react";
import CreateNew from '@/components/CreateNew';

const EggsView = () => {
    const [eggs, setEggs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eggToDelete, setEggToDelete] = useState(null);
    const { delete: destroy, processing } = useForm();
    const { flash } = usePage().props;
    const [flashMessage, setFlashMessage] = useState(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        const fetchEggs = async () => {
            try {
                const response = await fetch('/admin/api/eggs');
                const data = await response.json();
                setEggs(data);
            } catch (error) {
                console.error('Error fetching eggs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEggs();
    }, []);

    useEffect(() => {
        if (flash.status) {
            setFlashMessage({ message: flash.message, type: flash.status });
            if (flash.status === 'success') {
                setShowSuccessDialog(true);
            }
        }
    }, [flash]);

    const handleDelete = async () => {
        if (eggToDelete) {
            destroy(`/admin/api/eggs/${eggToDelete.id}`, {
                onSuccess: () => {
                    setEggToDelete(null);
                    setEggs(eggs.filter(egg => egg.id !== eggToDelete.id));
                },
                onError: () => {
                    console.error('Failed to delete egg');
                }
            });
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessDialog(false);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                {[...Array(6)].map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-2" />
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Skeleton className="h-4 w-16" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    if (eggs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CreateNew go="/admin/eggs/new" />
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                {eggs.map((egg) => (
                    <Card key={egg.id} className="cursor-pointer" onClick={() => window.location.href = `/admin/egg/edit/${egg.id}`}>
                        <CardHeader>
                            <CardTitle>{egg.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{egg.description}</p>
                            <div className="flex items-center space-x-2 mt-4">
                                <img src={egg.icon} alt={egg.name} className="w-8 h-8" />
                                <span>{egg.EggID}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button 
                                variant="link" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/admin/egg/edit/${egg.id}`;
                                }}
                            >
                                Edit <FaPencil className="ml-2" aria-hidden="true" />
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEggToDelete(egg);
                                }}
                            >
                                Delete <FaTrash className="ml-2" aria-hidden="true" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <AlertDialog open={!!eggToDelete} onOpenChange={() => setEggToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {eggToDelete?.name}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setEggToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={processing}
                        >
                            {processing ? (
                                <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showSuccessDialog} onOpenChange={handleSuccessClose}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            Success!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {flashMessage?.message || 'Egg deleted successfully!'}
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

export default EggsView;