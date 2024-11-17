'use client'

import React, { useEffect, useState } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import axios from 'axios'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, ExternalLink, Trash2 } from "lucide-react"
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
    const [serverToDelete, setServerToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const { post, delete: deleteServer } = useForm()

    const { status } = usePage().props
    const [showSuccess, setShowSuccess] = useState(!!status)

    useEffect(() => {
        hotReloadApi().then(fetchServers)
    }, [])

    const hotReloadApi = async () => {
        try {
            const response = await axios.get(`/pterodactyl/servers/${user.pterodactyl_id}`)
            console.warn(response.data.data.servers)
        } catch (error) {
            console.error('Error hot reloading API:', error)
        }
    }

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
        post(`/pterodactyl/servers/${user.pterodactyl_id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props.flash.res) {
                    setServers(page.props.flash.res)
                    page.props.flash.res.forEach((server) => {
                        fetchEggData(server.attributes.egg)
                    })
                }
                setIsLoading(false)
            },
            onError: () => {
                setIsLoading(false)
            },
        })
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                {[...Array(6)].map((_, index) => (
                    <Card key={index}>
                        <CardHeader><Skeleton className="h-6 w-36" /></CardHeader>
                        <CardContent><Skeleton className="h-4 w-full mb-2" /></CardContent>
                        <CardFooter className="flex justify-end">
                            <Skeleton className="h-4 w-16" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    if (!servers || servers.length === 0) {
        return (
            <div className="mt-6">
    <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
            <img 
                src="/empty.svg" 
                alt="No Servers" 
                className="w-80 h-80"
            />
            <p className="text-muted-foreground text-lg font-medium">
                You don't have any servers yet
            </p>
            <Button 
    variant="default"
    className="dark:bg-white bg-black"
    onClick={() => window.location.href = '/deploy'}
>
    Create Your First Server
</Button>
        </CardContent>
    </Card>
</div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-3">
            {servers.map((server) => {
                const { attributes } = server
                const egg = eggData[attributes.egg]
                const { status, suspended, limits, feature_limits } = attributes

                let backgroundClass = ''
                if (status === 'installing') {
                    backgroundClass = 'opacity-20'
                } else if (suspended) {
                    backgroundClass = ''
                } else {
                    backgroundClass = ''
                }

                return (
                    <Card
                        key={attributes.uuid}
                        className={`overflow-hidden group relative ${backgroundClass}`}
                        style={{
                            backgroundImage: egg?.imageUrl ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(${egg.imageUrl})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {suspended && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 z-10">
                                <img 
                                    src="/suspended.png" 
                                    alt="Suspended Clock" 
                                    className="w-24 h-24"
                                />
                                <p className="text-white font-semibold">Server Suspended</p>
                                <p className="text-white text-sm font-thin">Please contact Support</p>
                            </div>
                        )}

                        <CardHeader className="space-y-2">
                            <div className="flex items-center space-x-3">
                                {egg?.icon && (
                                    <img src={egg.icon} alt="" className="w-8 h-8 rounded-full" />
                                )}
                                <h3 className="text-lg font-semibold text-white truncate">
                                    {attributes.name}
                                </h3>
                            </div>
                            {attributes.description && (
                                <p className="text-sm text-gray-300 line-clamp-2">
                                    {attributes.description}
                                </p>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="text-sm text-gray-300">
                                    Node {attributes.node}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <ResourceItem label="Memory" value={`${limits.memory} MB`} />
                                <ResourceItem label="CPU" value={`${limits.cpu}%`} />
                                <ResourceItem label="Storage" value={`${limits.disk} MB`} />
                                <ResourceItem label="Ports" value={feature_limits.allocations} />
                                <ResourceItem label="Backups" value={feature_limits.backups} />
                                <ResourceItem label="Databases" value={feature_limits.databases} />
                            </div>
                        </CardContent>

                        <CardFooter className="justify-end space-x-2 bg-black/50 backdrop-blur-sm">
                            <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => setServerToDelete(attributes.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}

            <AlertDialog open={!!serverToDelete} onOpenChange={() => setServerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDelete(serverToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Server"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            
        </div>
    )
}

const ResourceItem = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm font-medium text-white">{value}</span>
    </div>
)