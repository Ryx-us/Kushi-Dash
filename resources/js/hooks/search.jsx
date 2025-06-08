import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, X, ChevronRight, Command, ArrowRight } from 'lucide-react';

// Default search data - commonly accessed pages in the application
const DEFAULT_SEARCH_DATA = [
    {
        href: '/dashboard',
        name: 'Dashboard',
        description: 'View your account dashboard and statistics',
        category: 'Navigation',
    },
    {
        href: '/deploy',
        name: 'Deploy Server',
        description: 'Deploy a new server instance',
        category: 'Actions',
    },
    {
        href: '/panel',
        name: 'Control Panel',
        description: 'Manage your server settings and configurations',
        category: 'Management',
    },
    {
        href: '/plans',
        name: 'Shop',
        description: 'Browse and purchase subscription plans',
        category: 'Shopping',
    },
    {
        href: '/shop',
        name: 'Coin Shop',
        description: 'Spend your coins on various items and services',
        category: 'Shopping',
    },
    {
        href: '/earn',
        name: 'Earn Coins',
        description: 'Complete tasks to earn more coins',
        category: 'Actions',
    },
    {
        href: '/profile',
        name: 'Profile',
        description: 'View and edit your profile information',
        category: 'User',
    },
    {
        href: '/broadcast/india',
        name: 'India broadcast',
        description: 'Indian System status',
        category: 'Management',
    },
    
    
];

/**
 * Custom hook that provides a modal search component
 * @param {Object[]} customData - Optional custom data to search through
 * @param {Object} options - Configuration options
 * @returns {Object} Search state and trigger function
 */
