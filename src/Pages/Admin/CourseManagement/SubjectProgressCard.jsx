import React from 'react';
import { BookOpen, CheckCircle2, Clock, AlertTriangle, ArrowRight, Atom, Layers, FileText } from 'lucide-react';

export default function SubjectProgressCard({ subject, onOpen }) {
    const defined = subject.units_defined || 0;
    const published = subject.units_published || 0;
    const generated = subject.units_generated || 0;
    const unstarted = subject.units_unstarted || 0;
    const drafts = subject.draft_or_review_units || 0;
    const pendingMedia = subject.pending_asset_count || 0;

    const pubPercent = defined > 0 ? Math.round((published / defined) * 100) : 0;
    const genPercent = defined > 0 ? Math.round((generated / defined) * 100) : 0;

    // Pick icon based on subject name
    const getSubjectIcon = (name = '') => {
        const lower = name.toLowerCase();
        if (lower.includes('chem') || lower.includes('bio') || lower.includes('phys') || lower.includes('science')) {
            return <Atom className="w-5 h-5 text-custom-blue" />;
        }
        return <BookOpen className="w-5 h-5 text-custom-blue" />;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
            <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-custom-blue/10 flex items-center justify-center flex-shrink-0 group-hover:bg-custom-blue/20 transition">
                            {getSubjectIcon(subject.name)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-custom-blue transition">
                                {subject.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span>{subject.topics_count || 0} {subject.topics_count === 1 ? 'Topic' : 'Topics'}</span>
                                <span>•</span>
                                <span className="font-medium text-gray-700">{defined} {defined === 1 ? 'Unit' : 'Units'} defined</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Pill */}
                    {defined === 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            No Syllabus
                        </span>
                    ) : pubPercent === 100 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Published
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-custom-blue border border-blue-200">
                            {pubPercent}% Published
                        </span>
                    )}
                </div>

                {/* Progress Indicators */}
                {defined > 0 ? (
                    <div className="space-y-3 mb-5 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                        {/* Published Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-medium text-gray-700 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Published Lessons
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {published} / {defined} <span className="text-gray-400 font-normal">({pubPercent}%)</span>
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(0, pubPercent))}%` }}
                                />
                            </div>
                        </div>

                        {/* Generated Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-medium text-gray-600 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-custom-blue" />
                                    Generated Lessons
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {generated} / {defined} <span className="text-gray-400 font-normal">({genPercent}%)</span>
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-custom-blue h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(0, genPercent))}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl mb-5">
                        No learning units ingested yet for this subject.
                    </div>
                )}

                {/* Status Badges Ribbon */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                    {drafts > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            {drafts} {drafts === 1 ? 'draft' : 'drafts'}
                        </span>
                    )}
                    {unstarted > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
                            <FileText className="w-3.5 h-3.5 text-gray-500" />
                            {unstarted} unstarted
                        </span>
                    )}
                    {pendingMedia > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            {pendingMedia} media pending
                        </span>
                    )}
                </div>
            </div>

            {/* Action Footer */}
            <button
                type="button"
                onClick={() => onOpen(subject)}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-custom-blue text-gray-700 hover:text-white font-semibold text-sm transition flex items-center justify-center gap-2 group-hover:border-custom-blue border border-gray-200/80"
            >
                <span>{defined === 0 ? 'View Subject' : 'Open Course'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
        </div>
    );
}
