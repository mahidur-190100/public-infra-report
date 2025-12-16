import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import IssueCard from '../IssueCard/IssueCard';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaFilter, FaTimes, FaSync } from 'react-icons/fa';

const AllIssues = () => {
    const loaderData = useLoaderData();
    const [searchTerm, setSearchTerm] = useState('');
    const [allIssues, setAllIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // New state for sorting and filtering
    const [sortBy, setSortBy] = useState('recent'); // recent, upvotes, title, status, priority
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        priority: 'all'
    });
    
    // Function to fetch fresh data from API
    const fetchIssues = async () => {
        try {
            setRefreshing(true);
            const response = await fetch('https://public-infra-report-server.vercel.app/issues');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.issues)) {
                console.log(`Fetched ${data.issues.length} issues from API`);
                setAllIssues(data.issues);
            } else {
                console.warn('Unexpected API response format:', data);
                // Fallback to loader data
                handleLoaderData(loaderData);
            }
        } catch (err) {
            console.error("Error fetching issues:", err);
            setError(err.message);
            // Fallback to loader data
            handleLoaderData(loaderData);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    // Function to handle loader data
    const handleLoaderData = (data) => {
        try {
            console.log("Processing loader data...");
            
            // Handle different response formats
            if (data.success && Array.isArray(data.issues)) {
                // New format: { success: true, issues: [...] }
                setAllIssues(data.issues);
                console.log("Using new format, issues count:", data.issues.length);
            } else if (Array.isArray(data)) {
                // Old format: raw array
                setAllIssues(data);
                console.log("Using old format, issues count:", data.length);
            } else if (data && data.issues && Array.isArray(data.issues)) {
                // Another possible format
                setAllIssues(data.issues);
                console.log("Using alternative format, issues count:", data.issues.length);
            } else {
                // Default to empty array
                console.warn("Unexpected data format, defaulting to empty array:", data);
                setAllIssues([]);
            }
        } catch (err) {
            console.error("Error processing data:", err);
            setError(err.message);
        }
    };

    // Initial load from loader data
    useEffect(() => {
        handleLoaderData(loaderData);
        setLoading(false);
    }, [loaderData]);

    // Auto-refresh every 30 seconds to catch updates
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Auto-refreshing issues data...");
            fetchIssues();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Create a custom event listener for issue updates
    useEffect(() => {
        const handleIssueUpdate = (event) => {
            console.log("Received issue update event:", event.detail);
            // Refresh data when we get an update event
            fetchIssues();
        };

        // Listen for custom events
        window.addEventListener('issue-rejected', handleIssueUpdate);
        window.addEventListener('issue-created', handleIssueUpdate);
        window.addEventListener('issue-updated', handleIssueUpdate);

        return () => {
            window.removeEventListener('issue-rejected', handleIssueUpdate);
            window.removeEventListener('issue-created', handleIssueUpdate);
            window.removeEventListener('issue-updated', handleIssueUpdate);
        };
    }, []);

    // Function to trigger a refresh manually
    const refreshData = async () => {
        await fetchIssues();
    };

    // Get unique categories, statuses, priorities for filters
    const availableCategories = [...new Set(allIssues.map(issue => issue.category).filter(Boolean))].sort();
    const availableStatuses = [...new Set(allIssues.map(issue => issue.status).filter(Boolean))].sort();
    const availablePriorities = [...new Set(allIssues.map(issue => issue.priority).filter(Boolean))].sort();

    // Filter out rejected issues (they shouldn't appear in all issues)
    const filteredOutRejected = allIssues.filter(issue => {
        const status = issue.status ? issue.status.toLowerCase() : '';
        return status !== 'rejected';
    });

    // Filter and sort issues
    const getFilteredAndSortedIssues = () => {
        // First apply search filter
        let filtered = searchTerm
            ? filteredOutRejected.filter(issue => {
                if (!issue) return false;
                
                const searchLower = searchTerm.toLowerCase();
                
                // Safely check each field
                const titleMatch = issue.title && issue.title.toLowerCase().includes(searchLower);
                const descriptionMatch = issue.description && issue.description.toLowerCase().includes(searchLower);
                const locationMatch = issue.location && issue.location.toLowerCase().includes(searchLower);
                const categoryMatch = issue.category && issue.category.toLowerCase().includes(searchLower);
                const reportedByMatch = issue.reportedBy && issue.reportedBy.toLowerCase().includes(searchLower);
                
                return titleMatch || descriptionMatch || locationMatch || categoryMatch || reportedByMatch;
            })
            : filteredOutRejected;

        // Apply additional filters
        if (filters.category !== 'all') {
            filtered = filtered.filter(issue => 
                issue.category && issue.category.toLowerCase() === filters.category.toLowerCase()
            );
        }
        
        if (filters.status !== 'all') {
            filtered = filtered.filter(issue => 
                issue.status && issue.status.toLowerCase() === filters.status.toLowerCase()
            );
        }
        
        if (filters.priority !== 'all') {
            filtered = filtered.filter(issue => 
                issue.priority && issue.priority.toLowerCase() === filters.priority.toLowerCase()
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'recent':
                    aValue = new Date(a.reportedAt || a.createdAt || 0);
                    bValue = new Date(b.reportedAt || b.createdAt || 0);
                    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
                
                case 'upvotes':
                    aValue = a.upvotes || 0;
                    bValue = b.upvotes || 0;
                    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
                
                case 'title':
                    aValue = (a.title || '').toLowerCase();
                    bValue = (b.title || '').toLowerCase();
                    return sortOrder === 'desc' 
                        ? bValue.localeCompare(aValue)
                        : aValue.localeCompare(bValue);
                
                case 'status':
                    aValue = (a.status || '').toLowerCase();
                    bValue = (b.status || '').toLowerCase();
                    return sortOrder === 'desc'
                        ? bValue.localeCompare(aValue)
                        : aValue.localeCompare(bValue);
                
                case 'priority':
                    // Custom priority order: high > normal > low
                    const priorityOrder = { 'high': 3, 'medium': 2, 'normal': 1, 'low': 0 };
                    aValue = priorityOrder[(a.priority || 'normal').toLowerCase()] || 0;
                    bValue = priorityOrder[(b.priority || 'normal').toLowerCase()] || 0;
                    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
                
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredIssues = getFilteredAndSortedIssues();

    // Sort options
    const sortOptions = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'upvotes', label: 'Most Upvotes' },
        { value: 'title', label: 'Title (A-Z)' },
        { value: 'status', label: 'Status' },
        { value: 'priority', label: 'Priority' }
    ];

    const handleSortChange = (newSortBy) => {
        if (newSortBy === sortBy) {
            // Toggle sort order if clicking same sort option
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            // Set new sort by and default to desc
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilters({
            category: 'all',
            status: 'all',
            priority: 'all'
        });
    };

    const hasActiveFilters = () => {
        return searchTerm.trim() !== '' || 
               filters.category !== 'all' ||
               filters.status !== 'all' ||
               filters.priority !== 'all';
    };

    // Count statuses (excluding rejected)
    const getStatusCounts = () => {
        const counts = {
            pending: 0,
            inProgress: 0,
            resolved: 0,
            rejected: 0,
            all: filteredOutRejected.length
        };

        filteredOutRejected.forEach(issue => {
            const status = issue.status ? issue.status.toLowerCase() : '';
            
            if (status.includes('pending')) {
                counts.pending++;
            } else if (status.includes('progress')) {
                counts.inProgress++;
            } else if (status.includes('resolved')) {
                counts.resolved++;
            }
        });

        // Count rejected from all issues (not filtered out)
        allIssues.forEach(issue => {
            const status = issue.status ? issue.status.toLowerCase() : '';
            if (status.includes('rejected')) {
                counts.rejected++;
            }
        });

        return counts;
    };

    const statusCounts = getStatusCounts();

    if (loading) {
        return (
            <div className="min-h-screen bg-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-300 rounded w-1/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        <div className="h-64 bg-gray-100 rounded w-full max-w-xl mx-auto mt-8"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Issues</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <div className="flex gap-2 justify-center">
                            <button 
                                onClick={fetchIssues} 
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            All Reported Issues
                        </h1>
                        <button
                            onClick={refreshData}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {refreshing ? (
                                <FaSync className="animate-spin" />
                            ) : (
                                <FaSync />
                            )}
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Browse and search through all infrastructure issues reported by citizens
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-6">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder="Search by title, description, location, category, or reporter..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sort and Filter Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        {/* Sort Options */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-gray-700 font-medium">Sort by:</span>
                            <div className="flex flex-wrap gap-2">
                                {sortOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSortChange(option.value)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                            sortBy === option.value
                                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        <span>{option.label}</span>
                                        {sortBy === option.value && (
                                            sortOrder === 'desc' 
                                                ? <FaSortAmountDown className="text-blue-600" />
                                                : <FaSortAmountUp className="text-blue-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <div className="flex items-center gap-4">
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FaTimes />
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <FaFilter />
                                <span>Filters</span>
                                {hasActiveFilters() && (
                                    <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filters Panel */}
                    {showFilters && (
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Categories</option>
                                        {availableCategories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        {availableStatuses.map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Priority Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={filters.priority}
                                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Priorities</option>
                                        {availablePriorities.map(priority => (
                                            <option key={priority} value={priority}>
                                                {priority}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters() && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Active Filters:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {searchTerm && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                Search: "{searchTerm}"
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </span>
                                        )}
                                        {filters.category !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                Category: {filters.category}
                                                <button
                                                    onClick={() => handleFilterChange('category', 'all')}
                                                    className="ml-1 text-green-600 hover:text-green-800"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </span>
                                        )}
                                        {filters.status !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                                Status: {filters.status}
                                                <button
                                                    onClick={() => handleFilterChange('status', 'all')}
                                                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </span>
                                        )}
                                        {filters.priority !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                                Priority: {filters.priority}
                                                <button
                                                    onClick={() => handleFilterChange('priority', 'all')}
                                                    className="ml-1 text-red-600 hover:text-red-800"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Count and Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="text-gray-700 mb-4 md:mb-0">
                        <p className="font-medium">
                            Showing <span className="text-blue-600 font-bold">{filteredIssues.length}</span> of{" "}
                            <span className="font-bold">{statusCounts.all}</span> total issues
                            <span className="text-gray-500 text-sm ml-2">
                                ({statusCounts.rejected} rejected issues hidden)
                            </span>
                        </p>
                        {searchTerm && (
                            <p className="text-gray-500 text-sm mt-1">
                                Search results for: <span className="font-medium">"{searchTerm}"</span>
                            </p>
                        )}
                        {hasActiveFilters() && !searchTerm && (
                            <p className="text-gray-500 text-sm mt-1">
                                Filtered issues • Sort: {sortOptions.find(o => o.value === sortBy)?.label} ({sortOrder})
                            </p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                            Data last updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                    
                    {/* Status Filter Badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            All: {statusCounts.all}
                        </span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            Pending: {statusCounts.pending}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            In Progress: {statusCounts.inProgress}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            Resolved: {statusCounts.resolved}
                        </span>
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                            Rejected: {statusCounts.rejected}
                        </span>
                    </div>
                </div>

                {/* Issues Grid */}
                {filteredIssues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredIssues.map((issue) => (
                            <div key={issue._id} className="transition-transform duration-300 hover:scale-[1.02]">
                                <IssueCard issue={issue} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="text-gray-400 text-5xl mb-4">
                            <FaSearch />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {statusCounts.all === 0 ? "No Issues Reported Yet" : "No Matching Issues Found"}
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            {statusCounts.all === 0 
                                ? "Be the first to report an infrastructure issue in your community!"
                                : `No issues match your filters. Try adjusting your search or filters.`
                            }
                        </p>
                        <div className="flex gap-2 justify-center">
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            )}
                            <button
                                onClick={refreshData}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Refresh Data
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllIssues;