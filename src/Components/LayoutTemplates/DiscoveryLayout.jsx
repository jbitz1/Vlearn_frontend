import React from 'react';

/**
 * DiscoveryLayout (Presentation Strategy)
 * Guided progressive disclosure spatial layout container.
 * Focuses on sequential discovery: Phenomenon → Model → Formalization → Reflection.
 */
export const DiscoveryLayout = ({ page, renderBlock, context }) => {
  const blocks = page?.blocks || [];

  return (
    <div className="layout-strategy discovery-layout max-w-4xl mx-auto space-y-8">
      {/* Render blocks in exact pedagogical sequence */}
      <div className="space-y-8">
        {blocks.map((block, idx) => (
          <div key={block.id || idx} className="discovery-moment transition-all duration-300">
            {renderBlock ? renderBlock(block) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoveryLayout;
