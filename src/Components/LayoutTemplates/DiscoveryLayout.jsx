import React from 'react';

/**
 * DiscoveryLayout (Presentation Strategy)
 * Guided progressive disclosure spatial layout container.
 * Focuses on sequential discovery: Phenomenon → Model → Formalization → Reflection.
 */
export const DiscoveryLayout = ({ page, renderBlock, context }) => {
  const blocks = page?.blocks || [];

  return (
    <div className="layout-strategy discovery-layout w-full max-w-[1536px] mx-auto space-y-10 px-0 sm:px-1">
      {/* Render blocks in exact pedagogical sequence */}
      <div className="space-y-10 w-full">
        {blocks.map((block, idx) => {
          const type = block?.block_type || '';
          const isWideMedia = [
            'suggested_simulation',
            'simulation_placeholder',
            'simulation',
            'diagram',
            'suggested_diagram',
            'suggested_video',
            'video_ref',
            'suggested_image',
            'image_placeholder',
            'experiment'
          ].includes(type);

          return (
            <div
              key={block.id || idx}
              className={`discovery-moment transition-all duration-300 ${
                isWideMedia ? 'w-full' : 'w-full max-w-5xl xl:max-w-6xl mx-auto'
              }`}
            >
              {renderBlock ? renderBlock(block) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscoveryLayout;
