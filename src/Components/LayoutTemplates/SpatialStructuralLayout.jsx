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
      <div className="layout-strategy spatial-layout max-w-4xl mx-auto space-y-6 sm:space-y-12 lg:space-y-16 px-2 sm:px-6 lg:px-8">
        {blocks.map((block, idx) => (
          <div key={block.id || idx}>{renderBlock ? renderBlock(block) : null}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="layout-strategy spatial-layout max-w-7xl mx-auto px-0 sm:px-4 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-24 items-start">
        {/* Right Column (Pedagogical Content) renders FIRST on mobile (order-1), SECOND on desktop (lg:order-2) */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 sm:space-y-12 lg:pl-8">
          {textBlocks.map((block, idx) => (
            <div key={block.id || idx} className="spatial-text-moment">
              {renderBlock ? renderBlock(block) : null}
            </div>
          ))}
        </div>

        {/* Left Column (Visual & Media) renders SECOND on mobile (order-2), FIRST on desktop (lg:order-1) */}
        <div className="lg:col-span-5 order-2 lg:order-1 space-y-6 sm:space-y-12 lg:sticky lg:top-16">
          <div className="space-y-6 sm:space-y-12">
            {visualBlocks.map((block, idx) => (
              <div key={block.id || idx} className="rounded-2xl overflow-hidden bg-transparent">
                {renderBlock ? renderBlock(block) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpatialStructuralLayout;
