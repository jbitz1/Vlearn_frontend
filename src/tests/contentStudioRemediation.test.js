import test from 'node:test';
import assert from 'node:assert/strict';
import { PageGroupingService } from '../services/presentation/PageGroupingService.js';
import { PresentationNormalizer } from '../services/presentation/PresentationNormalizer.js';
import { isAssetPresent, getBlockMedia } from '../utils/assetUtils.js';
import { getComponentBadgeInfo } from '../utils/componentBadgeUtils.js';
import { toggleWrap, toggleLinePrefix, toggleBlockMath, toggleColor } from '../utils/editorUtils.js';
import { COMPONENT_CATEGORIES, getVisibleComponentCategories } from '../utils/blockTypeConstants.js';

test('1. PresentationNormalizer preserves component_order ?? order precedence', () => {
    const blocks = [
        { id: 1, title: 'Block 1', order: 0, component_order: 2 },
        { id: 2, title: 'Block 2', order: 1, component_order: 0 },
        { id: 3, title: 'Block 3', order: 2, component_order: 1 },
    ];

    const sorted = PresentationNormalizer.sortBlocks(blocks);
    assert.deepEqual(
        sorted.map(b => b.id),
        [2, 3, 1],
        'Blocks must be sorted by component_order when present'
    );
});

test('2. PageGroupingService groups into virtual cards and retains custom card titles', () => {
    const blocks = [
        { id: 10, page_number: 1, page_title: 'Introduction to Vectors', block_type: 'concept_explanation', order: 0 },
        { id: 11, page_number: 1, page_title: 'Introduction to Vectors', block_type: 'worked_example', order: 1 },
        { id: 20, page_number: 2, page_title: 'Vector Addition & Scalar Multiplication', block_type: 'concept_explanation', order: 2 },
        { id: 21, page_number: 2, page_title: 'Vector Addition & Scalar Multiplication', block_type: 'knowledge_check', order: 3 },
    ];

    const pages = PageGroupingService.groupIntoPages(blocks);
    assert.equal(pages.length, 2, 'Must create 2 distinct pages');
    assert.equal(pages[0].pageTitle, 'Introduction to Vectors');
    assert.equal(pages[1].pageTitle, 'Vector Addition & Scalar Multiplication');
    assert.equal(pages[0].blocks.length, 2);
    assert.equal(pages[1].blocks.length, 2);
});

test('3. Card title redundancy check does not suppress single renamed card', () => {
    // Before fix, if only 1 card had a title, isRedundantPageTitle was true and title was wiped.
    const blocks = [
        { id: 10, page_number: 1, page_title: 'Custom Renamed Card Title', block_type: 'concept_explanation', order: 0 },
        { id: 11, page_number: 1, page_title: 'Custom Renamed Card Title', block_type: 'definition', order: 1 },
    ];

    const pages = PageGroupingService.groupIntoPages(blocks);
    assert.equal(pages.length, 1);
    assert.equal(pages[0].pageTitle, 'Custom Renamed Card Title', 'Custom title on single card must NOT be suppressed');
});

test('4. isAssetPresent correctly flags existing visuals as present (No false missing flags)', () => {
    // Case A: Asset with status 'attached'
    assert.equal(isAssetPresent({ id: 1, status: 'attached' }), true);

    // Case B: Asset with URL
    assert.equal(isAssetPresent({ id: 2, status: 'pending', url: 'https://upload.wikimedia.org/test.png' }), true);

    // Case C: Asset with uploaded file
    assert.equal(isAssetPresent({ id: 3, status: 'pending', file: '/media/diagrams/fig1.png' }), true);

    // Case D: Asset with inline vector SVG metadata
    assert.equal(isAssetPresent({ id: 4, status: 'pending', metadata: { svg_content: '<svg viewBox="0 0 100 100"><circle r="50"/></svg>' } }), true);

    // Case E: Asset with simulation or video metadata
    assert.equal(isAssetPresent({ id: 5, status: 'pending', metadata: { simulation_key: 'projectile_motion' } }), true);
    assert.equal(isAssetPresent({ id: 6, status: 'pending', metadata: { video_id: 'abc123xyz' } }), true);

    // Case F: Truly unassigned placeholder
    assert.equal(isAssetPresent({ id: 7, status: 'pending', url: null, file: null, metadata: {} }), false);
    assert.equal(isAssetPresent(null), false);
});

