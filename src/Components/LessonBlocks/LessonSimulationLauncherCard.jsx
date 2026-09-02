import React, { useState } from 'react';
import {
  FlaskConical,
  Zap,
  Dna,
  Calculator,
  Sparkles,
  Maximize2,
  BookOpen,
  Layers,
  ArrowRight,
} from 'lucide-react';
import FullscreenSimulationModal from '../Simulations/FullscreenSimulationModal';

const SUBJECT_THEMES = {
  CHEMISTRY: {
    bg: 'from-cyan-500/10 via-sky-500/5 to-transparent',
    border: 'border-cyan-200/80 hover:border-cyan-400/80',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    btn: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20',
    icon: FlaskConical,
    iconColor: 'text-cyan-600',
  },
  PHYSICS: {
    bg: 'from-amber-500/10 via-orange-500/5 to-transparent',
    border: 'border-amber-200/80 hover:border-amber-400/80',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
    icon: Zap,
    iconColor: 'text-amber-600',
  },
  BIOLOGY: {
    bg: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    border: 'border-emerald-200/80 hover:border-emerald-400/80',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    icon: Dna,
    iconColor: 'text-emerald-600',
  },
  MATHEMATICS: {
    bg: 'from-purple-500/10 via-violet-500/5 to-transparent',
    border: 'border-purple-200/80 hover:border-purple-400/80',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20',
    icon: Calculator,
    iconColor: 'text-purple-600',
  },
};

export default function LessonSimulationLauncherCard({ simObject, onTelemetry }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!simObject) return null;

  const subjectKey = (simObject.subject || 'CHEMISTRY').toUpperCase();
  const theme = SUBJECT_THEMES[subjectKey] || SUBJECT_THEMES.CHEMISTRY;
  const SubjectIcon = theme.icon;

  const overview =
    simObject.config?.context_spec?.overview ||
    simObject.description ||
    'Launch the interactive simulation to explore scientific concepts, manipulate variables, and observe real-time dynamic models.';

  return (
    <>
      <div
        className={`my-8 rounded-2xl sm:rounded-3xl border ${theme.border} bg-gradient-to-br ${theme.bg} bg-white p-5 sm:p-7 shadow-xs hover:shadow-md transition-all`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Simulation Info */}
          <div className="space-y-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.badge}`}
              >
                <SubjectIcon className="w-3.5 h-3.5 mr-1 shrink-0" />
                {simObject.subject || 'STEM'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-custom-blue border border-blue-200">
                <BookOpen className="w-3.5 h-3.5 mr-1 shrink-0" />
                {simObject.topic || 'Interactive Module'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse shrink-0" />
                Live Lab Model
              </span>
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              {simObject.title || 'Interactive Simulation'}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed max-w-3xl">
              {overview}
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] sm:text-xs text-gray-400 font-medium">
              <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Full-Screen Interactive Lab • Responsive across all devices</span>
            </div>
          </div>

          {/* Launch Button */}
          <div className="shrink-0 flex items-center">
            <button
              onClick={() => setIsOpen(true)}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer ${theme.btn}`}
            >
              <Maximize2 className="w-4 h-4 shrink-0" />
              <span>Open Simulation</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenSimulationModal
        simulation={simObject}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onTelemetry={onTelemetry}
      />
    </>
  );
}
