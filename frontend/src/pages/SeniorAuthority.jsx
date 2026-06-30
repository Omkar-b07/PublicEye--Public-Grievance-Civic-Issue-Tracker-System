import React, { useState, useEffect } from 'react';
import { Crown, AlertTriangle, Clock, CheckCircle2, Zap, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { fetchEscalatedIssues, fetchOverdueIssues, interveneIssue, triggerAutoEscalation } from '../api/issuesApi';

const SeniorAuthority = () => {
    const [escalated, setEscalated] = useState([]);
    const [overdue, setOverdue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('escalated'); // 'escalated' | 'overdue'
    const [triggering, setTriggering] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [esc, ovr] = await Promise.all([
                fetchEscalatedIssues(),
                fetchOverdueIssues(),
            ]);
            setEscalated(esc);
            setOverdue(ovr);
        } catch {
            toast.error('Failed to load escalated issues.');
        } finally {
            setLoading(false);
        }
    };

    const handleIntervene = async (id) => {
        if (!window.confirm('Force-resolve this issue as Senior Authority?')) return;
        try {
            const updated = await interveneIssue(id);
            setEscalated(prev => prev.filter(i => i.id !== id));
            setOverdue(prev => prev.filter(i => i.id !== id));
            toast.success('Issue force-resolved by senior authority ✅');
        } catch {
            toast.error('Failed to intervene');
        }
    };

    const handleAutoEscalate = async () => {
        setTriggering(true);
        try {
            const result = await triggerAutoEscalation();
            toast.success(result.message);
            await loadData();
        } catch {
            toast.error('Auto-escalation failed');
        } finally {
            setTriggering(false);
        }
    };

    const displayIssues = view === 'escalated' ? escalated : overdue;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Crown size={28} className="text-amber-500" />
                        Senior Authority
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Oversee escalated and overdue civic complaints.</p>
                </div>
                <button
                    onClick={handleAutoEscalate}
                    disabled={triggering}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-orange-300/40 hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                    <Zap size={16} />
                    {triggering ? 'Running...' : 'Run Auto-Escalation'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 text-center border-t-4 border-t-orange-400">
                    <div className="text-4xl font-extrabold text-gray-800">{escalated.length}</div>
                    <div className="text-sm font-semibold text-orange-600 uppercase mt-1">Manually Escalated</div>
                </div>
                <div className="glass-card p-4 text-center border-t-4 border-t-red-400">
                    <div className="text-4xl font-extrabold text-gray-800">{overdue.length}</div>
                    <div className="text-sm font-semibold text-red-600 uppercase mt-1">Overdue (72h+)</div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex rounded-2xl overflow-hidden border border-gray-200/60 glass-panel w-fit">
                <button
                    onClick={() => setView('escalated')}
                    className={`px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors ${view === 'escalated' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-white/60'}`}
                >
                    <AlertTriangle size={15} /> Escalated ({escalated.length})
                </button>
                <button
                    onClick={() => setView('overdue')}
                    className={`px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors ${view === 'overdue' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-white/60'}`}
                >
                    <Clock size={15} /> Overdue ({overdue.length})
                </button>
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
                                    {['Issue', 'Category', 'Priority', 'Created', view === 'escalated' ? 'Escalated At' : 'Age (hrs)', 'Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50">
                                {displayIssues.length > 0 ? displayIssues.map((issue) => {
                                    const ageHours = Math.floor((Date.now() - new Date(issue.created_at)) / 3600000);
                                    return (
                                        <tr key={issue.id} className="hover:bg-white/60 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-semibold text-gray-900">{issue.title}</div>
                                                    {issue.is_false_resolution && (
                                                        <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-red-200 shadow-sm flex items-center gap-1">
                                                            <Flag size={10} /> Disputed
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{issue.address || `${issue.latitude?.toFixed(3)}, ${issue.longitude?.toFixed(3)}`}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{issue.category}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${issue.priority === 'HIGH' ? 'bg-red-100 text-red-700' : issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                    {issue.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(issue.created_at + (issue.created_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                {view === 'escalated'
                                                    ? issue.escalated_at ? new Date(issue.escalated_at + (issue.escalated_at.endsWith('Z') ? '' : 'Z')).toLocaleString() : '—'
                                                    : <span className="font-bold text-red-600">{ageHours}h</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleIntervene(issue.id)}
                                                    className="flex items-center gap-1.5 text-white bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                                                >
                                                    <CheckCircle2 size={13} /> Force Resolve
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            {view === 'escalated'
                                                ? '✅ No manually escalated issues.'
                                                : '✅ No overdue issues (>72h). All issues are on track.'}
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

export default SeniorAuthority;
