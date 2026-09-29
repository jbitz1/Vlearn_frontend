import React, { useState } from 'react';
import { 
    Flag, 
    X, 
    CheckCircle2, 
    AlertTriangle, 
    Layers, 
    User, 
    Clock, 
    BookOpen, 
    ExternalLink,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router';

export default function IssueDetailModal({
    issue,
    onClose,
    onResolve,
    getStudioLink,
}) {
    if (!issue) return null;

    const [notes, setNotes] = useState(issue.resolution_notes || '');
    const [submitting, setSubmitting] = useState(false);

    const isResolved = issue.status === 'resolved';
    const studioLink = getStudioLink ? getStudioLink(issue) : null;

    const handleMarkResolved = async () => {
        setSubmitting(true);
        try {
            await onResolve(issue.id, notes.trim());
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="fixed inset-0" onClick={onClose} />
            
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full my-8 flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/80">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                            <Flag size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                                Issue Report #{issue.id}
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    isResolved 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                    {isResolved ? 'Resolved' : 'Pending Review'}
                                </span>
                            </h3>
                            <p className="text-xs text-gray-500">
                                Submitted {issue.created_at ? new Date(issue.created_at).toLocaleString() : 'Recently'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                    {/* Issue Category Pill */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Classification:</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            issue.issue_type === 'teacher_feedback'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : issue.issue_type === 'simulation_broken'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                            {issue.issue_type_display || issue.issue_type}
                        </span>
                        {issue.visualization_type && (
                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                Media: {issue.visualization_type}
                            </span>
                        )}
                    </div>

                    {/* Pedagogical & Lesson Coordinates */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-gray-200/80 space-y-2">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <BookOpen size={13} className="text-custom-blue" />
                            Curriculum & Lesson Context
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                                <span className="text-[11px] text-gray-500 block">Curriculum Coordinates</span>
                                <p className="text-xs font-bold text-gray-900">
                                    {[issue.grade_name, issue.subject_name].filter(Boolean).join(' • ') || 'General Subject'}
                                    {issue.topic_name && <span className="text-gray-600 block text-[11px] font-normal">Topic: {issue.topic_name}</span>}
                                </p>
                            </div>
                            <div>
                                <span className="text-[11px] text-gray-500 block">Lesson & Unit</span>
                                <p className="text-xs font-bold text-gray-900">
                                    {issue.lesson_title || (issue.lesson ? `Lesson #${issue.lesson}` : 'No Lesson Attached')}
                                </p>
                                {issue.learning_unit_title && (
                                    <span className="text-gray-500 block text-[11px]">Unit: {issue.learning_unit_title}</span>
                                )}
                            </div>
                        </div>

                        {(issue.visualization_title || issue.lesson_block) && (
                            <div className="pt-2 border-t border-gray-200/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
                                {issue.visualization_title && (
                                    <span><strong>Component:</strong> {issue.visualization_title}</span>
                                )}
                                {issue.block_page_number && (
                                    <span><strong>Page:</strong> {issue.block_page_number}</span>
                                )}
                                {issue.lesson_block && (
                                    <span><strong>Block ID:</strong> #{issue.lesson_block}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reporter Info */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200 text-xs">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-custom-blue flex items-center justify-center shrink-0">
                            <User size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">
                                {issue.user_name || issue.user_email || 'Anonymous User'}
                            </p>
                            <p className="text-gray-500 truncate text-[11px]">
                                {issue.user_email || 'No email provided'} • Role: {issue.user_role || 'Learner'}
                            </p>
                        </div>
                    </div>

                    {/* Reported Details & Description */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-gray-400" />
                            Report Description & User Feedback:
                        </p>
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {issue.description || 'No additional comments provided by the reporter.'}
                        </div>
                    </div>

                    {/* Resolution Status / Form */}
                    {isResolved ? (
                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                Resolved {issue.resolved_at ? new Date(issue.resolved_at).toLocaleString() : ''}
                            </div>
                            {issue.resolution_notes && (
                                <p className="text-xs text-emerald-900 mt-1 pl-6">
                                    <strong>Resolution Notes:</strong> {issue.resolution_notes}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-700 block">
                                Resolution Notes (Optional):
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Describe what was fixed (e.g., 'Replaced YouTube video with working link', 'Regenerated visual vectors via Content Studio')..."
                                className="w-full border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-custom-blue min-h-[70px] resize-y"
                            />
                        </div>
                    )}
                </div>

                {/* Modal Footer with Actions */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
                    >
                        Close
                    </button>

                    <div className="flex items-center gap-2.5 ml-auto">
                        {!isResolved && (
                            <button
                                type="button"
                                onClick={handleMarkResolved}
                                disabled={submitting}
                                className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                Mark as Resolved
                            </button>
                        )}

                        {studioLink && (
                            <Link
                                to={studioLink}
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-bold text-white bg-custom-blue hover:bg-blue-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                                <Layers size={13} />
                                Fix in Content Studio →
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
