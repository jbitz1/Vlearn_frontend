import React, { useState, useRef, useEffect } from 'react';
import SimulationWidgetFactory from './SimulationWidgetFactory';
import {
  BookOpen,
  HelpCircle,
  Sparkles,
  Minimize2,
  X,
  Tv,
} from 'lucide-react';

/**
 * Top Header Navigation Bar
 */
function SimulationHeader({
  title,
  topic,
  subject,
  subjectDisplay,
  overview,
  isFullscreen,
  toggleFullscreen,
  onClose,
  isModal,
}) {
  return (
    <header
      className={`w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs ${
        isModal ? 'sticky top-0 z-30' : 'rounded-2xl sm:rounded-3xl border border-gray-200'
      }`}
    >
      {/* Title & Metadata */}
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-custom-blue/10 text-custom-blue border border-custom-blue/20">
            <BookOpen className="w-3.5 h-3.5 mr-1 shrink-0" />
            {topic || subjectDisplay || subject || 'Interactive Simulation'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse shrink-0" />
            Interactive Lab Model
          </span>
        </div>

        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight truncate">
          {title || 'Interactive Simulation'}
        </h1>

        {overview && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 max-w-4xl">
            {overview}
          </p>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center shrink-0">
        {/* Projector / Screen Fullscreen Mode */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Projector / Fullscreen Mode'}
          aria-label="Projector Fullscreen Mode"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-all cursor-pointer"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-custom-blue shrink-0" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Tv className="w-3.5 h-3.5 text-custom-blue shrink-0" />
              <span className="hidden sm:inline">Projector View</span>
            </>
          )}
        </button>

        {/* Exit Button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Exit Simulation"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <X className="w-4 h-4 shrink-0" />
            <span>Exit Simulation</span>
          </button>
        )}
      </div>
    </header>
  );
}

/**
 * Companion Guide & Expected Outcomes Section (Rendered below the simulation stage)
 */
function SimulationGuideSection({ howToUse, expectedResults }) {
  if (howToUse.length === 0 && expectedResults.length === 0) return null;

  return (
    <section aria-label="Laboratory Guide and Expected Outcomes" className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
      {/* "How to Use" Step-by-Step Guide */}
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

      {/* Expected Outcomes & Observations */}
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
    </section>
  );
}

/**
 * Main Simulation Viewer Container
 * Full-screen scrollable presentation:
 * - Clean header with title, projector toggle, and exit button
 * - Expansive interactive simulation stage (visuals, clickable areas, graphs, sliders)
 * - Natural vertical scroll to access derivations, calculations, and companion guide protocols
 */
export default function SimulationViewerContainer({
  simulation = {},
  onTelemetry,
  onClose,
  isFullscreenModal = false,
  className = '',
}) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { title, subject_display, subject, topic, archetype, key, config = {} } = simulation;

  // Context guide details
  const context = config?.context_spec || {};
  const howToUse = Array.isArray(context.how_to_use) ? context.how_to_use : [];
  const expectedResults = Array.isArray(context.expected_results) ? context.expected_results : [];
  const overview = context.overview || 'Explore the interactive simulation below to test variables and observe scientific phenomena.';

  // Toggle browser fullscreen API
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const target = containerRef.current || document.documentElement;
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col space-y-6 ${className}`}
    >
      {/* 1. Header Bar */}
      <SimulationHeader
        title={title}
        topic={topic}
        subject={subject}
        subjectDisplay={subject_display}
        overview={overview}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onClose={onClose}
        isModal={isFullscreenModal}
      />

      {/* 2. Interactive Simulation Stage */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-xs border border-gray-200/80">
        <SimulationWidgetFactory
          archetype={archetype}
          simulationKey={key}
          config={config}
          title={title}
          onTelemetry={onTelemetry}
        />
      </div>

      {/* 3. Companion Guide & Expected Outcomes Deck */}
      <SimulationGuideSection
        howToUse={howToUse}
        expectedResults={expectedResults}
      />
    </div>
  );
}
