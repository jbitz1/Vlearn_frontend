import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, X, Send } from 'lucide-react';

export default function PublishGate({ blocks, assets, concepts, qualityReport, onConfirm, onCancel }) {
    const checks = computeChecks(blocks, assets, concepts, qualityReport);
    const nonOkCount = checks.filter((c) => c.severity !== 'ok').length;
    const score = qualityReport?.quality?.score;

    const hasNotices = nonOkCount > 0;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Publishing Checklist</h2>
                        {score !== undefined && (
                            <p className="text-xs font-semibold mt-1">
                                Educational Quality Score: <span className={score >= 80 ? 'text-emerald-600' : 'text-amber-600'}>{score}/100</span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Check list */}
                <div className="px-6 py-5 space-y-3 max-h-80 overflow-y-auto">
                    {checks.map((check, i) => (
                        <CheckRow key={i} check={check} />
                    ))}
                </div>

                {/* Summary bar */}
                <div className={`px-6 py-3 border-t border-gray-100 text-sm font-semibold flex items-center gap-2 ${
                    !hasNotices ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                    {!hasNotices ? (
                        <><CheckCircle size={16} /> Lesson is ready to publish.</>
                    ) : (
                        <><AlertTriangle size={16} /> {nonOkCount} notice{nonOkCount > 1 ? 's' : ''} detected. You can publish directly.</>
                    )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2 text-sm font-bold rounded-xl text-white transition-all flex items-center gap-2 shadow-sm ${
                            !hasNotices
                                ? 'bg-custom-blue hover:opacity-90'
                                : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                    >
                        <Send size={15} /> {!hasNotices ? 'Publish Now' : 'Publish Anyway'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CheckRow({ check }) {
    const { icon: Icon, color, bg } = SEVERITY_META[check.severity];
    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl ${bg}`}>
            <Icon size={16} className={`${color} flex-shrink-0 mt-0.5`} />
            <div>
                <p className={`text-sm font-semibold ${color}`}>{check.label}</p>
                {check.detail && <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>}
            </div>
        </div>
    );
}

const SEVERITY_META = {
    ok:      { icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
    warning: { icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50' },
    error:   { icon: XCircle,       color: 'text-red-600',     bg: 'bg-red-50' },
};

function computeChecks(blocks, assets, concepts, qualityReport) {
    if (qualityReport && qualityReport.validation && qualityReport.validation.checks) {
        return qualityReport.validation.checks;
    }

    const checks = [];

    if (concepts.length === 0) {
        checks.push({ severity: 'error', label: 'No concepts defined', detail: 'Generate a lesson first.' });
        return checks;
    }

    // 1. Every concept has a learning goal
    const conceptsWithoutGoal = concepts.filter(c => !c.goal || c.goal === 'No goal defined');
    if (conceptsWithoutGoal.length > 0) {
        checks.push({
            severity: 'error',
            label: `${conceptsWithoutGoal.length} concept${conceptsWithoutGoal.length > 1 ? 's' : ''} lack a learning goal`,
            detail: `e.g., "${conceptsWithoutGoal[0].pageTitle}" lacks clear objectives.`
        });
    } else {
        checks.push({ severity: 'ok', label: 'Every concept has a learning goal' });
    }

    // 2. Every concept has explanation
    const conceptsWithoutExplanation = concepts.filter(c => {
        const textBlocks = c.blocks.filter(b => ['concept_explanation', 'core_explanation', 'visual_learning', 'overview', 'definitions'].includes(b.block_type));
        return textBlocks.length === 0;
    });
    if (conceptsWithoutExplanation.length > 0) {
        checks.push({
            severity: 'error',
            label: `${conceptsWithoutExplanation.length} concept${conceptsWithoutExplanation.length > 1 ? 's' : ''} lack an explanation`,
            detail: `e.g., "${conceptsWithoutExplanation[0].pageTitle}" needs core content.`
        });
    } else {
        checks.push({ severity: 'ok', label: 'Every concept has an explanation' });
    }

    // 3. Knowledge checks exist
    const checkCount = blocks.filter((b) =>
        ['knowledge_check', 'revision_questions'].includes(b.block_type)
    ).length;
    if (checkCount === 0) {
        checks.push({
            severity: 'warning',
            label: 'No knowledge checks exist',
            detail: 'Adding questions improves student retention.',
        });
    } else {
        checks.push({ severity: 'ok', label: 'Knowledge checks exist' });
    }

    // 4. Visuals coverage
    const conceptsMissingMedia = concepts.filter(c => c.status === 'Missing Media');
    if (conceptsMissingMedia.length > 0) {
        checks.push({
            severity: 'warning',
            label: `${conceptsMissingMedia.length} concept${conceptsMissingMedia.length > 1 ? 's' : ''} lack visuals`,
            detail: 'Students learn better with diagrams and videos.',
        });
    } else {
        checks.push({ severity: 'ok', label: 'Visual coverage is good' });
    }

    // 5. Repository references present
    const repoAssets = assets.filter(a => a.source_type === 'knowledge_repository').length;
    if (repoAssets === 0) {
        checks.push({
            severity: 'warning',
            label: 'No repository references present',
            detail: 'Link concepts to textbook material for accuracy.',
        });
    } else {
        checks.push({ severity: 'ok', label: 'Repository references present' });
    }

    // 6. Reading load acceptable
    let words = 0;
    blocks.forEach(b => {
        let text = b.content || '';
        if (typeof text === 'object') text = JSON.stringify(text);
        words += text.split(/\s+/).length;
    });
    if (words > 2000) {
        checks.push({
            severity: 'warning',
            label: 'Reading load may be too high',
            detail: `${words} words is a heavy cognitive load for one lesson.`,
        });
    } else {
        checks.push({ severity: 'ok', label: 'Reading load is acceptable' });
    }

    return checks;
}
