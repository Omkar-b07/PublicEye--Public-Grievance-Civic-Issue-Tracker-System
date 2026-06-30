import React, { useState, useEffect } from 'react';
import { Building2, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { fetchDepartmentIssues, resolveIssue, escalateIssue } from '../api/issuesApi';

const PRIORITY_COLORS = {
    HIGH: 'text-red-600 bg-red-50',
    MEDIUM: 'text-yellow-600 bg-yellow-50',
    LOW: 'text-green-600 bg-green-50',
};

const Department = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await fetchDepartmentIssues();
            setIssues(data);
        } catch {
            toast.error('Failed to load department issues. Are you logged in as a department user?');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            const updated = await resolveIssue(id);
            setIssues(prev => prev.filter(i => i.id !== id));
            toast.success('Issue marked as Resolved! ✅');
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Failed to resolve issue');
        }
    };

    const handleEscalate = async (id) => {
        const confirmed = window.confirm('Escalate this issue to Senior Authority? This flags it as overdue or requiring intervention.');
        if (!confirmed) return;
        try {
            await escalateIssue(id);
            setIssues(prev => prev.filter(i => i.id !== id));
            toast.success('Issue escalated to Senior Authority ⚠️');
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Failed to escalate issue');
        }
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const filtered = issues.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 size={28} className="text-blue-600" />
                    Department Dashboard
                </h1>
                <p className="text-gray-500 text-sm mt-1">Manage and resolve civic issues assigned to your department.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Assigned', value: issues.length, color: 'border-t-blue-400' },
                    { label: 'High Priority', value: issues.filter(i => i.priority === 'HIGH').length, color: 'border-t-red-400' },
                    { label: 'Escalated', value: issues.filter(i => i.escalated_at).length, color: 'border-t-orange-400' },
                ].map((s, idx) => (
                    <div key={idx} className={`glass-card p-4 text-center border-t-4 ${s.color}`}>
                        <div className="text-3xl font-extrabold text-gray-800">{s.value}</div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="glass-panel p-4 rounded-2xl">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-white/60 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all"
                        placeholder="Search assigned issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
                {loading ? (
                    <div className="h-64 flex items-center justify-center"><Loader /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/50">
                            <thead className="bg-white/40 border-b border-gray-200/50">
                                <tr>
                                    {['Issue', 'Category', 'Priority', 'Date Assigned', 'Actions'].map(h => (
                                        <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50">
                                {filtered.length > 0 ? filtered.map((issue) => (
                                    <tr key={issue.id} className={`hover:bg-white/60 transition-colors ${issue.escalated_at ? 'bg-orange-50/40' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {issue.image_url && (
                                                    <img className="h-10 w-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                                        src={issue.image_url.startsWith('http') ? issue.image_url : `${apiUrl}${issue.image_url}`} alt="" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{issue.title}</div>
                                                    <div className="text-xs text-gray-500">{issue.address || `${issue.latitude?.toFixed(3)}, ${issue.longitude?.toFixed(3)}`}</div>
                                                    {issue.escalated_at && (
                                                        <span className="text-xs font-semibold text-orange-600">⚠️ Escalated</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{issue.category}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.MEDIUM}`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(issue.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleResolve(issue.id)}
                                                    className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-green-200 transition-colors"
                                                >
                                                    <CheckCircle2 size={13} /> Resolve
                                                </button>
                                                {!issue.escalated_at && (
                                                    <button
                                                        onClick={() => handleEscalate(issue.id)}
                                                        className="text-orange-600 hover:text-white hover:bg-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-orange-200 transition-colors"
                                                    >
                                                        <AlertTriangle size={13} /> Escalate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            {issues.length === 0
                                                ? 'No issues currently assigned to your department.'
                                                : 'No issues match your search.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Department;
