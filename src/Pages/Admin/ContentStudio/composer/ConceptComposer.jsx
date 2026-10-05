import React from 'react';
import {
    GoalEditor, ExplanationEditor, WorkedExampleEditor,
    KnowledgeCheckEditor, CalloutEditor, SummaryEditor,
    RealWorldExampleEditor, ExperimentEditor, GenericEditor,
    DefinitionEditor, MisconceptionEditor, TableEditor,
    ImageEditor, YouTubeEditor, VideoEditor, StepProcessEditor,
} from './ComponentEditors';
import VisualizationEditor from './VisualizationEditor';
import { MediaSlot } from './MediaSlot';
import { RotateCcw, Trash2, Copy, ArrowUp, ArrowDown, Plus, X, Sparkles, Edit2, GripVertical, Check } from 'lucide-react';
import VisualPromptModal from './VisualPromptModal';
import { isAssetPresent, getBlockMedia } from '../../../../utils/assetUtils';
import { SUGGESTED_TYPES, mapBlockTypeToAssetType, COMPONENT_CATEGORIES, getVisibleComponentCategories } from '../../../../utils/blockTypeConstants';

// Map blocks to structural sections for the workspace
function groupBlocksIntoSections(blocks) {
    const sections = {
        'Introduction': [],
        'Core Material': [],
        'Visuals & Interactions': [],
        'Practice & Assessment': [],
        'Summary & Coaching': []
    };

    blocks.forEach(block => {
        const type = block.block_type;

        // ── Introduction ─────────────────────────────────────────────────────
        if ([
            'learning_goal', 'objectives', 'hook', 'story', 'narrative',
            'introduction', 'overview', 'orient', 'did_you_know'
        ].includes(type)) {
            sections['Introduction'].push(block);

        // ── Core Material ─────────────────────────────────────────────────────
        } else if ([
            'concept_explanation', 'core_explanation', 'definitions', 'definition',
            'formula_breakdown', 'worked_example', 'real_world_example',
            'analogy', 'transition', 'visual_learning', 'prediction'
        ].includes(type)) {
            sections['Core Material'].push(block);

        // ── Visuals & Interactions ─────────────────────────────────────────────
        } else if (
            type.startsWith('suggested_') ||
            type.endsWith('_placeholder') ||
            type === 'video_ref' ||
            type === 'repository_asset' ||
            ['youtube', 'video', 'image', 'visualization', 'diagram'].includes(type)
        ) {
            sections['Visuals & Interactions'].push(block);

        // ── Practice & Assessment ──────────────────────────────────────────────
        } else if ([
            'knowledge_check', 'multiple_choice', 'true_false', 'fill_in_the_blank',
            'short_answer', 'revision_questions', 'reflection',
            'experiment', 'classroom_activity', 'activity', 'explore', 'investigate'
        ].includes(type)) {
            sections['Practice & Assessment'].push(block);

        // ── Summary & Coaching ─────────────────────────────────────────────────
        } else if ([
            'key_takeaway', 'summary', 'common_misconception', 'common_mistake',
            'callout', 'memory_tip', 'remediation', 'reteach', 'clarify'
        ].includes(type)) {
            sections['Summary & Coaching'].push(block);

        // ── Fallback: Core Material ────────────────────────────────────────────
        } else {
            sections['Core Material'].push(block);
        }
    });

    return sections;
}

