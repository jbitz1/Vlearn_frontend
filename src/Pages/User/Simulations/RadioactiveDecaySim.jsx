import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, RotateCcw, Activity, Info, Zap, CheckCircle2, ShieldAlert, Pause, Sparkles, Clock, RefreshCw } from 'lucide-react';

const REAL_WORLD_EXAMPLES = [
  {
    title: "Carbon-14 Dating",
    tag: "Archaeology",
    description: "Living organisms absorb C-14. When they die, C-14 decays with a half-life of 5,730 years, allowing scientists to date ancient organic artifacts."
  },
  {
    title: "Medical Radioisotopes",
    tag: "Healthcare",
    description: "Technetium-99m has a short half-life of 6 hours. It emits gamma rays for organ imaging and rapidly decays away to minimize patient radiation dose."
  },
  {
    title: "Smoke Detectors",
    tag: "Safety",
    description: "Americium-241 has a long half-life of 432 years. It emits alpha particles that ionize air to detect smoke without needing frequent replacement."
  },
  {
    title: "Nuclear Waste Management",
    tag: "Environment",
    description: "Plutonium-239 has a half-life of 24,100 years. Spent fuel must be safely stored for thousands of years until activity falls to safe levels."
  }
];

export default function RadioactiveDecaySim({ onTelemetry }) {
  // Controls
  const [initialCount, setInitialCount] = useState(200);
  const [isRunning, setIsRunning] = useState(false);
  const [isPausedForHalfLife, setIsPausedForHalfLife] = useState(false);

  // Simulation State
  const [atoms, setAtoms] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useState([]);
  const [halfLifeReached, setHalfLifeReached] = useState(false);
  const [halfLifeTime, setHalfLifeTime] = useState(null);

  // Checkpoints
  const [discoveries, setDiscoveries] = useState({
    firstDecay: false,
    halfLife: false,
    randomness: false,
    completed: false
  });
  const [exampleIndex, setExampleIndex] = useState(0);

  const halfLifeTarget = Math.floor(initialCount / 2);
  const activeCount = useMemo(() => atoms.filter(a => !a.decayed).length, [atoms]);
  const decayedCount = initialCount - activeCount;
  const decayPercentage = ((decayedCount / initialCount) * 100).toFixed(1);

  const allCompleted = discoveries.firstDecay && discoveries.halfLife && discoveries.randomness && discoveries.completed;

  // Initialize atoms in grid
  const initializeAtoms = (count) => {
    const newAtoms = [];
    const cols = Math.ceil(Math.sqrt(count * 1.3));
    const rows = Math.ceil(count / cols);
    const spacingX = 260 / cols;
    const spacingY = 220 / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = (Math.random() - 0.5) * 6;
      const jitterY = (Math.random() - 0.5) * 6;
      newAtoms.push({
        id: i,
        x: 20 + col * spacingX + jitterX,
        y: 20 + row * spacingY + jitterY,
        decayed: false,
        decayTime: null,
        rate: 0.045 + Math.random() * 0.01
      });
    }
    setAtoms(newAtoms);
    setElapsedTime(0);
    setHistory([{ time: 0, active: count }]);
    setHalfLifeReached(false);
    setHalfLifeTime(null);
    setIsPausedForHalfLife(false);
  };

  useEffect(() => {
    initializeAtoms(initialCount);
  }, [initialCount]);

  // Rotate real-world cards
  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex(prev => (prev + 1) % REAL_WORLD_EXAMPLES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Telemetry trigger
  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'chem_radioactive_decay_half_life',
        message: 'Student mastered population decay kinetics and half-life concepts.'
      });
    }
  }, [allCompleted, onTelemetry]);

  // Simulation step loop
  useEffect(() => {
    if (!isRunning || isPausedForHalfLife) return;

    const interval = setInterval(() => {
      setElapsedTime(prevTime => {
        const nextTime = Number((prevTime + 0.5).toFixed(1));
        
        setAtoms(prevAtoms => {
          let newlyDecayedCount = 0;
          const nextAtoms = prevAtoms.map(atom => {
            if (atom.decayed) return atom;
            if (Math.random() < atom.rate) {
              newlyDecayedCount++;
              return { ...atom, decayed: true, decayTime: nextTime };
            }
            return atom;
          });

          const currentActive = nextAtoms.filter(a => !a.decayed).length;

          // Update Checkpoint: First decay
          if (newlyDecayedCount > 0) {
            setDiscoveries(d => ({ ...d, firstDecay: true }));
          }

          // Checkpoint: Randomness observed
          if (nextTime > 3.0) {
            setDiscoveries(d => ({ ...d, randomness: true }));
          }

          // Half-Life Detection & Brief Highlight Pause
          if (!halfLifeReached && currentActive <= halfLifeTarget) {
            setHalfLifeReached(true);
            setHalfLifeTime(nextTime);
            setDiscoveries(d => ({ ...d, halfLife: true }));
            setIsPausedForHalfLife(true);
            setTimeout(() => {
              setIsPausedForHalfLife(false);
            }, 2500); // 2.5s highlight pause
          }

          // End condition
          if (currentActive === 0 || nextTime >= 30) {
            setIsRunning(false);
            setDiscoveries(d => ({ ...d, completed: true }));
          }

          setHistory(h => [...h, { time: nextTime, active: currentActive }]);
          return nextAtoms;
        });

        return nextTime;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isRunning, isPausedForHalfLife, halfLifeReached, halfLifeTarget]);

  const handleRun = () => {
    if (activeCount === 0) {
      initializeAtoms(initialCount);
    }
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    initializeAtoms(initialCount);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* 1. MISSION BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚛️</span>
              <h1 className="text-2xl font-bold tracking-tight">Radioactive Decay & Half-Life</h1>
            </div>
            <p className="text-emerald-200 mt-2 max-w-2xl text-sm leading-relaxed">
              Observe a radioactive sample over time. Can you discover why scientists can predict the decay of a population but never the decay of one individual atom?
            </p>
          </div>

          {/* Mastered Badge */}
          {allCompleted && (
            <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-4 py-2 rounded-2xl flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">Radioactive Decay Mastered!</span>
            </div>
          )}
        </div>

        {/* Checkpoint Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-emerald-700/50">
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${discoveries.firstDecay ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>1. First Decay</span>
          </div>
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${discoveries.halfLife ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Half-Life Reached</span>
          </div>
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${discoveries.randomness ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Observe Randomness</span>
          </div>
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${discoveries.completed ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>4. Complete Run</span>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/2 space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
            <label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Initial Sample Size:
            </label>
            <span className="bg-emerald-50 text-emerald-700 font-mono px-3 py-1 rounded-lg border border-emerald-200">
              {initialCount} atoms
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            disabled={isRunning}
            value={initialCount}
            onChange={(e) => setInitialCount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>50</span>
            <span>250</span>
            <span>500</span>
            <span>1000</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isRunning ? (
            <button
              onClick={handleRun}
              className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Run Simulation
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="flex-1 md:flex-none px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Pause className="w-5 h-5 fill-current" />
              Pause
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* 3. MAIN VISUALIZATION & POPULATION GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sample Container SVG */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden min-h-[420px]">
          <div className="flex justify-between items-center z-10 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Radioactive Sample Core
            </span>
            <span className="text-xs font-mono text-slate-400">
              Active: {activeCount} / {initialCount}
            </span>
          </div>

          {/* Half-Life Highlight Overlay */}
          {isPausedForHalfLife && (
            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center animate-fade-in p-6 text-center">
              <div className="bg-emerald-500 text-slate-950 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider mb-2 animate-bounce">
                Milestone Reached!
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">THIS IS ONE HALF-LIFE!</h2>
              <p className="text-emerald-200 text-sm max-w-md">
                Exactly 50% of the radioactive parent atoms have decayed in <span className="font-bold text-white">{halfLifeTime}s</span>.
              </p>
            </div>
          )}

          {/* Atomic Canvas SVG */}
          <div className="w-full flex-1 flex items-center justify-center relative my-2">
            <svg viewBox="0 0 300 240" className="w-full h-full max-h-[340px]">
              {/* Containment Vessel Wall */}
              <rect x="5" y="5" width="290" height="230" rx="16" fill="#0F172A" stroke="#334155" strokeWidth="3" strokeDasharray="6 4" />
              
              {/* Atoms */}
              {atoms.map((atom) => (
                <circle
                  key={atom.id}
                  cx={atom.x}
                  cy={atom.y}
                  r={initialCount > 300 ? "3" : "4.5"}
                  fill={atom.decayed ? "#475569" : "#10B981"}
                  stroke={atom.decayed ? "#334155" : "#34D399"}
                  strokeWidth="1"
                  className="transition-all duration-300"
                  style={{
                    filter: atom.decayed ? 'none' : 'drop-shadow(0 0 4px #10B981)'
                  }}
                />
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 stroke-emerald-300 shadow-[0_0_8px_#10B981]" />
                Radioactive Parent Atom
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-600" />
                Decayed Stable Daughter Atom
              </span>
            </div>
          </div>
        </div>

        {/* Population Decay Graph */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[420px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Population Decay Curve
            </h3>
            <span className="text-xs font-mono text-slate-500">N(t) vs Time</span>
          </div>

          {/* SVG Decay Plot */}
          <div className="w-full flex-1 relative flex items-center justify-center my-2">
            <svg viewBox="0 0 300 200" className="w-full h-full max-h-[260px]">
              {/* Axes */}
              <line x1="35" y1="20" x2="35" y2="170" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="35" y1="170" x2="285" y2="170" stroke="#CBD5E1" strokeWidth="2" />

              {/* 50% Half-Life Dashed Line */}
              <line x1="35" y1="95" x2="285" y2="95" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="42" y="90" fill="#10B981" fontSize="10" fontWeight="bold">50% Half-Life Line</text>

              {/* Plot Curve */}
              {history.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                  points={history.map(h => {
                    const x = 35 + (h.time / 30) * 250;
                    const y = 170 - (h.active / initialCount) * 150;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              )}

              {/* Half-Life Point Highlight */}
              {halfLifeTime && (
                <g>
                  <circle
                    cx={35 + (halfLifeTime / 30) * 250}
                    cy={95}
                    r="5"
                    fill="#10B981"
                    className="animate-ping"
                  />
                  <circle
                    cx={35 + (halfLifeTime / 30) * 250}
                    cy={95}
                    r="5"
                    fill="#047857"
                  />
                </g>
              )}

              {/* Labels */}
              <text x="10" y="25" fill="#64748B" fontSize="10">N0</text>
              <text x="10" y="174" fill="#64748B" fontSize="10">0</text>
              <text x="260" y="190" fill="#64748B" fontSize="10">Time (s)</text>
            </svg>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
            <span>Half-Life Time (t½):</span>
            <span className="font-mono font-bold text-emerald-700">
              {halfLifeTime ? `${halfLifeTime} seconds` : 'Calculating...'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. OBSERVATION PANEL */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Remaining Atoms</span>
          <span className="text-2xl font-bold font-mono text-emerald-600">{activeCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Decayed Atoms</span>
          <span className="text-2xl font-bold font-mono text-slate-600">{decayedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Elapsed Time</span>
          <span className="text-2xl font-bold font-mono text-blue-600">{elapsedTime}s</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Half-Life Status</span>
          <span className={`text-sm font-bold block mt-1 ${halfLifeReached ? 'text-emerald-600' : 'text-slate-400'}`}>
            {halfLifeReached ? `Reached (${halfLifeTime}s)` : 'Pending...'}
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Decay %</span>
          <span className="text-2xl font-bold font-mono text-purple-600">{decayPercentage}%</span>
        </div>
      </div>

      {/* 5. SCIENTIFIC EXPLANATION & REAL WORLD CONNECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Dynamic Explanation */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" />
              Scientific Explanation
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {halfLifeReached ? (
                <>
                  <strong className="text-slate-800">Population Predictability: </strong>
                  Although individual atoms decay at completely random times, the total number of decaying atoms per second is directly proportional to the remaining population. This produces a smooth, predictable exponential decay curve for large samples.
                </>
              ) : (
                <>
                  <strong className="text-slate-800">Individual Randomness: </strong>
                  Every radioactive nucleus has a constant probability of decay per unit time. We cannot predict exactly when any specific atom will decay, but we can accurately calculate when half of the population will remain.
                </>
              )}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 italic">
            "Half-life does not tell us when ONE atom decays; it tells us when HALF the population remains."
          </div>
        </div>

        {/* Real World Rotating Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Real-World Application</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                {REAL_WORLD_EXAMPLES[exampleIndex].tag}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mb-2">
              {REAL_WORLD_EXAMPLES[exampleIndex].title}
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              {REAL_WORLD_EXAMPLES[exampleIndex].description}
            </p>
          </div>

          <div className="flex justify-center gap-1.5 mt-4">
            {REAL_WORLD_EXAMPLES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === exampleIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-slate-700'}`}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