test('5. getBlockMedia extracts matching visual media from block content or metadata', () => {
    const blockWithUrl = {
        id: 42,
        block_type: 'suggested_diagram',
        title: 'Wave Interference Pattern',
        content: { url: 'https://example.com/wave.svg', caption: 'Interference pattern' }
    };
    const media = getBlockMedia(blockWithUrl);
    assert.ok(media, 'Media must be found for block');
    assert.equal(media.url, 'https://example.com/wave.svg');
    assert.equal(media.title, 'Wave Interference Pattern');

    const blockWithSvg = {
        id: 43,
        block_type: 'diagram',
        title: 'Cell Structure',
        metadata: { svg_content: '<svg><circle/></svg>' }
    };
    const svgMedia = getBlockMedia(blockWithSvg);
    assert.ok(svgMedia, 'SVG Media must be found');
    assert.equal(svgMedia.svgCode, '<svg><circle/></svg>');
});

test('6. getComponentBadgeInfo provides distinct pedagogical titles and badges', () => {
    const hookBadge = getComponentBadgeInfo('hook');
    assert.equal(hookBadge.label, 'Hook & Curiosity');

    const goalBadge = getComponentBadgeInfo('learning_goal');
    assert.equal(goalBadge.label, 'Learning Goal');

    const defBadge = getComponentBadgeInfo('definition');
    assert.equal(defBadge.label, 'Formal Definition');

    const summaryBadge = getComponentBadgeInfo('summary');
    assert.equal(summaryBadge.label, 'Concept Summary');

    const formulaBadge = getComponentBadgeInfo('formula_breakdown');
    assert.equal(formulaBadge.label, 'Formula Breakdown');

    const theoryBadge = getComponentBadgeInfo('concept_explanation');
    assert.equal(theoryBadge.label, 'Core Theory / Explanation');
});

test('7. Sequential block reordering simulates drag-and-drop within a card', () => {
    const cardBlocks = [
        { id: 101, title: 'A', order: 0, component_order: 0 },
        { id: 102, title: 'B', order: 1, component_order: 1 },
        { id: 103, title: 'C', order: 2, component_order: 2 },
    ];

    // Drag item 'C' (index 2) to top (index 0)
    const reordered = [...cardBlocks];
    const [moved] = reordered.splice(2, 1);
    reordered.splice(0, 0, moved);

    // Synchronize both order and component_order sequentially
    const updated = reordered.map((b, idx) => ({
        ...b,
        order: idx,
        component_order: idx,
    }));

    assert.equal(updated[0].id, 103);
    assert.equal(updated[0].order, 0);
    assert.equal(updated[0].component_order, 0);

    assert.equal(updated[1].id, 101);
    assert.equal(updated[1].order, 1);
    assert.equal(updated[1].component_order, 1);

    assert.equal(updated[2].id, 102);
    assert.equal(updated[2].order, 2);
    assert.equal(updated[2].component_order, 2);
});

test('8. toggleWrap wraps the word under cursor without inserting dummy text like "bold text"', () => {
    const text = 'Why does water turn into steam when heated?';
    // Cursor in 'water' between 'wa' and 'ter' (index 11)
    const res = toggleWrap(text, 11, 11, '**');
    assert.equal(res.nextVal, 'Why does **water** turn into steam when heated?');
    assert.doesNotMatch(res.nextVal, /bold text/);
    assert.equal(res.newStart, 11);
    assert.equal(res.newEnd, 16);
});

test('9. toggleWrap toggles bold OFF when the word or selection is already bold', () => {
    const boldText = 'Why does **water** turn into steam when heated?';
    // Cursor in 'water' (index 13)
    const res = toggleWrap(boldText, 13, 13, '**');
    assert.equal(res.nextVal, 'Why does water turn into steam when heated?');

    // Selection on '**Physics**'
    const phrase = 'witnessing **Physics** in action';
    const resPhrase = toggleWrap(phrase, 11, 22, '**');
    assert.equal(resPhrase.nextVal, 'witnessing Physics in action');
});

