import React from 'react';
import { Database, Target, CheckCircle, AlertCircle, AlertTriangle, Plus } from 'lucide-react';

export default function ConceptNavigator({
    concepts,
    activeConceptId,
    onSelectConcept,
    onAddConcept,
    lessonTitle,
    lessonStatus,
    lessonVersion,
}) {
    return (
        <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
            {/* Lesson meta header */}
            <div className="px-5 py-4 border-b border-gray-200 bg-white">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1.5">Lesson Blueprint</p>
                <h3 className="text-gray-900 font-extrabold text-sm leading-snug line-clamp-2">
                    {lessonTitle || 'Untitled Lesson'}
                </h3>
                <div className="flex items-center gap-2 mt-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        lessonStatus === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lessonStatus === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-200 text-gray-700'
                    }`}>
                        {lessonStatus || 'draft'}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">v{lessonVersion || 1}</span>
                </div>
            </div>

            {/* Concept list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {concepts.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-10">
                        No blueprint available.
                    </div>
                )}
                {concepts.map((concept, idx) => (
                    <ConceptCard
                        key={concept.pageNum}
                        concept={concept}
                        index={idx + 1}
                        isActive={concept.pageNum === activeConceptId}
                        onClick={() => onSelectConcept(concept.pageNum)}
                    />
                ))}

                {onAddConcept && (
                    <button
                        onClick={onAddConcept}
                        className="w-full py-2.5 px-3 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:text-custom-blue hover:border-custom-blue hover:bg-blue-50/50 transition-all flex items-center justify-center gap-1.5"
                    >
                        <Plus size={14} /> Add Card / Concept
                    </button>
                )}
            </div>
        </div>
    );
}

function ConceptCard({ concept, index, isActive, onClick }) {
    // Determine status icon
    let StatusIcon = CheckCircle;
    if (concept.status === 'Missing Media' || concept.status === 'Empty') {
        StatusIcon = AlertTriangle;
    }

    return (
        <button
            onClick={onClick}
            className={`w-full text-left rounded-xl border p-4 transition-all ${
                isActive
                    ? 'bg-white border-custom-blue shadow-md ring-1 ring-custom-blue/20'
                    : 'bg-white border-gray-200 shadow-sm hover:border-custom-blue/50'
            }`}
        >
            {/* Header: Title */}
            <div className="flex items-start gap-3 mb-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-custom-blue text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                    {index}
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className={`text-sm font-bold truncate ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                        {concept.pageTitle}
                    </h4>
                </div>
            </div>

            {/* Metadata lines */}
            <div className="space-y-2.5 ml-9">
                {/* Goal */}
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <Target size={10} /> Goal
                    </p>
                    <p className="text-xs text-gray-600 leading-snug line-clamp-2" title={concept.goal}>
                        {concept.goal || 'No explicit goal defined'}
                    </p>
                </div>

                {/* Uses */}
                <div className="flex items-center gap-1.5 text-xs">
                    <Database size={12} className="text-purple-500" />
                    <span className="text-gray-600 font-medium">
                        {concept.repoUsage} repository chunk{concept.repoUsage !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Status */}
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${concept.statusColor || 'text-gray-600 bg-gray-100'}`}>
                    <StatusIcon size={12} />
                    {concept.status || 'Unknown'}
                </div>
            </div>
        </button>
    );
}
