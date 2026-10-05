import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import apiClient from '../../../config/apiClient';
import { LessonViewer } from '../../LessonViewer';
import ConceptNavigator from './composer/ConceptNavigator';
import ConceptComposer from './composer/ConceptComposer';
import QualityBar from './composer/QualityBar';
import PublishGate from './composer/PublishGate';
import AIReviewPanel from './composer/AIReviewPanel';
import { isAssetPresent, getBlockMedia } from '../../../utils/assetUtils';
import { SUGGESTED_TYPES, mapBlockTypeToAssetType } from '../../../utils/blockTypeConstants';
import { extractText } from '../../../utils/contentUtils';
import { useGeneration } from '../../../Context/GenerationContext';
import {
    ArrowLeft, Eye, Edit, CheckCircle, AlertCircle, X,
    Loader2, Sparkles, RotateCcw, PenTool, Save,
    PanelLeft, PanelRight, ChevronRight, Check
} from 'lucide-react';

export default function ContentStudio() {
    const { learningUnitId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryLessonId = searchParams.get('lessonId');
    const targetBlockId = searchParams.get('targetBlock');
    const targetPage = searchParams.get('targetPage');

    // ── Data state ────────────────────────────────────────────────────────────
    const [lesson, setLesson] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [assets, setAssets] = useState([]);
    const [activeConceptId, setActiveConceptId] = useState(null);

    // ── Persistence & panel state ─────────────────────────────────────────────
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);
    const [isCoachCollapsed, setIsCoachCollapsed] = useState(false);
    const [coachWidth, setCoachWidth] = useState(380);
    const isDraggingCoachRef = useRef(false);

    const startResizeCoach = useCallback((e) => {
        e.preventDefault();
        isDraggingCoachRef.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const onMouseMove = (moveEvent) => {
            if (!isDraggingCoachRef.current) return;
            const newWidth = window.innerWidth - moveEvent.clientX;
            const minWidth = 320;
            const maxWidth = Math.max(minWidth, Math.round(window.innerWidth * 0.65));
            setCoachWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
        };

        const onMouseUp = () => {
            isDraggingCoachRef.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, []);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [isPreview, setIsPreview] = useState(false);
    const [isCreatingManual, setIsCreatingManual] = useState(false);
    const [isStartingGeneration, setIsStartingGeneration] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [regeneratingBlockId, setRegeneratingBlockId] = useState(null);
    const [showPublishGate, setShowPublishGate] = useState(false);
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

    // ── Generation state from global context ──────────────────────────────────
    const { startGeneration, isGeneratingUnit, getJobForUnit, setIsMonitorOpen } = useGeneration();
    const isThisUnitGenerating = isGeneratingUnit(learningUnitId);
    const activeUnitJob = getJobForUnit(learningUnitId);

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
        const response = await apiClient.get(`/api/curriculum/lesson-blocks/?lesson=${lessonId}&page_size=1000`);
        const sorted = (response.data.results || response.data || []).sort((a, b) => a.order - b.order);
        setBlocks(sorted);
    }, []);

    const fetchAssets = useCallback(async (lessonId) => {
        try {
            const response = await apiClient.get(`/api/curriculum/lesson-assets/?lesson=${lessonId}&page_size=1000`);
            setAssets(response.data.results || response.data || []);
        } catch {
            setAssets([]); // non-critical for V1 lessons
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            let current = null;
            if (learningUnitId) {
                const lessonRes = await apiClient.get(
                    `/api/curriculum/lessons/?learning_unit=${learningUnitId}`
                );
                const lessons = lessonRes.data.results || lessonRes.data || [];
                if (lessons.length > 0) current = lessons[0];
            } else if (queryLessonId) {
                const lessonRes = await apiClient.get(
                    `/api/curriculum/lessons/${queryLessonId}/`
                );
                current = lessonRes.data;
            }

            if (current) {
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
    }, [learningUnitId, queryLessonId, fetchBlocks, fetchAssets]);

    useEffect(() => {
        if (learningUnitId || queryLessonId) fetchAll();
    }, [learningUnitId, queryLessonId, fetchAll]);

    // ── Auto-select concept page when targetBlock or targetPage is specified ──
    useEffect(() => {
        if (blocks.length > 0) {
            if (targetBlockId) {
                const matchedBlock = blocks.find(b => String(b.id) === String(targetBlockId));
                if (matchedBlock && matchedBlock.page_number) {
                    setActiveConceptId(matchedBlock.page_number);
                }
            } else if (targetPage) {
                const p = parseInt(targetPage, 10);
                if (!isNaN(p)) {
                    setActiveConceptId(p);
                }
            }
        }
    }, [blocks, targetBlockId, targetPage]);

    // ── Listen for background generation completion ──────────────────────────
    useEffect(() => {
        const handleLessonGenerated = (e) => {
            if (String(e.detail?.learningUnitId) === String(learningUnitId)) {
                fetchAll();
                showNotification('success', 'Lesson generated! Updated content loaded.');
            }
        };
        window.addEventListener('vlearn:lesson-generated', handleLessonGenerated);
        return () => {
            window.removeEventListener('vlearn:lesson-generated', handleLessonGenerated);
        };
    }, [learningUnitId, fetchAll]);

    // ─────────────────────────────────────────────────────────────────────────
    // Generation
    // ─────────────────────────────────────────────────────────────────────────

    const handleGenerateFullLesson = async () => {
        setIsStartingGeneration(true);
        try {
            await startGeneration({
                learningUnitId,
                unitTitle: lesson?.title || `Learning Unit ${learningUnitId}`,
                mode: 'learning_experience_planner',
            });
            showNotification('success', 'Lesson generation started in background. You can track progress or continue working.');
        } catch (error) {
            showNotification(
                'error',
                error.response?.data?.error || error.response?.data?.detail || error.message || 'Failed to start lesson generation.'
            );
        } finally {
            setIsStartingGeneration(false);
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
        setRegeneratingBlockId(blockId);
        showNotification('success', 'Regenerating component in background...');
        try {
            const response = await apiClient.post(
                `/api/curriculum/lesson-blocks/${blockId}/regenerate/`
            );
            pollBlockJob(response.data.job_id);
        } catch {
            showNotification('error', 'Failed to start component regeneration.');
            setRegeneratingBlockId(null);
        }
    };

    const pollBlockJob = (jobId) => {
        const poll = setInterval(async () => {
            try {
                const jobResponse = await apiClient.get(`/api/curriculum/generation-jobs/${jobId}/`);
                if (jobResponse.data.status === 'completed') {
                    clearInterval(poll);
                    setRegeneratingBlockId(null);
                    await fetchAll();
                    showNotification('success', 'Component regenerated successfully.');
                } else if (jobResponse.data.status === 'failed') {
                    clearInterval(poll);
                    setRegeneratingBlockId(null);
                    showNotification('error', 'Component regeneration failed. Please try again.');
                }
            } catch { /* transient polling errors */ }
        }, 2000);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Block operations (all V1 API calls — unchanged)
    // ─────────────────────────────────────────────────────────────────────────

    const saveBlock = async (block) => {
        setSaveStatus('saving');
        try {
            await apiClient.patch(`/api/curriculum/lesson-blocks/${block.id}/`, {
                content: block.content,
                title: block.title,
                page_title: block.page_title,
                order: block.order,
                component_order: block.component_order ?? block.order,
            });
            setSaveStatus('saved');
            setHasUnsavedChanges(false);
        } catch {
            setSaveStatus('unsaved');
            showNotification('error', 'Failed to save. Please try again.');
        }
    };

    const handleSaveCardTitle = async (pageNum, newTitle) => {
        let blocksInPage = blocks.filter(b => b.page_number === pageNum);
        // Fallback for V1 lessons where blocks have null page_number
        if (blocksInPage.length === 0 && activeConcept) {
            const activeIds = new Set((activeConcept.blocks || []).map(b => b.id));
            blocksInPage = blocks.filter(b => activeIds.has(b.id));
        }
        if (blocksInPage.length === 0) return;

        setSaveStatus('saving');
        const targetIds = new Set(blocksInPage.map(b => b.id));
        // Optimistic local state update
        setBlocks(prev => prev.map(b => targetIds.has(b.id) ? { ...b, page_title: newTitle } : b));

        try {
            await Promise.all(
                blocksInPage.map(b =>
                    apiClient.patch(`/api/curriculum/lesson-blocks/${b.id}/`, { page_title: newTitle })
                )
            );
            setSaveStatus('saved');
            showNotification('success', 'Card title updated.');
        } catch {
            setSaveStatus('unsaved');
            showNotification('error', 'Failed to update card title on server.');
            // Do NOT overwrite local state with stale fetchBlocks; preserves in-flight edits
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
                component_type: blockType,
                title: title,
                content: {}, 
                order: newOrder,
                page_number: targetPageNum,
                metadata: {
                    component_tag: blockType,
                    visualization_type: blockType.includes('diagram') ? 'diagram' : blockType.includes('simulation') ? 'simulation' : (blockType.includes('video') || blockType.includes('youtube')) ? 'video' : 'component',
                    created_via: 'add_component_manual',
                }
            });
            await fetchBlocks(lesson.id);
        } catch {
            showNotification('error', 'Failed to add component.');
        }
    };

    const handleAddConcept = async () => {
        if (!lesson) return;
        try {
            const maxPage = blocks.reduce((max, b) => Math.max(max, typeof b.page_number === 'number' ? b.page_number : 0), 0);
            const newPageNum = maxPage + 1;
            const maxOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.order || 0)) : 0;
            
            await apiClient.post(`/api/curriculum/lesson-blocks/`, {
                lesson: lesson.id,
                block_type: 'concept_explanation',
                title: `Part ${newPageNum}: New Concept`,
                content: { text: '' },
                order: maxOrder + 1,
                page_number: newPageNum,
                page_title: `Part ${newPageNum}: New Concept`,
            });
            await fetchBlocks(lesson.id);
            setActiveConceptId(newPageNum);
            showNotification('success', `Created Card ${newPageNum}.`);
        } catch {
            showNotification('error', 'Failed to create new card.');
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
                component_type: blockType,
                title: title,
                content: {}, 
                order: newOrder,
                page_number: targetPageNum,
                metadata: {
                    component_tag: blockType,
                    visualization_type: mapBlockTypeToAssetType(blockType),
                    created_via: 'add_component_file_upload',
                }
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
            const data = error.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                showNotification('error', 'Publish failed:\n' + data.errors.join('\n'));
            } else if (data?.detail) {
                showNotification('error', `Publish failed: ${data.detail}`);
            } else if (data?.error) {
                showNotification('error', `Publish failed: ${data.error}`);
            } else if (data?.message) {
                showNotification('error', `Publish failed: ${data.message}`);
            } else {
                showNotification('error', error.message || 'Failed to publish lesson.');
            }
        }
    };

    const handleSaveDraft = async () => {
        if (!lesson) return;
        try {
            await apiClient.patch(`/api/curriculum/lessons/${lesson.id}/`, { status: 'draft' });
            setLesson(prev => ({ ...prev, status: 'draft' }));
            showNotification('success', 'Draft status saved.');
        } catch {
            showNotification('error', 'Failed to save draft.');
        }
    };

    const handleSaveChanges = useCallback(async () => {
        if (!lesson) return;
        setSaveStatus('saving');
        try {
            await Promise.all(
                blocks.map(b =>
                    apiClient.patch(`/api/curriculum/lesson-blocks/${b.id}/`, {
                        content: b.content,
                        title: b.title,
                        page_title: b.page_title,
                        order: b.order,
                        component_order: b.component_order ?? b.order,
                    })
                )
            );
            setSaveStatus('saved');
            setHasUnsavedChanges(false);
            showNotification('success', 'All changes saved.');
        } catch {
            setSaveStatus('unsaved');
            showNotification('error', 'Failed to save changes.');
        }
    }, [lesson, blocks]);

    // ─────────────────────────────────────────────────────────────────────────
    // Optimistic block update & listeners
    // ─────────────────────────────────────────────────────────────────────────

    const handleBlockChange = (updatedBlock) => {
        setHasUnsavedChanges(true);
        setSaveStatus('unsaved');
        setBlocks((prev) => prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveChanges();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSaveChanges]);

    const handleMoveBlock = async (blockId, direction) => {
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;
        const pageNum = block.page_number;

        // Scope reorder strictly within the active card/page
        const pageBlocks = blocks
            .filter(b => b.page_number === pageNum)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        const pageIdx = pageBlocks.findIndex(b => b.id === blockId);
        if (pageIdx < 0) return;
        if (direction === 'up' && pageIdx === 0) return;
        if (direction === 'down' && pageIdx === pageBlocks.length - 1) return;

        const targetIdx = direction === 'up' ? pageIdx - 1 : pageIdx + 1;
        const targetBlock = pageBlocks[targetIdx];

        const newBlocks = blocks.map(b => {
            if (b.id === block.id) return { ...b, order: targetBlock.order, component_order: targetBlock.order };
            if (b.id === targetBlock.id) return { ...b, order: block.order, component_order: block.order };
            return b;
        }).sort((a, b) => (a.order || 0) - (b.order || 0));

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

    const handleReorderBlocks = async (sourceBlockId, targetBlockId) => {
        const sourceBlock = blocks.find(b => String(b.id) === String(sourceBlockId));
        const targetBlock = blocks.find(b => String(b.id) === String(targetBlockId));
        if (!sourceBlock || !targetBlock || sourceBlock.id === targetBlock.id) return;

        const pageNum = sourceBlock.page_number;
        if (pageNum !== targetBlock.page_number) return;

        const pageBlocks = blocks
            .filter(b => b.page_number === pageNum)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        const sourceIdx = pageBlocks.findIndex(b => b.id === sourceBlock.id);
        const targetIdx = pageBlocks.findIndex(b => b.id === targetBlock.id);
        if (sourceIdx < 0 || targetIdx < 0) return;

        const reordered = [...pageBlocks];
        const [moved] = reordered.splice(sourceIdx, 1);
        reordered.splice(targetIdx, 0, moved);

        const slotOrders = pageBlocks.map(b => b.order);
        const updatedPageBlocksMap = new Map();
        reordered.forEach((b, idx) => {
            updatedPageBlocksMap.set(b.id, slotOrders[idx]);
        });

        const newBlocks = blocks.map(b => {
            if (updatedPageBlocksMap.has(b.id)) {
                const newOrder = updatedPageBlocksMap.get(b.id);
                return { ...b, order: newOrder, component_order: newOrder };
            }
            return b;
        }).sort((a, b) => (a.order || 0) - (b.order || 0));

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

    if (!learningUnitId && !queryLessonId) {
        return (
            <EmptyState
                icon="📚"
                title="No Learning Unit or Lesson Selected"
                subtitle="Select a learning unit or lesson from Course Management or the Issue Reports queue."
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

    if (!lesson) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full relative">
                    <button
                        onClick={() => navigate('/admin-dashboard/curriculum-builder')}
                        className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="Back to Curriculum"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    {isThisUnitGenerating ? (
                        <div className="space-y-4 pt-2">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-custom-blue flex items-center justify-center mx-auto shadow-inner">
                                <Loader2 className="animate-spin text-custom-blue" size={32} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Generating Lesson</h2>
                                <p className="text-gray-500 text-xs mt-1 animate-pulse min-h-[1.25rem]">
                                    {activeUnitJob?.step || 'Synthesizing pedagogical structure...'}
                                </p>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-custom-blue h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${activeUnitJob?.progressPercent || 35}%` }}
                                />
                            </div>

                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                You can safely navigate away to work on other topics. Generation will proceed in the background.
                            </p>

                            <div className="pt-2 flex flex-col gap-2">
                                <button
                                    onClick={() => setIsMonitorOpen(true)}
                                    className="w-full py-2.5 bg-blue-50 text-custom-blue rounded-xl font-semibold hover:bg-blue-100 transition text-xs border border-blue-200"
                                >
                                    View Generation Monitor
                                </button>
                                <button
                                    onClick={() => navigate('/admin-dashboard/curriculum-builder')}
                                    className="w-full py-2.5 text-gray-500 hover:text-gray-700 rounded-xl font-medium transition text-xs"
                                >
                                    Back to Curriculum
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-5xl mb-4">✨</div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Create Lesson</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                No lesson exists for this learning unit yet. Select how you would like to create it.
                            </p>

                            {activeUnitJob?.status === 'failed' && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs text-red-700">
                                    <p className="font-semibold mb-1">Previous Generation Failed</p>
                                    <p className="text-red-600 mb-2">{activeUnitJob.errorMessage || 'Unknown error occurred.'}</p>
                                    <p className="text-gray-500">You can retry generation or create manually.</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={handleGenerateFullLesson}
                                    disabled={isStartingGeneration || isThisUnitGenerating}
                                    className="w-full py-3 bg-custom-blue text-white rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isStartingGeneration ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Starting Generation...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} /> Generate with AI
                                        </>
                                    )}
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
                    )}
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

            {/* ── Background generation banner ───────────────────────────── */}
            {isThisUnitGenerating && (
                <div className="bg-blue-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-sm z-30">
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium">
                            Regenerating lesson in background: {activeUnitJob?.step || 'Synthesizing pedagogical structure...'}
                        </span>
                        <span className="bg-blue-700/80 px-2 py-0.5 rounded-full text-[10px]">
                            {activeUnitJob?.progressPercent || 30}%
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-blue-200 text-[11px]">You can continue editing or leave this page safely.</span>
                        <button
                            onClick={() => setIsMonitorOpen(true)}
                            className="underline hover:text-blue-100 font-semibold"
                        >
                            View Monitor
                        </button>
                    </div>
                </div>
            )}

            {/* ── Top Studio Header Bar ────────────────────────────────────────── */}
            {!isPreview && (
                <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between text-xs shadow-sm z-30">
                    {/* Left: Navigator toggle, Back, Breadcrumbs */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setIsNavigatorCollapsed(!isNavigatorCollapsed)}
                            title={isNavigatorCollapsed ? "Expand Blueprint Navigator" : "Collapse Blueprint Navigator"}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition shrink-0"
                        >
                            <PanelLeft size={16} className={isNavigatorCollapsed ? "text-gray-400" : "text-custom-blue"} />
                        </button>

                        <button
                            onClick={() => navigate('/admin-dashboard/curriculum-builder')}
                            className="text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium transition-colors shrink-0"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>

                        <div className="h-4 w-px bg-gray-200 shrink-0" />

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-1.5 text-gray-500 font-medium truncate">
                            {lesson?.grade_name && (
                                <>
                                    <span className="truncate">{lesson.grade_name}</span>
                                    <ChevronRight size={12} className="text-gray-400 shrink-0" />
                                </>
                            )}
                            <button
                                onClick={() => navigate('/admin-dashboard/curriculum-builder')}
                                className="hover:text-custom-blue truncate transition-colors text-left"
                            >
                                {lesson?.subject_name || 'Curriculum'}
                            </button>
                            {lesson?.topic_name && (
                                <>
                                    <ChevronRight size={12} className="text-gray-400 shrink-0" />
                                    <span className="truncate">{lesson.topic_name}</span>
                                </>
                            )}
                            {(lesson?.learning_unit_name || lesson?.title) && (
                                <>
                                    <ChevronRight size={12} className="text-gray-400 shrink-0" />
                                    <span className="font-semibold text-gray-800 truncate">
                                        {lesson?.learning_unit_name || lesson?.title}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Save Action, Regenerate, Preview, Coach Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Consolidated Save Button */}
                        <button
                            onClick={handleSaveChanges}
                            disabled={saveStatus === 'saving' || !hasUnsavedChanges}
                            title={
                                saveStatus === 'saving'
                                    ? 'Saving changes...'
                                    : hasUnsavedChanges
                                    ? 'Save all changes (Ctrl+S / Cmd+S)'
                                    : 'All changes saved to cloud'
                            }
                            className={`px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                saveStatus === 'saving'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 cursor-wait'
                                    : hasUnsavedChanges
                                    ? 'bg-custom-blue border-custom-blue text-white shadow-sm hover:opacity-95 cursor-pointer ring-2 ring-blue-400/20'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
                            }`}
                        >
                            {saveStatus === 'saving' ? (
                                <>
                                    <Loader2 size={13} className="animate-spin text-blue-600" />
                                    <span>Saving...</span>
                                </>
                            ) : hasUnsavedChanges ? (
                                <>
                                    <Save size={13} />
                                    <span>Save Changes</span>
                                </>
                            ) : (
                                <>
                                    <Check size={13} className="text-emerald-600" />
                                    <span>Saved</span>
                                </>
                            )}
                        </button>

                        {/* Regenerate button */}
                        <button
                            onClick={() => setShowRegenerateConfirm(true)}
                            disabled={isThisUnitGenerating}
                            title={isThisUnitGenerating ? "Generation in progress" : "Regenerate full lesson"}
                            className="px-2.5 py-1.5 flex items-center gap-1 rounded-lg text-xs font-semibold transition-all bg-orange-50 text-custom-orange hover:bg-orange-100 disabled:opacity-40"
                        >
                            {isThisUnitGenerating ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <RotateCcw size={12} />
                            )}
                            <span className="hidden sm:inline">{isThisUnitGenerating ? 'Generating...' : 'Regenerate'}</span>
                        </button>

                        {/* Preview button */}
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className={`px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isPreview
                                    ? 'bg-custom-blue text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Eye size={13} /> {isPreview ? 'Exit Preview' : 'Preview'}
                        </button>

                        {/* Toggle Coach Panel */}
                        <button
                            onClick={() => setIsCoachCollapsed(!isCoachCollapsed)}
                            title={isCoachCollapsed ? "Expand Instructional Coach" : "Collapse Instructional Coach"}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                        >
                            <PanelRight size={16} className={isCoachCollapsed ? "text-gray-400" : "text-custom-blue"} />
                        </button>
                    </div>
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
                {!isPreview && !isNavigatorCollapsed && (
                    <div className="w-80 flex-shrink-0 bg-white hidden md:flex flex-col z-10 relative shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] border-r border-gray-200">
                        <div className="flex-1 overflow-hidden">
                            <ConceptNavigator
                                concepts={concepts}
                                activeConceptId={activeConceptId}
                                onSelectConcept={setActiveConceptId}
                                onAddConcept={handleAddConcept}
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
                            <LessonViewer 
                                lessonData={lessonDataForPreview} 
                                paginated={true} 
                                isPreviewMode={true}
                                onExitPreview={() => setIsPreview(false)}
                            />
                        </div>
                    ) : (
                        <ConceptComposer
                            concept={activeConcept}
                            allAssets={assets}
                            lessonId={lesson?.id}
                            lessonTitle={lesson?.title}
                            onBlockChange={handleBlockChange}
                            onSave={saveBlock}
                            onDelete={deleteBlock}
                            onDuplicate={duplicateBlock}
                            onAddBlock={addBlock}
                            onAddBlockWithFile={addBlockWithFile}
                            onRegenerate={handleRegenerateBlock}
                            onAssetUpdated={() => {
                                fetchAssets(lesson?.id);
                                fetchBlocks(lesson?.id);
                            }}
                            onMove={handleMoveBlock}
                            onReorder={handleReorderBlocks}
                            onSaveCardTitle={handleSaveCardTitle}
                            isWideMode={isNavigatorCollapsed || isCoachCollapsed}
                            highlightBlockId={targetBlockId}
                        />
                    )}
                </div>

                {/* ── RIGHT: AI Review Panel & Live Card Preview ────────────────────────────── */}
                {!isPreview && !isCoachCollapsed && (
                    <div
                        className="hidden lg:flex shrink-0 relative bg-white border-l border-gray-200"
                        style={{ width: `${coachWidth}px` }}
                    >
                        {/* Drag resize handle on left border */}
                        <div
                            onMouseDown={startResizeCoach}
                            className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize z-20 group flex items-center justify-center hover:bg-custom-blue/10 active:bg-custom-blue/20 transition-colors"
                            title="Drag to resize preview & coach panel"
                        >
                            <div className="w-1 h-8 rounded-full bg-gray-300 group-hover:bg-custom-blue group-active:bg-custom-blue transition-colors" />
                        </div>

                        <div className="flex-1 w-full h-full overflow-hidden">
                            <AIReviewPanel
                                lesson={lesson}
                                blocks={blocks}
                                assets={assets}
                                concepts={concepts}
                                activeConcept={activeConcept}
                                coachWidth={coachWidth}
                                onToggleWide={() => setCoachWidth(coachWidth > 450 ? 380 : Math.round(window.innerWidth * 0.48))}
                            />
                        </div>
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


function cleanConceptTitle(raw, fallback) {
    if (!raw) return fallback;
    let clean = String(raw)
        .replace(/^#+\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/^-\s*/, '')
        .replace(/^(?:Stage|Card|Part|Module|Concept|Step)\s*\d+[\s:\-–—\.]*/i, '')
        .replace(/^\d+[\s:\-–—\.]+/i, '')
        .replace(/\s+(?:Visual|Diagram|Visualization|Video)\s*(?:Card|Slot)?$/i, '')
        .trim();
    return clean || fallback;
}

function groupBlocksIntoConcepts(blocks = [], assets = []) {
    if (!blocks || blocks.length === 0) return [];

    const MEDIA_TYPES = new Set([
        'image', 'diagram', 'video', 'youtube', 'gif', 'visualization',
        'suggested_diagram', 'suggested_image', 'suggested_video',
        'image_placeholder', 'diagram_placeholder', 'video_ref',
        'repository_asset', 'simulation_placeholder'
    ]);

    // 1. Check if backend already assigned distinct page_number values (>= 2 pages)
    const distinctBackendPages = new Set(
        blocks.map((b) => b.page_number).filter((p) => p !== undefined && p !== null)
    );

    let pagesList = [];

    if (distinctBackendPages.size >= 2) {
        const pagesMap = {};
        const pageOrder = [];

        blocks.forEach((block) => {
            const pageNum = block.page_number || 1;
            if (!pagesMap[pageNum]) {
                pagesMap[pageNum] = {
                    pageNum,
                    blocks: [],
                    isV1: false,
                    goal: '',
                    assets: [],
                };
                pageOrder.push(pageNum);
            }
            pagesMap[pageNum].blocks.push(block);
        });

        const pages = pageOrder.sort((a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : 0)).map((k) => pagesMap[k]);

        // Check if page_title is redundant across all pages
        const rawPageTitles = pages.map((p) => {
            const firstWithPageTitle = p.blocks.find((b) => b.page_title && b.page_title.trim());
            return firstWithPageTitle ? firstWithPageTitle.page_title.trim() : null;
        }).filter(Boolean);
        const isRedundantPageTitle = rawPageTitles.length > 1 && new Set(rawPageTitles).size <= 1;

        pages.forEach((page) => {
            const primaryBlock = page.blocks.find((b) => !MEDIA_TYPES.has((b.block_type || '').toLowerCase())) || page.blocks[0];
            const fallback = primaryBlock?.title || `Part ${page.pageNum}`;
            const chosenTitle = isRedundantPageTitle
                ? (primaryBlock?.title || primaryBlock?.page_title || fallback)
                : (primaryBlock?.page_title || primaryBlock?.metadata?.concept_group || primaryBlock?.title || fallback);
            page.pageTitle = cleanConceptTitle(chosenTitle, fallback);
        });

        pagesList = pages;
    } else {
        // 2. Adaptive Multi-Card Fallback (when backend has <= 1 distinct page number)
        const pages = [];
        let currentBlocks = [];

        const BREAK_TRIGGER_TYPES = new Set([
            'concept_explanation', 'core_explanation', 'worked_example',
            'real_world_example', 'experiment', 'misconception', 'common_misconception',
            'knowledge_check', 'revision_questions', 'multiple_choice', 'true_false',
            'short_answer', 'summary', 'reflection', 'key_takeaway', 'suggested_simulation'
        ]);

        blocks.forEach((block) => {
            const bt = (block.block_type || '').toLowerCase();
            const isMedia = MEDIA_TYPES.has(bt);

            const shouldBreak = currentBlocks.length > 0 && !isMedia && (
                BREAK_TRIGGER_TYPES.has(bt) ||
                currentBlocks.length >= 3
            );

            if (shouldBreak) {
                const primaryBlock = currentBlocks.find((b) => !MEDIA_TYPES.has((b.block_type || '').toLowerCase())) || currentBlocks[0];
                const pageNum = pages.length + 1;
                const pageTitle = cleanConceptTitle(
                    primaryBlock?.title || primaryBlock?.page_title || primaryBlock?.metadata?.concept_group || `Part ${pageNum}`,
                    `Part ${pageNum}`
                );
                pages.push({
                    pageNum,
                    pageTitle,
                    blocks: currentBlocks,
                    isV1: true,
                    goal: '',
                    assets: [],
                });
                currentBlocks = [];
            }

            currentBlocks.push(block);
        });

        if (currentBlocks.length > 0) {
            const primaryBlock = currentBlocks.find((b) => !MEDIA_TYPES.has((b.block_type || '').toLowerCase())) || currentBlocks[0];
            const pageNum = pages.length + 1;
            const pageTitle = cleanConceptTitle(
                primaryBlock?.title || primaryBlock?.page_title || primaryBlock?.metadata?.concept_group || `Part ${pageNum}`,
                `Part ${pageNum}`
            );
            pages.push({
                pageNum,
                pageTitle,
                blocks: currentBlocks,
                isV1: true,
                goal: '',
                assets: [],
            });
        }

        pagesList = pages;
    }

    pagesList.forEach(concept => {
        const goalBlock = concept.blocks.find(b => ['learning_goal', 'objectives'].includes(b.block_type));
        if (goalBlock) {
            concept.goal = extractText(goalBlock.content);
        } else {
            const metaGoalBlock = concept.blocks.find(b => b.metadata?.student_goal);
            if (metaGoalBlock) {
                concept.goal = metaGoalBlock.metadata.student_goal;
            } else {
                const expBlock = concept.blocks.find(b => [
                    'concept_explanation', 'core_explanation', 'overview',
                    'worked_example', 'real_world_example', 'analogy',
                    'misconception', 'common_misconception', 'summary',
                    'knowledge_check', 'prediction', 'key_takeaway'
                ].includes(b.block_type));
                if (expBlock) {
                    const text = extractText(expBlock.content);
                    concept.goal = text ? (text.substring(0, 150) + (text.length > 150 ? '...' : '')) : (concept.pageTitle || 'Core Concept Goal');
                } else {
                    concept.goal = concept.pageTitle || 'Core Concept Goal';
                }
            }
        }
        
        const conceptBlockIds = concept.blocks.map(b => b.id);
        concept.assets = assets.filter(a => 
            a.blocks && a.blocks.some(bId => conceptBlockIds.includes(bId) || conceptBlockIds.includes(bId?.id))
        );
        
        concept.repoUsage = concept.assets.filter(a => a.source_type === 'knowledge_repository').length;
        
        // Accurate media presence check:
        // 1. Assets linked to concept that lack any media
        const pendingAssets = concept.assets.filter(a => !isAssetPresent(a));

        // 2. Visual blocks in concept that lack both an attached asset and inline media
        const visualBlocksLackingMedia = concept.blocks.filter(b => {
            const isMedia = SUGGESTED_TYPES.has(b.block_type);
            if (!isMedia) return false;
            const hasLinkedAsset = concept.assets.some(a => 
                (a.blocks?.includes(b.id) || a.blocks?.some?.(x => x === b.id || x?.id === b.id)) && isAssetPresent(a)
            );
            if (hasLinkedAsset) return false;
            return !getBlockMedia(b);
        });

        if (pendingAssets.length > 0 || visualBlocksLackingMedia.length > 0) {
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

    return pagesList;
}