function selectEditor(blockType) {
    switch (blockType) {
        case 'learning_goal':
        case 'objectives':
            return GoalEditor;
        case 'overview':
        case 'introduction':
        case 'concept_explanation':
        case 'core_explanation':
        case 'visual_learning':
        case 'definitions':        // legacy AI-generated type kept for compat
        case 'transition':
        case 'hook':
        case 'story':
        case 'analogy':
        case 'key_takeaway':
        case 'common_misconception': // legacy type kept for compat
        case 'reflection':
            return ExplanationEditor;
        // New structured editors
        case 'definition':
        case 'definition_card':
            return DefinitionEditor;
        case 'misconception':
        case 'common_mistake':
            return MisconceptionEditor;
        case 'table':
        case 'comparison_table':
            return TableEditor;
        case 'step_process':
            return StepProcessEditor;
        case 'worked_example':
            return WorkedExampleEditor;
        // Rich media editors
        case 'image':
            return ImageEditor;
        case 'youtube':
            return YouTubeEditor;
        case 'video':
            return VideoEditor;
        // AI visualization
        case 'visualization':
            return VisualizationEditor;
        // Existing editors
        case 'knowledge_check':
        case 'revision_questions':
        case 'multiple_choice':
        case 'true_false':
        case 'fill_in_the_blank':
        case 'short_answer':
            return KnowledgeCheckEditor;
        case 'callout':
            return CalloutEditor;
        case 'summary':
            return SummaryEditor;
        case 'real_world_example':
            return RealWorldExampleEditor;
        case 'experiment':
            return ExperimentEditor;
        default:
            if (SUGGESTED_TYPES.has(blockType)) return null;
            return GenericEditor;
    }
}

