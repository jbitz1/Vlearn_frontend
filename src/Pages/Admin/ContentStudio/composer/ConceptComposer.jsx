import React from 'react';
import {
    GoalEditor, ExplanationEditor, WorkedExampleEditor,
    KnowledgeCheckEditor, CalloutEditor, SummaryEditor,
    RealWorldExampleEditor, ExperimentEditor, GenericEditor,
    DefinitionEditor, MisconceptionEditor, TableEditor,
    ImageEditor, YouTubeEditor, VideoEditor,
} from './ComponentEditors';
import VisualizationEditor from './VisualizationEditor';
import { MediaSlot } from './MediaSlot';
import { RotateCcw, Trash2, Copy, ArrowUp, ArrowDown, Plus } from 'lucide-react';

const SUGGESTED_TYPES = new Set([
    'suggested_diagram', 'suggested_illustration', 'suggested_image', 
    'suggested_infographic', 'suggested_table', 'suggested_graph', 
    'suggested_timeline', 'suggested_flowchart', 'suggested_mind_map',
    'image_placeholder', 'diagram_placeholder', 'suggested_gif', 
    'video_ref', 'suggested_video', 'repository_asset',
    'suggested_simulation', 'suggested_external_link', 'simulation_placeholder',
]);

export function mapBlockTypeToAssetType(blockType) {
    if (!blockType) return 'image';
    const base = blockType
        .replace(/^suggested_/, '')
        .replace(/_placeholder$/, '')
        .replace(/_ref$/, '');
    switch (base) {
        case 'diagram':
        case 'graph':
        case 'timeline':
        case 'flowchart':
        case 'mind_map':
        case 'table':
            return 'diagram';
        case 'image':
        case 'illustration':
        case 'infographic':
        case 'repository_asset':
            return 'image';
        case 'video':
            return 'video';
        case 'youtube':
            return 'youtube';
        case 'gif':
            return 'gif';
        case 'simulation':
            return 'simulation';
        case 'external_link':
        case 'activity':
            return 'external_link';
        default:
            return 'image';
    }
}


