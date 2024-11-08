'use client'

import React, { useEffect, useState } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import axios from 'axios'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, ExternalLink, Trash2 } from "lucide-react"
import {Skeleton} from "@/components/ui/skeleton.jsx";

export default function Component({ className = '' }) {
    const user = usePage().props.auth.user
    const [serverData, setServerData] = useState(null)
    const [eggData, setEggData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const { post } = useForm()

    useEffect(() => {
        hotReloadApi().then(fetchServers)
    }, [])

    const hotReloadApi = async () => {
        try {
            await axios.get(`/pterodactyl/servers/${user.pterodactyl_id}`)
        } catch (error) {
            console.error('Error hot reloading API:', error)
        }
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
                if (page.props.flash.servers) {
                    setServerData(page.props.flash.servers)
                    Object.values(page.props.flash.servers.servers).forEach((server) => {
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
                            <CardHeader>
                                <Skeleton className="h-6 w-36" />
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

    if (!serverData?.servers || Object.keys(serverData.servers).length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No servers found</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-3">
            {Object.entries(serverData.servers).map(([id, server]) => {
                const egg = eggData[server.attributes.egg]
                const { status, suspended, limits, feature_limits: featureLimits } = server.attributes

                // Determine background based on status
                let backgroundClass = ''
                if (status === 'installing') {
                    backgroundClass = 'bg-yellow-500' // Example installing background
                } else if (suspended) {
                    backgroundClass = 'bg-red-500' // Suspended background
                } else {
                    backgroundClass = 'bg-green-500' // Default active background
                }

                return (
                    <Card
                        key={id}
                        className={`overflow-hidden group relative ${backgroundClass}`}
                        style={{
                            backgroundImage: egg?.imageUrl ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(${egg.imageUrl})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {suspended && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <p className="text-white font-semibold">Server Suspended</p>
                            </div>
                        )}

                        <CardHeader className="space-y-2">
                            <div className="flex items-center space-x-3">
                                {egg?.icon && (
                                    <img
                                        src={egg.icon}
                                        alt=""
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <h3 className="text-lg font-semibold text-white truncate">
                                    {server.attributes.name}
                                </h3>
                            </div>
                            {server.attributes.description && (
                                <p className="text-sm text-gray-300 line-clamp-2">
                                    {server.attributes.description}
                                </p>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="text-sm text-gray-300">
                                    Node {server.attributes.node}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Memory</span>
                                    <span className="text-sm font-medium text-white">
                                        {limits.memory} MB
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">CPU</span>
                                    <span className="text-sm font-medium text-white">
                                        {limits.cpu}%
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Storage</span>
                                    <span className="text-sm font-medium text-white">
                                        {limits.disk} MB
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Ports</span>
                                    <span className="text-sm font-medium text-white">
                                        {featureLimits.allocations}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Backups</span>
                                    <span className="text-sm font-medium text-white">
                                        {featureLimits.backups}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Databases</span>
                                    <span className="text-sm font-medium text-white">
                                        {featureLimits.databases}
                                    </span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="justify-end space-x-2 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}