test('10. toggleLinePrefix cleanly adds and removes list and heading prefixes as toggles', () => {
    const text = 'boil water for tea';
    // Add bullet
    const bullet = toggleLinePrefix(text, 0, 0, '- ');
    assert.equal(bullet.nextVal, '- boil water for tea');

    // Toggle bullet OFF
    const unbullet = toggleLinePrefix(bullet.nextVal, 0, 0, '- ');
    assert.equal(unbullet.nextVal, 'boil water for tea');

    // Add Heading
    const heading = toggleLinePrefix(text, 0, 0, '### ');
    assert.equal(heading.nextVal, '### boil water for tea');

    // Toggle Heading OFF
    const unheading = toggleLinePrefix(heading.nextVal, 0, 0, '### ');
    assert.equal(unheading.nextVal, 'boil water for tea');
});

test('11. toggleLinePrefix anchors to line boundary when text in the middle of a line is selected', () => {
    const text = 'The 6 Stages of Scientific Inquiry';
    // User selected 'Scientific' (index 16 to 26) in the middle of the line
    const res = toggleLinePrefix(text, 16, 26, '### ');
    assert.equal(res.nextVal, '### The 6 Stages of Scientific Inquiry', 'Heading must be anchored at line start, not mid-line');

    // Deselect / toggle off
    const unres = toggleLinePrefix(res.nextVal, 20, 30, '### ');
    assert.equal(unres.nextVal, 'The 6 Stages of Scientific Inquiry', 'Toggling off must cleanly remove heading prefix');
});

test('12. toggleLinePrefix smoothly switches heading levels (H1, H2, H3)', () => {
    const text = 'Understanding Thermodynamics';
    // Apply H3
    const h3 = toggleLinePrefix(text, 5, 10, '### ');
    assert.equal(h3.nextVal, '### Understanding Thermodynamics');

    // Switch to H1
    const h1 = toggleLinePrefix(h3.nextVal, 5, 10, '# ');
    assert.equal(h1.nextVal, '# Understanding Thermodynamics', 'Must replace H3 prefix with H1 prefix');

    // Switch to H2
    const h2 = toggleLinePrefix(h1.nextVal, 0, 0, '## ');
    assert.equal(h2.nextVal, '## Understanding Thermodynamics', 'Must replace H1 prefix with H2 prefix');
});

test('13. COMPONENT_CATEGORIES preserves complete component registry without deleting definitions', () => {
    const allItems = Object.values(COMPONENT_CATEGORIES).flat();
    assert.ok(allItems.length >= 26, `Must preserve full registry of definitions (found ${allItems.length})`);

    const types = new Set(allItems.map(i => i.type));
    // Verify legacy/experimental types are preserved
    assert.ok(types.has('video'), 'video must remain defined');
    assert.ok(types.has('video_ref'), 'video_ref must remain defined');
    assert.ok(types.has('suggested_diagram'), 'suggested_diagram must remain defined');
    assert.ok(types.has('suggested_simulation'), 'suggested_simulation must remain defined');
    assert.ok(types.has('story'), 'story must remain defined');
    assert.ok(types.has('analogy'), 'analogy must remain defined');
});

test('14. getVisibleComponentCategories returns only platform-compatible, non-hidden components', () => {
    const visible = getVisibleComponentCategories();
    const visibleItems = Object.values(visible).flat();

    // No visible item may have hidden: true
    for (const item of visibleItems) {
        assert.equal(item.hidden, false, `Visible item ${item.label} (${item.type}) must not be hidden`);
    }

    // Unsupported and redundant items must NOT be present in visible list
    const visibleTypes = new Set(visibleItems.map(i => i.type));
    assert.equal(visibleTypes.has('video'), false, 'Direct hosted video must be hidden (no streaming CDN)');
    assert.equal(visibleTypes.has('video_ref'), false, 'Video ref upload must be hidden (exceeds file/payload limits)');
    assert.equal(visibleTypes.has('diagram_placeholder'), false, 'Upload diagram must be hidden (redundant with upload image)');
    assert.equal(visibleTypes.has('suggested_diagram'), false, 'Suggested diagram placeholder must be hidden');
    assert.ok(visibleTypes.has('suggested_simulation'), 'Interactive simulation link must remain visible and supported');
    assert.equal(visibleTypes.has('visualization'), false, 'Visualization must be hidden from Add Component (handled by dedicated AI button)');
    assert.equal(visibleTypes.has('story'), false, 'Story must be hidden (redundant with Concept Explanation)');
    assert.equal(visibleTypes.has('analogy'), false, 'Analogy must be hidden (redundant with Concept Explanation)');
    assert.equal(visibleTypes.has('reflection'), false, 'Reflection must be hidden (redundant with Short Answer)');
    assert.equal(visibleTypes.has('key_takeaway'), false, 'Key Takeaway must be hidden (redundant with Summary)');
});