export default function ConceptComposer({
    concept,
    allAssets,
    lessonId,
    lessonTitle = '',
    onBlockChange,
    onSave,
    onDelete,
    onDuplicate,
    onRegenerate,
    onAssetUpdated,
    onMove,
    onReorder,
    onSaveCardTitle,
    onAddBlock,
    onAddBlockWithFile,
    highlightBlockId = null,
    isWideMode = false,
}) {
    const [showAddMenu, setShowAddMenu] = React.useState(false);
    const [isEditingTitle, setIsEditingTitle] = React.useState(false);
    const [titleInput, setTitleInput] = React.useState(concept?.pageTitle || '');
    const [visualModalState, setVisualModalState] = React.useState({
        isOpen: false,
        targetBlock: null,
        targetAsset: null,
    });

    React.useEffect(() => {
        setTitleInput(concept?.pageTitle || '');
        setIsEditingTitle(false);
    }, [concept?.pageNum, concept?.pageTitle]);

    const handleTitleSubmit = () => {
        setIsEditingTitle(false);
        const trimmed = titleInput.trim();
        if (trimmed && trimmed !== concept?.pageTitle && onSaveCardTitle) {
            onSaveCardTitle(concept.pageNum, trimmed);
        }
    };

    const handleOpenGeneralVisualPrompt = () => {
        setVisualModalState({
            isOpen: true,
            targetBlock: null,
            targetAsset: null,
        });
    };

    const handleOpenTargetedVisualPrompt = (block, asset) => {
        setVisualModalState({
            isOpen: true,
            targetBlock: block,
            targetAsset: asset || null,
        });
    };

    const handleCloseVisualPrompt = () => {
        setVisualModalState({
            isOpen: false,
            targetBlock: null,
            targetAsset: null,
        });
    };

    if (!concept) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📄</span>
                    </div>
                    <p className="font-medium text-gray-500">Select a concept to review</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Concept Header */}
            <div className="px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-extrabold text-custom-blue uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                        Card {concept.pageNum}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">Concept Review & Authoring</span>
                </div>

                <div className="flex items-center gap-3">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 flex-1 max-w-xl">
                            <input
                                type="text"
                                autoFocus
                                value={titleInput}
                                onChange={(e) => setTitleInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleTitleSubmit();
                                    if (e.key === 'Escape') {
                                        setTitleInput(concept.pageTitle || '');
                                        setIsEditingTitle(false);
                                    }
                                }}
                                onBlur={handleTitleSubmit}
                                className="w-full text-2xl font-extrabold text-gray-900 border-b-2 border-custom-blue outline-none bg-transparent py-0.5"
                                placeholder="Enter card title..."
                            />
                            <button
                                type="button"
                                onClick={handleTitleSubmit}
                                className="px-3 py-1 text-xs font-bold text-white bg-custom-blue hover:opacity-90 rounded-md shadow-xs transition-opacity"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <div
                            className="flex items-center gap-3 group cursor-pointer"
                            onClick={() => setIsEditingTitle(true)}
                            title="Click to rename this card"
                        >
                            <h2 className="text-2xl font-extrabold text-gray-900 group-hover:text-custom-blue transition-colors">
                                {concept.pageTitle || `Part ${concept.pageNum}`}
                            </h2>
                            <button
                                type="button"
                                className="p-1.5 text-gray-400 hover:text-custom-blue bg-gray-100/80 hover:bg-blue-50 border border-gray-200/80 hover:border-blue-200 rounded-md transition-all flex items-center justify-center shadow-2xs shrink-0 cursor-pointer"
                                aria-label="Rename card title"
                                title="Click to rename card"
                            >
                                <Edit2 size={14} className="text-gray-400 group-hover:text-custom-blue" />
                            </button>
                        </div>
                    )}
                </div>

                {concept.isV1 && (
                    <p className="text-xs text-gray-400 mt-2">
                        Legacy concept group — automatically organized for backward compatibility.
                    </p>
                )}
            </div>

            {/* Components list */}
            <div className="flex-1 overflow-y-auto bg-custom-cream/30">
                <div className={`${isWideMode ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-8 py-8 space-y-10 pb-32 transition-all duration-200`}>
                    
                    {/* Sequential Component List (Direct Drag & Drop Ordering) */}
                    <div className="space-y-6">
                        {concept.blocks && concept.blocks.length > 0 ? (
                            concept.blocks
                                .slice()
                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                .map((block) => (
                                    <ComponentWrapper
                                        key={block.id}
                                        block={block}
                                        allAssets={allAssets}
                                        lessonId={lessonId}
                                        onBlockChange={onBlockChange}
                                        onSave={onSave}
                                        onDelete={onDelete}
                                        onDuplicate={onDuplicate}
                                        onRegenerate={onRegenerate}
                                        onAssetUpdated={onAssetUpdated}
                                        onMove={onMove}
                                        onReorder={onReorder}
                                        onPromptVisual={handleOpenTargetedVisualPrompt}
                                        isHighlighted={Boolean(highlightBlockId && String(block.id) === String(highlightBlockId))}
                                    />
                                ))
                        ) : (
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
                                <p className="text-sm font-medium">No components on this card yet.</p>
                                <p className="text-xs text-gray-400 mt-1">Click "Add Component" below to add content or interactive checks.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Add Component & Prompt Visual Actions */}
                    <div className="pt-8 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowAddMenu(!showAddMenu)}
                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-custom-blue hover:text-custom-blue transition-colors shadow-xs cursor-pointer"
                            >
                                <Plus size={18} />
                                Add Component
                            </button>
                            
                            {showAddMenu && (
                                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                                    <div className="fixed inset-0" onClick={() => setShowAddMenu(false)} />
                                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Add Component</h3>
                                                <p className="text-xs text-gray-500">Choose a platform-compatible component to add to this card</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddMenu(false)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <div className="p-6 overflow-y-auto max-h-[calc(85vh-130px)]">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {Object.entries(getVisibleComponentCategories()).map(([category, items]) => (
                                                    <div key={category} className="space-y-2 bg-gray-50/60 p-3.5 rounded-xl border border-gray-100 flex flex-col">
                                                        <h4 className="text-[11px] font-extrabold text-custom-blue uppercase tracking-wider px-1 mb-1">{category}</h4>
                                                        <div className="space-y-1.5 flex-1">
                                                            {items.map((item) => {
                                                                if (item.upload) {
                                                                    return (
                                                                        <label
                                                                            key={item.type}
                                                                            className="group flex flex-col w-full text-left p-2 rounded-lg transition-all cursor-pointer bg-white border border-gray-100 hover:border-orange-300 hover:bg-orange-50/50 shadow-2xs"
                                                                            title={item.description || item.label}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="font-semibold text-xs text-gray-800 group-hover:text-custom-terracotta">{item.label}</span>
                                                                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-bold tracking-wider">Upload</span>
                                                                            </div>
                                                                            {item.description && (
                                                                                <span className="text-[10px] text-gray-400 group-hover:text-gray-600 line-clamp-1 mt-0.5 leading-tight">
                                                                                    {item.description}
                                                                                </span>
                                                                            )}
                                                                            <input
                                                                                type="file"
                                                                                className="hidden"
                                                                                accept="image/*,.gif"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files[0];
                                                                                    if (file) {
                                                                                        onAddBlockWithFile(concept.pageNum, item.type, item.label, file);
                                                                                        setShowAddMenu(false);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </label>
                                                                    );
                                                                }
                                                                return (
                                                                    <button
                                                                        key={item.type}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            onAddBlock(concept.pageNum, item.type, item.label);
                                                                            setShowAddMenu(false);
                                                                        }}
                                                                        className="group flex flex-col w-full text-left p-2 rounded-lg transition-all bg-white border border-gray-100 hover:border-orange-300 hover:bg-orange-50/50 shadow-2xs"
                                                                        title={item.description || item.label}
                                                                    >
                                                                        <span className="font-semibold text-xs text-gray-800 group-hover:text-custom-terracotta">{item.label}</span>
                                                                        {item.description && (
                                                                            <span className="text-[10px] text-gray-400 group-hover:text-gray-600 line-clamp-1 mt-0.5 leading-tight">
                                                                                {item.description}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50/80 px-6 py-3 border-t border-gray-100 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddMenu(false)}
                                                className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Prompt AI for Visual Action */}
                        <button
                            type="button"
                            onClick={handleOpenGeneralVisualPrompt}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-dashed border-orange-300 rounded-xl text-custom-orange font-semibold hover:bg-orange-100/70 transition-colors shadow-xs cursor-pointer"
                        >
                            <Sparkles size={18} />
                            Prompt AI for Visual
                        </button>

                        <VisualPromptModal
                            isOpen={visualModalState.isOpen}
                            onClose={handleCloseVisualPrompt}
                            lessonId={lessonId}
                            lessonTitle={lessonTitle}
                            conceptPageNum={concept.pageNum}
                            targetBlock={visualModalState.targetBlock}
                            targetAsset={visualModalState.targetAsset}
                            existingBlocks={concept.blocks || []}
                            onSuccess={() => {
                                if (onAssetUpdated) onAssetUpdated();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ComponentWrapper({
    block,
    allAssets,
    lessonId,
    onBlockChange,
    onSave,
    onDelete,
    onDuplicate,
    onRegenerate,
    onAssetUpdated,
    onMove,
    onReorder,
    onPromptVisual,
    isHighlighted = false,
}) {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const isMediaBlock = SUGGESTED_TYPES.has(block.block_type);

    let blockAssets = allAssets.filter((a) =>
        a.blocks?.includes(block.id) || a.blocks?.some?.((b) => b === block.id || b?.id === block.id)
    );

    // Fallback: assets inlined directly on block object (e.g. from LessonBlockSerializer)
    if (blockAssets.length === 0 && Array.isArray(block.assets) && block.assets.length > 0) {
        blockAssets = block.assets;
    }

    // Fallback: direct inline media in block.content or block.metadata (ingested Wikimedia, SVG, YouTube)
    const inlineMedia = getBlockMedia(block);
    if (blockAssets.length === 0 && inlineMedia) {
        blockAssets = [{
            id: null,
            asset_type: mapBlockTypeToAssetType(block.block_type),
            status: 'attached',
            title: inlineMedia.title || block.title || block.block_type.replace(/_/g, ' '),
            description: inlineMedia.caption || extractDescription(block.content),
            url: inlineMedia.url,
            file: null,
            metadata: {
                admin_instruction: extractDescription(block.content),
                svg_content: inlineMedia.svgCode,
                generated_code: inlineMedia.svgCode,
                video_id: inlineMedia.videoId,
                simulation_key: inlineMedia.simKey,
            },
            blocks: [block.id],
        }];
    }

    const EditorComponent = selectEditor(block.block_type);

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (!isDragOver) setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const sourceId = e.dataTransfer.getData('text/plain');
                if (sourceId && onReorder) {
                    onReorder(sourceId, block.id);
                }
            }}
            className={`relative group transition-all duration-200 ${
                isDragOver ? 'ring-2 ring-custom-blue bg-blue-50/20 rounded-2xl p-2' : ''
            } ${
                isHighlighted ? 'ring-2 ring-rose-500 rounded-2xl p-3 bg-rose-50/20 shadow-md' : ''
            }`}
        >
            {isHighlighted && (
                <div className="mb-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold shadow-xs">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        Reported Issue Target: User feedback or visual error reported on this component
                    </span>
                    <span className="text-[10px] uppercase tracking-wider bg-rose-200/80 px-2 py-0.5 rounded font-extrabold text-rose-900">
                        Block #{block.id}
                    </span>
                </div>
            )}
            {/* Action toolbar (visible on hover) */}
            <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-gray-200 shadow-sm rounded-lg p-1 z-10">
                <div
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(block.id));
                        e.dataTransfer.effectAllowed = 'move';
                    }}
                    className="p-1.5 rounded text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
                    title="Drag to reorder component"
                >
                    <GripVertical size={14} />
                </div>
                <button
                    onClick={() => onMove(block.id, 'up')}
                    className="p-1.5 rounded text-gray-400 hover:text-custom-blue hover:bg-blue-50 transition-colors"
                    title="Move up"
                >
                    <ArrowUp size={14} />
                </button>
                <button
                    onClick={() => onMove(block.id, 'down')}
                    className="p-1.5 rounded text-gray-400 hover:text-custom-blue hover:bg-blue-50 transition-colors"
                    title="Move down"
                >
                    <ArrowDown size={14} />
                </button>
                <button
                    onClick={() => onPromptVisual && onPromptVisual(block, null)}
                    className="p-1.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Generate or update AI visual for this component"
                >
                    <Sparkles size={14} />
                </button>
                <button
                    onClick={() => onRegenerate(block.id)}
                    className="p-1.5 rounded text-gray-400 hover:text-custom-orange hover:bg-orange-50 transition-colors"
                    title="Regenerate this component"
                >
                    <RotateCcw size={14} />
                </button>
                <button
                    onClick={() => onDuplicate(block)}
                    className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Duplicate component"
                >
                    <Copy size={14} />
                </button>
                <button
                    onClick={() => onDelete(block.id)}
                    className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete component"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Component Content */}
            {isMediaBlock ? (
                <div className="space-y-3">
                    {blockAssets.length === 0 ? (
                        <MediaSlot
                            asset={{
                                id: null,
                                asset_type: mapBlockTypeToAssetType(block.block_type),
                                status: 'pending',
                                title: block.title || block.block_type.replace(/_/g, ' '),
                                description: extractDescription(block.content),
                                metadata: { admin_instruction: extractDescription(block.content) },
                                url: null,
                                file: null,
                                blocks: [block.id],
                            }}
                            lessonId={lessonId}
                            blockId={block.id}
                            onAssetUpdated={onAssetUpdated}
                            onDeleteBlock={onDelete}
                            onPromptVisual={(bId, asset) => onPromptVisual && onPromptVisual(block, asset)}
                        />
                    ) : (
                        blockAssets.map((asset, idx) => (
                            <MediaSlot
                                key={asset.id || `${block.id}_asset_${idx}`}
                                asset={asset}
                                lessonId={lessonId}
                                blockId={block.id}
                                onAssetUpdated={onAssetUpdated}
                                onDeleteBlock={onDelete}
                                onPromptVisual={(bId, asset) => onPromptVisual && onPromptVisual(block, asset)}
                            />
                        ))
                    )}
                </div>
            ) : (
                EditorComponent && (
                    <EditorComponent
                        block={block}
                        onChange={onBlockChange}
                        onSave={onSave}
                        onDelete={onDelete}
                    />
                )
            )}

            {/* Attached media for text blocks */}
            {!isMediaBlock && blockAssets.length > 0 && (
                <div className="space-y-3 mt-4">
                    {blockAssets.map((asset) => (
                        <MediaSlot
                            key={asset.id}
                            asset={asset}
                            lessonId={lessonId}
                            blockId={block.id}
                            onAssetUpdated={onAssetUpdated}
                            onPromptVisual={(bId, asset) => onPromptVisual && onPromptVisual(block, asset)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function extractDescription(content) {
    if (!content) return '';
    if (typeof content === 'string') {
        try { return JSON.parse(content)?.description || JSON.parse(content)?.suggested_illustration || ''; }
        catch { return content; }
    }
    return content.description || content.suggested_illustration || '';
}
