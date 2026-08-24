import React from 'react';

/**
 * ProceduralLayout (Presentation Strategy)
 * Step-by-step algorithmic / procedural calculation layout container.
 * Emphasizes worked examples, problem setup, step execution, and verification.
 */
export const ProceduralLayout = ({ page, renderBlock, context }) => {
  const blocks = page?.blocks || [];

  return (
    <div className="layout-strategy procedural-layout max-w-5xl xl:max-w-6xl mx-auto space-y-8">
      {/* Procedural Moments */}
      <div className="space-y-8">
        {blocks.map((block, idx) => (
          <div
            key={block.id || idx}
            className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm hover:border-custom-navy/30 transition-all"
          >
            {renderBlock ? renderBlock(block) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProceduralLayout;
