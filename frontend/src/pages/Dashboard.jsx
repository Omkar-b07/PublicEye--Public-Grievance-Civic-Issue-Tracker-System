import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Map, LayoutGrid } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import Loader from '../components/Loader';
import MapComponent from '../components/MapComponent';
import { fetchIssues } from '../api/issuesApi';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

const Dashboard = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

    const loadIssues = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter !== 'all') params.status = filter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const data = await fetchIssues(params);
            setIssues(data);
        } catch (err) {
            toast.error('Failed to load issues. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, [filter, searchQuery]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadIssues();
        }, 400);
        return () => clearTimeout(timer);
    }, [loadIssues]);

    const handleUpvoteChange = (id, newCount, hasVoted) => {
        setIssues(prev =>
            prev.map(i => i.id === id
                ? { ...i, upvotes: newCount, user_has_upvoted: hasVoted }
                : i
            )
        );
    };

    const stats = [
        { label: 'Total Issues', value: issues.length, color: 'text-blue-600', border: 'border-t-blue-400' },
        { label: 'Pending', value: issues.filter(i => i.status === 'PENDING').length, color: 'text-yellow-600', border: 'border-t-yellow-400' },
        { label: 'In Progress', value: issues.filter(i => i.status === 'IN_PROGRESS').length, color: 'text-purple-600', border: 'border-t-purple-400' },
        { label: 'Resolved', value: issues.filter(i => i.status === 'RESOLVED').length, color: 'text-green-600', border: 'border-t-green-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Overview of all civic issues in your area.</p>
                </div>
                <Link
                    to="/report"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:-translate-y-0.5 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-300 w-full sm:w-auto justify-center"
                >
                    <Plus size={20} />
                    Report New Issue
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`glass-card p-5 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-300 border-t-4 ${stat.border}`}>
                        <span className="text-4xl font-extrabold text-gray-800 tracking-tight">{stat.value}</span>
                        <span className={`text-sm font-semibold mt-2 ${stat.color} uppercase tracking-wider`}>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Filters & View Toggle */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-white/60 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm transition-all duration-300 shadow-sm"
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <select
                        className="block pl-3 pr-10 py-2.5 text-base bg-white/60 border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm rounded-xl border transition-all duration-300 shadow-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        {STATUSES.map(s => (
                            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex rounded-xl border border-gray-200/50 overflow-hidden shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white/60 text-gray-500 hover:bg-white'}`}
                            title="Grid view"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2.5 transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-white/60 text-gray-500 hover:bg-white'}`}
                            title="Map view"
                        >
                            <Map size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader />
                </div>
            ) : viewMode === 'map' ? (
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="glass-card rounded-2xl overflow-hidden" style={{ height: '500px' }}>
                        <MapComponent
                            issues={issues.map(i => ({ lat: i.latitude, lng: i.longitude, title: i.title, id: i.id }))}
                            height="100%"
                        />
                    </div>
                </div>
            ) : issues.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    {issues.map(issue => (
                        <IssueCard key={issue.id} issue={issue} onUpvoteChange={handleUpvoteChange} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                    <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No issues found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters.</p>
                    <button
                        onClick={() => { setFilter('all'); setSearchQuery(''); }}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
