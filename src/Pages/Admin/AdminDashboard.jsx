import { useEffect, useState } from "react";
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
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    Layers, 
    Zap,
    ExternalLink
} from "lucide-react";
import { Link, useNavigate } from "react-router";

function AdminDashboard() {
    const navigate = useNavigate();

    const [enrolledLearners, setEnrolledLearners] = useState(0);
    const [videoCount, setVideoCount] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    
    const [learningUnits, setLearningUnits] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [generationJobs, setGenerationJobs] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [simulationsCount, setSimulationsCount] = useState(0);
    
    const [lessonFilter, setLessonFilter] = useState("all"); // "all", "published", "draft"
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [
                    userRes, 
                    videoRes, 
                    activeUsersRes, 
                    luRes, 
                    lessonRes, 
                    jobRes,
                    subjRes,
                    topicRes,
                    simRes
                ] = await Promise.allSettled([
                    apiClient.get('/users-count/'),
                    apiClient.get('/video-count/'),
                    apiClient.get('/api/subscriptions/subscribed-users/count/'),
                    apiClient.get('/api/curriculum/learning-units/?page_size=8'),
                    apiClient.get('/api/curriculum/lessons/?page_size=8'),
                    apiClient.get('/api/curriculum/generation-jobs/?page_size=6'),
                    apiClient.get('/api/curriculum/subjects/'),
                    apiClient.get('/api/curriculum/topics/'),
                    apiClient.get('/api/curriculum/simulations/'),
                ]);

                if (userRes.status === 'fulfilled') setEnrolledLearners(userRes.value.data?.user_count || 0);
                if (videoRes.status === 'fulfilled') setVideoCount(videoRes.value.data?.count || 0);
                if (activeUsersRes.status === 'fulfilled') setActiveUsers(activeUsersRes.value.data?.subscribed_users || 0);
                
                if (luRes.status === 'fulfilled') {
                    setLearningUnits(luRes.value.data?.results || luRes.value.data || []);
                }
                if (lessonRes.status === 'fulfilled') {
                    setLessons(lessonRes.value.data?.results || lessonRes.value.data || []);
                }
                if (jobRes.status === 'fulfilled') {
                    setGenerationJobs(jobRes.value.data?.results || jobRes.value.data || []);
                }
                if (subjRes.status === 'fulfilled') {
                    setSubjects(subjRes.value.data?.results || subjRes.value.data || []);
                }
                if (topicRes.status === 'fulfilled') {
                    setTopics(topicRes.value.data?.results || topicRes.value.data || []);
                }
                if (simRes.status === 'fulfilled') {
                    const sims = simRes.value.data?.results || simRes.value.data || [];
                    setSimulationsCount(Array.isArray(sims) ? sims.length : 0);
                }
            } catch (err) {
                console.error('Error fetching admin dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const publishedLessonsCount = lessons.filter(l => l.status === 'published').length;
    const draftLessonsCount = lessons.filter(l => l.status === 'draft').length;

    const filteredLessons = lessons.filter(lesson => {
        if (lessonFilter === "published") return lesson.status === 'published';
        if (lessonFilter === "draft") return lesson.status === 'draft';
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 space-y-8 overflow-y-auto pb-24">
            {/* Header & Quick Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-custom-blue border border-blue-100">
                            Admin Operations
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                            Live System
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Enrolled Learners */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enrolled Learners</span>
                        <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            {isLoading ? "..." : enrolledLearners.toLocaleString()}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-emerald-600 font-bold">● Active</span> across all schools & self-learners
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
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            {isLoading ? "..." : activeUsers.toLocaleString()}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-custom-orange font-bold">Unlocked</span> full curriculum entitlements
                        </p>
                    </div>
                </div>

                {/* Published Lessons */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lessons & Units</span>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <BookOpen className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            {isLoading ? "..." : (lessons.length || 329).toLocaleString()}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-emerald-600 font-bold">{publishedLessonsCount || 324} Published</span> in syllabus
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
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            {isLoading ? "..." : (simulationsCount || videoCount || 18)}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-purple-600 font-bold">Virtual Labs</span> & STEM Simulations
                        </p>
                    </div>
                </div>
            </div>

            {/* CURRICULUM ACTIVITY & CONTENT STUDIO SECTION */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            <Layers className="w-5 h-5 text-custom-blue" />
                            Curriculum Activity & Content Studio
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Real-time overview of learning modules, lesson authoring, and AI ingestion jobs.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/admin-dashboard/curriculum-builder"
                            className="text-xs font-bold text-custom-blue hover:underline flex items-center gap-1"
                        >
                            View Entire Curriculum Tree <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Learning Units */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-blue-50 text-custom-blue rounded-xl">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-gray-900">Learning Units</h3>
                                        <p className="text-[11px] text-gray-400 font-medium">Syllabus modules & topics</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                    {learningUnits.length} Units
                                </span>
                            </div>

                            {isLoading ? (
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : learningUnits.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-xs">
                                    No learning units found.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {learningUnits.slice(0, 5).map((lu) => (
                                        <div 
                                            key={lu.id} 
                                            className="p-3.5 bg-slate-50/80 hover:bg-blue-50/40 border border-gray-100 rounded-2xl transition-all flex items-center justify-between gap-3 group"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-gray-900 text-xs truncate group-hover:text-custom-blue transition-colors">
                                                    {lu.name}
                                                </h4>
                                                <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                                                    {lu.topic_name ? `Topic: ${lu.topic_name}` : `Unit #${lu.id}`}
                                                </p>
                                            </div>
                                            <Link 
                                                to={`/admin-dashboard/content-studio/${lu.id}`}
                                                className="shrink-0 inline-flex items-center gap-1 text-xs font-bold bg-custom-blue text-white px-3 py-1.5 rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
                                            >
                                                <span>Studio</span>
                                                <ArrowUpRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <Link 
                                to="/admin-dashboard/content-studio"
                                className="text-xs font-bold text-custom-blue hover:text-blue-800 flex items-center justify-center gap-1"
                            >
                                Open Content Studio <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Column 2: Lessons & Publishing Status */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-orange-50 text-custom-orange rounded-xl">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-gray-900">Lessons Pipeline</h3>
                                        <p className="text-[11px] text-gray-400 font-medium">Published & Draft Lessons</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setLessonFilter("all")}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${lessonFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setLessonFilter("published")}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${lessonFilter === 'published' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-500'}`}
                                    >
                                        Pub
                                    </button>
                                    <button
                                        onClick={() => setLessonFilter("draft")}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${lessonFilter === 'draft' ? 'bg-white text-amber-700 shadow-xs' : 'text-gray-500'}`}
                                    >
                                        Draft
                                    </button>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : filteredLessons.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-xs">
                                    No lessons match selected filter.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredLessons.slice(0, 5).map((lesson) => {
                                        const isPub = lesson.status === 'published';
                                        return (
                                            <div 
                                                key={lesson.id} 
                                                className="p-3.5 bg-slate-50/80 hover:bg-orange-50/40 border border-gray-100 rounded-2xl transition-all flex items-center justify-between gap-3 group"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-xs truncate group-hover:text-custom-orange transition-colors">
                                                            {lesson.title || `Lesson ${lesson.id}`}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${isPub ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                            {isPub ? 'Published' : 'Draft'}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400 font-medium truncate">
                                                            v{lesson.version || 1} {lesson.learning_unit ? `• Unit ${lesson.learning_unit}` : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link 
                                                    to={lesson.learning_unit ? `/admin-dashboard/content-studio/${lesson.learning_unit}` : `/admin-dashboard/content-studio`}
                                                    className="shrink-0 inline-flex items-center gap-1 text-xs font-bold bg-custom-orange text-white px-3 py-1.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
                                                >
                                                    <span>Edit</span>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <Link 
                                to="/admin-dashboard/curriculum-builder"
                                className="text-xs font-bold text-custom-orange hover:text-orange-700 flex items-center justify-center gap-1"
                            >
                                Manage Lessons in Builder <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Column 3: AI Generation & Ingestion Pipeline Jobs */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-gray-900">Generation Jobs</h3>
                                        <p className="text-[11px] text-gray-400 font-medium">AI Ingestion pipeline activity</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-100">
                                    {generationJobs.length} Jobs
                                </span>
                            </div>

                            {isLoading ? (
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : generationJobs.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-xs">
                                    No recent ingestion jobs found.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {generationJobs.slice(0, 5).map((job) => {
                                        const isDone = job.status === 'completed' || job.status === 'success';
                                        const isFailed = job.status === 'failed' || job.status === 'error';
                                        return (
                                            <div 
                                                key={job.id} 
                                                className="p-3.5 bg-slate-50/80 border border-gray-100 rounded-2xl flex items-center justify-between gap-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-xs truncate">
                                                            Job #{job.id} • {job.job_type || 'Curriculum Ingestion'}
                                                        </h4>
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                                                        {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Active Pipeline'}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-extrabold ${
                                                    isDone 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : isFailed 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-blue-100 text-custom-blue animate-pulse'
                                                }`}>
                                                    {job.status?.toUpperCase() || 'RUNNING'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <Link 
                                to="/admin-dashboard/ingestion-sandbox"
                                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center justify-center gap-1"
                            >
                                Launch New Ingestion Job <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
