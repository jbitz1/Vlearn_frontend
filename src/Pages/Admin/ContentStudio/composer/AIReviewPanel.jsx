import React, { useState, useMemo } from 'react';
import {
    GraduationCap,
    Eye,
    FileText,
    Activity,
    ImageIcon,
    Clock,
    CheckCircle2,
    Lightbulb,
    Check,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { isAssetPresent, getBlockMedia } from '../../../../utils/assetUtils';
import { BlockRenderer } from '../../../../Components/LessonBlocks/BlockRenderer';

/**
 * Extracts human-readable text from diverse block content formats.
 */
function extractText(content) {
    if (!content) return '';
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            return extractText(parsed);
        } catch {
            return content;
        }
    }
    if (typeof content === 'object') {
        const parts = [];
        if (content.text) parts.push(content.text);
        if (content.content) parts.push(content.content);
        if (content.explanation) parts.push(content.explanation);
        if (content.question) parts.push(content.question);
        if (content.summary) parts.push(content.summary);
        if (content.description) parts.push(content.description);
        if (Array.isArray(content.steps)) {
            parts.push(content.steps.map(s => typeof s === 'string' ? s : `${s.title || ''} ${s.description || ''}`).join(' '));
        }
        if (Array.isArray(content.options)) {
            parts.push(content.options.map(o => (typeof o === 'string' ? o : o.text || '')).join(' '));
        }
        return parts.join(' ') || '';
    }
    return String(content);
}

