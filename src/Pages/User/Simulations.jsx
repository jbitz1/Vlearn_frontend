import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router';
import UserContext from '../../Context/UserContext';
import SimulationCard from '../../Components/User/SimulationCard';
import FullscreenSimulationModal from '../../Components/Simulations/FullscreenSimulationModal';
import {
  Beaker,
  Zap,
  Dna,
  Calculator,
  Sparkles,
  SlidersHorizontal,
  GraduationCap,
  Layers,
  BookOpen,
} from 'lucide-react';
import {
  GRADE_CONFIG,
  getStructuredCurriculumGroups,
} from './Simulations/curriculumTopics';

const SUBJECT_CONFIG = {
  ALL: { name: 'All Subjects', icon: SlidersHorizontal, color: 'text-gray-700 bg-gray-100' },
  CHEMISTRY: { name: 'Chemistry', icon: Beaker, color: 'text-cyan-600 bg-cyan-50' },
  PHYSICS: { name: 'Physics', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  BIOLOGY: { name: 'Biology', icon: Dna, color: 'text-emerald-600 bg-emerald-50' },
  MATHEMATICS: { name: 'Mathematics', icon: Calculator, color: 'text-purple-600 bg-purple-50' },
};

export default function Simulations() {
  const { user } = useContext(UserContext);
  const [simulations, setSimulations] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/curriculum/simulations/')
      .then((res) => {
        if (!res.ok) throw new Error('API query failed');
        return res.json();
      })
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        const activeItems = items.filter((sim) => sim.status === 'ACTIVE');
        setSimulations(activeItems);
      })
      .catch((err) => {
        console.warn('Failed to load simulations from API, keeping active registry:', err);
        setSimulations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getSubjectCount = (subKey) => {
    if (subKey === 'ALL') return simulations.length;
    return simulations.filter((s) => s.subject === subKey).length;
  };

  const structuredGroups = useMemo(() => {
    return getStructuredCurriculumGroups(simulations, selectedSubject, selectedGrade);
  }, [simulations, selectedSubject, selectedGrade]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Simulations</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100/80 z-10 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-gray-100">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Beaker className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 text-sm mb-6">
            Please sign in to access interactive virtual experiment simulations.
          </p>
          <Link
            to="/login"
            className="inline-block w-full bg-custom-blue text-white py-3 rounded-2xl font-medium hover:bg-custom-orange transition-colors shadow-md"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-14 pr-4 py-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* 1. Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Beaker className="w-7 h-7 sm:w-8 sm:h-8 text-custom-orange shrink-0" />
            Experiment Simulations
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Interactive virtual labs, dynamic models, and parameter-driven STEM simulations categorized by Form and Grade.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-blue-50 text-custom-blue px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-blue-100 text-xs font-semibold self-start md:self-center">
          <Sparkles className="w-4 h-4 text-custom-orange shrink-0" />
          {simulations.length} Interactive Lab Simulations Ready
        </div>
      </div>

      {/* 2. Grade & Form Tabs Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <GraduationCap className="w-4 h-4 text-custom-blue" />
          Select Level / Class
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {GRADE_CONFIG.map((g) => {
            const isSelected = selectedGrade === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border min-h-[40px] ${
                  isSelected
                    ? 'bg-custom-blue text-white shadow-xs border-custom-blue'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Subject Filter Navigation Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <BookOpen className="w-4 h-4 text-custom-orange" />
          Select Subject Domain
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-none">
          {Object.keys(SUBJECT_CONFIG).map((subKey) => {
            const conf = SUBJECT_CONFIG[subKey];
            const Icon = conf.icon;
            const count = getSubjectCount(subKey);
            const isSelected = selectedSubject === subKey;

            return (
              <button
                key={subKey}
                onClick={() => setSelectedSubject(subKey)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer border min-h-[44px] ${
                  isSelected
                    ? 'bg-custom-orange text-white shadow-xs border-custom-orange'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                {conf.name}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Categorized Curriculum Topic Views */}
      {structuredGroups.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 max-w-2xl mx-auto mt-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
            <Beaker className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No simulations available for this selection</h3>
          <p className="text-slate-500 text-sm">
            Try switching the Form/Grade tab or Subject filter above to explore registered simulations.
          </p>
        </div>
      ) : (
        <div className="space-y-14">
          {structuredGroups.map((group) => {
            const conf = SUBJECT_CONFIG[group.subjectKey] || { name: group.subjectKey, icon: Beaker, color: 'text-gray-700 bg-gray-100' };
            const Icon = conf.icon;

            return (
              <section key={group.subjectKey} className="space-y-10">
                {/* Subject Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                    <span className={`p-2 rounded-xl ${conf.color}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    {conf.name}
                  </h2>
                </div>

                {/* Form Sub-Sections */}
                <div className="space-y-12 pl-1 sm:pl-2">
                  {group.formGroups.map((formBlock) => (
                    <div key={formBlock.formKey} className="space-y-6">
                      {/* Form Header Banner */}
                      <div className="flex items-center justify-between bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-custom-blue" />
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            {formBlock.formLabel}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full shadow-2xs">
                          {formBlock.totalActive} Active {formBlock.totalActive === 1 ? 'Simulation' : 'Simulations'}
                        </span>
                      </div>

                      {/* Topics Grid */}
                      <div className="space-y-8 pl-1 sm:pl-3">
                        {formBlock.topics.map((topic) => (
                          <div key={topic.id} className="space-y-4">
                            <div className="flex items-end justify-between pb-2 border-b border-slate-100">
                              <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  Topic {topic.id}
                                </span>
                                <h4 className="text-base sm:text-lg font-bold text-slate-800">
                                  {topic.title}
                                </h4>
                              </div>
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                {topic.items.length} {topic.items.length === 1 ? 'Simulation' : 'Simulations'}
                              </span>
                            </div>

                            {topic.items.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {topic.items.map((sim) => (
                                  <SimulationCard
                                    key={sim.key || sim.id}
                                    simulation={sim}
                                    onLaunch={setActiveSimulation}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs sm:text-sm">
                                <p className="font-medium text-slate-600 mb-0.5">
                                  Simulations in development for {topic.title}.
                                </p>
                                <p className="text-slate-400 text-xs">
                                  Check back soon as new virtual laboratories are added.
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Fullscreen Simulation Overlay Portal */}
      <FullscreenSimulationModal
        simulation={activeSimulation}
        isOpen={Boolean(activeSimulation)}
        onClose={() => setActiveSimulation(null)}
      />
    </div>
  );
}
