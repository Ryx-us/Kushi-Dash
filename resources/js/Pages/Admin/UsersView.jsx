import React, { useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    User,
    Mail,
    Crown,
    Coins,
    Server,
    Calendar,
    LucideMail,
    LucideCrown,
    LucideHandCoins,
    LucideCoins,
    LucideEgg,
    LucideCalendar, LucideServerCog, LucidePenTool, LucideBadgeMinus
} from 'lucide-react';
import {Gi3dHammer} from "react-icons/gi";

export default function UsersView() {
    const { users } = usePage().props; // Get the users from Inertia props

    // Log the users to see the structure
    useEffect(() => {
        console.log("Users from Inertia:", users);
    }, [users]);

    return (
        <div>
            <h2>Users List</h2>
            {/* Check if there are any users */}
            {users.length === 0 && <p>Kushi Engine Has Detected No users, This is a strange occurrence.</p>}

            {/* Display user details if available */}
            {users.length > 0 && (
                <div className="user-list">
                    {users.map((user, index) => (
                        <Card
                            key={index}
                            className={`user-card mb-4 ${user.rank === 'admin' ? 'shadow-red-500 shadow-2xl' : ''}`} // Apply red shadow for admins
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {/* Use custom icon for admin users */}
                                    {user.rank === 'admin' ? (
                                        <LucideBadgeMinus className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                    {user.name || 'N/A'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    <p className="flex items-center gap-2">
                                        <LucideMail className="h-4 w-4" />
                                        <span className="font-medium">Email:</span> {user.email || 'N/A'}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <LucideCrown className="h-4 w-4" />
                                        <span className="font-medium">Rank:</span> {user.rank || 'Free '}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <LucideHandCoins className="h-4 w-4" />
                                        <span className="font-medium">Coins:</span> {user.coins || '0'}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <LucideCoins className="h-4 w-4" />
                                        <span className="font-medium">Discord ID:</span> {user.discord_id || 'N/A'}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <LucideEgg className="h-4 w-4" />
                                        <span className="font-medium">Pterodactyl ID:</span> {user.pterodactyl_id || 'N/A'}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <LucideCalendar className="h-4 w-4" />
                                        <span className="font-medium">Created At:</span> {user.created_at || 'N/A'}
                                    </p>
                                    <Link href={`/admin/users/${user.id}/edit`} className="mt-4 inline-block">
                                        <button className="px-4 py-2 bg-black  text-white rounded-lg hover:bg-zinc-600 dark:bg-white dark:text-zinc-950  dark:hover:bg-zinc-200  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
                                            Manage
                                        </button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
