/**
 * PageGroupingService
 * Applies adaptive, instructionally-justified page break rules.
 * Does not use rigid hardcoded page limits, but infers breaks using:
 * 1. Backend compiler page_number / concept_group mapping
 * 2. Learning moment shifts (e.g., interactive simulation)
 * 3. Assessment & checkpoint boundaries
 * 4. Cognitive load thresholds
 */

import { PresentationNormalizer } from './PresentationNormalizer';

export class PageGroupingService {
  /**
   * Cleans raw title strings from generic/robotic prefixes.
   */
  static formatCleanPageTitle(raw, fallback) {
    if (!raw || raw === '---' || String(raw).startsWith('---')) return fallback;
    const clean = String(raw)
      .replace(/^#+\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/^-\s*/, '')
      .replace(/^Module\s*\d+(\.\d+)?:\s*/i, '')
      .replace(/^Concept\s*\d*[:\s\-]*/i, '')
      .replace(/^Core Concept\s*\d*[:\s\-]*/i, '')
      .replace(/^Key Concept\s*\d*[:\s\-]*/i, '')
      .trim();
    return clean || fallback;
  }

  /**
   * Groups blocks into pages respecting pedagogical bounds.
   */
  static groupIntoPages(blocks = []) {
    if (!blocks || blocks.length === 0) return [];

    const sortedBlocks = PresentationNormalizer.sortBlocks(blocks);

    // 1. Check if backend already assigned page_number values
    const hasBackendPages = sortedBlocks.some(
      (b) => b.page_number !== undefined && b.page_number !== null
    );

    if (hasBackendPages) {
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

    // 2. Fallback: Adaptive Page Break Inference
    const pages = [];
    let currentBlocks = [];
    let currentConcept = null;
    let currentLayout = 'DiscoveryLayout';
    let cognitiveLoadScore = 0;

    const MAX_COGNITIVE_LOAD = 10;

    sortedBlocks.forEach((block) => {
      const blockConcept = this.formatCleanPageTitle(
        block.metadata?.concept_group || block.page_title || block.title || 'Core Material',
        'Core Material'
      );
      const blockLayout = block.metadata?.layout_template || 'DiscoveryLayout';
      const blockLoad = this.estimateBlockCognitiveLoad(block);

      const conceptShift = currentConcept && blockConcept !== currentConcept;
      const loadExceeded = cognitiveLoadScore + blockLoad > MAX_COGNITIVE_LOAD;
      const isMajorMilestone = ['suggested_simulation', 'simulation_placeholder', 'knowledge_check'].includes(
        block.block_type
      ) && currentBlocks.length >= 2;

      if (currentBlocks.length > 0 && (conceptShift || loadExceeded || isMajorMilestone)) {
        const pageTitle = currentConcept || currentBlocks[0]?.title || `Part ${pages.length + 1}`;
        pages.push({
          pageNum: pages.length + 1,
          pageTitle,
          conceptGroup: pageTitle,
          layoutTemplate: currentLayout,
          blocks: currentBlocks,
        });
        currentBlocks = [];
        cognitiveLoadScore = 0;
      }

      currentBlocks.push(block);
      currentConcept = blockConcept;
      currentLayout = blockLayout;
      cognitiveLoadScore += blockLoad;
    });

    if (currentBlocks.length > 0) {
      const pageTitle = currentConcept || currentBlocks[0]?.title || `Part ${pages.length + 1}`;
      pages.push({
        pageNum: pages.length + 1,
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