export function useSearch(customData = [], options = {}) {
    // Combine default data with any custom data
    const searchData = [...DEFAULT_SEARCH_DATA, ...customData];

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [groupedResults, setGroupedResults] = useState({});
    const inputRef = useRef(null);
    const resultsRef = useRef(null);
    
    // Detect OS for keyboard shortcut display
    const [osType, setOsType] = useState('unknown');
    
    useEffect(() => {
        // Detect operating system
        const platform = navigator.platform || '';
        if (platform.indexOf('Mac') !== -1) {
            setOsType('mac');
        } else if (platform.indexOf('Win') !== -1) {
            setOsType('windows');
        } else if (platform.indexOf('Linux') !== -1) {
            setOsType('linux');
        } else {
            setOsType('unknown');
        }
    }, []);

    const openSearch = () => {
        setIsOpen(true);
        // Use a slightly longer timeout to ensure the modal is fully rendered
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 150);
    };

    const closeSearch = () => {
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    // Register keyboard shortcut (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Open search with Cmd+K / Ctrl+K (works on all platforms)
            if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                openSearch();
            }

            // Close with Escape
            if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                closeSearch();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Handle search logic
    const performSearch = useCallback(
        (searchQuery) => {
            if (!searchQuery.trim()) {
                setResults([]);
                setGroupedResults({});
                return;
            }

            const searchTerms = searchQuery.toLowerCase().split(' ').filter((term) => term.length > 0);

            const filteredResults = searchData.filter((item) => {
                return searchTerms.every((term) => {
                    return (
                        (item.name && item.name.toLowerCase().includes(term)) ||
                        (item.description && item.description.toLowerCase().includes(term))
                    );
                });
            });

            // Group results by category
            const grouped = filteredResults.reduce((acc, item) => {
                const category = item.category || 'General';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(item);
                return acc;
            }, {});

            setResults(filteredResults);
            setGroupedResults(grouped);
            setSelectedIndex(filteredResults.length > 0 ? 0 : -1);
        },
        [searchData]
    );

    // Update search results when query changes
    useEffect(() => {
        performSearch(query);
    }, [query, performSearch]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyNavigation = (e) => {
            // Tab to navigate through results (instead of arrow keys)
            if (e.key === 'Tab' && results.length > 0) {
                e.preventDefault();
                if (e.shiftKey) {
                    // Shift+Tab - go up
                    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : results.length - 1));
                } else {
                    // Tab - go down
                    setSelectedIndex((prevIndex) => (prevIndex < results.length - 1 ? prevIndex + 1 : 0));
                }
            }

            // Enter to select
            if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const selectedItem = results[selectedIndex];
                if (selectedItem && selectedItem.href) {
                    // Use Inertia's router.visit instead of window.location
                    router.visit(selectedItem.href);
                    closeSearch();
                }
            }
        };

        document.addEventListener('keydown', handleKeyNavigation);
        return () => {
            document.removeEventListener('keydown', handleKeyNavigation);
        };
    }, [isOpen, results, selectedIndex]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && selectedIndex >= 0) {
            const allResultItems = resultsRef.current.querySelectorAll('[data-result-item]');
            const selectedElement = allResultItems[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                });
            }
        }
    }, [selectedIndex]);

    // Highlight matching text in search results
    const highlightMatch = (text, query) => {
        if (!query.trim() || !text) return text;

        const terms = query.toLowerCase().split(' ').filter((term) => term.length > 0);
        let result = text;

        terms.forEach((term) => {
            const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
            result = result.replace(
                regex,
                '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
            );
        });

        return result;
    };
    
    // Get shortcut display based on OS
    const getShortcutDisplay = () => {
        switch(osType) {
            case 'mac':
                return (
                    <div className="ml-2 flex items-center border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="mr-0.5">⌘</span>
                        <span>K</span>
                    </div>
                );
            case 'windows':
            case 'linux':
            default:
                return (
                    <div className="ml-2 flex items-center border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="mr-0.5">Ctrl</span>
                        <span>+</span>
                        <span className="ml-0.5">K</span>
                    </div>
                );
        }
    };
    
    // Keyboard shortcut hints based on OS
    const getKeyboardHints = () => {
        return (
            <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs">
                                Tab
                            </kbd>
                            <span className="ml-1.5">to navigate</span>
                        </div>
                        <div className="flex items-center">
                            <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs">
                                Enter
                            </kbd>
                            <span className="ml-1.5">to select</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs">
                            Esc
                        </kbd>
                        <span className="ml-1.5">to close</span>
                    </div>
                </div>
            </div>
        );
    };

    // Search component that will render as a modal
    const SearchComponent = () => (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                        onClick={closeSearch}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <div
                        className="flex min-h-full items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
                    >
                        <div
                            className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-200 dark:border-zinc-800"
                            onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
                        >
                            {/* Search header */}
                            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 p-4">
                                <Search className="h-5 w-5 text-zinc-400 mr-3" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="flex-1 bg-transparent border-0 focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-base outline-none"
                                    placeholder="Type to search..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoComplete="off"
                                    autoFocus // Add autoFocus
                                />
                                {query && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setQuery('');
                                            if (inputRef.current) {
                                                inputRef.current.focus();
                                            }
                                        }}
                                        className="ml-2 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                                
                                {getShortcutDisplay()}
                            </div>

                            {/* Search results */}
                            <div className="overflow-y-auto max-h-[calc(80vh-60px)]" ref={resultsRef}>
                                {results.length > 0 ? (
                                    <div className="py-2">
                                        {Object.entries(groupedResults).map(([category, items], categoryIndex) => (
                                            <div key={category} className="mb-2">
                                                <div className="px-4 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                                                    {category}
                                                </div>
                                                <ul>
                                                    {items.map((item, itemIndex) => {
                                                        // Calculate the overall index in the flat results array
                                                        const flatIndex = results.findIndex((r) => r === item);

                                                        return (
                                                            <li
                                                                key={`${category}-${itemIndex}`}
                                                                data-result-item
                                                                className={`px-4 py-2 cursor-pointer ${
                                                                    flatIndex === selectedIndex
                                                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                                                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                                                }`}
                                                                onMouseEnter={() => setSelectedIndex(flatIndex)}
                                                            >
                                                                <Link
                                                                    href={item.href}
                                                                    className="flex justify-between items-center"
                                                                    onClick={closeSearch}
                                                                >
                                                                    <div>
                                                                        <h4
                                                                            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: highlightMatch(item.name, query),
                                                                            }}
                                                                        />
                                                                        {item.description && (
                                                                            <p
                                                                                className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: highlightMatch(item.description, query),
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <ArrowRight className="h-4 w-4 text-zinc-400 ml-2 flex-shrink-0" />
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : query ? (
                                    <div className="py-12 text-center">
                                        <p className="text-zinc-500 dark:text-zinc-400">No results found for "{query}"</p>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Recent searches</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {DEFAULT_SEARCH_DATA.slice(0, 4).map((item, index) => (
                                                <Link
                                                    key={index}
                                                    href={item.href}
                                                    className="flex items-center p-2 rounded-md text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                                    onClick={closeSearch}
                                                >
                                                    <span className="mr-2 text-zinc-400">
                                                        <Search className="h-4 w-4" />
                                                    </span>
                                                    <span className="text-zinc-700 dark:text-zinc-300 truncate">
                                                        {item.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Keyboard navigation help */}
                                {getKeyboardHints()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    // Create a trigger button component
    const SearchTrigger = ({ className, children }) => (
        <button
            type="button"
            onClick={openSearch}
            className={className}
            aria-label="Search"
        >
            {children || <Search className="h-5 w-5" />}
        </button>
    );

    return {
        isOpen,
        openSearch,
        closeSearch,
        SearchComponent,
        SearchTrigger,
    };
}

// Helper function to escape special characters in string for use in regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default useSearch;