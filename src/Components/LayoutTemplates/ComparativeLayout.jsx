import React from 'react';

/**
 * ComparativeLayout (Presentation Strategy)
 * Side-by-side comparative spatial layout container.
 * Perfect for contrasting concepts, alternative models, before/after, or misconceptions.
 */
export const ComparativeLayout = ({ page, renderBlock, context }) => {
  const blocks = page?.blocks || [];

  // If even number of blocks >= 2, arrange in 2-column comparative grid
  const useGrid = blocks.length >= 2;

  return (
    <div className="layout-strategy comparative-layout max-w-6xl xl:max-w-7xl mx-auto space-y-8">
      <div className={useGrid ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
        {blocks.map((block, idx) => (
          <div
            key={block.id || idx}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {renderBlock ? renderBlock(block) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparativeLayout;
