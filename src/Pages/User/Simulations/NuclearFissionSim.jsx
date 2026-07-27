import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, RotateCcw, Activity, Info, Zap, CheckCircle2, ShieldAlert, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

const DENSITY_CONFIG = {
  low: { label: 'Low Density', count: 12, spacing: 60, name: 'Low' },
  medium: { label: 'Medium Density', count: 24, spacing: 42, name: 'Medium' },
  high: { label: 'High Density', count: 40, spacing: 30, name: 'High' }
};

const ROD_CONFIG = {
  inserted: { label: 'Fully Inserted', efficiency: 95, absorptionProb: 0.9, heightPercent: 90 },
  half: { label: 'Half Inserted', efficiency: 50, absorptionProb: 0.5, heightPercent: 45 },
  removed: { label: 'Fully Removed', efficiency: 0, absorptionProb: 0.05, heightPercent: 5 }
};

const REAL_WORLD_EXAMPLES = [
  {
    title: "Nuclear Power Generation",
    tag: "Energy",
    description: "Controlled fission of U-235 generates intense thermal energy to produce steam and drive electricity-generating turbines."
  },
  {
    title: "Boron & Cadmium Control Rods",
    tag: "Safety",
    description: "Control rods made of neutron-absorbing elements (boron, cadmium) are inserted to regulate neutron flux and prevent thermal runaway."
  },
  {
    title: "Research Reactors & Isotopes",
    tag: "Medicine",
    description: "Low-power research reactors harvest neutrons from fission to create medical radioisotopes like Molybdenum-99 for diagnostic scans."
  },
  {
    title: "Nuclear Safety Systems",
    tag: "Engineering",
    description: "Emergency shutdown systems (SCRAM) drop all control rods into the reactor core within seconds to halt fission during anomalies."
  }
];