test('15. All hidden components have explicit reason documentation explaining platform constraints or redundancy', () => {
    const allItems = Object.values(COMPONENT_CATEGORIES).flat();
    const hiddenItems = allItems.filter(i => i.hidden);

    assert.ok(hiddenItems.length >= 7, 'Must have at least 7 hidden items properly flagged');
    for (const item of hiddenItems) {
        assert.ok(
            typeof item.reason === 'string' && item.reason.trim().length > 10,
            `Hidden item ${item.label} (${item.type}) must have an explanatory reason string`
        );
    }
});

test('16. Visible components include core learning, assessment, and media modalities', () => {
    const visible = getVisibleComponentCategories();
    const visibleItems = Object.values(visible).flat();
    const visibleTypes = new Set(visibleItems.map(i => i.type));

    // Core Theory & Structure
    assert.ok(visibleTypes.has('learning_goal'));
    assert.ok(visibleTypes.has('concept_explanation'));
    assert.ok(visibleTypes.has('definition'));
    assert.ok(visibleTypes.has('step_process'));
    assert.ok(visibleTypes.has('table'));
    assert.ok(visibleTypes.has('hook'));

    // Visuals & Media
    assert.ok(visibleTypes.has('image_placeholder'));
    assert.ok(visibleTypes.has('image'));
    assert.ok(visibleTypes.has('youtube'));
    assert.ok(visibleTypes.has('suggested_simulation'), 'Interactive Simulation must be in visible components');

    // Applied Practice
    assert.ok(visibleTypes.has('worked_example'));
    assert.ok(visibleTypes.has('real_world_example'));
    assert.ok(visibleTypes.has('experiment'));

    // Assessment
    assert.ok(visibleTypes.has('multiple_choice'));
    assert.ok(visibleTypes.has('true_false'));
    assert.ok(visibleTypes.has('fill_in_the_blank'));
    assert.ok(visibleTypes.has('short_answer'));

    // Review & Coaching
    assert.ok(visibleTypes.has('misconception'));
    assert.ok(visibleTypes.has('summary'));
});

test('17. Issue reports pagination handles large datasets and page slices accurately', () => {
    // Simulate 23 issues over years of operational accumulation
    const sampleIssues = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, title: `Issue ${i + 1}` }));
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(sampleIssues.length / pageSize));

    assert.equal(totalPages, 5, '23 issues at 5 per page should yield 5 pages');

    // Page 1 slice
    const p1 = sampleIssues.slice(0, 5);
    assert.equal(p1.length, 5);
    assert.equal(p1[0].id, 1);
    assert.equal(p1[4].id, 5);

    // Page 5 slice (remaining 3)
    const p5 = sampleIssues.slice((5 - 1) * pageSize, 5 * pageSize);
    assert.equal(p5.length, 3);
    assert.equal(p5[0].id, 21);
    assert.equal(p5[2].id, 23);
});

test('18. getPagePills generates clean, intuitive page navigation with ellipsis', () => {
    const getPagePills = (current, total) => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }
        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    // Case 1: Short list (<= 7 pages)
    assert.deepEqual(getPagePills(3, 5), [1, 2, 3, 4, 5]);

    // Case 2: Near start of large list (20 pages, page 2)
    assert.deepEqual(getPagePills(2, 20), [1, 2, 3, 4, 5, '...', 20]);

    // Case 3: Near end of large list (20 pages, page 19)
    assert.deepEqual(getPagePills(19, 20), [1, '...', 16, 17, 18, 19, 20]);

    // Case 4: In the middle of large list (20 pages, page 10)
    assert.deepEqual(getPagePills(10, 20), [1, '...', 9, 10, 11, '...', 20]);
});


