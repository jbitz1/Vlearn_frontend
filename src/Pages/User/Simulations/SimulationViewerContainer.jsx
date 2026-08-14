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
  Info
} from 'lucide-react';

export default function SimulationViewerContainer({ simulation = {}, onTelemetry, className = '' }) {
  const { title, subject_display, subject, topic, archetype, key, config = {} } = simulation;

  // Defensive UI Guardrails
  const context = config?.context_spec || {};
  const howToUse = Array.isArray(context.how_to_use) ? context.how_to_use : [];
  const expectedResults = Array.isArray(context.expected_results) ? context.expected_results : [];
  const overview = context.overview || 'Explore the interactive simulation below to test variables and observe scientific phenomena.';

  // State for collapsible panels & checkpoint verification
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(true);
  const [isExpectedResultsOpen, setIsExpectedResultsOpen] = useState(true);
  const [checkpointVerified, setCheckpointVerified] = useState(false);

  const handleVerifyCheckpoint = () => {
    setCheckpointVerified(true);
    if (typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        key: key || archetype,
        title,
        timestamp: Date.now()
      });
    }
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* 2-Column Responsive Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* RIGHT COLUMN (8 cols on Desktop): Interactive Simulation Stage renders FIRST on Mobile (order-1) */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-4 sm:space-y-6">
          {/* Interactive Simulation Stage */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xs sm:shadow-sm border border-gray-100 overflow-hidden min-h-[360px] sm:min-h-[480px]">
            <SimulationWidgetFactory
              archetype={archetype}
              simulationKey={key}
              config={config}
              title={title}
              onTelemetry={onTelemetry}
            />
          </div>
        </div>

        {/* LEFT COLUMN (4 cols on Desktop): Overview & Guide renders SECOND on Mobile (order-2) */}
        <div className="lg:col-span-4 order-2 lg:order-1 space-y-4 sm:space-y-6">
          {/* Header & Concept Overview Callout Box */}
          <div className="bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-100/80 shadow-xs sm:shadow-sm">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-custom-blue/10 text-custom-blue">
                <BookOpen className="w-3.5 h-3.5 mr-1 shrink-0" />
                {topic || subject_display || subject || 'STEM Simulation'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse shrink-0" />
                Active Model
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2 sm:mb-3 tracking-tight">
              {title || 'Interactive Simulation'}
            </h2>

            <div className="bg-white/80 backdrop-blur-xs p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-100 text-xs sm:text-sm text-gray-700 leading-relaxed shadow-inner">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-custom-blue shrink-0 mt-0.5" />
                <p>{overview}</p>
              </div>
            </div>
          </div>

          {/* "How to Use" Step-by-Step Panel */}
          {howToUse.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs sm:shadow-sm overflow-hidden transition-all">
              <button
                onClick={() => setIsHowToUseOpen(!isHowToUseOpen)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-gray-900 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer min-h-[44px]"
              >
                <span className="flex items-center gap-2 text-sm sm:text-base">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-custom-orange shrink-0" />
                  How to Use & Guide
                </span>
                <span className="text-gray-400 shrink-0">
                  {isHowToUseOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                </span>
              </button>

              {isHowToUseOpen && (
                <div className="p-4 sm:p-5 pt-1 sm:pt-2 space-y-2.5 sm:space-y-3">
                  {howToUse.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50/70 rounded-xl sm:rounded-2xl border border-gray-100">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl bg-custom-orange/10 text-custom-orange font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-gray-700 leading-normal font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expected Outcomes & Observations Panel */}
      {expectedResults.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs sm:shadow-sm overflow-hidden">
          <button
            onClick={() => setIsExpectedResultsOpen(!isExpectedResultsOpen)}
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-gray-900 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer min-h-[44px]"
          >
            <span className="flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
              What to Observe & Expected Outcomes
            </span>
            <span className="text-gray-400 shrink-0">
              {isExpectedResultsOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
            </span>
          </button>

          {isExpectedResultsOpen && (
            <div className="p-4 sm:p-5 pt-1 sm:pt-2 space-y-3 sm:space-y-4">
              {/* Results Table / Cards */}
              <div className="grid grid-cols-1 gap-3">
                {expectedResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/40 border border-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 md:w-1/3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                        Action / Parameter
                      </span>
                      <p className="text-xs font-semibold text-gray-900">{item.action || 'Manipulating Control'}</p>
                    </div>

                    <div className="hidden md:flex items-center text-amber-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 md:w-1/3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                        Expected Outcome
                      </span>
                      <p className="text-xs text-gray-700">{item.expected_outcome || 'Observed shift'}</p>
                    </div>

                    <div className="space-y-1 md:w-1/3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        Key Takeaway
                      </span>
                      <p className="text-xs font-medium text-emerald-900">{item.key_takeaway || 'Core principle'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkpoint Reflection Card */}
              <div className="mt-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">Student Checkpoint Reflection</h4>
                    <p className="text-[11px] sm:text-xs text-gray-600">
                      Have you tested the control variables and verified the expected observations?
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleVerifyCheckpoint}
                  className={`w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-medium text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 min-h-[44px] ${
                    checkpointVerified
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {checkpointVerified ? 'Checkpoint Verified!' : 'Verify Checkpoint'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
