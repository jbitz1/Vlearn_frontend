import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router';
import UserContext from '../../Context/UserContext';
import SimulationCard from '../../Components/User/SimulationCard';
import SimulationViewerContainer from './Simulations/SimulationViewerContainer';
import { ArrowLeft, Beaker, Zap, Dna, Calculator, Sparkles, SlidersHorizontal } from 'lucide-react';



const SUBJECT_CONFIG = {
  ALL: { name: 'All Subjects', icon: SlidersHorizontal, color: 'text-gray-700 bg-gray-100' },
  CHEMISTRY: { name: 'Chemistry', icon: Beaker, color: 'text-cyan-600 bg-cyan-50' },
  PHYSICS: { name: 'Physics', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  BIOLOGY: { name: 'Biology', icon: Dna, color: 'text-emerald-600 bg-emerald-50' },
  MATHEMATICS: { name: 'Mathematics', icon: Calculator, color: 'text-purple-600 bg-purple-50' }
};

const CHEMISTRY_TOPICS = [
  { id: 1, title: 'Acids, Bases and Salts' },
  { id: 2, title: 'Energy Changes in Chemical and Physical Processes' },
  { id: 3, title: 'Reaction Rates and Reversible Reactions' },
  { id: 4, title: 'Electrochemistry' },
  { id: 5, title: 'Metals' },
  { id: 6, title: 'Organic Chemistry II' },
  { id: 7, title: 'Radioactivity' }
];

export default function Simulations() {
  const { user } = useContext(UserContext);
  const [simulations, setSimulations] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
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
        console.warn('Failed to load simulations:', err);
        setSimulations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getSubjectCount = (subKey) => {
    if (subKey === 'ALL') return simulations.length;
    return simulations.filter((s) => s.subject === subKey).length;
  };

  const getGroupedSimulations = () => {
    const subjects = selectedSubject === 'ALL' ? ['CHEMISTRY', 'PHYSICS', 'BIOLOGY', 'MATHEMATICS'] : [selectedSubject];

    return subjects
      .map((sub) => {
        const items = simulations.filter((s) => s.subject === sub);
        const activeCount = items.filter((s) => s.status === 'ACTIVE').length;
        const upcomingCount = items.filter((s) => s.status !== 'ACTIVE').length;
        
        if (sub === 'CHEMISTRY') {
          const topicGroups = CHEMISTRY_TOPICS.map(topic => {
            const topicItems = items.filter(s => s.topic === topic.title);
            return {
              ...topic,
              items: topicItems
            };
          });
          
          const officialTopicTitles = CHEMISTRY_TOPICS.map(t => t.title);
          const orphanItems = items.filter(s => !officialTopicTitles.includes(s.topic));
          
          return {
            subjectKey: sub,
            info: SUBJECT_CONFIG[sub] || { name: sub, icon: Beaker },
            items,
            activeCount,
            upcomingCount,
            isChemistry: true,
            topicGroups,
            orphanItems
          };
        }

        return {
          subjectKey: sub,
          info: SUBJECT_CONFIG[sub] || { name: sub, icon: Beaker },
          items,
          activeCount,
          upcomingCount,
          isChemistry: false
        };
      })
      .filter((group) => selectedSubject !== 'ALL' || group.items.length > 0 || group.isChemistry);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Simulations</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-200 transition-colors">
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

  // Render mounted simulation player with SimulationViewerContainer wrapper
  if (activeSimulation) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setActiveSimulation(null)}
            className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-custom-orange transition-colors cursor-pointer bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Simulations Catalog
          </button>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-custom-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {activeSimulation.topic || activeSimulation.subject_display || activeSimulation.subject}
            </span>
          </div>
        </div>

        {/* Guided Discovery Wrapper Container */}
        <SimulationViewerContainer
          simulation={activeSimulation}
          onTelemetry={(eventName, payload) => {
            console.log(`[Simulation Telemetry] ${eventName}:`, payload);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Beaker className="w-8 h-8 text-custom-orange" />
            Experiment Simulations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Interactive virtual labs, dynamic models, and parameter-driven STEM simulations.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-blue-50 text-custom-blue px-4 py-2 rounded-2xl border border-blue-100 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-custom-orange" />
          {simulations.length} Active Simulations Ready
        </div>
      </div>

      {/* Horizontal Filter Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {Object.keys(SUBJECT_CONFIG).map((subKey) => {
          const conf = SUBJECT_CONFIG[subKey];
          const Icon = conf.icon;
          const count = getSubjectCount(subKey);
          const isSelected = selectedSubject === subKey;

          return (
            <button
              key={subKey}
              onClick={() => setSelectedSubject(subKey)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-custom-orange text-white shadow-md border-custom-orange'
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

            {/* Categorized Grid Views */}
      {simulations.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 max-w-2xl mx-auto mt-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
            <Beaker className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No simulations available</h3>
          <p className="text-slate-500 text-sm">Check back later for new interactive experiments and simulations.</p>
        </div>
      ) : (
        <div className="space-y-12">
        {getGroupedSimulations().map((group) => {
          const Icon = group.info.icon;
          return (
            <section key={group.subjectKey} className="space-y-8">
              {/* Category Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                  <span className={`p-2 rounded-xl ${group.info.color}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  {group.info.name}
                  <span className="text-sm font-normal text-gray-500">
                    — {group.activeCount} Active
                  </span>
                </h2>
              </div>

              {group.isChemistry ? (
                <div className="space-y-10 pl-2">
                  {group.topicGroups.map((topic) => (
                    <div key={topic.id} className="space-y-4">
                      <div className="flex items-end justify-between pb-2 border-b border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topic {topic.id}</span>
                          <h3 className="text-lg font-bold text-slate-800">{topic.title}</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          {topic.items.length} {topic.items.length === 1 ? 'Simulation' : 'Simulations'}
                        </span>
                      </div>
                      
                      {topic.items.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {topic.items.map((sim) => (
                            <SimulationCard key={sim.key || sim.id} simulation={sim} onLaunch={setActiveSimulation} />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center text-slate-500 text-sm">
                          <p className="font-medium text-slate-600 mb-1">Simulations coming soon.</p>
                          <p className="text-xs">These interactive activities will be available in a future update.</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {group.orphanItems.length > 0 && (
                    <div className="space-y-4 pt-6">
                      <div className="flex items-end justify-between pb-2 border-b border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Other Topics</span>
                          <h3 className="text-lg font-bold text-slate-800">Additional Chemistry Simulations</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {group.orphanItems.map((sim) => (
                          <SimulationCard key={sim.key || sim.id} simulation={sim} onLaunch={setActiveSimulation} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                group.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.items.map((sim) => (
                      <SimulationCard key={sim.key || sim.id} simulation={sim} onLaunch={setActiveSimulation} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-3xl p-8 text-center text-gray-500 text-sm">
                    No simulations currently registered for {group.info.name}.
                  </div>
                )
              )}
            </section>
          );
        })}
      </div>
      )}
    </div>
  );
}
