import { useEffect, useState, useMemo } from "react";
import apiClient from "../../config/apiClient";
import { 
    Users, 
    UserCheck, 
    BookOpen, 
    FileText, 
    Activity, 
    FolderTree, 
    Cpu, 
    Sparkles, 
    ChevronRight, 
    ChevronLeft,
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    Layers, 
    Zap,
    ExternalLink,
    Flag,
    Eye,
    GraduationCap,
    Play
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import CourseContentProgressModule from "./CourseManagement/CourseContentProgressModule";
import IssueDetailModal from "./IssueDetailModal";

function AdminDashboard() {
    const navigate = useNavigate();

    const [enrolledLearners, setEnrolledLearners] = useState(0);
    const [subscribedLearners, setSubscribedLearners] = useState(0);
    const [otherUsersCount, setOtherUsersCount] = useState(0);
    const [teachersCount, setTeachersCount] = useState(0);
    const [schoolAdminsCount, setSchoolAdminsCount] = useState(0);
    const [simulationsCount, setSimulationsCount] = useState(0);
    const [courseOverview, setCourseOverview] = useState([]);
    const [issueReports, setIssueReports] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [issueFilter, setIssueFilter] = useState("all"); // "all", "open", "resolved"
    const [issuePage, setIssuePage] = useState(1);
    const ISSUES_PER_PAGE = 5;
    const [isLoading, setIsLoading] = useState(true);

    const getStudioLink = (issue) => {
        if (!issue) return '/admin-dashboard/content-studio';
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
        if (issue.visualization_type === 'simulation' || issue.issue_type === 'simulation_broken' || issue.issue_type === 'controls_broken') {
            const simName = issue.visualization_title || '';
            return `/simulations${simName ? `?sim=${encodeURIComponent(simName)}` : ''}`;
        }
        return '/admin-dashboard/content-studio';
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [
                    userRes, 
                    activeUsersRes, 
                    simRes,
                    overviewRes,
                    issueRes
                ] = await Promise.allSettled([
                    apiClient.get('/users-count/'),
                    apiClient.get('/api/subscriptions/subscribed-users/count/'),
                    apiClient.get('/api/curriculum/simulations/'),
                    apiClient.get('/api/curriculum/course-management/overview/'),
                    apiClient.get('/api/curriculum/visualization-issues/'),
                ]);

                if (userRes.status === 'fulfilled') {
                    const uData = userRes.value.data || {};
                    setEnrolledLearners(uData.enrolled_learners ?? uData.user_count ?? 0);
                    setOtherUsersCount(uData.other_users ?? 0);
                    setTeachersCount(uData.teachers ?? 0);
                    setSchoolAdminsCount(uData.school_admins ?? 0);
                }
                if (activeUsersRes.status === 'fulfilled') {
                    setSubscribedLearners(activeUsersRes.value.data?.subscribed_users || 0);
                }
                
                if (simRes.status === 'fulfilled') {
                    const simData = simRes.value.data;
                    const count = simData?.count ?? (Array.isArray(simData?.results) ? simData.results.length : Array.isArray(simData) ? simData.length : 0);
                    setSimulationsCount(count);
                }
                if (overviewRes.status === 'fulfilled') {
                    setCourseOverview(overviewRes.value.data || []);
                }
                if (issueRes.status === 'fulfilled') {
                    setIssueReports(issueRes.value.data?.results || issueRes.value.data || []);
                }
            } catch (err) {
                console.error('Error fetching admin dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleResolveIssue = async (issueId, notes = "Resolved by platform admin.") => {
        try {
            await apiClient.post(`/api/curriculum/visualization-issues/${issueId}/resolve/`, {
                resolution_notes: notes
            });
            setIssueReports(prev => prev.map(issue => 
                issue.id === issueId ? { 
                    ...issue, 
                    status: 'resolved',
                    resolved_at: new Date().toISOString(),
                    resolution_notes: notes 
                } : issue
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
            console.error("Failed to resolve issue:", err);
            alert("Failed to mark issue as resolved.");
        }
    };

    const totalDefinedUnits = courseOverview.reduce((acc, g) => acc + (g.units_defined || 0), 0);
    const totalGeneratedLessons = courseOverview.reduce((acc, g) => acc + (g.units_generated || 0), 0);
    const totalPublishedLessons = courseOverview.reduce((acc, g) => acc + (g.units_published || 0), 0);

    const filteredIssues = useMemo(() => {
        return issueReports.filter(issue => {
            if (issueFilter === "open") return issue.status !== 'resolved';
            if (issueFilter === "resolved") return issue.status === 'resolved';
            return true;
        });
    }, [issueReports, issueFilter]);

    const totalIssuePages = Math.max(1, Math.ceil(filteredIssues.length / ISSUES_PER_PAGE));
    const safePage = Math.min(issuePage, totalIssuePages);

    const paginatedIssues = useMemo(() => {
        const start = (safePage - 1) * ISSUES_PER_PAGE;
        return filteredIssues.slice(start, start + ISSUES_PER_PAGE);
    }, [filteredIssues, safePage]);

    return (
        <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 space-y-8 overflow-y-auto pb-24">
            {/* Header & Quick Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-custom-blue border border-blue-100">
                            Admin Operations
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Platform Administration Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage curriculum hierarchy, content studio units, AI generation jobs, and system users.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to="/admin-dashboard/curriculum-builder"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:text-custom-blue hover:border-blue-200 text-xs font-bold shadow-sm transition-all"
                    >
                        <FolderTree className="w-4 h-4 text-custom-blue" />
                        Curriculum Builder
                    </Link>
                    <Link
                        to="/admin-dashboard/content-studio"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:text-custom-orange hover:border-orange-200 text-xs font-bold shadow-sm transition-all"
                    >
                        <Layers className="w-4 h-4 text-custom-orange" />
                        Content Studio
                    </Link>
                    <Link
                        to="/admin-dashboard/ingestion-sandbox"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-custom-blue text-white hover:bg-blue-800 text-xs font-bold shadow-sm transition-all"
                    >
                        <Cpu className="w-4 h-4" />
                        Ingestion Sandbox
                    </Link>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                {/* Enrolled Learners */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enrolled Learners</span>
                        <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {isLoading ? "..." : enrolledLearners.toLocaleString()}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-blue-600 font-bold">Have an account</span> • Registered learners
                        </p>
                    </div>
                </div>

                {/* Subscribed Learners */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subscribed Learners</span>
                        <div className="p-3 bg-orange-50 text-custom-orange rounded-2xl group-hover:scale-110 transition-transform">
                            <UserCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {isLoading ? "..." : subscribedLearners.toLocaleString()}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-custom-orange font-bold">Purchased subscriptions</span> • Active access
                        </p>
                    </div>
                </div>

                {/* Educators & Other Accounts */}
                <Link
                    to="/admin-dashboard/user-management"
                    className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-purple-200 transition-all cursor-pointer"
                    title="View educators, school admins, and staff in User Management"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Other Accounts</span>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {isLoading ? "..." : otherUsersCount.toLocaleString()}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-purple-600 font-bold">{teachersCount} Teachers</span> • {schoolAdminsCount} Admins
                        </p>
                    </div>
                </Link>

                {/* Published Lessons */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lessons</span>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <BookOpen className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {isLoading ? "..." : totalGeneratedLessons.toLocaleString()}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-emerald-600 font-bold">{totalPublishedLessons.toLocaleString()} Published</span>
                            {totalDefinedUnits > 0 && <span className="text-gray-400">/ {totalDefinedUnits.toLocaleString()} Units</span>}
                        </p>
                    </div>
                </div>

                {/* STEM Simulations */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interactive Labs</span>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Cpu className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {isLoading ? "..." : simulationsCount.toLocaleString()}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-purple-600 font-bold">Virtual Labs</span> & Sims
                        </p>
                    </div>
                </div>

                {/* Visual Issues & Teacher Feedback */}
                <Link
                    to="/admin-dashboard/reported-issues"
                    className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-rose-600 transition-colors">Reported Issues</span>
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Flag className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                {isLoading ? "..." : issueReports.filter(i => i.status !== 'resolved').length}
                            </h2>
                            <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                Manage Center →
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-rose-600 font-bold">{issueReports.length} Total</span> submitted
                        </p>
                    </div>
                </Link>
            </div>

            {/* COURSE CONTENT PROGRESSION MODULE */}
            <CourseContentProgressModule />


            {/* VISUALIZATION ISSUE REPORTS & TEACHER FEEDBACK QUEUE */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                            <Flag className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                                    Visual Issue Reports & Teacher Feedback
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 whitespace-nowrap shrink-0">
                                    {issueReports.filter(i => i.status !== 'resolved').length} Open
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                User-submitted issues on interactive simulations, diagrams, videos, and pedagogical notes.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => { setIssueFilter("all"); setIssuePage(1); }}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${issueFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
                            >
                                All ({issueReports.length})
                            </button>
                            <button
                                onClick={() => { setIssueFilter("open"); setIssuePage(1); }}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${issueFilter === 'open' ? 'bg-white text-rose-700 shadow-xs' : 'text-gray-500'}`}
                            >
                                Open ({issueReports.filter(i => i.status !== 'resolved').length})
                            </button>
                            <button
                                onClick={() => { setIssueFilter("resolved"); setIssuePage(1); }}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${issueFilter === 'resolved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-500'}`}
                            >
                                Resolved ({issueReports.filter(i => i.status === 'resolved').length})
                            </button>
                        </div>

                        <Link
                            to="/admin-dashboard/reported-issues"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
                        >
                            <span>Open Issues Center</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-400 text-xs">Loading issue reports...</div>
                ) : filteredIssues.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        No issues matching the filter. All clear!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="p-3.5">Issue Type</th>
                                    <th className="p-3.5">Visualization / Context</th>
                                    <th className="p-3.5">Details & Feedback</th>
                                    <th className="p-3.5">Reporter</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {paginatedIssues.map((issue) => (
                                    <tr key={issue.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="p-3.5 font-bold">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                                issue.issue_type === 'teacher_feedback'
                                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                    : issue.issue_type === 'simulation_broken'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                            }`}>
                                                {issue.issue_type_display || issue.issue_type}
                                            </span>
                                        </td>
                                        <td className="p-3.5 max-w-[220px]">
                                            <div className="font-bold text-gray-900 truncate">
                                                {issue.visualization_title || issue.block_title || 'Visual Component'}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-normal truncate mt-0.5">
                                                {[issue.grade_name, issue.subject_name, issue.lesson_title].filter(Boolean).join(' • ') || `Type: ${issue.visualization_type || issue.block_type || 'Unknown'}`}
                                            </div>
                                            {issue.block_page_number && (
                                                <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                                                    Page {issue.block_page_number}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3.5 max-w-[260px]">
                                            <div 
                                                onClick={() => setSelectedIssue(issue)}
                                                className="truncate text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
                                                title="Click to view full feedback"
                                            >
                                                {issue.description || 'No description provided.'}
                                            </div>
                                        </td>
                                        <td className="p-3.5 text-gray-500">
                                            <div className="font-medium text-gray-800">
                                                {issue.user_email || 'Anonymous / Student'}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {issue.user_role ? `Role: ${issue.user_role} • ` : ''}
                                                {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : ''}
                                            </div>
                                        </td>
                                        <td className="p-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                issue.status === 'resolved'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                            }`}>
                                                {issue.status === 'resolved' ? 'Resolved' : 'Open'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedIssue(issue)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                                                title="View complete feedback & issue details"
                                            >
                                                <Eye className="w-3 h-3" />
                                                View
                                            </button>
                                            {issue.status !== 'resolved' && (
                                                <button
                                                    onClick={() => handleResolveIssue(issue.id)}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer"
                                                >
                                                    Mark Resolved
                                                </button>
                                            )}
                                            {issue.visualization_type === 'simulation' || issue.issue_type === 'simulation_broken' || issue.issue_type === 'controls_broken' ? (
                                                <Link
                                                    to={getStudioLink(issue)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition-colors inline-block"
                                                    title="Launch live simulation"
                                                >
                                                    <Play className="w-3 h-3 fill-current" />
                                                    Test Sim
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={getStudioLink(issue)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-custom-blue text-white font-bold text-[11px] hover:bg-blue-800 transition-colors inline-block"
                                                    title="Open directly in Content Studio on this target block"
                                                >
                                                    Fix in Studio
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {!isLoading && filteredIssues.length > ISSUES_PER_PAGE && (
                    <div className="px-4 py-3 bg-slate-50/70 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 rounded-b-2xl">
                        <div>
                            Showing <span className="font-bold text-gray-800">{(safePage - 1) * ISSUES_PER_PAGE + 1}</span> to <span className="font-bold text-gray-800">{Math.min(safePage * ISSUES_PER_PAGE, filteredIssues.length)}</span> of <span className="font-bold text-gray-800">{filteredIssues.length}</span> issues
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setIssuePage(prev => Math.max(1, prev - 1))}
                                disabled={safePage <= 1}
                                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                title="Previous Page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-gray-700">
                                Page {safePage} of {totalIssuePages}
                            </span>
                            <button
                                onClick={() => setIssuePage(prev => Math.min(totalIssuePages, prev + 1))}
                                disabled={safePage >= totalIssuePages}
                                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                title="Next Page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* QUICK OPERATIONS & NAVIGATION HUB */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                            Admin Operations Hub
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Direct access to platform management tools and system configurations.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
                    <Link
                        to="/admin-dashboard/curriculum-builder"
                        className="p-5 rounded-2xl border border-gray-200/80 hover:border-custom-blue/50 hover:bg-blue-50/20 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-custom-blue flex items-center justify-center mb-3 group-hover:bg-custom-blue group-hover:text-white transition-colors">
                                <FolderTree className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                                Curriculum Builder
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Organize subjects, topics, grade levels, and learning unit hierarchies.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-custom-blue mt-4 flex items-center gap-1">
                            Explore Builder →
                        </span>
                    </Link>

                    <Link
                        to="/admin-dashboard/content-studio"
                        className="p-5 rounded-2xl border border-gray-200/80 hover:border-custom-orange/50 hover:bg-orange-50/20 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-custom-orange flex items-center justify-center mb-3 group-hover:bg-custom-orange group-hover:text-white transition-colors">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-custom-orange transition-colors">
                                Content Studio
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Author interactive multi-page lessons, enrich SVGs, and configure blocks.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-custom-orange mt-4 flex items-center gap-1">
                            Open Studio →
                        </span>
                    </Link>

                    <Link
                        to="/admin-dashboard/ingestion-sandbox"
                        className="p-5 rounded-2xl border border-gray-200/80 hover:border-purple-300 hover:bg-purple-50/20 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                Ingestion Sandbox
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                AI pipeline sandbox for bulk syllabus ingestion and markdown parsing.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-purple-700 mt-4 flex items-center gap-1">
                            Launch Pipeline →
                        </span>
                    </Link>

                    <Link
                        to="/admin-dashboard/user-management"
                        className="p-5 rounded-2xl border border-gray-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                User Management
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Manage student accounts, teacher assignments, and role permissions.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
                            Manage Users →
                        </span>
                    </Link>

                    <Link
                        to="/admin-dashboard/reported-issues"
                        className="p-5 rounded-2xl border border-gray-200/80 hover:border-rose-300 hover:bg-rose-50/20 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                <Flag className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-rose-700 transition-colors">
                                Reported Issues
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Investigate student/teacher reports on interactive simulations and lesson blocks.
                            </p>
                        </div>
                        <span className="text-xs font-bold text-rose-700 mt-4 flex items-center gap-1">
                            Resolve Issues ({issueReports.filter(i => i.status !== 'resolved').length}) →
                        </span>
                    </Link>
                </div>
            </div>

            {/* Reported Issue Detail Modal */}
            <IssueDetailModal
                issue={selectedIssue}
                onClose={() => setSelectedIssue(null)}
                onResolve={handleResolveIssue}
                getStudioLink={getStudioLink}
            />
        </div>
    );
}

export default AdminDashboard;
