// UsersView.jsx
import React, { useEffect, useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    User,
    Search,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    LucideEgg,
    LucideCalendar,
    LucideMail,
    LucideCrown,
    LucideBadgeMinus,
    LucideHandCoins,
    LucideCoins,
    LucideArrowUpDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import EmptyState from '../Common/NotFound';

export default function UsersView() {
    const { users } = usePage().props;
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [sortField, setSortField] = useState('All');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [rankFilter, setRankFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    // Apply filtering, sorting, and pagination
    useEffect(() => {
        // First, filter the users
        let filtered = [...users];

        // Apply rank filter
        if (rankFilter !== 'All') {
            filtered = filtered.filter(user => user.rank === rankFilter);
        }

        // Apply search filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user => 
                (user.email || '').toLowerCase().includes(query) ||
                (user.discord_id || '').toLowerCase().includes(query) ||
                (user.name || '').toLowerCase().includes(query) ||
                (user.pterodactyl_id || '').toLowerCase().includes(query) ||
                (user.rank || '').toLowerCase().includes(query)
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

        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [users, sortField, sortOrder, searchQuery, rankFilter]);

    // Calculate pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Handle pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Toggle sort order
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    // Get available ranks for filtering
    const availableRanks = ['All', ...new Set(users.map(user => user.rank || 'Free').filter(Boolean))];

    // Get user rank badge color
    const getRankBadgeColor = (rank) => {
        switch (rank) {
            case 'admin': return 'bg-red-500';
            case 'premium': return 'bg-yellow-500';
            case 'vip': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="container mx-auto py-2">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-sans font-bold">Users Management</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                    </span>
                </div>
            </div>
            

            {/* Search and Filter Bar */}
            <div className=" bg-white dark:bg-black rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search users by name, email, Discord ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center gap-2">
                        <Select value={sortField} onValueChange={setSortField}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Sort Options</SelectLabel>
                                    <SelectItem value="All">Default</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="rank">Rank</SelectItem>
                                    <SelectItem value="coins">Coins</SelectItem>
                                    <SelectItem value="created_at">Creation Date</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {sortField !== 'All' && (
                            <Button 
                                variant="outline" 
                                size="icon"
                                onClick={toggleSortOrder}
                                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            >
                                <LucideArrowUpDown className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                            </Button>
                        )}

                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setShowFilters(!showFilters)}
                            title="Advanced Filters"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">User Rank</label>
                            <Select value={rankFilter} onValueChange={setRankFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by rank" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRanks.map(rank => (
                                        <SelectItem key={rank} value={rank}>
                                            {rank}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Results Per Page</label>
                            <Select value={usersPerPage.toString()} onValueChange={(value) => setUsersPerPage(Number(value))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Results per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 per page</SelectItem>
                                    <SelectItem value="10">10 per page</SelectItem>
                                    <SelectItem value="25">25 per page</SelectItem>
                                    <SelectItem value="50">50 per page</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-1 md:col-span-2 flex items-end">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setSearchQuery('');
                                    setSortField('All');
                                    setSortOrder('asc');
                                    setRankFilter('All');
                                }}
                                className="ml-auto"
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {currentUsers.length === 0 && (
                <EmptyState />
            )}

            {/* User Cards Grid */}
            {currentUsers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {currentUsers.map((user, index) => (
                        <Card
                            key={user.id || index}
                            className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
                                user.rank === 'admin' ? 'border-red-500 border-2' : ''
                            }`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="flex items-center gap-2 truncate">
                                        {user.rank === 'admin' ? (
                                            <LucideBadgeMinus className="h-5 w-5 text-red-500 flex-shrink-0" />
                                        ) : (
                                            <User className="h-5 w-5 flex-shrink-0" />
                                        )}
                                        <span className="truncate">{user.name || 'N/A'}</span>
                                    </CardTitle>
                                    <Badge className={`${getRankBadgeColor(user.rank)}`}>
                                        {user.rank || 'Free'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <p className="flex items-center gap-2">
                                        <LucideMail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Email:</span> 
                                        <span className="truncate">{user.email || 'N/A'}</span>
                                    </p>
                                    
                                    <p className="flex items-center gap-2">
                                        <LucideHandCoins className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Coins:</span> 
                                        <span>{user.coins || '0'}</span>
                                    </p>
                                    
                                    <p className="flex items-center gap-2">
                                        <LucideCoins className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Discord:</span> 
                                        <span className="truncate">{user.discord_id || 'N/A'}</span>
                                    </p>
                                    
                                    <p className="flex items-center gap-2">
                                        <LucideEgg className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Ptero ID:</span> 
                                        <span className="truncate">{user.pterodactyl_id || 'N/A'}</span>
                                    </p>
                                    
                                    <p className="flex items-center gap-2">
                                        <LucideCalendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Created:</span> 
                                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                    </p>
                                    
                                    <div className="pt-3 flex justify-end">
                                        <Link href={`/admin/users/${user.id}/edit`}>
                                            <Button>
                                                Manage User
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            

            {/* Pagination Controls */}
            {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between bg-white dark:bg-black p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={prevPage} 
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        
                        <div className="hidden md:flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Show pages around current page
                                let pageToShow;
                                if (totalPages <= 5) {
                                    pageToShow = i + 1;
                                } else if (currentPage <= 3) {
                                    pageToShow = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageToShow = totalPages - 4 + i;
                                } else {
                                    pageToShow = currentPage - 2 + i;
                                }
                                
                                return (
                                    <Button
                                        key={i}
                                        variant={currentPage === pageToShow ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => paginate(pageToShow)}
                                        className="w-9 h-9 p-0"
                                    >
                                        {pageToShow}
                                    </Button>
                                );
                            })}
                            
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <>
                                    <span className="mx-1">...</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => paginate(totalPages)}
                                        className="w-9 h-9 p-0"
                                    >
                                        {totalPages}
                                    </Button>
                                </>
                            )}
                        </div>
                        
                        <div className="md:hidden">
                            <span className="text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                        
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={nextPage} 
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}