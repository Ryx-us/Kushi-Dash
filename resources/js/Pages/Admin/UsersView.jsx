// UsersView.jsx
import React, { useEffect, useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    User,
    Mail,
    Crown,
    Coins,
    LucideEgg,
    LucideCalendar,
    LucideServerCog,
    LucidePenTool,
    LucideBadgeMinus,
    LucideHandCoins,
    LucideCoins,
    LucideMail as MailIcon,
    LucideMail,
    LucideCrown,
} from 'lucide-react';
import { Gi3dHammer } from "react-icons/gi";
import NotFound from '../NotFound';
import EmptyState from '../Common/NotFound';

export default function UsersView() {
    const { users } = usePage().props; // Get the users from Inertia props
    const [sortedUsers, setSortedUsers] = useState([]);
    const [sortField, setSortField] = useState('All');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState(''); // New state for search

    // Sort and filter users whenever users, sortField, sortOrder, or searchQuery changes
    useEffect(() => {
        let filtered = [...users];

        // Filter based on search query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user => 
                (user.email || '').toLowerCase().includes(query) ||
                (user.discord_id || '').toLowerCase().includes(query) ||
                (user.name || '').toLowerCase().includes(query)
            );
        }

        // Sort the filtered users
        if (sortField !== 'All') {
            filtered.sort((a, b) => {
                const fieldA = a[sortField] ? a[sortField].toString().toLowerCase() : '';
                const fieldB = b[sortField] ? b[sortField].toString().toLowerCase() : '';

                if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
                if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setSortedUsers(filtered);
    }, [users, sortField, sortOrder, searchQuery]);

    const handleSortFieldChange = (e) => {
        setSortField(e.target.value);
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div>
            <h2>Users List</h2>

            {/* Search and Sorting Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center mb-4 gap-4">
                {/* Search Input */}
                <div className="flex items-center">
                    <label htmlFor="search" className="mr-2 font-medium">Search:</label>
                    <input
                        id="search"
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by Email, Discord ID, or Name"
                        className="px-2 py-1 border rounded w-full md:w-64 text-black"
                    />
                </div>

                {/* Sorting Controls */}
                <div className="flex items-center">
                    <label htmlFor="sortField" className="mr-2 font-medium dark:text-black">Sort By:</label>
                    <select
                        id="sortField"
                        value={sortField}
                        onChange={handleSortFieldChange}
                        className="px-2 py-1 border rounded"
                    >
                        <option value="All">All</option>
                        <option value="email">Email</option>
                        <option value="discord_id">Discord ID</option>
                        <option value="name">Name</option>
                    </select>
                    {sortField !== 'All' && (
                        <button
                            onClick={toggleSortOrder}
                            className="ml-4 px-2 py-1 bg-gray-200 rounded"
                        >
                            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </button>
                    )}
                </div>
            </div>

            {/* Check if there are any users */}
            {sortedUsers.length === 0 && <EmptyState/>}

            {/* Display user details if available */}
            {sortedUsers.length > 0 && (
                <div className="user-list">
                    {sortedUsers.map((user, index) => (
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
                                        <span className="font-medium">Rank:</span> {user.rank || 'Free'}
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
                                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-600 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
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