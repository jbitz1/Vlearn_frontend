import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import UserContext from '../Context/UserContext';
import { BlockRenderer } from '../Components/LessonBlocks/BlockRenderer';
import { ConceptCompletionCard } from '../Components/LessonBlocks/BlueprintComponents';
import apiClient from '../config/apiClient';
import { ContentNormalizer } from '../utils/ContentNormalizer';
import {
    ChevronLeft, ChevronRight, Clock,
    CheckCircle, Circle, LayoutList
} from 'lucide-react';
import { useLessonProgress } from '../Hooks/useLessonProgress';
import { LessonTimeline, LessonCompletionCard } from '../Components/LessonBlocks/LessonProgressComponents';
import { PresentationEngine } from '../services/presentation/PresentationEngine';
import { LayoutSelectionService } from '../services/presentation/LayoutSelectionService';
import studentCurriculumService from '../services/studentCurriculumService';

// ─────────────────────────────────────────────────────────────────────────────
// Error Boundary to prevent any child render failure from triggering Router 404
// ─────────────────────────────────────────────────────────────────────────────
class LessonErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('[LessonViewer ErrorBoundary]:', error, errorInfo);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false, error: null });
        }
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 my-8 max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl font-bold">!</div>
                    <h3 className="text-xl font-bold text-amber-900">Unable to display this concept</h3>
                    <p className="text-sm text-amber-700 max-w-md mx-auto">
                        An error occurred while rendering this concept's interactive elements.
                    </p>
                    {this.state.error?.message && (
                        <p className="text-xs font-mono text-amber-800 bg-amber-100/60 p-3 rounded-xl max-w-lg mx-auto overflow-x-auto text-left whitespace-pre-wrap">
                            {this.state.error.message}
                        </p>
                    )}
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
function estimateReadingTime(blocks) {
    let seconds = 0;
    blocks.forEach((b) => {
        const type = b.block_type;
        if (type === 'video_ref' || type === 'suggested_video') {
            seconds += 180;
        } else if (type === 'image_placeholder' || type === 'suggested_image' || type === 'suggested_diagram') {
            seconds += 60;
        } else if (type === 'knowledge_check' || type === 'revision_questions') {
            seconds += 120;
        } else if (type === 'experiment' || type === 'mini_activity' || type === 'suggested_activity') {
            seconds += 120;
        } else if (type === 'suggested_simulation') {
            seconds += 180;
        }
        
        const textStr = ContentNormalizer.extractText(b.content);
        const words = textStr.split(/\s+/).filter(Boolean).length;
        seconds += (words / 200) * 60;
    });
    return Math.max(1, Math.ceil(seconds / 60));
}