function countWords(str) {
    if (!str || typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Analyzes pedagogical health metrics and suggestions.
 */
function evaluatePedagogy(blocks = [], assets = []) {
    const nonVisualTypes = [
        'suggested_diagram', 'suggested_video', 'suggested_image', 'image_placeholder', 
        'video_ref', 'suggested_illustration', 'suggested_infographic', 'suggested_simulation', 
        'simulation_placeholder', 'repository_asset'
    ];
    const textBlocks = blocks.filter(b => !nonVisualTypes.includes(b.block_type));

    let wordCount = 0;
    textBlocks.forEach(b => {
        const raw = extractText(b.content) || b.title || '';
        wordCount += countWords(raw);
    });

    const readingTimeMin = Math.max(1, Math.round((wordCount / 180) * 10) / 10);

    const checkTypes = [
        'knowledge_check', 'multiple_choice', 'true_false', 'short_answer', 
        'fill_in_the_blank', 'revision_questions', 'reflection', 'experiment', 'classroom_activity'
    ];
    const activeBlocks = blocks.filter(b => checkTypes.includes(b.block_type));
    const checkCount = activeBlocks.length;

    const visualTypes = [
        'suggested_diagram', 'suggested_video', 'suggested_image', 'suggested_illustration', 
        'suggested_infographic', 'suggested_simulation', 'image', 'diagram', 'video', 'youtube', 
        'visualization', 'image_placeholder', 'video_ref', 'simulation_placeholder', 'repository_asset'
    ];
    const visualBlocks = blocks.filter(b => visualTypes.includes(b.block_type));

    const blockIds = new Set(blocks.map(b => b.id));
    const scopeAssets = assets.filter(a => {
        if (!a.blocks || !Array.isArray(a.blocks)) return false;
        return a.blocks.some(id => blockIds.has(typeof id === 'object' ? id?.id : id));
    });

    const attachedCount = scopeAssets.filter(isAssetPresent).length +
        visualBlocks.filter(b => !scopeAssets.some(a => (a.blocks || []).some(x => (typeof x === 'object' ? x?.id : x) === b.id)) && Boolean(getBlockMedia(b))).length;

    const totalMediaSlots = Math.max(visualBlocks.length, scopeAssets.length, attachedCount);

    const totalEstMinutes = Math.max(1, Math.ceil(readingTimeMin + checkCount * 1));

    const hasGoal = blocks.some(b => ['learning_goal', 'objectives', 'hook'].includes(b.block_type));
    const hasExplanation = blocks.some(b => [
        'concept_explanation', 'core_explanation', 'definitions', 'definition', 
        'definition_card', 'table', 'comparison_table', 'step_process', 'formula_breakdown'
    ].includes(b.block_type));
    const hasContext = blocks.some(b => [
        'real_world_example', 'worked_example', 'analogy', 'experiment'
    ].includes(b.block_type));
    const hasCheck = checkCount > 0;
    const hasSummary = blocks.some(b => [
        'summary', 'key_takeaway', 'callout'
    ].includes(b.block_type));

    // High priority suggestion (top advice only to reduce clutter)
    const suggestions = [];
    if (!hasExplanation && blocks.length > 0) {
        suggestions.push({
            id: 'explanation',
            title: 'Add Core Explanation',
            text: 'Include a core explanation, definition, or step process to anchor the concept.'
        });
    } else if (!hasCheck && blocks.length >= 2) {
        suggestions.push({
            id: 'check',
            title: 'Add Active Recall Check',
            text: 'Add a Multiple Choice or Knowledge Check question to reinforce comprehension.'
        });
    } else if (totalMediaSlots === 0 && blocks.length >= 2) {
        suggestions.push({
            id: 'media',
            title: 'Include Visual Anchor',
            text: 'Consider adding a diagram, illustration, or video to support visual learners.'
        });
    } else if (wordCount > 600) {
        suggestions.push({
            id: 'pacing',
            title: 'High Reading Volume',
            text: `Card has ${wordCount} words. Consider splitting into two cards to avoid cognitive overload.`
        });
    }

    return {
        wordCount,
        readingTimeMin,
        totalEstMinutes,
        checkCount,
        mediaCount: attachedCount,
        hasGoal,
        hasExplanation,
        hasContext,
        hasCheck,
        hasSummary,
        topSuggestion: suggestions[0] || null,
    };
}

export default function AIReviewPanel({
    lesson,
    blocks = [],
    assets = [],
    concepts = [],
    activeConcept = null,
    coachWidth = 380,
    onToggleWide = null
}) {
    const [panelTab, setPanelTab] = useState('preview'); // 'preview' | 'coach'

    // Real-time metrics based on active card
    const targetBlocks = useMemo(() => {
        if (activeConcept?.blocks) {
            return activeConcept.blocks;
        }
        return blocks;
    }, [activeConcept, blocks]);

    const metrics = useMemo(() => {
        return evaluatePedagogy(targetBlocks, assets);
    }, [targetBlocks, assets]);

    const activeConceptTitle = activeConcept?.pageTitle || (activeConcept?.pageNum ? `Part ${activeConcept.pageNum}` : 'Concept');
    const isWide = coachWidth > 450;

    return (
        <div className="w-full h-full flex flex-col bg-slate-50/70 select-none overflow-hidden border-l border-gray-200/80">
            {/* ── Top Header with Tab Switcher & Width Toggle ─────────────── */}
            <div className="px-4 py-3 border-b border-gray-200/70 bg-white sticky top-0 shadow-2xs z-10">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {panelTab === 'preview' ? (
                            <Eye size={16} className="text-custom-blue shrink-0" />
                        ) : (
                            <GraduationCap size={16} className="text-custom-blue shrink-0" />
                        )}
                        <h3 className="text-xs font-bold text-gray-900 truncate">
                            {panelTab === 'preview' ? 'Live Card Preview' : 'Instructional Coach'}
                        </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {onToggleWide && (
                            <button
                                type="button"
                                onClick={onToggleWide}
                                title={isWide ? "Reset to standard width" : "Expand to side-by-side view"}
                                className="p-1 text-gray-400 hover:text-custom-blue hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            >
                                {isWide ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                            </button>
                        )}
                        <span className="text-[10px] font-bold text-custom-blue bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                            CBC Standard
                        </span>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex rounded-lg p-0.5 bg-gray-100/90 border border-gray-200/60 text-xs">
                    <button
                        type="button"
                        onClick={() => setPanelTab('preview')}
                        className={`flex-1 py-1.5 px-2 rounded-md font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            panelTab === 'preview'
                                ? 'bg-white text-custom-blue shadow-2xs'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Eye size={12} />
                        <span>Live Preview</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPanelTab('coach')}
                        className={`flex-1 py-1.5 px-2 rounded-md font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            panelTab === 'coach'
                                ? 'bg-white text-custom-blue shadow-2xs'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <GraduationCap size={13} />
                        <span>Coach Insights</span>
                    </button>
                </div>
            </div>

            {/* ── TAB 1: Live Card Preview ─────────────────────────────────── */}
            {panelTab === 'preview' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {/* Card Title Banner */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-custom-blue bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                Card {activeConcept?.pageNum || 1}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">
                                {(activeConcept?.blocks || []).length} component{(activeConcept?.blocks || []).length === 1 ? '' : 's'}
                            </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug">
                            {activeConceptTitle}
                        </h2>
                    </div>

                    {/* Sequential Block Preview */}
                    {activeConcept?.blocks && activeConcept.blocks.length > 0 ? (
                        <div className="space-y-4">
                            {activeConcept.blocks
                                .slice()
                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                .map((block) => (
                                    <div
                                        key={block.id || Math.random()}
                                        className="bg-white rounded-xl shadow-2xs border border-gray-200/80 p-4 overflow-hidden"
                                    >
                                        <BlockRenderer block={block} />
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200 p-6">
                            <Eye size={24} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm font-semibold text-gray-600">No components on this card yet</p>
                            <p className="text-xs text-gray-400 mt-1">Add components from the center canvas to preview them in real time.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB 2: Pedagogical Coach ─────────────────────────────────── */}
            {panelTab === 'coach' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Active Card Pill */}
                    <div className="px-3 py-2 bg-white rounded-xl border border-gray-200/70 shadow-2xs flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                            Card {activeConcept?.pageNum || 1}
                        </span>
                        <span className="text-xs font-bold text-gray-800 truncate max-w-[180px]" title={activeConceptTitle}>
                            {activeConceptTitle}
                        </span>
                    </div>

                    {/* 3 Metric Stat Pills */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs text-center">
                            <Clock size={14} className="mx-auto text-blue-600 mb-1" />
                            <span className="block text-xs font-extrabold text-gray-800">
                                ~{metrics.totalEstMinutes}m
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium block truncate">
                                {metrics.wordCount} words
                            </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs text-center">
                            <ImageIcon size={14} className="mx-auto text-emerald-600 mb-1" />
                            <span className="block text-xs font-extrabold text-gray-800">
                                {metrics.mediaCount}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium block truncate">
                                visual{metrics.mediaCount === 1 ? '' : 's'}
                            </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs text-center">
                            <Activity size={14} className="mx-auto text-purple-600 mb-1" />
                            <span className="block text-xs font-extrabold text-gray-800">
                                {metrics.checkCount}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium block truncate">
                                recall check{metrics.checkCount === 1 ? '' : 's'}
                            </span>
                        </div>
                    </div>

                    {/* High-Priority Coaching Advice */}
                    {metrics.topSuggestion ? (
                        <div className="bg-white border border-gray-200/80 border-l-3 border-l-custom-terracotta p-3 rounded-xl shadow-2xs">
                            <div className="flex items-start gap-2">
                                <Lightbulb size={15} className="text-custom-orange shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-900 leading-tight mb-1">
                                        {metrics.topSuggestion.title}
                                    </p>
                                    <p className="text-[11px] text-gray-600 leading-relaxed">
                                        {metrics.topSuggestion.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-50/70 border border-emerald-200/70 p-3 rounded-xl shadow-2xs flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <p className="text-xs font-semibold text-emerald-900">
                                Pedagogically balanced card
                            </p>
                        </div>
                    )}

                    {/* CBC Standards Checklist */}
                    <div className="bg-white rounded-xl border border-gray-200/80 p-3 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                                Quality Standards
                            </p>
                            <span className="text-[10px] font-bold text-gray-400">
                                {[metrics.hasGoal, metrics.hasExplanation, metrics.hasContext, metrics.hasCheck, metrics.hasSummary].filter(Boolean).length}/5 Met
                            </span>
                        </div>

                        <div className="space-y-2 pt-1">
                            <CheckItem label="Learning Goal / Hook" checked={metrics.hasGoal} />
                            <CheckItem label="Core Theory & Explanation" checked={metrics.hasExplanation} />
                            <CheckItem label="Real-World Example / Context" checked={metrics.hasContext} />
                            <CheckItem label="Check for Understanding" checked={metrics.hasCheck} />
                            <CheckItem label="Summary / Key Takeaway" checked={metrics.hasSummary} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CheckItem({ label, checked }) {
    return (
        <div className="flex items-center gap-2">
            {checked ? (
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-emerald-600 font-bold" />
                </div>
            ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                </div>
            )}
            <span className={`text-xs ${checked ? 'text-gray-900 font-medium' : 'text-gray-400 font-normal'}`}>
                {label}
            </span>
        </div>
    );
}
