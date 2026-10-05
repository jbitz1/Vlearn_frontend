/**
 * blockTypeConstants.js
 *
 * Shared constants and helpers for LessonBlock type classification.
 *
 * IMPORTANT: This must remain a .js file (not .jsx) so that it can be
 * safely imported by JSX files without breaking Vite React Fast Refresh.
 */

/**
 * The set of block_type values that represent visual/media placeholders
 * rather than authored text content.
 */
export const SUGGESTED_TYPES = new Set([
    'suggested_diagram', 'suggested_illustration', 'suggested_image',
    'suggested_infographic', 'suggested_table', 'suggested_graph',
    'suggested_timeline', 'suggested_flowchart', 'suggested_mind_map',
    'image_placeholder', 'diagram_placeholder', 'suggested_gif',
    'video_ref', 'suggested_video', 'repository_asset',
    'suggested_simulation', 'suggested_external_link', 'simulation_placeholder',
]);

/**
 * Map a LessonBlock block_type to the corresponding asset_type string used
 * by the media/asset upload system.
 *
 * @param {string|null|undefined} blockType
 * @returns {string}
 */
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
            return 'external_link';
        default:
            return 'image';
    }
}

/**
 * COMPONENT_CATEGORIES
 *
 * Full component catalog for Content Studio.
 * Preserves ALL component definitions (both active and experimental/legacy).
 * Items marked `hidden: true` are filtered out from the author-facing "Add Component"
 * modal due to platform compatibility, server constraints, or redundancy, but are
 * deliberately retained here for future capabilities.
 */
export const COMPONENT_CATEGORIES = {
    'Introductions & Core Theory': [
        { label: 'Learning Goal', type: 'learning_goal', hidden: false, description: 'State clear, measurable objectives for this card.' },
        { label: 'Concept Explanation', type: 'concept_explanation', hidden: false, description: 'Core theory, explanations, and main instructional text.' },
        { label: 'Definition', type: 'definition', hidden: false, description: 'Formal terminology, meanings, and key definitions.' },
        { label: 'Step Process', type: 'step_process', hidden: false, description: 'Sequential stages, algorithms, or chronological procedures.' },
        { label: 'Comparison Table', type: 'table', hidden: false, description: 'Structured side-by-side comparison matrix.' },
        { label: 'Hook', type: 'hook', hidden: false, description: 'Engaging real-world phenomenon or opening question.' },
        // Hidden / preserved for future platform improvements:
        { label: 'Story', type: 'story', hidden: true, reason: 'Redundant with Concept Explanation / Hook; preserved for backwards compatibility.' },
        { label: 'Analogy', type: 'analogy', hidden: true, reason: 'Redundant with Concept Explanation; preserved for backwards compatibility.' },
    ],
    'Visuals & Media': [
        { label: 'Upload Image', type: 'image_placeholder', upload: true, hidden: false, description: 'Upload a diagram, photo, or illustration directly.' },
        { label: 'Image (URL)', type: 'image', hidden: false, description: 'Embed an external web image with caption.' },
        { label: 'YouTube Video', type: 'youtube', hidden: false, description: 'Embed an educational YouTube video player.' },
        { label: 'Simulation Link (PhET / Lab)', type: 'suggested_simulation', hidden: false, description: 'Embed or link an interactive PhET simulation or virtual lab.' },
        // Hidden / preserved for future platform improvements:
        { label: 'Video (Hosted)', type: 'video', hidden: true, reason: 'Platform constraint: Server lacks dedicated chunked video streaming endpoint / CDN storage pipeline; use YouTube Video instead.' },
        { label: 'Upload Video', type: 'video_ref', upload: true, hidden: true, reason: 'Platform constraint: Direct video uploads exceed server memory limits and lack a transcoding pipeline.' },
        { label: 'Upload Diagram', type: 'diagram_placeholder', upload: true, hidden: true, reason: 'Redundant with Upload Image; causes asset type collision.' },
        { label: 'AI Visualization', type: 'visualization', hidden: true, reason: 'Redundant: Content Studio provides a dedicated "Prompt AI for Visual" button.' },
        { label: 'Diagram Suggestion', type: 'suggested_diagram', hidden: true, reason: 'Platform constraint: Internal AI blueprint placeholder type; cannot be authored manually.' },
    ],
    'Applied Practice & Context': [
        { label: 'Worked Example', type: 'worked_example', hidden: false, description: 'Step-by-step problem, calculation, and solution breakdown.' },
        { label: 'Real-world Example', type: 'real_world_example', hidden: false, description: 'Practical real-life application connecting theory to everyday life.' },
        { label: 'Experiment', type: 'experiment', hidden: false, description: 'Hands-on lab activity, observation, or experiment.' },
    ],
    'Checks for Understanding': [
        { label: 'Multiple Choice', type: 'multiple_choice', hidden: false, description: 'Standard 4-option quiz question with immediate feedback.' },
        { label: 'True / False', type: 'true_false', hidden: false, description: 'Quick binary conceptual check.' },
        { label: 'Fill in the Blank', type: 'fill_in_the_blank', hidden: false, description: 'Sentence completion test with keyword matching.' },
        { label: 'Short Answer', type: 'short_answer', hidden: false, description: 'Open-ended conceptual response question.' },
        // Hidden / preserved for future platform improvements:
        { label: 'Reflection', type: 'reflection', hidden: true, reason: 'Redundant with Short Answer and Concept Explanation.' },
    ],
    'Teacher Coaching & Summary': [
        { label: 'Common Misconception', type: 'misconception', hidden: false, description: 'Highlight and debunk a common student misunderstanding.' },
        { label: 'Summary', type: 'summary', hidden: false, description: 'Key takeaways and recap of the card or concept.' },
        // Hidden / preserved for future platform improvements:
        { label: 'Key Takeaway', type: 'key_takeaway', hidden: true, reason: 'Redundant with Summary.' },
    ],
};

/**
 * Returns a curated dictionary of categories containing only platform-compatible,
 * non-hidden components for authoring.
 *
 * @returns {Record<string, Array<{label: string, type: string, upload?: boolean, description?: string}>>}
 */
export function getVisibleComponentCategories() {
    const visible = {};
    for (const [category, items] of Object.entries(COMPONENT_CATEGORIES)) {
        const filtered = items.filter(item => !item.hidden);
        if (filtered.length > 0) {
            visible[category] = filtered;
        }
    }
    return visible;
}