// ─────────────────────────────────────────────────────────────────────────────
// LessonViewer
//
// Modes:
//   - Default (paginated=false): V1 scrolling behaviour — UNCHANGED
//   - paginated=true            : concept-by-concept student experience
//
// The ContentStudio uses paginated=false (default) so the existing preview
// in the old layout continues to work without any change.
// The new student route can pass paginated={true}.
// ─────────────────────────────────────────────────────────────────────────────
export const LessonViewer = ({ lessonData, paginated = false }) => {
    const { topicId } = useParams();
    const location = useLocation();
    const { user } = useContext(UserContext);
    const [lesson, setLesson] = useState(lessonData || null);
    const [loading, setLoading] = useState(!lessonData);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (lessonData) {
            setLesson(lessonData);
            setLoading(false);
            return;
        }
        
        const searchParams = new URLSearchParams(location.search);
        const lessonIdParam = searchParams.get('lessonId');
        const isPreview = searchParams.get('preview') === 'true';

        const validTopicId = topicId && topicId !== 'undefined' ? topicId : null;

        if (!validTopicId && !lessonIdParam) {
            setError('No topic or lesson specified.');
            setLoading(false);
            return;
        }
        const fetchLesson = async () => {
            try {
                let url = '';
                if (lessonIdParam) {
                    url = `/api/curriculum/lessons/${lessonIdParam}/?v=2`;
                } else if (validTopicId) {
                    url = `/api/curriculum/topics/${validTopicId}/lesson/${isPreview ? '?preview=true' : ''}`;
                }
                
                const response = await apiClient.get(url);
                setLesson(response.data);
            } catch (err) {
                if (err.response?.status === 403) {
                    setError('You do not have an active subscription for this subject. Please upgrade your plan to unlock this lesson.');
                } else if (err.response?.status === 404) {
                    setError('No published lesson is available for this topic yet.');
                } else {
                    setError('Failed to load lesson. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [topicId, lessonData, location.search]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-blue-600 font-semibold animate-pulse">Loading Lesson...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-2">Unable to Load Lesson</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-400 text-center">
                    <p className="text-lg font-medium">No lesson content available.</p>
                    <p className="text-sm mt-1">This topic has not been published yet.</p>
                </div>
            </div>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────
    if (paginated && lesson.blocks && lesson.blocks.length > 0) {
        const searchParams = new URLSearchParams(location.search);
        const isPreview = searchParams.get('preview') === 'true';
        return <PaginatedViewer lesson={lesson} topicId={topicId} isPreview={isPreview} userId={user?.id} />;
    }

    // ── V1 scrolling mode (default, unchanged) ───────────────────────────────
    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold mb-4">{lesson.title}</h1>
                    <div className="flex gap-4 text-sm opacity-80">
                        <span className="bg-white/20 px-3 py-1 rounded-full">Version: {lesson.version}</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full capitalize">Status: {lesson.status}</span>
                        {lesson.published_at && (
                            <span className="bg-white/20 px-3 py-1 rounded-full">
                                Published: {new Date(lesson.published_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-6">
                    {lesson.blocks && lesson.blocks.map((block) => (
                        <BlockRenderer key={block.id} block={block} />
                    ))}
                </div>
                {(!lesson.blocks || lesson.blocks.length === 0) && (
                    <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        This lesson has no content blocks yet.
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Paginated Viewer — one concept at a time
// ─────────────────────────────────────────────────────────────────────────────
function PaginatedViewer({ lesson, topicId, isPreview, userId }) {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const effectiveTopicId = (topicId && topicId !== 'undefined') ? topicId : lesson?.topic;
    const presentation = PresentationEngine.composeExperience(lesson, lesson.blocks || [], lesson.assets || []);
    const pages = presentation.pages;
    const totalPages = pages.length;
    
    const progress = useLessonProgress(lesson.id, totalPages, isPreview, userId);
    const { 
        savedConceptIndex,
        completedConcepts,
        isCompleted,
        completionPercentage,
        markConceptCompleted,
        saveCurrentConcept,
        completeLesson,
        updateMetadata
    } = progress;

    const [pageIndex, setPageIndex] = useState(savedConceptIndex || 0);
    const [showContents, setShowContents] = useState(false);
    const [interactedBlocks, setInteractedBlocks] = useState(new Set());
    const [topicData, setTopicData] = useState(null);

    useEffect(() => {
        if (effectiveTopicId && effectiveTopicId !== 'undefined') {
            apiClient.get(`/api/curriculum/topics/${effectiveTopicId}/`).then(res => {
                setTopicData(res.data);
                if (res.data?.subject) {
                    studentCurriculumService.recordSubjectAccess(res.data.subject, userId);
                }
            }).catch(console.error);
        }
    }, [effectiveTopicId, userId]);

    useEffect(() => {
        if (lesson?.title && effectiveTopicId) {
            updateMetadata(
                lesson.title, 
                effectiveTopicId, 
                totalPages, 
                topicData?.subject || null, 
                topicData?.subject_name || ''
            );
        }
    }, [lesson?.title, effectiveTopicId, totalPages, topicData, updateMetadata]);

    const currentPage = pages[pageIndex];
    const readingTime = estimateReadingTime(currentPage?.blocks || []);
    const totalReadingTime = estimateReadingTime(lesson.blocks || []);

    const navigateTo = useCallback((idx) => {
        setPageIndex(idx);
        saveCurrentConcept(idx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [saveCurrentConcept]);

    const goNext = useCallback(() => {
        markConceptCompleted(pageIndex);
        const nextIdx = Math.min(pageIndex + 1, totalPages - 1);
        navigateTo(nextIdx);
    }, [pageIndex, totalPages, markConceptCompleted, navigateTo]);

    const goPrev = useCallback(() => {
        navigateTo(Math.max(pageIndex - 1, 0));
    }, [pageIndex, navigateTo]);

    const handleComplete = () => {
        markConceptCompleted(pageIndex);
        completeLesson();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const knowledgeCheckBlocks = currentPage?.blocks?.filter(b => 
        b.block_type === 'knowledge_check' || b.block_type === 'revision_questions'
    ) || [];
    const isGated = knowledgeCheckBlocks.some(b => !interactedBlocks.has(b.id));

    const handleInteract = useCallback((blockId) => {
        setInteractedBlocks((prev) => new Set([...prev, blockId]));
    }, []);

    // ── Keyboard Arrow Navigation ──────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Do not intercept if typing in an answer box, search field, or input
            const activeTag = document.activeElement?.tagName?.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
                return;
            }

            if (e.key === 'ArrowRight' || e.key === 'Right') {
                if (isGated) return; // Guardrail: require answering knowledge checks before advancing
                e.preventDefault();
                if (pageIndex === totalPages - 1) {
                    handleComplete();
                } else {
                    goNext();
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                if (pageIndex > 0) {
                    e.preventDefault();
                    goPrev();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageIndex, totalPages, isGated, goNext, goPrev, handleComplete]);

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <LessonCompletionCard 
                    lessonTitle={lesson.title}
                    completedConceptsCount={totalPages}
                    estimatedStudyTime={totalReadingTime}
                    onBackToTopic={() => {
                        const targetTopicId = effectiveTopicId || lesson?.topic;
                        if (targetTopicId && targetTopicId !== 'undefined') {
                            if (user?.role === 'teacher') {
                                navigate(`/teacher/topic/${targetTopicId}`);
                            } else {
                                navigate(`/student/topic/${targetTopicId}`);
                            }
                        } else {
                            if (user?.role === 'teacher') {
                                navigate('/teacher/subjects');
                            } else {
                                navigate('/student/subjects');
                            }
                        }
                    }}
                    onReview={() => {
                        progress.resetProgress();
                        setPageIndex(0);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* ── Top bar ──────────────────────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-1 bg-custom-blue transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>

                <div className="max-w-[1536px] mx-auto px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
                    {/* Lesson title + progress meta */}
                    <div className="flex-1 min-w-0">
                        {topicData && (
                            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1 truncate">
                                <button onClick={() => navigate(user?.role === 'teacher' ? '/teacher' : '/student/home')} className="hover:text-custom-blue transition-colors">Dashboard</button>
                                <ChevronRight size={12} className="text-gray-300 shrink-0" />
                                <span className="hover:text-custom-blue cursor-pointer transition-colors truncate" onClick={() => navigate(user?.role === 'teacher' ? `/teacher/subject/${topicData.subject}` : `/student/subject/${topicData.subject}`)}>{topicData.subject_name}</span>
                                <ChevronRight size={12} className="text-gray-300 shrink-0" />
                                <span className="hover:text-custom-blue cursor-pointer transition-colors truncate" onClick={() => navigate(user?.role === 'teacher' ? `/teacher/topic/${effectiveTopicId}` : `/student/topic/${effectiveTopicId}`)}>{topicData.name}</span>
                            </div>
                        )}
                        <h1 className="text-xs sm:text-sm font-bold text-gray-800 truncate">{lesson.title}</h1>
                        <div className="flex items-center gap-2.5 mt-0.5">
                            <span className="text-[11px] sm:text-xs text-custom-blue font-bold">
                                {completionPercentage}% complete
                            </span>
                            <span className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={11} />
                                ~{Math.max(0, totalReadingTime - Math.round(totalReadingTime * completionPercentage / 100))} min left
                            </span>
                        </div>
                    </div>

                    {/* Contents toggle */}
                    <button
                        onClick={() => setShowContents((v) => !v)}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
                        title="Table of Contents"
                    >
                        <LayoutList size={18} />
                    </button>
                </div>
            </div>

            {/* ── Table of Contents overlay ─────────────────────────────── */}
            {showContents && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 flex items-start justify-center pt-16 sm:pt-20 px-3"
                    onClick={() => setShowContents(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 text-base">Table of Contents</h2>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{lesson.title}</p>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-2">
                            {pages.map((page, idx) => {
                                const isDone = completedConcepts.includes(idx);
                                const isCurrent = idx === pageIndex;
                                return (
                                    <button
                                        key={page.key || idx}
                                        onClick={() => { navigateTo(idx); setShowContents(false); }}
                                        className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors min-h-[44px] ${
                                            isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="flex-shrink-0">
                                            {isDone
                                                ? <CheckCircle size={16} className="text-emerald-500" />
                                                : isCurrent
                                                ? <Circle size={16} className="text-custom-blue fill-custom-blue/20" />
                                                : <Circle size={16} className="text-gray-300" />
                                            }
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isCurrent ? 'text-custom-blue' : 'text-gray-700'}`}>
                                                {page.pageTitle || page.title || `Part ${idx + 1}`}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0 font-mono">
                                            {idx + 1}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Page content ─────────────────────────────────────────── */}
            <div key={pageIndex} className="flex-1 w-full animate-slide-up-fade">
                
                {/* Presentation Engine Strategy Rendering */}
                {(() => {
                    const currentPage = pages[pageIndex];
                    const presentationContext = presentation.getPresentationContext(pageIndex);
                    const layoutKey = currentPage?.resolvedLayoutKey || currentPage?.layoutTemplate || 'DiscoveryLayout';
                    const StrategyComponent = LayoutSelectionService.getStrategyComponent(layoutKey);
                    const rawTitle = currentPage?.pageTitle || currentPage?.title || lesson.title;
                    const formatCleanTitle = (str, fallback) => {
                        if (!str || str === '---' || str.startsWith('---')) return fallback;
                        let text = str
                            .replace(/^#+\s*/, '')
                            .replace(/\*\*/g, '')
                            .replace(/^-\s*/, '')
                            .replace(/^Module\s*\d+(\.\d+)?:\s*/i, '')
                            .replace(/^(Core|Key)?\s*Concept\s*(\d+|one|two|three|four|five)?[.:\s\-]*/i, '')
                            .replace(/^(Section|Part|Unit|Phase|Step)\s*\d+[.:\s\-]+/i, '')
                            .trim();
                        return text || fallback;
                    };
                    const cleanTitle = formatCleanTitle(rawTitle, lesson.title);

                    return (
                        <div className="max-w-[1536px] mx-auto w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
                            <div className="mb-6 sm:mb-8 border-b border-gray-200/60 pb-4 sm:pb-6">
                                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                                    <span className="text-[10px] sm:text-[11px] font-bold text-custom-blue bg-blue-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-widest border border-blue-200/60">
                                        Part {pageIndex + 1} of {totalPages}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                                        <Clock size={12} /> ~{readingTime} min read
                                    </span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-gray-900 leading-tight">
                                    {cleanTitle}
                                </h2>
                            </div>

                            <LessonErrorBoundary resetKey={pageIndex}>
                                <StrategyComponent
                                    page={currentPage}
                                    context={presentationContext}
                                    renderBlock={(block) => (
                                        <BlockRenderer key={block.id} block={block} onInteract={handleInteract} />
                                    )}
                                />
                            </LessonErrorBoundary>
                        </div>
                    );
                })()}

                <div className="max-w-[1536px] mx-auto px-4 sm:px-8 pb-8 sm:pb-12">
                    <LessonTimeline 
                        totalPages={totalPages} 
                        currentPageIndex={pageIndex} 
                        completedConcepts={completedConcepts} 
                        onNavigate={navigateTo} 
                    />
                </div>
            </div>

            {/* ── Navigation footer ─────────────────────────────────────── */}
            <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200/60 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1536px] mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
                    <button
                        onClick={goPrev}
                        disabled={pageIndex === 0}
                        className={`flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                            pageIndex === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <ChevronLeft size={18} /> Previous
                    </button>

                    {/* Completion message on last page */}
                    {pageIndex === totalPages - 1 ? (
                        <button
                            onClick={handleComplete}
                            disabled={isGated}
                            className={`flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2.5 min-h-[44px] rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
                                isGated ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            }`}
                        >
                            <CheckCircle size={16} /> Complete Lesson
                        </button>
                    ) : (
                        <button
                            onClick={goNext}
                            disabled={isGated}
                            className={`flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2.5 min-h-[44px] rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
                                isGated ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-custom-blue text-white hover:bg-blue-700'
                            }`}
                        >
                            Continue <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
