import React, { useEffect, useState } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import axios from 'axios'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
    Pencil, 
    ExternalLink, 
    Trash2, 
    Server, 
    Cpu, 
    HardDrive, 
    Network, 
    Database, 
    Save,
    RefreshCw,
    MapPin,
    MemoryStickIcon
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DisplayServer({ className = '' }) {
    const user = usePage().props.auth.user
    const [servers, setServers] = useState([])
    const [eggData, setEggData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [serverToDelete, setServerToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const { post, delete: deleteServer } = useForm()

    const { status } = usePage().props
    const [showSuccess, setShowSuccess] = useState(!!status)
    const { pterodactyl_URL } = usePage().props;

    useEffect(() => {
        fetchServers();
    }, []);

    const handleDelete = (serverId) => {
        setIsDeleting(true)
        deleteServer(`/pterodactyl/servers/${serverId}/delete`, {
            onSuccess: () => {
                setIsDeleting(false)
                setServerToDelete(null)
                fetchServers()
            },
            onError: () => {
                setIsDeleting(false)
                setServerToDelete(null)
            }
        })
    }

    const handleEdit = (serverId) => {
        const editUrl = `/dashboard/servers/edit/${serverId}`;
        window.location.href = editUrl;
    };


    const fetchEggData = async (eggId) => {
        try {
            const response = await fetch(`/client/api/pterodactyl/egg/${eggId}`)
            const data = await response.json()
            setEggData(prev => ({ ...prev, [eggId]: data }))
        } catch (error) {
            console.error('Error fetching egg data:', error)
        }
    }

    const fetchServers = () => {
        setIsLoading(true);
        setIsRefreshing(true);

        axios.get(`/pterodactyl/servers/${user.pterodactyl_id}`, {
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            const data = response.data;
            let serverData = [];
            
            if (data.props && data.props.flash && data.props.flash.res) {
                serverData = data.props.flash.res;
            } else if (data.servers) {
                serverData = data;
            }
            
            setServers(serverData.servers);
            
            if (Array.isArray(serverData)) {
                serverData.forEach(server => {
                    if (server.attributes && server.attributes.egg) {
                        fetchEggData(server.attributes.egg);
                    }
                });
            }
        })
        .catch(error => {
            console.error("Error fetching servers:", error);
        })
        .finally(() => {
            setIsLoading(false);
            setIsRefreshing(false);
        });
    };

    const handleExternalLinkClick = (serverId) => {
        if (!pterodactyl_URL) {
            console.error('Pterodactyl URL is not defined.');
            return;
        }

        const serverUrl = `${pterodactyl_URL}/server/${serverId}`;
        window.open(serverUrl, '_blank');
    };

    if (isLoading && !isRefreshing) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
                {[...Array(6)].map((_, index) => (
                    <Card key={index} className="border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40">
                        <CardHeader><Skeleton className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-1/2 bg-zinc-200 dark:bg-zinc-800" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-12 w-full bg-zinc-200 dark:bg-zinc-800" />
                                <Skeleton className="h-12 w-full bg-zinc-200 dark:bg-zinc-800" />
                                <Skeleton className="h-12 w-full bg-zinc-200 dark:bg-zinc-800" />
                                <Skeleton className="h-12 w-full bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            <Skeleton className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            <Skeleton className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    if (!servers || servers.length === 0) {
        return (
            <div className="mt-6">
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black">
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                        <img 
                            src="/Empty-pana.svg" 
                            alt="No Servers" 
                            className="w-80 h-80"
                        />
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">
                            You don't have any servers yet
                        </p>
                        <Button 
                            variant="outline"
                            className="border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            onClick={() => window.location.href = '/deploy'}
                        >
                            <Server className="mr-2 h-4 w-4" />
                            Create Your First Server
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6 py-3 ">
                <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-200"></h2>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchServers} 
                    disabled={isRefreshing}
                    className="border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-3">
                {servers.map((server) => {
                    const { attributes } = server
                    const egg = eggData[attributes.egg]
                    const { status, suspended, limits, feature_limits } = attributes
                    
                    let statusDot = 'bg-green-400'
                    let statusText = 'Online'
                    
                    if (status === 'installing') {
                        statusDot = 'bg-yellow-300'
                        statusText = 'Installing'
                    } else if (status === 'running') {
                        statusDot = 'bg-zinc-300'
                        statusText = 'Online'
                    } else if (suspended) {
                        statusDot = 'bg-zinc-700'
                        statusText = 'Suspended'
                    }

                    return (
                        <Card
                            key={attributes.uuid}
                            className="overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                        >
                            {suspended && (
                                <div className="absolute inset-0 bg-white/90 dark:bg-black/90 flex flex-col items-center justify-center gap-2 z-10">
                                    <img 
                                        src="/suspended.png" 
                                        alt="Suspended Clock" 
                                        className="w-24 h-24 opacity-50"
                                    />
                                    <p className="text-zinc-700 dark:text-zinc-300 font-semibold">Server Suspended</p>
                                    <p className="text-zinc-500 text-sm">Please contact Support</p>
                                </div>
                            )}

                            <CardHeader className="pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
                                <div className="flex items-center space-x-3">
                                    {egg?.icon ? (
                                        <img src={egg.icon} alt="" className="w-7 h-7 rounded-md opacity-80" />
                                    ) : (
                                        <Server className="w-6 h-6 text-zinc-500" />
                                    )}
                                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                        {attributes.name}
                                    </h3>
                                </div>
                            </CardHeader>

                            <CardContent className="py-4 space-y-4">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                                        <span className="text-zinc-600 dark:text-zinc-400">{statusText}</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1.5">
                                        <MapPin className="h-3 w-3 text-zinc-500" />
                                        <span className="text-zinc-500">
                                            Node {attributes.node}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ResourceItem 
                                        icon={<MemoryStickIcon className="h-4 w-4 text-zinc-500" />} 
                                        label="Memory" 
                                        value={`${limits.memory} MB`} 
                                    />
                                    <ResourceItem 
                                        icon={<Cpu className="h-4 w-4 text-zinc-500" />} 
                                        label="CPU" 
                                        value={`${limits.cpu}%`} 
                                    />
                                    <ResourceItem 
                                        icon={<HardDrive className="h-4 w-4 text-zinc-500" />} 
                                        label="Storage" 
                                        value={`${limits.disk} MB`} 
                                    />
                                    <ResourceItem 
                                        icon={<Network className="h-4 w-4 text-zinc-500" />} 
                                        label="Ports" 
                                        value={feature_limits.allocations} 
                                    />
                                    <ResourceItem 
                                        icon={<Save className="h-4 w-4 text-zinc-500" />} 
                                        label="Backups" 
                                        value={feature_limits.backups} 
                                    />
                                    <ResourceItem 
                                        icon={<Database className="h-4 w-4 text-zinc-500" />} 
                                        label="Databases" 
                                        value={feature_limits.databases} 
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="justify-end space-x-1 py-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleEdit(attributes.id)}
                                    className="text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleExternalLinkClick(attributes.identifier)}
                                    className="text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-zinc-500 hover:text-zinc-700 hover:bg-red-600 dark:hover:text-red-100 dark:hover:bg-red-800"
                                    onClick={() => setServerToDelete(attributes.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            <AlertDialog open={!!serverToDelete} onOpenChange={() => setServerToDelete(null)}>
                <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-zinc-800 dark:text-zinc-200">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400">
                            This action cannot be undone. This will permanently delete your server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDelete(serverToDelete)}
                            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Server"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

const ResourceItem = ({ icon, label, value }) => (
    <div className="flex items-center p-2 rounded border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors bg-zinc-100/50 dark:bg-zinc-900/50">
        <div className="mr-3 flex-shrink-0">
            {icon}
        </div>
        <div className="flex flex-col overflow-hidden">
            <span className="text-xs text-zinc-500 truncate">{label}</span>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{value}</span>
        </div>
    </div>
)