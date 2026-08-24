import React, { useState } from 'react';
import SimulationWidgetFactory from './SimulationWidgetFactory';
import {
  BookOpen,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info,
  Maximize2
} from 'lucide-react';

export default function SimulationViewerContainer({ simulation = {}, onTelemetry, className = '' }) {
  const { title, subject_display, subject, topic, archetype, key, config = {} } = simulation;

  // Defensive UI Guardrails
  const context = config?.context_spec || {};
  const howToUse = Array.isArray(context.how_to_use) ? context.how_to_use : [];
  const expectedResults = Array.isArray(context.expected_results) ? context.expected_results : [];
  const overview = context.overview || 'Explore the interactive simulation below to test variables and observe scientific phenomena.';

  // State for collapsible reference panels
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* 1. Header Bar */}
      <div className="bg-gradient-to-r from-blue-50/90 via-white to-purple-50/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-custom-blue/10 text-custom-blue border border-custom-blue/20">
              <BookOpen className="w-3.5 h-3.5 mr-1 shrink-0" />
              {topic || subject_display || subject || 'Chemistry Simulation'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse shrink-0" />
              Interactive Lab Model
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {title || 'Interactive Simulation'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
            {overview}
          </p>
        </div>
      </div>

      {/* 2. Full-Width Expansive Interactive Simulation Stage */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-xs border border-gray-200/80 overflow-hidden min-h-[380px] sm:min-h-[500px]">
        <SimulationWidgetFactory
          archetype={archetype}
          simulationKey={key}
          config={config}
          title={title}
          onTelemetry={onTelemetry}
        />
      </div>

      {/* 3. Companion Guide & Expected Outcomes Deck (Wide 2-Column Grid Below Stage) */}
      {(howToUse.length > 0 || expectedResults.length > 0) && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {/* Left Card: "How to Use" Step-by-Step Guide */}
          {howToUse.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 font-bold text-gray-900 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2 text-sm sm:text-base">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-custom-orange shrink-0" />
                How to Use & Laboratory Protocol
              </div>
              <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                {howToUse.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50/70 rounded-xl sm:rounded-2xl border border-gray-100">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl bg-custom-orange/10 text-custom-orange font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right Card: Expected Outcomes & Observations */}
          {expectedResults.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 font-bold text-gray-900 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                What to Observe & Expected Outcomes
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                {expectedResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/40 border border-amber-200/60 text-xs sm:text-sm space-y-1.5"
                  >
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      {item.action || `Observation ${idx + 1}`}
                    </div>
                    {item.expected_outcome && (
                      <p className="text-gray-700 pl-3 leading-relaxed">
                        <strong className="text-gray-900 font-semibold">Outcome: </strong>
                        {item.expected_outcome}
                      </p>
                    )}
                    {item.key_takeaway && (
                      <p className="text-emerald-800 font-medium pl-3 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100/80 leading-relaxed">
                        <strong>Key Takeaway: </strong>
                        {item.key_takeaway}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
