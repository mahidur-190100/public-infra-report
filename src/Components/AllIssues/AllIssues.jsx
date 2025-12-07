import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import IssueCard from '../IssueCard/IssueCard';
import { FaSearch } from 'react-icons/fa';

const AllIssues = () => {
    const allIssues = useLoaderData();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter issues based on search term
    const filteredIssues = searchTerm
        ? allIssues.filter(issue =>
            issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : allIssues;

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        All Reported Issues
                    </h1>
                    
                    {/* Simple Search Bar */}
                    <div className="max-w-xl mx-auto mb-8">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search issues..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <p className="text-gray-600 text-sm mt-2">
                            Search by title, location, category, or description
                        </p>
                    </div>
                </div>

                {/* Results Count */}
                <div className="text-gray-600 mb-6">
                    Found {filteredIssues.length} issues
                    {searchTerm && ` for "${searchTerm}"`}
                </div>

                {/* Issues Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                    {filteredIssues.map((issue) => (
                        <div key={issue._id} className="h-full">
                            <IssueCard issue={issue} />
                        </div>
                    ))}
                </div>
                
                {filteredIssues.length === 0 && (
                    <div className="text-center text-gray-500 mt-12">
                        <p className="text-xl">No issues found.</p>
                        <p className="mt-2">Try a different search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllIssues;