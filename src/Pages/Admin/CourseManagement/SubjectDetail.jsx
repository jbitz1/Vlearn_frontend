import React, { useState } from 'react';
import {
    ChevronDown, ChevronUp, CheckCircle2, Clock, Eye, AlertTriangle,
    Layers, ExternalLink, Play, Sparkles, FileText, ArrowLeft, Loader2,
    Atom, BookOpen, Video, Image as ImageIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useGeneration } from '../../../Context/GenerationContext';

export default function SubjectDetail({
    subject,
    hierarchy,
    loading = false,
    onBack,
    onInspectLesson,
    onRefresh,
    searchQuery = '',
}) {
    const navigate = useNavigate();
    const { startGeneration, isGeneratingUnit, setIsMonitorOpen } = useGeneration();
    const [expandedTopics, setExpandedTopics] = useState(new Set());

    // Initialize with all topics expanded by default once hierarchy loads
    React.useEffect(() => {
        if (hierarchy?.topics?.length) {
            setExpandedTopics(new Set(hierarchy.topics.map(t => t.id)));
        }
    }, [hierarchy]);

    // Auto-refresh hierarchy when a background lesson generation finishes
    React.useEffect(() => {
        const handleLessonGenerated = () => {
            if (onRefresh) onRefresh();
        };
        window.addEventListener('vlearn:lesson-generated', handleLessonGenerated);
        return () => {
            window.removeEventListener('vlearn:lesson-generated', handleLessonGenerated);
        };
    }, [onRefresh]);

    const toggleTopic = (topicId) => {
        setExpandedTopics(prev => {
            const next = new Set(prev);
            if (next.has(topicId)) {
                next.delete(topicId);
            } else {
                next.add(topicId);
            }
            return next;
        });
    };

    const expandAll = () => {
        if (hierarchy?.topics) {
            setExpandedTopics(new Set(hierarchy.topics.map(t => t.id)));
        }
    };

    const collapseAll = () => {
        setExpandedTopics(new Set());
    };

    const handleGenerate = async (unit) => {
        try {
            await startGeneration({
                learningUnitId: unit.id,
                unitTitle: unit.name,
                mode: 'learning_experience_planner',
            });
            setIsMonitorOpen(true);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Failed to trigger generation:', err);
        }
    };

    const topics = hierarchy?.topics || [];
    const filteredTopics = topics.filter(t => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const matchesTopic = t.name.toLowerCase().includes(q);
        const matchesUnit = t.units?.some(u => u.name.toLowerCase().includes(q));
        return matchesTopic || matchesUnit;
    });

    const subInfo = hierarchy?.subject || subject;
    const defined = subInfo.units_defined || 0;
    const published = subInfo.units_published || 0;
    const generated = subInfo.units_generated || 0;
    const drafts = subInfo.draft_or_review_units || 0;

    return (
        <div>
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200/80 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>All Subjects</span>
                    </button>
                    <div className="h-5 w-[1px] bg-gray-300" />
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {subInfo.curriculum_name} • {subInfo.grade_name}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {subInfo.name}
                        </h2>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={expandedTopics.size === topics.length ? collapseAll : expandAll}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                        {expandedTopics.size === topics.length ? 'Collapse All' : 'Expand All'}
                    </button>
                    <Link
                        to={`/admin-dashboard/curriculum-builder?subject=${subInfo.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-custom-blue bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Edit in Builder</span>
                    </Link>
                </div>
            </div>

            {/* Subject Summary KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Topics</span>
                    <div className="text-xl font-bold text-gray-900 mt-1">{topics.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Units Defined</span>
                    <div className="text-xl font-bold text-gray-900 mt-1">{defined}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Generated</span>
                    <div className="text-xl font-bold text-custom-blue mt-1">
                        {generated} <span className="text-xs text-gray-400 font-normal">/ {defined}</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Published</span>
                    <div className="text-xl font-bold text-emerald-600 mt-1">
                        {published} <span className="text-xs text-gray-400 font-normal">/ {defined}</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm col-span-2 sm:col-span-1">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Draft / Review</span>
                    <div className="text-xl font-bold text-amber-600 mt-1">{drafts}</div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <Loader2 className="w-8 h-8 text-custom-blue animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-600">Loading topic hierarchy & lesson states...</p>
                </div>
            )}

            {/* Empty Topics State */}
            {!loading && topics.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-800 mb-1">No topics defined yet</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
                        This subject has been created, but syllabus topics and learning units have not yet been ingested.
                    </p>
                    <Link
                        to={`/admin-dashboard/curriculum-builder?subject=${subInfo.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-custom-blue text-white font-semibold text-sm rounded-xl hover:bg-custom-blue/90 transition shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Ingest Syllabus in Curriculum Builder</span>
                    </Link>
                </div>
            )}

            {/* Topic Accordions */}
            {!loading && (
                <div className="space-y-4">
                    {filteredTopics.map((topic, index) => {
                        const isExpanded = expandedTopics.has(topic.id);
                        const topicUnits = topic.units || [];
                        const topicPub = topic.units_published || 0;
                        const topicGen = topic.units_generated || 0;
                        const topicDef = topic.units_count || topicUnits.length;

                        return (
                            <div
                                key={topic.id}
                                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition"
                            >
                                {/* Accordion Header */}
                                <div
                                    onClick={() => toggleTopic(topic.id)}
                                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 select-none transition"
                                >
                                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-700 flex-shrink-0">
                                            {String(topic.order || index + 1).padStart(2, '0')}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base truncate">
                                                {topic.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                <span>{topicDef} {topicDef === 1 ? 'Unit' : 'Units'}</span>
                                                <span>•</span>
                                                <span className="text-emerald-600 font-semibold">{topicPub} Published</span>
                                                {topicGen > topicPub && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-amber-600 font-medium">{topicGen - topicPub} in Draft</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {/* Published Badge */}
                                        {topicDef > 0 && topicPub === topicDef && (
                                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                                            </span>
                                        )}
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Accordion Body (Learning Units Table) */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 divide-y divide-gray-100">
                                        {topicUnits.length === 0 ? (
                                            <div className="p-6 text-center text-xs text-gray-400 italic">
                                                No learning units created for this topic.
                                            </div>
                                        ) : (
                                            topicUnits.map((unit, uIdx) => {
                                                const generating = isGeneratingUnit(unit.id) || unit.generation_state === 'generating';
                                                const hasLesson = Boolean(unit.lesson_id);
                                                const isPub = unit.published;
                                                const isDraft = hasLesson && !isPub;

                                                return (
                                                    <div
                                                        key={unit.id}
                                                        className="p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                                                    >
                                                        {/* Unit Info */}
                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                            <span className="text-xs font-semibold text-gray-400 mt-0.5 w-6">
                                                                #{unit.order || uIdx + 1}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <h4 className="font-medium text-gray-900 text-sm leading-snug">
                                                                    {unit.name}
                                                                </h4>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                                                                    {hasLesson && (
                                                                        <span>{unit.blocks_count || 0} blocks</span>
                                                                    )}
                                                                    {unit.assets_count > 0 && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-custom-blue font-medium">
                                                                                {unit.assets_count} visual assets
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    {unit.pending_assets_count > 0 && (
                                                                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                                                                            <AlertTriangle className="w-3 h-3" />
                                                                            {unit.pending_assets_count} media pending
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Status & Actions Bar */}
                                                        <div className="flex items-center justify-between lg:justify-end gap-3 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                                            {/* Status Badge */}
                                                            <div>
                                                                {generating ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-custom-blue border border-blue-200 animate-pulse">
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                                                                    </span>
                                                                ) : isPub ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Published {unit.lesson_version ? `v${unit.lesson_version}` : ''}
                                                                    </span>
                                                                ) : isDraft ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                                        <Clock className="w-3.5 h-3.5" /> Draft {unit.lesson_version ? `v${unit.lesson_version}` : ''}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                                        Unstarted
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex items-center gap-1.5">
                                                                {hasLesson ? (
                                                                    <>
                                                                        {/* Inspect Components Drawer */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => onInspectLesson(unit.lesson_id, unit)}
                                                                            className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition inline-flex items-center gap-1"
                                                                            title="Inspect components and visual assets in detail"
                                                                        >
                                                                            <Layers className="w-3.5 h-3.5 text-gray-500" />
                                                                            <span className="hidden sm:inline">Inspect</span>
                                                                        </button>

                                                                        {/* Edit in Content Studio */}
                                                                        <Link
                                                                            to={`/admin-dashboard/content-studio/${unit.id}`}
                                                                            className="px-2.5 py-1.5 text-xs font-semibold text-custom-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition inline-flex items-center gap-1"
                                                                            title="Open in Content Studio"
                                                                        >
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                            <span>Studio</span>
                                                                        </Link>

                                                                        {/* Preview as Student */}
                                                                        <a
                                                                            href={`/student/lesson-viewer/?lessonId=${unit.lesson_id}&preview=true&from=admin`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition inline-flex items-center gap-1"
                                                                            title="Preview lesson as student in new tab"
                                                                        >
                                                                            <Play className="w-3.5 h-3.5" />
                                                                            <span className="hidden sm:inline">Preview</span>
                                                                        </a>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {/* Generate Lesson */}
                                                                        <button
                                                                            type="button"
                                                                            disabled={generating}
                                                                            onClick={() => handleGenerate(unit)}
                                                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-custom-blue hover:bg-custom-blue/90 disabled:opacity-50 rounded-lg transition inline-flex items-center gap-1 shadow-sm"
                                                                        >
                                                                            <Sparkles className="w-3.5 h-3.5" />
                                                                            <span>{generating ? 'Generating...' : 'Generate AI'}</span>
                                                                        </button>

                                                                        {/* Manual Studio Create */}
                                                                        <Link
                                                                            to={`/admin-dashboard/content-studio/${unit.id}`}
                                                                            className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition inline-flex items-center gap-1"
                                                                            title="Open Content Studio to author manually"
                                                                        >
                                                                            <FileText className="w-3.5 h-3.5" />
                                                                            <span className="hidden sm:inline">Manual</span>
                                                                        </Link>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
