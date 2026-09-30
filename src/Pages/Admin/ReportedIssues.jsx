import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import {
    Flag,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Layers,
    User,
    BookOpen,
    ExternalLink,
    Search,
    Filter,
    RefreshCw,
    Check,
    Cpu,
    ArrowUpRight,
    Eye,
    MessageSquare,
    Play,
    Sparkles,
    SlidersHorizontal,
    Video,
    HelpCircle
} from 'lucide-react';
import apiClient from '../../config/apiClient';
import IssueDetailModal from './IssueDetailModal';

export default function ReportedIssues() {
    const [issues, setIssues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('open'); // 'all', 'open', 'resolved'
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'simulation', 'video', 'content', 'teacher'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchIssues = async () => {
        try {
            const res = await apiClient.get('/api/curriculum/visualization-issues/');
            const data = res.data?.results || res.data || [];
            setIssues(data);
        } catch (err) {
            console.error('Failed to load visualization issues:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchIssues();
    };

    const handleResolveIssue = async (issueId, notes = 'Resolved by platform admin.') => {
        try {
            await apiClient.post(`/api/curriculum/visualization-issues/${issueId}/resolve/`, {
                resolution_notes: notes
            });
            setIssues(prev => prev.map(issue =>
                issue.id === issueId
                    ? {
                        ...issue,
                        status: 'resolved',
                        resolved_at: new Date().toISOString(),
                        resolution_notes: notes
                    }
                    : issue
            ));
            if (selectedIssue && selectedIssue.id === issueId) {
                setSelectedIssue(prev => ({
                    ...prev,
                    status: 'resolved',
                    resolved_at: new Date().toISOString(),
                    resolution_notes: notes
                }));
            }
        } catch (err) {
            console.error('Failed to resolve issue:', err);
            alert('Failed to mark issue as resolved.');
        }
    };

    // Calculate smart remediation link for each issue
    const getRemediationLink = (issue) => {
        if (!issue) return '/admin-dashboard/content-studio';

        // 1. If linked to curriculum lesson unit
        if (issue.learning_unit_id) {
            const params = new URLSearchParams();
            if (issue.lesson) params.set('lessonId', issue.lesson);
            if (issue.lesson_block) params.set('targetBlock', issue.lesson_block);
            if (issue.block_page_number) params.set('targetPage', issue.block_page_number);
            const qs = params.toString();
            return `/admin-dashboard/content-studio/${issue.learning_unit_id}${qs ? `?${qs}` : ''}`;
        }
        if (issue.lesson) {
            const params = new URLSearchParams();
            params.set('lessonId', issue.lesson);
            if (issue.lesson_block) params.set('targetBlock', issue.lesson_block);
            if (issue.block_page_number) params.set('targetPage', issue.block_page_number);
            return `/admin-dashboard/content-studio?${params.toString()}`;
        }

        // 2. If it is a simulation issue
        if (issue.visualization_type === 'simulation' || issue.issue_type === 'simulation_broken' || issue.issue_type === 'controls_broken') {
            const simName = issue.visualization_title || '';
            return `/simulations${simName ? `?sim=${encodeURIComponent(simName)}` : ''}`;
        }

        // 3. Fallback to Content Studio
        return '/admin-dashboard/content-studio';
    };

    const isSimulationIssue = (issue) => {
        return (
            issue.visualization_type === 'simulation' ||
            issue.issue_type === 'simulation_broken' ||
            issue.issue_type === 'controls_broken'
        );
    };

    // Filter calculations
    const openCount = useMemo(() => issues.filter(i => i.status !== 'resolved').length, [issues]);
    const resolvedCount = useMemo(() => issues.filter(i => i.status === 'resolved').length, [issues]);
    const simIssuesCount = useMemo(() => issues.filter(isSimulationIssue).length, [issues]);
    const lessonIssuesCount = useMemo(() => issues.filter(i => Boolean(i.lesson || i.lesson_block)).length, [issues]);

    const filteredIssues = useMemo(() => {
        return issues.filter(issue => {
            // Status filter
            if (statusFilter === 'open' && issue.status === 'resolved') return false;
            if (statusFilter === 'resolved' && issue.status !== 'resolved') return false;

            // Category filter
            if (categoryFilter === 'simulation') {
                if (!isSimulationIssue(issue)) return false;
            } else if (categoryFilter === 'video') {
                if (issue.issue_type !== 'youtube_unavailable' && issue.visualization_type !== 'youtube' && issue.visualization_type !== 'video') {
                    return false;
                }
            } else if (categoryFilter === 'content') {
                if (issue.issue_type !== 'content_error') return false;
            } else if (categoryFilter === 'teacher') {
                if (issue.issue_type !== 'teacher_feedback' && issue.visualization_type !== 'teacher_feedback') return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const titleMatch = (issue.visualization_title || '').toLowerCase().includes(q);
                const descMatch = (issue.description || '').toLowerCase().includes(q);
                const emailMatch = (issue.user_email || '').toLowerCase().includes(q);
                const lessonMatch = (issue.lesson_title || '').toLowerCase().includes(q);
                const subjectMatch = (issue.subject_name || '').toLowerCase().includes(q);
                const topicMatch = (issue.topic_name || '').toLowerCase().includes(q);
                if (!titleMatch && !descMatch && !emailMatch && !lessonMatch && !subjectMatch && !topicMatch) {
                    return false;
                }
            }

            return true;
        });
    }, [issues, statusFilter, categoryFilter, searchQuery]);

    const getIssueTypeBadge = (issueType) => {
        switch (issueType) {
            case 'simulation_broken':
                return {
                    label: 'Broken Simulation',
                    color: 'bg-rose-50 text-rose-700 border-rose-200',
                    icon: Cpu
                };
            case 'controls_broken':
                return {
                    label: 'Unresponsive Controls',
                    color: 'bg-amber-50 text-amber-800 border-amber-200',
                    icon: SlidersHorizontal
                };
            case 'youtube_unavailable':
                return {
                    label: 'Video Unavailable',
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: Video
                };
            case 'content_error':
                return {
                    label: 'Content Error',
                    color: 'bg-orange-50 text-orange-800 border-orange-200',
                    icon: AlertTriangle
                };
            case 'teacher_feedback':
                return {
                    label: 'Teacher Feedback',
                    color: 'bg-purple-50 text-purple-700 border-purple-200',
                    icon: MessageSquare
                };
            default:
                return {
                    label: 'General Issue',
                    color: 'bg-slate-100 text-slate-700 border-slate-200',
                    icon: HelpCircle
                };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 space-y-8 overflow-y-auto pb-24">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link to="/admin-dashboard" className="text-xs font-bold text-gray-500 hover:text-custom-blue transition-colors">
                            Admin Dashboard
                        </Link>
                        <span className="text-xs text-gray-400">/</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                            Remediation Center
                        </span>
                        {openCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
                                {openCount} Action Required
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
                        <Flag className="w-7 h-7 text-rose-600" />
                        Reported Content & Visual Issues
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 max-w-3xl">
                        Investigate and resolve learner- and teacher-reported problems across interactive simulations, video assets, formulas, and curriculum lesson blocks.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:text-custom-blue hover:border-blue-200 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-custom-blue' : ''}`} />
                        <span>Refresh Reports</span>
                    </button>
                    <Link
                        to="/admin-dashboard/content-studio"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-custom-blue text-white hover:bg-blue-800 text-xs font-bold shadow-sm transition-all"
                    >
                        <Layers className="w-4 h-4" />
                        <span>Content Studio</span>
                    </Link>
                </div>
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Open Issues */}
                <div
                    onClick={() => setStatusFilter('open')}
                    className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer ${
                        statusFilter === 'open'
                            ? 'border-rose-300 ring-2 ring-rose-100 shadow-md'
                            : 'border-gray-200/80 hover:border-rose-200 shadow-sm'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Review</span>
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-3xl font-extrabold text-gray-900">{openCount}</h2>
                        <p className="text-xs text-rose-600 font-semibold mt-0.5">
                            {openCount > 0 ? 'Requires administrative action' : 'All reports clear'}
                        </p>
                    </div>
                </div>

                {/* 2. Resolved Issues */}
                <div
                    onClick={() => setStatusFilter('resolved')}
                    className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer ${
                        statusFilter === 'resolved'
                            ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-md'
                            : 'border-gray-200/80 hover:border-emerald-200 shadow-sm'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resolved</span>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-3xl font-extrabold text-gray-900">{resolvedCount}</h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Total resolved issues
                        </p>
                    </div>
                </div>

                {/* 3. Simulations Broken */}
                <div
                    onClick={() => setCategoryFilter(categoryFilter === 'simulation' ? 'all' : 'simulation')}
                    className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer ${
                        categoryFilter === 'simulation'
                            ? 'border-purple-300 ring-2 ring-purple-100 shadow-md'
                            : 'border-gray-200/80 hover:border-purple-200 shadow-sm'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Simulations</span>
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
                            <Cpu className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-3xl font-extrabold text-gray-900">{simIssuesCount}</h2>
                        <p className="text-xs text-purple-600 font-semibold mt-0.5">
                            Simulation lab reports
                        </p>
                    </div>
                </div>

                {/* 4. Lesson / Block Content Issues */}
                <div
                    onClick={() => setCategoryFilter(categoryFilter === 'content' ? 'all' : 'content')}
                    className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer ${
                        categoryFilter === 'content'
                            ? 'border-blue-300 ring-2 ring-blue-100 shadow-md'
                            : 'border-gray-200/80 hover:border-blue-200 shadow-sm'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lesson Blocks</span>
                        <div className="p-2.5 bg-blue-50 text-custom-blue rounded-2xl">
                            <BookOpen className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-3xl font-extrabold text-gray-900">{lessonIssuesCount}</h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Direct curriculum blocks
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl self-start">
                        <button
                            onClick={() => setStatusFilter('open')}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                statusFilter === 'open'
                                    ? 'bg-white text-rose-700 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Open Pending ({openCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('resolved')}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                statusFilter === 'resolved'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Resolved ({resolvedCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                statusFilter === 'all'
                                    ? 'bg-white text-gray-900 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            All Reports ({issues.length})
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by visual title, lesson, subject, or reporter..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-2xl text-xs bg-slate-50 focus:bg-white focus:border-custom-blue outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                        Category Filter:
                    </span>
                    {[
                        { id: 'all', label: 'All Categories' },
                        { id: 'simulation', label: 'Interactive Simulations' },
                        { id: 'video', label: 'Video & YouTube' },
                        { id: 'content', label: 'Content Errors' },
                        { id: 'teacher', label: 'Teacher Feedback' }
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                categoryFilter === cat.id
                                    ? 'bg-custom-blue text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Issues Queue */}
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            <span>Issue Reports List</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                {filteredIssues.length} Shown
                            </span>
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Click on any report to view comprehensive details, inspect pedagogical coordinates, or mark resolved.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-16 text-center text-gray-400 text-xs">
                        <RefreshCw className="w-8 h-8 text-custom-blue animate-spin mx-auto mb-3" />
                        Loading issue reports from platform database...
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <div className="p-16 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">No issues found</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                                ? 'No reported issues match your active search and filter options.'
                                : 'Great job! There are currently no unresolved visualization or content issues.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="p-4">Classification</th>
                                    <th className="p-4">Visualization / Target Asset</th>
                                    <th className="p-4">Report Details & Feedback</th>
                                    <th className="p-4">Reporter</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Remediation Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {filteredIssues.map((issue) => {
                                    const typeBadge = getIssueTypeBadge(issue.issue_type);
                                    const TypeIcon = typeBadge.icon;
                                    const isResolved = issue.status === 'resolved';
                                    const isSim = isSimulationIssue(issue);
                                    const remediationLink = getRemediationLink(issue);

                                    return (
                                        <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* 1. Classification */}
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${typeBadge.color}`}>
                                                        <TypeIcon className="w-3.5 h-3.5" />
                                                        {issue.issue_type_display || typeBadge.label}
                                                    </span>
                                                    <div className="text-[10px] text-gray-400 font-mono">
                                                        ID #{issue.id}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. Target Asset / Context */}
                                            <td className="p-4 max-w-[260px]">
                                                <div className="font-bold text-gray-900 truncate">
                                                    {issue.visualization_title || issue.block_title || 'Visual Component'}
                                                </div>
                                                <div className="text-[11px] text-gray-500 font-normal truncate mt-0.5">
                                                    {[issue.grade_name, issue.subject_name, issue.lesson_title].filter(Boolean).join(' • ') ||
                                                        (isSim ? 'Interactive Virtual Lab' : `Type: ${issue.visualization_type || 'Unknown'}`)}
                                                </div>
                                                {issue.block_page_number && (
                                                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                                                        Page {issue.block_page_number}
                                                    </span>
                                                )}
                                            </td>

                                            {/* 3. Description / Feedback */}
                                            <td className="p-4 max-w-[280px]">
                                                <div
                                                    onClick={() => setSelectedIssue(issue)}
                                                    className="text-gray-700 line-clamp-2 hover:text-custom-blue cursor-pointer transition-colors leading-relaxed"
                                                    title="Click to view complete details"
                                                >
                                                    {issue.description || <span className="italic text-gray-400">No additional commentary provided.</span>}
                                                </div>
                                                {issue.resolution_notes && isResolved && (
                                                    <div className="mt-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 line-clamp-1">
                                                        <strong>Resolution:</strong> {issue.resolution_notes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* 4. Reporter */}
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {issue.user_name || issue.user_email || 'Anonymous / Learner'}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    {issue.user_role ? `Role: ${issue.user_role} • ` : ''}
                                                    {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'Recent'}
                                                </div>
                                            </td>

                                            {/* 5. Status */}
                                            <td className="p-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                                    isResolved
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    {isResolved ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                            Resolved
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3 h-3 text-rose-600" />
                                                            Open
                                                        </>
                                                    )}
                                                </span>
                                            </td>

                                            {/* 6. Remediation Actions */}
                                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                                {/* View Modal */}
                                                <button
                                                    onClick={() => setSelectedIssue(issue)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                                                    title="View detailed feedback modal"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>

                                                {/* Direct Remediation Links */}
                                                {isSim ? (
                                                    <Link
                                                        to={remediationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition-colors shadow-xs"
                                                        title="Launch live simulation to test issues"
                                                    >
                                                        <Play className="w-3 h-3 fill-current" />
                                                        Test Sim
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        to={remediationLink}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-custom-blue text-white font-bold text-[11px] hover:bg-blue-800 transition-colors shadow-xs"
                                                        title="Open in Content Studio to inspect and edit block"
                                                    >
                                                        <Layers className="w-3 h-3" />
                                                        Fix in Studio
                                                    </Link>
                                                )}

                                                {/* Quick Resolve Button */}
                                                {!isResolved && (
                                                    <button
                                                        onClick={() => handleResolveIssue(issue.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                                                        title="Mark this issue as resolved"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Resolve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detailed Inspection Modal */}
            <IssueDetailModal
                issue={selectedIssue}
                onClose={() => setSelectedIssue(null)}
                onResolve={handleResolveIssue}
                getStudioLink={getRemediationLink}
            />
        </div>
    );
}
