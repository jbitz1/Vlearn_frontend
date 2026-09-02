/**
 * PageGroupingService
 * Applies adaptive, instructionally-justified page break rules.
 * Does not use rigid hardcoded page limits, but infers breaks using:
 * 1. Backend compiler page_number / concept_group mapping
 * 2. Learning moment shifts (e.g., interactive simulation)
 * 3. Assessment & checkpoint boundaries
 * 4. Cognitive load thresholds
 */

import { PresentationNormalizer } from './PresentationNormalizer.js';

export class PageGroupingService {
  /**
   * Cleans raw title strings from generic/robotic prefixes and drafting jargon.
   */
  static formatCleanPageTitle(raw, fallback) {
    if (!raw || raw === '---' || String(raw).startsWith('---')) return fallback;
    let clean = String(raw)
      .replace(/^#+\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/^-\s*/, '')
      .replace(/^(?:Stage|Card|Part|Module|Concept|Step)\s*\d+[\s:\-–—\.]*/i, '')
      .replace(/^\d+[\s:\-–—\.]+/i, '')
      .trim();

    const draftingMap = [
      [/^(?:Introduction\s*&\s*Hook|Intro\s*&\s*Hook|Introduction\s*Hook|Hook\s*&\s*Intro)\b/i, 'Introduction & Discovery'],
      [/^(?:Curiosity\s*Hook|Hook\s*Scenario|Hook)\b/i, 'Curiosity & Discovery'],
      [/^(?:Predict|Prediction|Predictive\s*Challenge)\b/i, 'Initial Prediction Challenge'],
      [/^(?:Core\s*Principles?\s*&\s*Mechanism|Core\s*Principles?|Core\s*Explanation)\b/i, 'Fundamental Principles'],
      [/^(?:Real[\s\-_]*World\s*Applications?\s*&\s*Workings|Real[\s\-_]*World\s*Connection|Real[\s\-_]*World\s*Applications?)\b/i, 'Real-World Applications'],
      [/^(?:Worked\s*Example|Step[\s\-_]*by[\s\-_]*Step\s*Worked\s*Example)\b/i, 'Step-by-Step Problem Solving'],
      [/^(?:Common\s*Pitfalls?\s*&\s*Practice|Common\s*Misconceptions?|Misconception)\b/i, 'Common Misconceptions & Pitfalls'],
      [/^(?:Knowledge\s*Check|Active\s*Practice\s*&\s*Knowledge\s*Check|Check\s*for\s*Understanding)\b/i, 'Check Your Understanding'],
      [/^(?:Reflection\s*&\s*Summary|Summary\s*&\s*Reflection|Summary\s*&\s*Key\s*Takeaways|Summary)\b/i, 'Key Insights & Summary'],
    ];

    for (const [pattern, replacement] of draftingMap) {
      if (pattern.test(clean)) {
        clean = clean.replace(pattern, replacement);
        break;
      }
    }

    return clean || fallback;
  }

  /**
   * Groups blocks into pages respecting pedagogical bounds.
   */
  static groupIntoPages(blocks = []) {
    if (!blocks || blocks.length === 0) return [];

    const sortedBlocks = PresentationNormalizer.sortBlocks(blocks);

    // 1. Check if backend already assigned distinct page_number values (>= 2 pages)
    const distinctBackendPages = new Set(
      sortedBlocks.map((b) => b.page_number).filter((p) => p !== undefined && p !== null)
    );

    if (distinctBackendPages.size >= 2) {
      const pageMap = {};
      sortedBlocks.forEach((block) => {
        const pageNum = block.page_number || 1;
        const fallbackTitle = block.title || `Part ${pageNum}`;
        const cleanTitle = this.formatCleanPageTitle(
          block.page_title || block.metadata?.concept_group || fallbackTitle,
          fallbackTitle
        );
        if (!pageMap[pageNum]) {
          pageMap[pageNum] = {
            pageNum,
            pageTitle: cleanTitle,
            conceptGroup: cleanTitle,
            layoutTemplate: block.metadata?.layout_template || 'DiscoveryLayout',
            blocks: [],
          };
        }
        pageMap[pageNum].blocks.push(block);
      });

      return Object.values(pageMap).sort((a, b) => a.pageNum - b.pageNum);
    }

    // 2. Adaptive Multi-Card Fallback (when backend has <= 1 distinct page number)
    const pages = [];
    let currentBlocks = [];
    let currentLayout = 'DiscoveryLayout';

    const BREAK_TRIGGER_TYPES = new Set([
      'concept_explanation', 'core_explanation', 'worked_example',
      'real_world_example', 'experiment', 'misconception', 'common_misconception',
      'knowledge_check', 'revision_questions', 'multiple_choice', 'true_false',
      'short_answer', 'summary', 'reflection', 'key_takeaway', 'suggested_simulation'
    ]);

    sortedBlocks.forEach((block) => {
      const bt = (block.block_type || '').toLowerCase();
      const isMedia = [
        'image', 'diagram', 'video', 'youtube', 'gif',
        'suggested_diagram', 'suggested_image', 'suggested_video',
        'image_placeholder', 'diagram_placeholder', 'video_ref',
        'repository_asset', 'simulation_placeholder'
      ].includes(bt);

      const shouldBreak = currentBlocks.length > 0 && !isMedia && (
        BREAK_TRIGGER_TYPES.has(bt) ||
        currentBlocks.length >= 3
      );

      if (shouldBreak) {
        const firstBlock = currentBlocks[0];
        const pageNum = pages.length + 1;
        const pageTitle = this.formatCleanPageTitle(
          firstBlock?.page_title || firstBlock?.metadata?.concept_group || firstBlock?.title || `Part ${pageNum}`,
          `Part ${pageNum}`
        );
        pages.push({
          pageNum,
          pageTitle,
          conceptGroup: pageTitle,
          layoutTemplate: currentLayout,
          blocks: currentBlocks,
        });
        currentBlocks = [];
      }

      currentBlocks.push(block);
      currentLayout = block.metadata?.layout_template || currentLayout || 'DiscoveryLayout';
    });

    if (currentBlocks.length > 0) {
      const firstBlock = currentBlocks[0];
      const pageNum = pages.length + 1;
      const pageTitle = this.formatCleanPageTitle(
        firstBlock?.page_title || firstBlock?.metadata?.concept_group || firstBlock?.title || `Part ${pageNum}`,
        `Part ${pageNum}`
      );
      pages.push({
        pageNum,
        pageTitle,
        conceptGroup: pageTitle,
        layoutTemplate: currentLayout,
        blocks: currentBlocks,
      });
    }

    return pages;
  }

  static estimateBlockCognitiveLoad(block) {
    const type = block.block_type || '';
    if (['suggested_simulation', 'simulation_placeholder'].includes(type)) return 5;
    if (['worked_example', 'knowledge_check', 'formula_breakdown'].includes(type)) return 3;
    if (['concept_explanation', 'definitions', 'experiment'].includes(type)) return 2;
    return 1;
  }
}