export default function NuclearFissionSim({ onTelemetry }) {
  // Student Controls
  const [density, setDensity] = useState('medium');
  const [rodPosition, setRodPosition] = useState('half');
  const [animStatus, setAnimStatus] = useState('idle'); // 'idle' | 'running' | 'completed'

  // Engine State
  const [nuclei, setNuclei] = useState([]);
  const [neutrons, setNeutrons] = useState([]);
  const [energyMW, setEnergyMW] = useState(0);
  const [reactionStatus, setReactionStatus] = useState('Subcritical'); // 'Subcritical' | 'Controlled Critical' | 'Uncontrolled Runaway'
  
  // Checkpoints
  const [discoveries, setDiscoveries] = useState({
    singleFission: false,
    controlled: false,
    uncontrolled: false,
    diedNaturally: false
  });
  const [exampleIndex, setExampleIndex] = useState(0);

  const densityData = DENSITY_CONFIG[density];
  const rodData = ROD_CONFIG[rodPosition];

  const allCompleted = discoveries.singleFission && discoveries.controlled && discoveries.uncontrolled && discoveries.diedNaturally;

  // Initialize Reactor Core
  const initializeReactor = () => {
    const newNuclei = [];
    const count = densityData.count;
    const cols = Math.ceil(Math.sqrt(count * 1.5));
    const rows = Math.ceil(count / cols);
    const spacingX = 360 / (cols + 1);
    const spacingY = 220 / (rows + 1);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      newNuclei.push({
        id: i,
        x: 30 + (col + 1) * spacingX,
        y: 20 + (row + 1) * spacingY,
        split: false,
        flash: false
      });
    }

    setNuclei(newNuclei);
    setNeutrons([]);
    setEnergyMW(0);
    setReactionStatus('Subcritical');
    setAnimStatus('idle');
  };

  useEffect(() => {
    initializeReactor();
  }, [density]);

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
        simulation: 'chem_nuclear_fission_chain_reaction',
        message: 'Student mastered nuclear chain reactions, control rod mechanics, and reactor safety.'
      });
    }
  }, [allCompleted, onTelemetry]);

  // Trigger initial neutron
  const handleFireNeutron = () => {
    if (animStatus === 'running') return;
    initializeReactor();
    setAnimStatus('running');

    // Launch single trigger neutron from left edge towards center
    setNeutrons([
      { id: 'n-init', x: 10, y: 130, vx: 4.5, vy: 0, active: true }
    ]);
  };

  // Main Fission Loop
  useEffect(() => {
    if (animStatus !== 'running') return;

    const interval = setInterval(() => {
      setNeutrons(prevNeutrons => {
        if (prevNeutrons.length === 0) {
          setAnimStatus('completed');
          // Checkpoint: Reaction died naturally
          setDiscoveries(d => ({ ...d, diedNaturally: true }));
          return [];
        }

        const nextNeutrons = [];
        let newlySplitCount = 0;

        setNuclei(prevNuclei => {
          let updatedNuclei = [...prevNuclei];

          prevNeutrons.forEach(n => {
            if (!n.active) return;

            // Move neutron
            const nx = n.x + n.vx;
            const ny = n.y + n.vy;

            // Check Control Rod Absorption (vertical absorption zones)
            const rodAbsorptionHeight = (220 * rodData.heightPercent) / 100;
            const isNearControlRod = (nx > 120 && nx < 140) || (nx > 240 && nx < 260);
            if (isNearControlRod && ny < rodAbsorptionHeight + 20) {
              if (Math.random() < rodData.absorptionProb) {
                // Absorbed by control rod!
                return;
              }
            }

            // Check Boundary Collisions
            if (nx < 10 || nx > 410 || ny < 10 || ny > 250) {
              return; // escaped core
            }

            // Check collision with intact U-235 nucleus
            let struck = false;
            updatedNuclei = updatedNuclei.map(target => {
              if (target.split || struck) return target;

              const dist = Math.hypot(target.x - nx, target.y - ny);
              if (dist < 16) {
                struck = true;
                newlySplitCount++;
                
                // Spawn 3 secondary neutrons in random outward directions
                for (let k = 0; k < 3; k++) {
                  const angle = (Math.PI * 2 * k) / 3 + (Math.random() - 0.5) * 0.5;
                  const speed = 3.5 + Math.random() * 1.5;
                  nextNeutrons.push({
                    id: `n-${Date.now()}-${Math.random()}`,
                    x: target.x,
                    y: target.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    active: true
                  });
                }

                return { ...target, split: true, flash: true };
              }
              return target;
            });

            if (!struck) {
              nextNeutrons.push({ ...n, x: nx, y: ny });
            }
          });

          return updatedNuclei;
        });

        // Update Energy & Checkpoints
        if (newlySplitCount > 0) {
          setEnergyMW(e => e + newlySplitCount * 200);
          setDiscoveries(d => ({ ...d, singleFission: true }));
        }

        // Determine Reaction State
        const activeCount = nextNeutrons.length;
        if (activeCount > 8) {
          setReactionStatus('Uncontrolled Runaway');
          setDiscoveries(d => ({ ...d, uncontrolled: true }));
        } else if (activeCount >= 2) {
          setReactionStatus('Controlled Critical');
          setDiscoveries(d => ({ ...d, controlled: true }));
        } else if (activeCount === 0) {
          setReactionStatus('Subcritical');
        }

        return nextNeutrons;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [animStatus, rodData]);

  const handleReset = () => {
    initializeReactor();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* 1. MISSION BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">💥</span>
              <h1 className="text-2xl font-bold tracking-tight">Nuclear Fission & Chain Reactions</h1>
            </div>
            <p className="text-rose-200 mt-2 max-w-2xl text-sm leading-relaxed">
              Trigger a nuclear chain reaction. Can you produce energy safely, or will the reaction become uncontrollable?
            </p>
          </div>

          {/* Mastered Badge */}
          {allCompleted && (
            <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-4 py-2 rounded-2xl flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">Nuclear Fission Mastered!</span>
            </div>
          )}
        </div>

        {/* Checkpoint Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-rose-800/50">
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${discoveries.singleFission ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Single Fission</span>
          </div>
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${discoveries.controlled ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Controlled Reaction</span>
          </div>
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${discoveries.uncontrolled ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Uncontrolled Runaway</span>
          </div>
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${discoveries.diedNaturally ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>4. Subcritical Decay</span>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Uranium Density Selector */}
        <div className="w-full md:w-1/3 space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Uranium Fuel Density</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(DENSITY_CONFIG).map(k => (
              <button
                key={k}
                disabled={animStatus === 'running'}
                onClick={() => setDensity(k)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all disabled:opacity-50 ${density === k ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {DENSITY_CONFIG[k].name}
              </button>
            ))}
          </div>
        </div>

        {/* Control Rod Position Selector */}
        <div className="w-full md:w-1/3 space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Control Rod Position</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(ROD_CONFIG).map(k => (
              <button
                key={k}
                disabled={animStatus === 'running'}
                onClick={() => setRodPosition(k)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all disabled:opacity-50 ${rodPosition === k ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleFireNeutron}
            disabled={animStatus === 'running'}
            className="flex-1 md:flex-none px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            Fire Initial Neutron
          </button>

          <button
            onClick={handleReset}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* 3. MAIN REACTOR CORE SVG VISUALIZATION */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
        
        {/* Uncontrolled Warning Alert Banner */}
        {reactionStatus === 'Uncontrolled Runaway' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-600 text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            Uncontrolled Chain Reaction!
          </div>
        )}

        {/* Controlled Status Banner */}
        {reactionStatus === 'Controlled Critical' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-600 text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg">
            <ShieldCheck className="w-4 h-4" />
            Controlled Fission Active
          </div>
        )}

        <div className="flex justify-between items-center z-10 mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${reactionStatus === 'Uncontrolled Runaway' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
            Nuclear Reactor Core (U-235 Fuel Grid)
          </span>
          <span className="text-xs font-mono text-slate-400">
            Control Rod Efficiency: {rodData.efficiency}%
          </span>
        </div>

        {/* Canvas SVG */}
        <div className="w-full flex-1 flex items-center justify-center relative my-2">
          <svg viewBox="0 0 420 260" className="w-full h-full max-h-[380px]">
            {/* Reactor Containment Vessel */}
            <rect x="5" y="5" width="410" height="250" rx="16" fill="#090D16" stroke="#1E293B" strokeWidth="3" />
            
            {/* Control Rods (Vertical Absorption Bars) */}
            <g>
              {/* Rod 1 */}
              <rect x="125" y="5" width="16" height={(220 * rodData.heightPercent) / 100} fill="#3B82F6" opacity="0.85" rx="3" stroke="#60A5FA" strokeWidth="1" />
              {/* Rod 2 */}
              <rect x="245" y="5" width="16" height={(220 * rodData.heightPercent) / 100} fill="#3B82F6" opacity="0.85" rx="3" stroke="#60A5FA" strokeWidth="1" />
            </g>

            {/* Uranium-235 Nuclei */}
            {nuclei.map(n => (
              <g key={n.id}>
                {!n.split ? (
                  // Intact U-235 Nucleus
                  <g>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="9"
                      fill="#F43F5E"
                      stroke="#FB7185"
                      strokeWidth="2"
                      style={{ filter: 'drop-shadow(0 0 6px #F43F5E)' }}
                    />
                    <text x={n.x} y={n.y + 3} fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">
                      U
                    </text>
                  </g>
                ) : (
                  // Split Fission Fragments
                  <g>
                    {/* Energy Flash Ring */}
                    <circle cx={n.x} cy={n.y} r="18" fill="none" stroke="#FDE047" strokeWidth="2" opacity="0.6" className="animate-ping" />
                    {/* Fragment 1 (Ba-141) */}
                    <circle cx={n.x - 7} cy={n.y - 6} r="5" fill="#A855F7" />
                    {/* Fragment 2 (Kr-92) */}
                    <circle cx={n.x + 7} cy={n.y + 6} r="4" fill="#3B82F6" />
                  </g>
                )}
              </g>
            ))}

            {/* Active Neutrons */}
            {neutrons.map(n => (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r="3"
                fill="#FACC15"
                stroke="#FEF08A"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 0 5px #FACC15)' }}
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E]" />
              Uranium-235 Nucleus
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_6px_#FACC15]" />
              Free Neutron (n)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500" />
              Neutron-Absorbing Control Rod
            </span>
          </div>
        </div>
      </div>

      {/* 4. OBSERVATION PANEL */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Energy Released</span>
          <span className="text-2xl font-bold font-mono text-rose-600">{energyMW} MW</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Active Neutrons</span>
          <span className="text-2xl font-bold font-mono text-yellow-600">{neutrons.length}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Control Rod Position</span>
          <span className="text-sm font-bold text-blue-600 block mt-1">{rodData.label}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Control Rod Efficiency</span>
          <span className="text-2xl font-bold font-mono text-emerald-600">{rodData.efficiency}%</span>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Reactor State</span>
          <span className={`text-sm font-bold block mt-1 ${reactionStatus === 'Uncontrolled Runaway' ? 'text-rose-600' : reactionStatus === 'Controlled Critical' ? 'text-emerald-600' : 'text-slate-400'}`}>
            {reactionStatus}
          </span>
        </div>
      </div>

      {/* 5. SCIENTIFIC EXPLANATION & REAL WORLD CONNECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Dynamic Explanation */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-rose-600" />
              Scientific Explanation
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {reactionStatus === 'Uncontrolled Runaway' ? (
                <>
                  <strong className="text-rose-700">Uncontrolled Chain Reaction: </strong>
                  When control rods are removed, secondary neutrons from each fission event freely strike adjacent U-235 nuclei. The fission rate multiplies exponentially, releasing massive thermal energy instantaneously.
                </>
              ) : reactionStatus === 'Controlled Critical' ? (
                <>
                  <strong className="text-emerald-700">Controlled Fission: </strong>
                  Control rods absorb excess neutrons so that on average, exactly one neutron per fission goes on to split another nucleus. This maintains a steady, safe rate of energy production.
                </>
              ) : (
                <>
                  <strong className="text-slate-800">Subcritical State: </strong>
                  Either uranium density is too low or control rods absorb too many neutrons, causing the chain reaction to fizzle out naturally as available neutrons drop to zero.
                </>
              )}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 italic">
            "One neutron triggers one fission, releasing 3 neutrons and massive energy. Control rods regulate neutron multiplication."
          </div>
        </div>

        {/* Real World Rotating Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-rose-950 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Real-World Application</span>
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-400/30">
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
                className={`h-1.5 rounded-full transition-all duration-300 ${i === exampleIndex ? 'w-6 bg-rose-400' : 'w-1.5 bg-slate-700'}`}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
