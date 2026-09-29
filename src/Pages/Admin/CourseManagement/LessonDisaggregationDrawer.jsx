import React, { useState, useEffect } from 'react';
import {
    X, CheckCircle2, Clock, Layers, ExternalLink, Play, AlertTriangle,
    Atom, Video, Image as ImageIcon, FileText, Sparkles, Loader2, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router';
import apiClient from '../../../config/apiClient';

export default function LessonDisaggregationDrawer({
    lessonId,
    isOpen = false,
    onClose,
}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('anatomy'); // 'anatomy' | 'assets'

    useEffect(() => {
        if (!isOpen || !lessonId) {
            setData(null);
            setError(null);
            return;
        }

        const fetchDisaggregation = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiClient.get(`/api/curriculum/course-management/lesson-disaggregation/?lesson_id=${lessonId}`);
                setData(res.data);
            } catch (err) {
                console.error('Failed to load lesson disaggregation:', err);
                setError('Failed to load lesson components. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDisaggregation();
    }, [isOpen, lessonId]);

    if (!isOpen) return null;

    const lesson = data?.lesson;
    const summary = data?.summary || {};
    const blocks = data?.blocks || [];
    const assets = data?.assets || [];

    // Group blocks by page_number
    const blocksByPage = blocks.reduce((acc, b) => {
        const page = b.page_number || 1;
        if (!acc[page]) acc[page] = [];
        acc[page].push(b);
        return acc;
    }, {});

    const sortedPages = Object.keys(blocksByPage).map(Number).sort((a, b) => a - b);

    // Get asset icon helper
    const getAssetIcon = (type = '') => {
        if (type === 'simulation') return <Atom className="w-4 h-4 text-purple-600" />;
        if (type === 'youtube' || type === 'video') return <Video className="w-4 h-4 text-rose-600" />;
        return <ImageIcon className="w-4 h-4 text-blue-600" />;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
                    
                    {/* Header */}
                    <div className="p-5 sm:p-6 border-b border-gray-100 bg-slate-50/80 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                <span>{lesson?.curriculum_name || 'Curriculum'}</span>
                                <span>•</span>
                                <span>{lesson?.grade_name}</span>
                                <span>•</span>
                                <span className="text-custom-blue">{lesson?.subject_name}</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 truncate leading-snug">
                                {lesson?.title || 'Lesson Components Inspection'}
                            </h2>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                                <span>Topic: {lesson?.topic_name}</span>
                                {lesson?.status && (
                                    <>
                                        <span>•</span>
                                        <span className={`inline-flex items-center gap-1 font-semibold ${
                                            lesson.status === 'published' ? 'text-emerald-700' : 'text-amber-700'
                                        }`}>
                                            {lesson.status === 'published' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            {lesson.status.toUpperCase()} (v{lesson.version || 1})
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Quick Action Navigation Bar */}
                    {lesson && (
                        <div className="px-6 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between text-xs font-medium">
                            <div className="flex items-center gap-3">
                                <Link
                                    to={`/admin-dashboard/content-studio/${lesson.learning_unit_id}`}
                                    className="inline-flex items-center gap-1.5 text-custom-blue hover:underline font-semibold"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Edit in Content Studio</span>
                                </Link>
                                <span>•</span>
                                <a
                                    href={`/student/lesson-viewer/?lessonId=${lesson.id}&preview=true`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-emerald-600 hover:underline font-semibold"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Student Preview</span>
                                </a>
                            </div>

                            {summary.pending_assets_count > 0 && (
                                <span className="inline-flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
                                    <AlertTriangle className="w-3 h-3" />
                                    {summary.pending_assets_count} Pending Media
                                </span>
                            )}
                        </div>
                    )}

                    {/* Summary KPI Strip */}
                    <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Blocks</span>
                            <span className="text-base font-bold text-gray-900">{summary.total_blocks || 0}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pages</span>
                            <span className="text-base font-bold text-gray-900">{summary.total_pages || 1}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Assets</span>
                            <span className="text-base font-bold text-custom-blue">{summary.total_assets || 0}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pending</span>
                            <span className={`text-base font-bold ${summary.pending_assets_count > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                                {summary.pending_assets_count || 0}
                            </span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto whitespace-nowrap border-b border-gray-200 px-6 bg-white scrollbar-none">
                        <button
                            type="button"
                            onClick={() => setActiveTab('anatomy')}
                            className={`py-3 px-4 font-semibold text-xs border-b-2 transition ${
                                activeTab === 'anatomy'
                                    ? 'border-custom-blue text-custom-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Lesson Anatomy ({blocks.length} Blocks)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('assets')}
                            className={`py-3 px-4 font-semibold text-xs border-b-2 transition ${
                                activeTab === 'assets'
                                    ? 'border-custom-blue text-custom-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Visual Assets ({assets.length} Media)
                        </button>
                    </div>

                    {/* Drawer Body Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {loading && (
                            <div className="py-20 text-center">
                                <Loader2 className="w-8 h-8 text-custom-blue animate-spin mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-500">Inspecting lesson components...</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                                {error}
                            </div>
                        )}

                        {!loading && !error && activeTab === 'anatomy' && (
                            <div className="space-y-6">
                                {sortedPages.map((pageNum) => (
                                    <div key={pageNum} className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-100">
                                            <span>Page {pageNum}</span>
                                            <span>({blocksByPage[pageNum].length} components)</span>
                                        </div>

                                        <div className="space-y-2.5">
                                            {blocksByPage[pageNum].map((b, idx) => (
                                                <div
                                                    key={b.id}
                                                    className="bg-gray-50/70 hover:bg-slate-50 rounded-xl p-3.5 border border-gray-200/70 transition"
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-5 h-5 rounded-md bg-gray-200/80 text-[11px] font-bold text-gray-600 flex items-center justify-center">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white text-gray-800 border border-gray-200 uppercase tracking-tight">
                                                                {b.component_type || b.block_type}
                                                            </span>
                                                            {b.component_tag && b.component_tag !== b.component_type && (
                                                                <span className="text-[10px] text-gray-400 font-mono">
                                                                    tag: {b.component_tag}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400">Order: {b.order}</span>
                                                    </div>

                                                    {/* Text preview */}
                                                    {b.content_preview && (
                                                        <p className="text-xs text-gray-600 font-normal line-clamp-2 mt-1 leading-relaxed pl-7">
                                                            {b.content_preview}
                                                        </p>
                                                    )}

                                                    {/* Attached Assets */}
                                                    {b.assets?.length > 0 && (
                                                        <div className="mt-2.5 pl-7 flex flex-wrap gap-2">
                                                            {b.assets.map((ast) => (
                                                                <span
                                                                    key={ast.id}
                                                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 shadow-2xs"
                                                                >
                                                                    {getAssetIcon(ast.asset_type)}
                                                                    <span className="font-medium truncate max-w-[150px]">
                                                                        {ast.title || ast.asset_type}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 capitalize">
                                                                        ({ast.status})
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && !error && activeTab === 'assets' && (
                            <div className="space-y-3">
                                {assets.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-gray-400 italic">
                                        No visual assets attached to this lesson.
                                    </div>
                                ) : (
                                    assets.map((ast) => (
                                        <div
                                            key={ast.id}
                                            className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs hover:shadow-sm transition flex items-start justify-between gap-4"
                                        >
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    {getAssetIcon(ast.asset_type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                                            {ast.asset_type}
                                                        </span>
                                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                                            ast.status === 'attached' || ast.status === 'approved'
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-rose-50 text-rose-700'
                                                        }`}>
                                                            {ast.status}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">
                                                            src: {ast.source_type}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900 text-sm mt-1 truncate">
                                                        {ast.title || 'Untitled Asset'}
                                                    </h4>
                                                    {ast.description && (
                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                            {ast.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* External preview link */}
                                            {ast.url && (
                                                <a
                                                    href={ast.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg bg-gray-50 hover:bg-custom-blue hover:text-white text-gray-600 transition flex-shrink-0"
                                                    title="Open Asset in new tab"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Viewing Lesson ID #{lesson?.id}
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition"
                        >
                            Close Drawer
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
