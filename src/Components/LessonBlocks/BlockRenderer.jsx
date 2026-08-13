import React from 'react';
import {
  LearningGoalBlock,
  ConceptExplanationBlock,
  DefinitionCardBlock,
  WorkedExampleBlock,
  AnalogyBlock,
  CommonMisconceptionBlock,
  CommonMistakeBlock,
  CalloutBlock,
  QuickFactBlock,
  DidYouKnowBlock,
  MemoryTipBlock,
  RealWorldConnectionBlock,
  RealWorldExampleBlock,
  ReflectionBlock,
  PredictionBlock,
  MiniActivityBlock,
  FormulaBreakdownBlock,
  KeyTakeawayBlock,
  BeforeYouContinueBlock,
  SummaryBlock,
  TransitionBlock,
  KnowledgeCheckBlock,
  SuggestedMediaBlock,
  ComparisonTableBlock,
  StepProcessBlock,
} from './BlueprintComponents';
import { ContentNormalizer } from '../../utils/ContentNormalizer';

// Legacy V1 blocks — kept intact for backward compatibility
import {
  OverviewBlock,
  ObjectiveBlock,
  DefinitionBlock,
  CoreExplanationBlock,
  ExperimentBlock,
  RevisionQuestionsBlock,
} from './TextBlocks';
import { ImagePlaceholderBlock, VideoRefBlock, SimulationPlaceholderBlock } from './MediaBlocks';

export const BlockRenderer = ({ block, onInteract }) => {
  if (!block || !block.block_type) return null;

  switch (block.block_type) {
    // ── Phase 2 blueprint component types ─────────────────────────────────
    case 'learning_goal':        return <LearningGoalBlock       block={block} />;
    case 'concept_explanation':  
    case 'hook':
    case 'story':                return <ConceptExplanationBlock  block={block} />;
    case 'definition_card':      return <DefinitionCardBlock      block={block} />;
    case 'worked_example':       return <WorkedExampleBlock       block={block} />;
    case 'analogy':              return <AnalogyBlock             block={block} />;
    case 'common_misconception': return <CommonMisconceptionBlock block={block} />;
    case 'common_mistake':       return <CommonMistakeBlock       block={block} />;
    case 'callout':              return <CalloutBlock             block={block} />;
    case 'quick_fact':           return <QuickFactBlock           block={block} />;
    case 'did_you_know':         return <DidYouKnowBlock          block={block} />;
    case 'memory_tip':           return <MemoryTipBlock           block={block} />;
    case 'real_world_connection':return <RealWorldConnectionBlock block={block} />;
    case 'real_world_example':   return <RealWorldExampleBlock    block={block} />;
    case 'reflection':           return <ReflectionBlock          block={block} />;
    case 'prediction':           return <PredictionBlock          block={block} />;
    case 'mini_activity':
    case 'classroom_activity':
    case 'discussion_prompt':    return <MiniActivityBlock        block={block} />;
    case 'formula_breakdown':    return <FormulaBreakdownBlock    block={block} />;
    case 'key_takeaway':         return <KeyTakeawayBlock         block={block} />;
    case 'before_you_continue':  return <BeforeYouContinueBlock   block={block} />;
    case 'summary':              return <SummaryBlock             block={block} />;
    case 'transition':           return <TransitionBlock          block={block} />;
    case 'comparison_table':     return <ComparisonTableBlock     block={block} />;
    case 'step_process':         return <StepProcessBlock         block={block} />;
    case 'knowledge_check':
    case 'multiple_choice':
    case 'true_false':
    case 'fill_in_the_blank':
    case 'short_answer':         return <KnowledgeCheckBlock      block={block} onInteract={onInteract} />;

    // Suggested media (pending or resolved)
    case 'diagram':
    case 'image':
    case 'suggested_diagram':
    case 'suggested_illustration':
    case 'suggested_infographic':
    case 'suggested_table':
    case 'suggested_graph':
    case 'suggested_timeline':
    case 'suggested_flowchart':
    case 'suggested_mind_map':
    case 'suggested_video':
    case 'suggested_image':
    case 'suggested_simulation':
    case 'suggested_gif':
    case 'suggested_activity':
    case 'suggested_external_link':
    case 'repository_asset':
    case 'image_placeholder':
    case 'diagram_placeholder':
    case 'video_ref':
    case 'simulation_placeholder':
      return <SuggestedMediaBlock block={block} />;

    // ── Legacy V1 block types — completely unchanged ───────────────────────
    case 'overview':
    case 'introduction':
      return <OverviewBlock block={block} />;
    case 'objectives':
      return <ObjectiveBlock block={block} />;
    case 'definitions':
      return <DefinitionBlock block={block} />;
    case 'core_explanation':
    case 'visual_learning':
      return <CoreExplanationBlock block={block} />;
    case 'experiment':
      return <ExperimentBlock block={block} />;
    case 'revision_questions':
      return <RevisionQuestionsBlock block={block} onInteract={onInteract} />;

    // ── Text fallback with component_type resolution ─────────────────────
    case 'text':
    default: {
      const compType = block.component_type || block.metadata?.component_type;
      if (compType === 'learning_goal') return <LearningGoalBlock block={block} />;
      if (compType === 'definition_card' || compType === 'definition') return <DefinitionCardBlock block={block} />;
      if (compType === 'worked_example') return <WorkedExampleBlock block={block} />;
      if (compType === 'summary_card' || compType === 'summary') return <SummaryBlock block={block} />;
      if (compType === 'comparison_table') return <ComparisonTableBlock block={block} />;
      if (compType === 'step_process') return <StepProcessBlock block={block} />;
      if (compType === 'suggested_image' || compType === 'photo_view') return <SuggestedMediaBlock block={block} />;
      if (compType === 'suggested_diagram' || compType === 'svg_viewer') return <SuggestedMediaBlock block={block} />;
      if (compType === 'knowledge_check' || compType === 'mcq_interactive') return <KnowledgeCheckBlock block={block} onInteract={onInteract} />;
      if (compType === 'concept_card' || compType === 'concept_explanation') return <ConceptExplanationBlock block={block} />;

      // If block contains renderable content, render it via ConceptExplanationBlock fallback
      const rawText = ContentNormalizer.extractText(block.content);
      if (rawText && rawText.trim()) {
        return <ConceptExplanationBlock block={block} />;
      }
      return null;
    }
  }
};
