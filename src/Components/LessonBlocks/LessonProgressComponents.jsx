import React from 'react';
import { ArrowRight, ArrowLeft, PartyPopper, Clock } from 'lucide-react';

export const LessonTimeline = ({ totalPages, currentPageIndex, completedConcepts, onNavigate }) => {
    return (
        <div className="flex items-center justify-center gap-2 mt-12 mb-4 bg-white px-6 py-4 rounded-full shadow-sm border border-gray-100 mx-auto w-max">
            {Array.from({ length: totalPages }).map((_, idx) => {
                const isCurrent = idx === currentPageIndex;
                const isCompleted = completedConcepts.includes(idx);
                
                let baseClasses = "w-3 h-3 rounded-full transition-all cursor-pointer ";
                
                if (isCurrent) {
                    baseClasses += "bg-indigo-600 ring-4 ring-indigo-100 scale-125";
                } else if (isCompleted) {
                    baseClasses += "bg-emerald-400 hover:bg-emerald-500";
                } else {
                    baseClasses += "bg-gray-200 hover:bg-gray-300";
                }

                return (
                    <React.Fragment key={idx}>
                        {idx > 0 && (
                            <div className={`h-0.5 w-4 transition-colors ${completedConcepts.includes(idx - 1) ? 'bg-emerald-200' : 'bg-gray-100'}`} />
                        )}
                        <button 
                            onClick={() => onNavigate(idx)}
                            className={baseClasses}
                            aria-label={`Go to part ${idx + 1}`}
                            title={`Part ${idx + 1}`}
                        />
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export const LessonCompletionCard = ({ lessonTitle, completedConceptsCount, estimatedStudyTime, onBackToTopic, onReview }) => {
    return (
        <div className="max-w-2xl mx-auto my-16 text-center animate-slide-up-fade bg-white p-10 rounded-3xl shadow-xl border border-indigo-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            
            <PartyPopper className="text-emerald-500 w-16 h-16 mx-auto mb-6 drop-shadow-md" />
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Lesson Completed</h1>
            <p className="text-xl text-gray-600 mb-10">You have successfully finished <br/><strong className="text-gray-900">{lessonTitle}</strong></p>
            
            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-12">
                <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100">
                    <span className="block text-4xl font-black text-emerald-600 mb-2">{completedConceptsCount}</span>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Parts<br/>Completed</span>
                </div>
                <div className="bg-indigo-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
                    <span className="block text-4xl font-black text-indigo-600 mb-2">{estimatedStudyTime}</span>
                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Minutes<br/>Invested</span>
                </div>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
                <button 
                    onClick={onBackToTopic}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
                >
                    <ArrowLeft size={20} /> Back to Topic
                </button>
                <button 
                    onClick={onReview}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl font-bold hover:bg-indigo-50 transition"
                >
                    Review Lesson <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export const LessonResumeBanner = ({ lastConceptTitle, onResume, onDismiss }) => {
    return (
        <div className="bg-indigo-900 text-white p-4 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-md animate-slide-down relative z-50">
            <div className="flex items-center gap-3">
                <Clock className="text-indigo-300 w-6 h-6 animate-pulse" />
                <div className="text-left">
                    <p className="font-bold text-sm uppercase tracking-wide text-indigo-200">Resume Learning</p>
                    <p className="text-white font-medium">Last visited: {lastConceptTitle}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={onResume}
                    className="px-6 py-2 bg-white text-indigo-900 rounded-full font-bold hover:bg-indigo-50 transition shadow-sm text-sm"
                >
                    Continue Lesson
                </button>
                <button onClick={onDismiss} className="p-2 text-indigo-300 hover:text-white transition">
                    ✕
                </button>
            </div>
        </div>
    );
};
