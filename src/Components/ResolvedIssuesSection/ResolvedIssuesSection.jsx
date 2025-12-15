import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import { FaArrowRight, FaCheckCircle, FaSpinner } from "react-icons/fa";
import IssueCard from "../IssueCard/IssueCard";

const ResolvedIssuesSection = () => {
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResolvedIssues = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3000/resolved-issues/limit?limit=6"
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setResolvedIssues(data.issues || []);
        } else {
          setError(data.message || "Failed to fetch resolved issues");
        }
      } catch (err) {
        console.error("Error fetching resolved issues:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResolvedIssues();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
            <p className="text-gray-600">Loading recently resolved issues...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading resolved issues: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (resolvedIssues.length === 0) {
    return (
      <section className="w-full bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Resolved Issues Yet
            </h3>
            <p className="text-gray-600">
              Be the first to report an issue and help improve our city!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-br from-green-50 to-blue-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full mb-4">
            <FaCheckCircle className="mr-2" />
            <span className="font-semibold">Recently Resolved</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Successfully Resolved Issues
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how our community and staff have worked together to fix public infrastructure problems.
            {resolvedIssues.length > 0 && (
              <span className="text-green-600 font-semibold ml-2">
                {resolvedIssues.length} issues resolved
              </span>
            )}
          </p>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {resolvedIssues.map((issue) => (
            <div
              key={issue._id}
              className="transform transition-all duration-300 hover:scale-[1.02]"
              data-aos="fade-up"
            >
              <IssueCard issue={issue} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to="/issues?status=resolved"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          >
            View All Resolved Issues
            <FaArrowRight />
          </Link>
          <p className="text-gray-500 text-sm mt-3">
            Click on any issue card to see detailed information
          </p>
        </div>

        {/* Stats Summary */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">
              {resolvedIssues.length}
            </div>
            <div className="text-sm text-gray-600">Recently Resolved</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.max(...resolvedIssues.map(i => i.upvotes || 0))}
            </div>
            <div className="text-sm text-gray-600">Highest Upvotes</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(resolvedIssues.map(i => i.category)).size}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(resolvedIssues.map(i => i.reportedBy)).size}
            </div>
            <div className="text-sm text-gray-600">Active Reporters</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResolvedIssuesSection;