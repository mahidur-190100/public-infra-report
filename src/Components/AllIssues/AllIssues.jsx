import React from 'react';
import { useLoaderData } from 'react-router-dom';
import IssueCard from '../IssueCard/IssueCard';

const AllIssues = () => {
    const issues = useLoaderData();
    console.log(issues);

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    All Reported Issues
                </h1>
                
                {/* Equal Height Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                    {issues.map((issue) => (
                        <div key={issue._id} className="h-full">
                            <IssueCard issue={issue} />
                        </div>
                    ))}
                </div>
                
                {issues.length === 0 && (
                    <div className="text-center text-gray-500 mt-12">
                        <p className="text-xl">No issues reported yet.</p>
                        <p className="mt-2">Be the first to report an infrastructure problem!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllIssues;