import React from 'react';

/**
 * SpatialStructuralLayout (Presentation Strategy)
 * Responsive 2-column spatial arrangement container.
 * Left Column: Visuals, diagrams, and simulations.
 * Right Column: Structured pedagogical explanations, worked examples, and reflections.
 */
export const SpatialStructuralLayout = ({ page, renderBlock, context }) => {
  const blocks = page?.blocks || [];

  // Separate visual/simulation media blocks from text/explanation blocks
  const isMediaBlock = (block) => {
    const type = block?.block_type || '';
    return (
      type.startsWith('suggested_') ||
      type.endsWith('_placeholder') ||
      type === 'video_ref' ||
      type === 'simulation'
    );
  };

  const visualBlocks = blocks.filter(isMediaBlock);
  const textBlocks = blocks.filter((b) => !isMediaBlock(b));

  // If no visual blocks exist, render single column cleanly with max width constraint
  if (visualBlocks.length === 0) {
    return (
      <div className="layout-strategy spatial-layout max-w-4xl mx-auto space-y-16 px-6 lg:px-8">
        {blocks.map((block, idx) => (
          <div key={block.id || idx}>{renderBlock ? renderBlock(block) : null}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="layout-strategy spatial-layout max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
        {/* Left Column: Visual & Media Panel (Sticky on Desktop) */}
        {/* Uses 5 columns (out of 12) to leave generous whitespace between text and visuals */}
        <div className="lg:col-span-5 space-y-16 lg:sticky lg:top-16">
          <div className="space-y-16">
            {visualBlocks.map((block, idx) => (
              <div key={block.id || idx} className="rounded-2xl overflow-hidden bg-transparent">
                {renderBlock ? renderBlock(block) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pedagogical Content Panel */}
        <div className="lg:col-span-7 space-y-16 lg:pl-8">
          {textBlocks.map((block, idx) => (
            <div key={block.id || idx} className="spatial-text-moment">
              {renderBlock ? renderBlock(block) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpatialStructuralLayout;