const COMPONENT_CATEGORIES = {
    'Introductions': [
        { label: 'Learning Goal', type: 'learning_goal' },
        { label: 'Hook', type: 'hook' },
        { label: 'Story', type: 'story' },
    ],
    'Core Explanations': [
        { label: 'Concept Explanation', type: 'concept_explanation' },
        { label: 'Definition', type: 'definition' },
        { label: 'Analogy', type: 'analogy' },
        { label: 'Table', type: 'table' },
    ],
    'Visuals & Media': [
        { label: 'Image (URL)', type: 'image' },
        { label: 'YouTube Video', type: 'youtube' },
        { label: 'Video (Hosted)', type: 'video' },
        { label: 'AI Visualization', type: 'visualization' },
        { label: 'Upload Image', type: 'image_placeholder', upload: true },
        { label: 'Upload Diagram', type: 'diagram_placeholder', upload: true },
        { label: 'Upload Video', type: 'video_ref', upload: true },
        { label: 'Diagram Suggestion', type: 'suggested_diagram' },
        { label: 'Simulation Suggestion', type: 'suggested_simulation' }
    ],
    'Real-World Context': [
        { label: 'Worked Example', type: 'worked_example' },
        { label: 'Real-world Example', type: 'real_world_example' },
        { label: 'Experiment', type: 'experiment' },
    ],
    'Checks for Understanding': [
        { label: 'Multiple Choice', type: 'multiple_choice' },
        { label: 'Short Answer', type: 'short_answer' },
        { label: 'True/False', type: 'true_false' },
        { label: 'Fill in the Blank', type: 'fill_in_the_blank' },
        { label: 'Reflection', type: 'reflection' },
    ],
    'Teacher Coaching & Summary': [
        { label: 'Common Misconception', type: 'misconception' },
        { label: 'Key Takeaway', type: 'key_takeaway' },
        { label: 'Summary', type: 'summary' }
    ]
};

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
            type === 'repository_asset'
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
            return DefinitionEditor;
        case 'misconception':
            return MisconceptionEditor;
        case 'table':
            return TableEditor;
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
    onBlockChange,
    onSave,
    onDelete,
    onDuplicate,
    onRegenerate,
    onAssetUpdated,
    onMove,
    onAddBlock,
    onAddBlockWithFile,
}) {
    const [showAddMenu, setShowAddMenu] = React.useState(false);
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
            <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
                <p className="text-xs font-bold text-custom-blue uppercase tracking-widest mb-2">Concept Review</p>
                <h2 className="text-2xl font-extrabold text-gray-900">{concept.pageTitle}</h2>
                {concept.isV1 && (
                    <p className="text-xs text-gray-400 mt-2">
                        Legacy concept group — automatically organized for backward compatibility.
                    </p>
                )}
            </div>

            {/* Components list */}
            <div className="flex-1 overflow-y-auto bg-custom-cream/30">
                <div className="max-w-4xl mx-auto px-8 py-8 space-y-10 pb-32">
                    
                    {(() => {
                        const sections = groupBlocksIntoSections(concept.blocks);
                        
                        return Object.entries(sections).map(([sectionName, blocks]) => {
                            if (blocks.length === 0) return null;
                            
                            return (
                                <div key={sectionName} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 overflow-hidden">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-custom-terracotta"></div>
                                        {sectionName}
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        {blocks.map(block => (
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
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        });
                    })()}
                    
                    {/* Add Component Action */}
                    <div className="pt-8 border-t border-gray-100 flex justify-center">
                        <div className="relative">
                            <button
                                onClick={() => setShowAddMenu(!showAddMenu)}
                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold hover:border-custom-blue hover:text-custom-blue transition-colors shadow-sm"
                            >
                                <Plus size={18} />
                                Add Component
                            </button>
                            
                            {showAddMenu && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-max min-w-[600px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50">
                                    <div className="grid grid-cols-3 divide-x divide-y divide-gray-100">
                                        {Object.entries(COMPONENT_CATEGORIES).map(([category, items]) => (
                                            <div key={category} className="p-4 bg-white hover:bg-gray-50/50 transition-colors">
                                                <h3 className="text-[10px] font-extrabold text-custom-blue uppercase tracking-widest mb-3 px-2">{category}</h3>
                                                <div className="space-y-1">
                                                    {items.map((item) => {
                                                        if (item.upload) {
                                                            return (
                                                                <label
                                                                    key={item.type}
                                                                    className="block w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-custom-terracotta rounded-lg transition-colors cursor-pointer"
                                                                >
                                                                    {item.label}
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*,video/*,.gif,.pdf"
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
                                                                onClick={() => {
                                                                    onAddBlock(concept.pageNum, item.type, item.label);
                                                                    setShowAddMenu(false);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-custom-terracotta rounded-lg transition-colors"
                                                            >
                                                                {item.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50/80 p-3 text-center border-t border-gray-100">
                                        <button onClick={() => setShowAddMenu(false)} className="text-xs font-semibold text-gray-500 hover:text-gray-700">Close</button>
                                    </div>
                                </div>
                            )}
                        </div>
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
    onMove
}) {
    const isMediaBlock = SUGGESTED_TYPES.has(block.block_type);

    const blockAssets = allAssets.filter((a) =>
        a.blocks?.includes(block.id) || a.blocks?.some?.((b) => b === block.id || b?.id === block.id)
    );

    const EditorComponent = selectEditor(block.block_type);

    return (
        <div className="relative group">
            {/* Action toolbar (visible on hover) */}
            <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-gray-200 shadow-sm rounded-lg p-1 z-10">
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
                        />
                    ) : (
                        blockAssets.map((asset) => (
                            <MediaSlot
                                key={asset.id}
                                asset={asset}
                                lessonId={lessonId}
                                blockId={block.id}
                                onAssetUpdated={onAssetUpdated}
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
