/**
 * Helper to get semantic badge info for component blocks
 * Maps block_type to a pedagogical title, description, and color theme.
 */
export function getComponentBadgeInfo(blockType) {
    switch (blockType) {
        case 'hook':
            return { label: 'Hook & Curiosity', description: 'Engage students with a compelling question or real-world teaser.', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' };
        case 'story':
            return { label: 'Narrative Story', description: 'Contextualize the concept with an illustrative narrative.', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' };
        case 'learning_goal':
        case 'objectives':
            return { label: 'Learning Goal', description: 'Clearly state what students will be able to do.', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' };
        case 'definition':
        case 'definitions':
        case 'definition_card':
            return { label: 'Formal Definition', description: 'Exact definition of key terminology or scientific terms.', color: 'text-teal-700', bg: 'bg-teal-100', border: 'border-teal-200' };
        case 'step_process':
            return { label: 'Sequential Process Flow', description: 'Ordered steps or procedural workflow with numbered stages.', color: 'text-sky-700', bg: 'bg-sky-100', border: 'border-sky-200' };
        case 'table':
        case 'comparison_table':
            return { label: 'Comparison Table', description: 'Structured comparison or multi-column data analysis.', color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200' };
        case 'worked_example':
            return { label: 'Worked Example', description: 'Step-by-step problem solving with guided calculations.', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' };
        case 'analogy':
            return { label: 'Conceptual Analogy', description: 'Bridge unfamiliar ideas with familiar experiences.', color: 'text-cyan-700', bg: 'bg-cyan-100', border: 'border-cyan-200' };
        case 'formula_breakdown':
            return { label: 'Formula Breakdown', description: 'Deconstruct equations, symbols, units, and constants.', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' };
        case 'key_takeaway':
            return { label: 'Key Takeaway', description: 'The most important principle students must remember.', color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200' };
        case 'summary':
            return { label: 'Concept Summary', description: 'Synthesize the main ideas covered in this card.', color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200' };
        case 'reflection':
            return { label: 'Reflection Prompt', description: 'Prompt students to think metacognitively about what they learned.', color: 'text-violet-700', bg: 'bg-violet-100', border: 'border-violet-200' };
        case 'transition':
            return { label: 'Bridge / Transition', description: 'Connect this card to the next logical learning step.', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' };
        case 'concept_explanation':
        case 'core_explanation':
        default:
            return { label: 'Core Theory / Explanation', description: 'Write the core concept clearly and concisely.', color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200' };
    }
}
