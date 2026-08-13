import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import apiClient from '../../../config/apiClient';
import { LessonViewer } from '../../LessonViewer';
import ConceptNavigator from './composer/ConceptNavigator';
import ConceptComposer, { mapBlockTypeToAssetType } from './composer/ConceptComposer';
import QualityBar from './composer/QualityBar';
import PublishGate from './composer/PublishGate';
import AIReviewPanel from './composer/AIReviewPanel';
import {
    ArrowLeft, Eye, Edit, CheckCircle, AlertCircle, X,
    Loader2, Sparkles, RotateCcw, PenTool
} from 'lucide-react';

export default function ContentStudio() {
    const { learningUnitId } = useParams();
    const navigate = useNavigate();

    // ── Data state ────────────────────────────────────────────────────────────
    const [lesson, setLesson] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [assets, setAssets] = useState([]);
    const [activeConceptId, setActiveConceptId] = useState(null);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [isPreview, setIsPreview] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreatingManual, setIsCreatingManual] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [jobStep, setJobStep] = useState(null);
    const [showPublishGate, setShowPublishGate] = useState(false);
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

    // ── Notification ──────────────────────────────────────────────────────────
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), type === 'error' ? 8000 : 4000);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Derived concepts
    // ─────────────────────────────────────────────────────────────────────────
    const concepts = useMemo(() => {
        return groupBlocksIntoConcepts(blocks, assets);
    }, [blocks, assets]);

    // Ensure we always have an active concept if possible
    useEffect(() => {
        if (concepts.length > 0 && !activeConceptId) {
            setActiveConceptId(concepts[0].pageNum);
        }
    }, [concepts, activeConceptId]);

    const activeConcept = useMemo(() => {
        return concepts.find(c => c.pageNum === activeConceptId) || concepts[0];
    }, [concepts, activeConceptId]);

    const lessonDataForPreview = useMemo(() => {
        if (!lesson) return null;
        const blocksWithAssets = blocks.map(block => {
            const blockAssets = assets.filter((a) =>
                a.blocks?.includes(block.id) || a.blocks?.some?.((b) => b === block.id || b?.id === block.id)
            );
            return { ...block, assets: blockAssets };
        });
        return { ...lesson, blocks: blocksWithAssets };
    }, [lesson, blocks, assets]);

    // ─────────────────────────────────────────────────────────────────────────
    // Data fetching
    // ─────────────────────────────────────────────────────────────────────────

    const fetchBlocks = useCallback(async (lessonId) => {
        const response = await apiClient.get(`/api/curriculum/lesson-blocks/?lesson=${lessonId}`);
        const sorted = (response.data.results || response.data || []).sort((a, b) => a.order - b.order);
        setBlocks(sorted);
    }, []);

    const fetchAssets = useCallback(async (lessonId) => {
        try {
            const response = await apiClient.get(`/api/curriculum/lesson-assets/?lesson=${lessonId}`);
            setAssets(response.data.results || response.data || []);
        } catch {
            setAssets([]); // non-critical for V1 lessons
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const lessonRes = await apiClient.get(
                `/api/curriculum/lessons/?learning_unit=${learningUnitId}`
            );
            const lessons = lessonRes.data.results || lessonRes.data || [];
            if (lessons.length > 0) {
                const current = lessons[0];
                setLesson(current);
                await Promise.all([fetchBlocks(current.id), fetchAssets(current.id)]);
            } else {
                setLesson(null);
                setBlocks([]);
                setAssets([]);
            }
        } catch {
            showNotification('error', 'Failed to load lesson data.');
        } finally {
            setIsLoading(false);
        }
    }, [learningUnitId, fetchBlocks, fetchAssets]);

    useEffect(() => {
        if (learningUnitId) fetchAll();
    }, [learningUnitId, fetchAll]);

    // ─────────────────────────────────────────────────────────────────────────
    // Generation
    // ─────────────────────────────────────────────────────────────────────────

    const handleGenerateFullLesson = async () => {
        setIsGenerating(true);
        setJobStep('Starting generation pipeline...');
        try {
            const response = await apiClient.post(
                `/api/curriculum/learning-units/${learningUnitId}/generate_lesson/`,
                { mode: 'learning_experience_planner' }
            );
            pollJob(response.data.job_id);
        } catch {
            showNotification('error', 'Failed to start lesson generation.');
            setIsGenerating(false);
            setJobStep(null);
        }
    };

    const handleCreateManualLesson = async () => {
        setIsCreatingManual(true);
        try {
            await apiClient.post(`/api/curriculum/learning-units/${learningUnitId}/create_manual_lesson/`);
            await fetchAll();
        } catch {
            showNotification('error', 'Failed to create manual lesson.');
        } finally {
            setIsCreatingManual(false);
        }
    };

    const handleRegenerateBlock = async (blockId) => {
        setIsGenerating(true);
        setJobStep('Regenerating component...');
        try {
            const response = await apiClient.post(
                `/api/curriculum/lesson-blocks/${blockId}/regenerate/`
            );
            pollJob(response.data.job_id);
        } catch {
            showNotification('error', 'Failed to start component regeneration.');
            setIsGenerating(false);
            setJobStep(null);
        }
    };

    const GENERATION_STEPS = [
        'Retrieving knowledge chunks...',
        'Building prompt...',
        'Generating content...',
        'Saving lesson blocks...',
        'Finalising...',
    ];

    const pollJob = (jobId) => {
        let stepIdx = 0;
        const stepTimer = setInterval(() => {
            stepIdx = Math.min(stepIdx + 1, GENERATION_STEPS.length - 1);
            setJobStep(GENERATION_STEPS[stepIdx]);
        }, 3000);

        const poll = setInterval(async () => {
            try {
                const jobResponse = await apiClient.get(`/api/curriculum/generation-jobs/${jobId}/`);
                if (jobResponse.data.status === 'completed') {
                    clearInterval(poll);
                    clearInterval(stepTimer);
                    await fetchAll();
                    setIsGenerating(false);
                    setJobStep(null);
                    showNotification('success', 'Content generated successfully.');
                } else if (jobResponse.data.status === 'failed') {
                    clearInterval(poll);
                    clearInterval(stepTimer);
                    showNotification(
                        'error',
                        `We couldn't complete the lesson generation.\nNo lesson content was lost.\nYou can retry generation once the AI service becomes available.`
                    );
                    setIsGenerating(false);
                    setJobStep(null);
                }
            } catch { /* transient polling errors */ }
        }, 2000);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Block operations (all V1 API calls — unchanged)
    // ─────────────────────────────────────────────────────────────────────────

    const saveBlock = async (block) => {
        try {
            await apiClient.patch(`/api/curriculum/lesson-blocks/${block.id}/`, {
                content: block.content,
                title: block.title,
            });
        } catch {
            showNotification('error', 'Failed to save. Please try again.');
        }
    };

    const deleteBlock = async (blockId) => {
        if (!window.confirm('Delete this component? This cannot be undone.')) return;
        try {
            await apiClient.delete(`/api/curriculum/lesson-blocks/${blockId}/`);
            await fetchBlocks(lesson.id);
        } catch {
            showNotification('error', 'Failed to delete component.');
        }
    };

    const duplicateBlock = async (block) => {
        try {
            await apiClient.post(`/api/curriculum/lesson-blocks/`, {
                lesson: lesson.id,
                block_type: block.block_type,
                title: `${block.title} (Copy)`,
                content: block.content,
                order: block.order + 1,
            });
            await fetchBlocks(lesson.id);
        } catch {
            showNotification('error', 'Failed to duplicate component.');
        }
    };

    const addBlock = async (pageNum, blockType, title) => {
        if (!lesson) return;
        
        try {
            // Determine order. Max globally + 1.
            const maxOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.order || 0)) : 0;
            const newOrder = maxOrder + 1;
            
            // Check if pageNum is a V1 legacy group or an actual concept
            const isV1 = typeof pageNum === 'string' && pageNum.startsWith('v1_');
            const targetPageNum = isV1 ? null : pageNum;

            await apiClient.post(`/api/curriculum/lesson-blocks/`, {
                lesson: lesson.id,
                block_type: blockType,
                title: title,
                content: {}, 
                order: newOrder,
                page_number: targetPageNum,
            });
            await fetchBlocks(lesson.id);
        } catch {
            showNotification('error', 'Failed to add component.');
        }
    };

    const addBlockWithFile = async (pageNum, blockType, title, file) => {
        if (!lesson) return;
        
        try {
            const maxOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.order || 0)) : 0;
            const newOrder = maxOrder + 1;
            const isV1 = typeof pageNum === 'string' && pageNum.startsWith('v1_');
            const targetPageNum = isV1 ? null : pageNum;

            // 1. Create block
            const blockRes = await apiClient.post(`/api/curriculum/lesson-blocks/`, {
                lesson: lesson.id,
                block_type: blockType,
                title: title,
                content: {}, 
                order: newOrder,
                page_number: targetPageNum,
            });
            const newBlockId = blockRes.data.id;

            // 2. Upload file to create asset
            const formData = new FormData();
            formData.append('file', file);
            formData.append('storage_type', 'file');
            formData.append('status', 'attached');
            formData.append('lesson', lesson.id);
            formData.append('asset_type', mapBlockTypeToAssetType(blockType));
            formData.append('title', title);
            
            const assetRes = await apiClient.post(`/api/curriculum/lesson-assets/`, formData);

            // 3. Attach asset to block
            await apiClient.post(`/api/curriculum/lesson-assets/${assetRes.data.id}/attach_to_block/`, {
                block_id: newBlockId
            });

            await fetchBlocks(lesson.id);
            await fetchAssets(lesson.id);
        } catch (e) {
            showNotification('error', 'Failed to upload and add component.');
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Publish  (goes through the gate modal)
    // ─────────────────────────────────────────────────────────────────────────

    const handlePublish = async () => {
        if (!lesson) return;
        setShowPublishGate(false);
        try {
            await apiClient.post(`/api/curriculum/lessons/${lesson.id}/publish/`);
            showNotification('success', 'Lesson published successfully!');
            fetchAll();
        } catch (error) {
            if (error.response?.data?.errors) {
                showNotification('error', 'Publish failed:\n' + error.response.data.errors.join('\n'));
            } else {
                showNotification('error', 'Failed to publish lesson.');
            }
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Optimistic block update
    // ─────────────────────────────────────────────────────────────────────────

    const handleBlockChange = (updatedBlock) => {
        setBlocks((prev) => prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
    };

    const handleMoveBlock = async (blockId, direction) => {
        const idx = blocks.findIndex(b => b.id === blockId);
        if (idx < 0) return;
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        
        // Swap orders
        const tempOrder = newBlocks[idx].order;
        newBlocks[idx].order = newBlocks[targetIdx].order;
        newBlocks[targetIdx].order = tempOrder;
        
        // Swap in array
        const temp = newBlocks[idx];
        newBlocks[idx] = newBlocks[targetIdx];
        newBlocks[targetIdx] = temp;
        
        setBlocks(newBlocks);
        
        try {
            await apiClient.post('/api/curriculum/lesson-blocks/reorder/', {
                ordering: newBlocks.map((b, i) => ({ id: b.id, order: i }))
            });
        } catch {
            showNotification('error', 'Failed to reorder blocks.');
            fetchBlocks(lesson.id);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Empty / loading states
    // ─────────────────────────────────────────────────────────────────────────

    if (!learningUnitId) {
        return (
            <EmptyState
                icon="📚"
                title="No Learning Unit Selected"
                subtitle="Select a learning unit from the dashboard."
            />
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">
                <Loader2 className="animate-spin mr-2" size={20} />
                Loading Lesson Composer...
            </div>
        );
    }

    if (!lesson && !isGenerating) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
                    <div className="text-5xl mb-4">✨</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Create Lesson</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        No lesson exists for this learning unit yet. Select how you would like to create it.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={handleGenerateFullLesson}
                            className="w-full py-3 bg-custom-blue text-white rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm shadow-sm"
                        >
                            <Sparkles size={18} /> Generate with AI
                        </button>
                        <button
                            onClick={handleCreateManualLesson}
                            disabled={isCreatingManual}
                            className="w-full py-3 bg-white text-gray-800 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50"
                        >
                            {isCreatingManual ? (
                                <Loader2 className="animate-spin text-gray-500" size={18} />
                            ) : (
                                <PenTool className="text-custom-orange" size={18} />
                            )}
                            Create Manually
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isGenerating) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 gap-4">
                <Loader2 className="animate-spin text-custom-blue" size={40} />
                <p className="text-xl font-bold text-gray-700">Generating Lesson</p>
                <p className="text-gray-500 text-sm animate-pulse">{jobStep || 'Processing...'}</p>
                <div className="flex gap-2 mt-4">
                    {['Retrieve', 'Prompt', 'Generate', 'Save'].map((step, i) => (
                        <div key={step} className="flex items-center gap-1 text-xs text-gray-400">
                            <span className={`w-2 h-2 rounded-full ${
                                jobStep && i <= Math.floor((['Retrieve','Prompt','Generate','Save'].indexOf(
                                    step
                                ) / 3) * 4) ? 'bg-custom-blue' : 'bg-gray-200'
                            }`} />
                            {step}
                        </div>
                    ))}
                </div>
            </div>
        );
    }



    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">

            {/* ── Global notification ────────────────────────────────────── */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-start gap-3 p-4 rounded-xl shadow-xl max-w-sm border ${
                    notification.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                    {notification.type === 'error'
                        ? <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        : <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    }
                    <p className="text-sm whitespace-pre-line flex-1">{notification.message}</p>
                    <button onClick={() => setNotification(null)} className="flex-shrink-0 opacity-60 hover:opacity-100">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* ── Top Panel: QualityBar (Health Dashboard) ────────────────────────────────── */}
            {!isPreview && (
                <QualityBar
                    blocks={blocks}
                    assets={assets}
                    concepts={concepts}
                    onPublish={() => setShowPublishGate(true)}
                    lessonStatus={lesson?.status}
                />
            )}

            {/* ── Main content area ────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* ── LEFT: Concept Navigator (Blueprint) ────────────────────────────────── */}
                {!isPreview && (
                    <div className="w-80 flex-shrink-0 bg-white hidden md:flex flex-col z-10 relative shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)]">
                        {/* Back + preview toggle + regenerate */}
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <button
                                onClick={() => navigate('/admin-dashboard/curriculum-builder')}
                                className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-xs font-medium transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to Curriculum
                            </button>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setShowRegenerateConfirm(true)}
                                    disabled={isGenerating}
                                    title="Regenerate full lesson"
                                    className="px-2.5 py-1.5 flex items-center gap-1 rounded-lg text-xs font-semibold transition-all bg-orange-50 text-custom-orange hover:bg-orange-100 disabled:opacity-40"
                                >
                                    <RotateCcw size={12} /> Regenerate
                                </button>
                                <button
                                    onClick={() => setIsPreview(!isPreview)}
                                    className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all bg-gray-200 text-gray-600 hover:bg-gray-300"
                                >
                                    <Eye size={13} /> Preview
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ConceptNavigator
                                concepts={concepts}
                                activeConceptId={activeConceptId}
                                onSelectConcept={setActiveConceptId}
                                lessonTitle={lesson?.title}
                                lessonStatus={lesson?.status}
                                lessonVersion={lesson?.version}
                            />
                        </div>
                    </div>
                )}

                {/* ── CENTER: Composer / Preview ──────────────────────────────── */}
                <div className="flex-1 flex flex-col overflow-hidden relative z-0 bg-gray-50">
                    {isPreview ? (
                        <div className="flex-1 overflow-y-auto bg-gray-100 flex flex-col relative">
                            {/* Editor back button overlay */}
                            <div className="absolute top-4 right-4 z-50">
                                <button
                                    onClick={() => setIsPreview(false)}
                                    className="px-4 py-2 bg-custom-blue text-white rounded-lg text-sm font-bold shadow-lg hover:opacity-90 flex items-center gap-2"
                                >
                                    <Edit size={14} /> Exit Preview
                                </button>
                            </div>
                            <LessonViewer lessonData={lessonDataForPreview} paginated={true} />
                        </div>
                    ) : (
                            <ConceptComposer
                                concept={activeConcept}
                                allAssets={assets}
                                lessonId={lesson?.id}
                                onBlockChange={handleBlockChange}
                                onSave={saveBlock}
                                onDelete={deleteBlock}
                                onDuplicate={duplicateBlock}
                                onAddBlock={addBlock}
                                onAddBlockWithFile={addBlockWithFile}
                                onRegenerate={handleRegenerateBlock}
                                onAssetUpdated={() => fetchAssets(lesson?.id)}
                                onMove={handleMoveBlock}
                            />
                    )}
                </div>

                {/* ── RIGHT: AI Review Panel ────────────────────────────────── */}
                {!isPreview && (
                    <div className="hidden lg:block shrink-0">
                        <AIReviewPanel lesson={lesson} blocks={blocks} assets={assets} />
                    </div>
                )}

            </div>

            {/* ── Publish Gate Modal ─────────────────────────────────────── */}
            {showPublishGate && (
                <PublishGate
                    blocks={blocks}
                    assets={assets}
                    concepts={concepts}
                    qualityReport={lesson?.quality_report}
                    onConfirm={handlePublish}
                    onCancel={() => setShowPublishGate(false)}
                />
            )}

            {/* ── Regenerate Confirmation Modal ──────────────────────────── */}
            {showRegenerateConfirm && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100">
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-5 mx-auto">
                            <RotateCcw size={22} className="text-custom-orange" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Regenerate Full Lesson?</h2>
                        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                            This will <span className="font-semibold text-red-600">delete all current lesson blocks</span> and
                            re-run the full AI generation pipeline from scratch using the latest Knowledge Repository content.
                            <br/><br/>
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRegenerateConfirm(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowRegenerateConfirm(false);
                                    handleGenerateFullLesson();
                                }}
                                className="flex-1 py-2.5 bg-custom-orange text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={14} /> Yes, Regenerate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function EmptyState({ icon, title, subtitle }) {
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-50 gap-3">
            <div className="text-5xl">{icon}</div>
            <h2 className="text-xl font-bold text-gray-700">{title}</h2>
            <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Logic: Intelligent Legacy Grouping
// ─────────────────────────────────────────────────────────────────────────────
export function extractText(content) {
    if (!content) return '';
    if (typeof content === 'string') {
        try { return JSON.parse(content)?.text || content; } catch { return content; }
    }
    return content.text || content.content || '';
}

function groupBlocksIntoConcepts(blocks, assets = []) {
    const pages = {};
    const pageOrder = [];
    
    let v1ConceptCounter = 1;
    let currentV1ConceptType = null;
    
    const getGroupType = (blockType) => {
        if (['overview', 'introduction', 'objectives', 'learning_goal'].includes(blockType)) return 'intro';
        if (['concept_explanation', 'core_explanation', 'visual_learning', 'worked_example', 'real_world_example', 'definitions', 'transition'].includes(blockType)) return 'core';
        if (['experiment'].includes(blockType)) return 'activity';
        if (['knowledge_check', 'revision_questions'].includes(blockType)) return 'assessment';
        if (['summary', 'callout'].includes(blockType)) return 'summary';
        return null;
    };

    blocks.forEach((block) => {
        if (block.page_number != null) {
            const pageNum = block.page_number;
            if (!pages[pageNum]) {
                pages[pageNum] = {
                    pageNum,
                    pageTitle: block.page_title || `Concept ${pageNum}`,
                    blocks: [],
                    isV1: false,
                    goal: '',
                    assets: [],
                };
                pageOrder.push(pageNum);
            }
            pages[pageNum].blocks.push(block);
        } else {
            const groupType = getGroupType(block.block_type);
            
            if (groupType && groupType !== currentV1ConceptType) {
                currentV1ConceptType = groupType;
                v1ConceptCounter++;
            }
            if (!currentV1ConceptType) {
                currentV1ConceptType = 'core';
                v1ConceptCounter++;
            }

            const pageNum = `v1_${v1ConceptCounter}`;
            if (!pages[pageNum]) {
                let title = `Concept ${v1ConceptCounter}`;
                if (currentV1ConceptType === 'intro') title = 'Introduction & Goals';
                if (currentV1ConceptType === 'core') title = 'Core Concept';
                if (currentV1ConceptType === 'activity') title = 'Activity / Experiment';
                if (currentV1ConceptType === 'assessment') title = 'Knowledge Check';
                if (currentV1ConceptType === 'summary') title = 'Summary & Key Points';

                pages[pageNum] = {
                    pageNum,
                    pageTitle: title,
                    blocks: [],
                    isV1: true,
                    goal: '',
                    assets: [],
                };
                pageOrder.push(pageNum);
            }
            pages[pageNum].blocks.push(block);
        }
    });

    const result = pageOrder.map((k) => pages[k]);
    
    result.forEach(concept => {
        const goalBlock = concept.blocks.find(b => ['learning_goal', 'objectives'].includes(b.block_type));
        if (goalBlock) {
            concept.goal = extractText(goalBlock.content);
        } else {
            const expBlock = concept.blocks.find(b => ['concept_explanation', 'core_explanation', 'overview'].includes(b.block_type));
            if (expBlock) {
                const text = extractText(expBlock.content);
                concept.goal = text ? text.substring(0, 150) + '...' : 'No explicit goal defined';
            } else {
                concept.goal = 'No explicit goal defined';
            }
        }
        
        const conceptBlockIds = concept.blocks.map(b => b.id);
        concept.assets = assets.filter(a => 
            a.blocks && a.blocks.some(bId => conceptBlockIds.includes(bId))
        );
        
        concept.repoUsage = concept.assets.filter(a => a.source_type === 'knowledge_repository').length;
        
        const pendingAssets = concept.assets.filter(a => a.status === 'pending');
        if (pendingAssets.length > 0) {
            concept.status = 'Missing Media';
            concept.statusColor = 'text-amber-600 bg-amber-50';
        } else if (concept.blocks.length === 0) {
            concept.status = 'Empty';
            concept.statusColor = 'text-gray-600 bg-gray-50';
        } else {
            concept.status = 'Complete';
            concept.statusColor = 'text-emerald-600 bg-emerald-50';
        }
    });

    return result;
}
