import React from 'react';

/**
 * NarrativeTimelineLayout (Presentation Strategy)
 * Historical / contextual narrative flow connecting learning moments.
 */
export const NarrativeTimelineLayout = ({ page, renderBlock, context }) => {
  const blocks = page?.blocks || [];

  return (
    <div className="layout-strategy narrative-timeline-layout max-w-4xl mx-auto space-y-8">
      <div className="relative border-l-2 border-custom-terracotta/30 ml-4 pl-8 space-y-10">
        {blocks.map((block, idx) => (
          <div key={block.id || idx} className="relative">
            <div className="absolute -left-[41px] top-4 w-4 h-4 rounded-full bg-custom-terracotta border-4 border-white shadow-sm" />
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm">
              {renderBlock ? renderBlock(block) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NarrativeTimelineLayout;
