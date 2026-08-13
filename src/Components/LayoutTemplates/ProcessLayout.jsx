import React from 'react';
import { ArrowDown } from 'lucide-react';

/**
 * ProcessLayout (Presentation Strategy)
 * Sequential process/mechanism layout container.
 * Features vertical process step connectors between learning moments.
 */
export const ProcessLayout = ({ page, renderBlock, context }) => {
  const blocks = page?.blocks || [];

  return (
    <div className="layout-strategy process-layout max-w-4xl mx-auto space-y-8">
      {/* Sequential Blocks with Flow Connectors */}
      <div className="relative space-y-6">
        {blocks.map((block, idx) => {
          const isLast = idx === blocks.length - 1;
          return (
            <React.Fragment key={block.id || idx}>
              <div className="relative bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-custom-forest text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {idx + 1}
                </div>
                <div className="pl-4">{renderBlock ? renderBlock(block) : null}</div>
              </div>

              {!isLast && (
                <div className="flex justify-center py-2 text-custom-forest/40">
                  <ArrowDown className="w-5 h-5 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessLayout;
