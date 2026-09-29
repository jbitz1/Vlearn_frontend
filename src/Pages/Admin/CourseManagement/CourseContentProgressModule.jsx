import React, { useState, useEffect } from 'react';
import {
    Layers, ArrowRight, CheckCircle2, Clock, AlertTriangle,
    BookOpen, Loader2, Sparkles, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import apiClient from '../../../config/apiClient';

export default function CourseContentProgressModule() {
    const navigate = useNavigate();
    const [overviewData, setOverviewData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOverview = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get('/api/curriculum/course-management/overview/');
                setOverviewData(res.data || []);
            } catch (err) {
                console.error('Failed to load course overview:', err);
                setError('Failed to load course content progression.');
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    // Filter to active grades with defined units or active curricula
    const activeGrades = overviewData.filter(g => g.units_defined > 0 || g.subjects_count > 0);

    // Platform aggregates
    const totalDefined = overviewData.reduce((acc, g) => acc + (g.units_defined || 0), 0);
    const totalPublished = overviewData.reduce((acc, g) => acc + (g.units_published || 0), 0);
    const totalDrafts = overviewData.reduce((acc, g) => acc + (g.draft_units || 0), 0);
    const totalPendingMedia = overviewData.reduce((acc, g) => acc + (g.pending_asset_count || 0), 0);
    const overallPercent = totalDefined > 0 ? Math.round((totalPublished / totalDefined) * 100) : 0;

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-6">
            {/* Module Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <Layers className="w-5 h-5 text-custom-blue" />
                        Course Content Progress
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Live progression from ingested syllabus units to generated and published student-facing lessons.
                    </p>
                </div>

                <Link
                    to="/admin-dashboard/course-management"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-custom-blue text-white rounded-xl text-xs font-bold hover:bg-custom-blue/90 shadow-sm transition self-start sm:self-auto"
                >
                    <span>Open Course Management</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Platform Health Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-gray-100">
                <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Defined Units</span>
                    <span className="text-xl font-extrabold text-gray-900">{totalDefined}</span>
                </div>
                <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Published Lessons</span>
                    <span className="text-xl font-extrabold text-emerald-600">
                        {totalPublished} <span className="text-xs text-gray-400 font-normal">({overallPercent}%)</span>
                    </span>
                </div>
                <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Draft Lessons</span>
                    <span className="text-xl font-extrabold text-amber-600">{totalDrafts}</span>
                </div>
                <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Pending Media</span>
                    <span className={`text-xl font-extrabold ${totalPendingMedia > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                        {totalPendingMedia}
                    </span>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="py-12 text-center">
                    <Loader2 className="w-7 h-7 text-custom-blue animate-spin mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-500">Calculating curriculum completion rates...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                    {error}
                </div>
            )}

            {/* Active Levels Progress List */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeGrades.map((grade) => {
                        const def = grade.units_defined || 0;
                        const pub = grade.units_published || 0;
                        const gen = grade.units_generated || 0;
                        const pct = def > 0 ? Math.round((pub / def) * 100) : 0;

                        return (
                            <div
                                key={grade.grade_id}
                                onClick={() => navigate(`/admin-dashboard/course-management?curriculum=${grade.curriculum_id}&grade=${grade.grade_id}`)}
                                className="p-4 rounded-2xl bg-white border border-gray-200/70 hover:border-custom-blue/60 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-custom-blue" />
                                            <h4 className="font-bold text-gray-900 text-sm group-hover:text-custom-blue transition">
                                                {grade.grade_name}
                                            </h4>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-md">
                                            {grade.curriculum_name}
                                        </span>
                                    </div>

                                    {/* Progression Fraction */}
                                    <div className="text-xs text-gray-600 mb-2 flex items-center justify-between">
                                        <span>
                                            <span className="font-semibold text-gray-800">{gen}/{def}</span> generated
                                        </span>
                                        <span>
                                            <span className="font-bold text-emerald-600">{pub}/{def}</span> published ({pct}%)
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
                                        <div
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Bottom status pills */}
                                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        {grade.draft_units > 0 && (
                                            <span className="text-amber-700 font-medium">
                                                {grade.draft_units} {grade.draft_units === 1 ? 'draft' : 'drafts'}
                                            </span>
                                        )}
                                        {grade.pending_asset_count > 0 && (
                                            <span className="text-rose-600 font-medium flex items-center gap-0.5">
                                                <AlertTriangle className="w-3 h-3" /> {grade.pending_asset_count} media
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-custom-blue font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                        Manage <ChevronRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
