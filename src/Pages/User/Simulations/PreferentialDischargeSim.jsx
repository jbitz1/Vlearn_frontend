import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle2, RotateCcw, Play, Activity, Info, AlertTriangle, ShieldAlert } from 'lucide-react';

const ELECTROLYTE_DATA = {
  dilute_nacl: {
    id: "dilute_nacl",
    name: "Dilute NaCl",
    type: "Aqueous",
    cations: ["Na⁺", "H⁺"],
    anions: ["Cl⁻", "OH⁻"],
    cathodeWinner: "H⁺",
    cathodeLoser: "Na⁺",
    anodeWinner: "OH⁻",
    anodeLoser: "Cl⁻",
    cathodeReason: "Hydrogen is discharged more readily than sodium ions.",
    anodeReason: "OH⁻ is lower in the electrochemical series than Cl⁻ and is discharged.",
    products: { cathode: "Hydrogen Gas (H₂)", anode: "Oxygen Gas (O₂)", remaining: "Na⁺, Cl⁻ (NaCl becomes concentrated)" }
  },
  concentrated_nacl: {
    id: "concentrated_nacl",
    name: "Concentrated NaCl (Brine)",
    type: "Aqueous",
    cations: ["Na⁺", "H⁺"],
    anions: ["Cl⁻", "OH⁻"],
    cathodeWinner: "H⁺",
    cathodeLoser: "Na⁺",
    anodeWinner: "Cl⁻",
    anodeLoser: "OH⁻",
    cathodeReason: "Hydrogen is discharged more readily than sodium ions.",
    anodeReason: "Although OH⁻ is lower in the series, Cl⁻ is discharged due to its much higher concentration.",
    products: { cathode: "Hydrogen Gas (H₂)", anode: "Chlorine Gas (Cl₂)", remaining: "Na⁺, OH⁻ (NaOH forms)" }
  },
  cuso4_carbon: {
    id: "cuso4_carbon",
    name: "CuSO₄",
    type: "Aqueous (Inert Carbon Electrodes)",
    cations: ["Cu²⁺", "H⁺"],
    anions: ["SO₄²⁻", "OH⁻"],
    cathodeWinner: "Cu²⁺",
    cathodeLoser: "H⁺",
    anodeWinner: "OH⁻",
    anodeLoser: "SO₄²⁻",
    cathodeReason: "Copper is lower in the electrochemical series than Hydrogen.",
    anodeReason: "OH⁻ is much lower in the electrochemical series than SO₄²⁻.",
    products: { cathode: "Copper Metal (Cu)", anode: "Oxygen Gas (O₂)", remaining: "H⁺, SO₄²⁻ (H₂SO₄ forms, solution turns colorless)" }
  },
  cuso4_copper: {
    id: "cuso4_copper",
    name: "CuSO₄",
    type: "Aqueous (Active Copper Electrodes)",
    cations: ["Cu²⁺", "H⁺"],
    anions: ["SO₄²⁻", "OH⁻"],
    cathodeWinner: "Cu²⁺",
    cathodeLoser: "H⁺",
    anodeWinner: "Cu (Electrode)",
    anodeLoser: "OH⁻, SO₄²⁻",
    cathodeReason: "Copper is lower in the electrochemical series than Hydrogen.",
    anodeReason: "The active copper anode dissolves (Cu → Cu²⁺ + 2e⁻) because it requires less energy than discharging any anion.",
    products: { cathode: "Copper deposits", anode: "Anode dissolves", remaining: "Cu²⁺, SO₄²⁻ (Concentration remains constant)" }
  },
  dilute_h2so4: {
    id: "dilute_h2so4",
    name: "Dilute H₂SO₄",
    type: "Aqueous",
    cations: ["H⁺", "H⁺"], // Duplicated for visual symmetry
    anions: ["SO₄²⁻", "OH⁻"],
    cathodeWinner: "H⁺",
    cathodeLoser: "H⁺", // Visual trick: both are H+
    anodeWinner: "OH⁻",
    anodeLoser: "SO₄²⁻",
    cathodeReason: "Only Hydrogen ions are present at the cathode.",
    anodeReason: "OH⁻ is much lower in the electrochemical series than SO₄²⁻.",
    products: { cathode: "Hydrogen Gas (H₂)", anode: "Oxygen Gas (O₂)", remaining: "H⁺, SO₄²⁻ (H₂SO₄ becomes more concentrated)" }
  }
};

const PHASES = {
  IDLE: 'idle',
  RACING: 'racing',
  COMPETING: 'competing',
  RESULT: 'result'
};

export default function PreferentialDischargeSim({ config = {}, onTelemetry }) {
  const [selectedBaseId, setSelectedBaseId] = useState('dilute_nacl');
  const [electrodeType, setElectrodeType] = useState('carbon'); // 'carbon' | 'copper'
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [progress, setProgress] = useState(0);

  const [explored, setExplored] = useState(new Set());
  const [mastered, setMastered] = useState(false);

  const animationRef = useRef(null);

  // Compute actual ID based on base and electrode
  const selectedId = selectedBaseId === 'cuso4' 
    ? (electrodeType === 'carbon' ? 'cuso4_carbon' : 'cuso4_copper')
    : selectedBaseId;

  const currentData = ELECTROLYTE_DATA[selectedId];

  // Master Check
  useEffect(() => {
    if (explored.size >= 5 && !mastered && phase === PHASES.RESULT) {
      setMastered(true);
      if (typeof onTelemetry === 'function') {
        onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
          simulation: 'chem_preferential_discharge',
          message: "Learner explored all combinations including concentration and active electrode effects."
        });
      }
    }
  }, [explored, mastered, phase, onTelemetry]);

  // Handlers
  const handleSelectBase = (e) => {
    setSelectedBaseId(e.target.value);
    setPhase(PHASES.IDLE);
    setProgress(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const handleToggleElectrode = (type) => {
    setElectrodeType(type);
    setPhase(PHASES.IDLE);
    setProgress(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const handleStart = () => {
    if (phase !== PHASES.IDLE) return;
    setPhase(PHASES.RACING);
    
    // Add to explored set
    setExplored(prev => new Set([...prev, selectedId]));

    const duration = 4000; // 4 seconds total
    const startTime = performance.now();

    const animate = (time) => {
      let p = (time - startTime) / duration;
      if (p > 1) p = 1;

      setProgress(p);

      if (p < 0.4) {
        setPhase(PHASES.RACING);
      } else if (p < 0.8) {
        setPhase(PHASES.COMPETING);
      } else {
        setPhase(PHASES.RESULT);
      }

      if (p < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleReset = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setPhase(PHASES.IDLE);
    setProgress(0);
  };

  // SVG Positions
  const isActiveAnode = currentData.anodeWinner === 'Cu (Electrode)';
  const anodeLoserOpacity = phase === PHASES.COMPETING ? 1 - ((progress - 0.4) / 0.4) : (phase === PHASES.RESULT ? 0 : 1);
  const cathodeLoserOpacity = anodeLoserOpacity; // Same timing

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 bg-slate-50 rounded-3xl font-sans" role="region" aria-label="Preferential Discharge Simulation">
      
      {/* MISSION BANNER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
          <Target className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            Mission
            {mastered && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-extrabold">Mastered</span>}
          </h2>
          <p className="text-slate-600 mt-1 font-medium">
            Choose an electrolyte. Watch the ions compete at the electrodes. Can you predict which ions will be discharged first and why?
          </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1 w-full flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Electrolyte Selection</label>
            <select
              value={selectedBaseId}
              onChange={handleSelectBase}
              disabled={phase !== PHASES.IDLE}
              className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold px-4 py-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none disabled:opacity-50"
            >
              <option value="dilute_nacl">Dilute NaCl</option>
              <option value="concentrated_nacl">Concentrated NaCl (Brine)</option>
              <option value="cuso4">CuSO₄</option>
              <option value="dilute_h2so4">Dilute H₂SO₄</option>
            </select>
          </div>

          {/* Secondary Toggle for CuSO4 */}
          {selectedBaseId === 'cuso4' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Electrode Material</label>
              <div className="flex bg-slate-100 p-1 rounded-xl w-full">
                <button
                  disabled={phase !== PHASES.IDLE}
                  onClick={() => handleToggleElectrode('carbon')}
                  className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-all disabled:opacity-50 ${electrodeType === 'carbon' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Inert Carbon
                </button>
                <button
                  disabled={phase !== PHASES.IDLE}
                  onClick={() => handleToggleElectrode('copper')}
                  className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-all disabled:opacity-50 ${electrodeType === 'copper' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Active Copper
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full md:w-auto h-full items-end mt-2 md:mt-0">
          <button
            onClick={handleStart}
            disabled={phase !== PHASES.IDLE}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex-1 md:flex-none shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" /> Start Electrolysis
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-3 rounded-xl font-bold transition-all flex-1 md:flex-none shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* STAGE */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center justify-end min-h-[400px]">
            
            {/* Header / Circuit */}
            <div className="absolute top-0 w-full flex flex-col items-center pt-6">
              <div className="w-48 h-2 bg-slate-800 rounded-full relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded shadow-sm border border-yellow-500 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> DC Supply
                </div>
              </div>
              {/* Wires */}
              <div className="w-48 flex justify-between">
                <div className="w-1 h-12 bg-slate-800"></div>
                <div className="w-1 h-12 bg-slate-800"></div>
              </div>
            </div>

            {/* Tank */}
            <div className="w-full max-w-md h-64 border-4 border-b-8 border-slate-200 rounded-b-3xl relative overflow-visible bg-blue-50/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-100/40 rounded-b-xl"></div>
              <div className="absolute bottom-2 left-0 w-full text-center text-blue-900/40 font-bold uppercase tracking-widest text-xl pointer-events-none">
                {currentData.name}
              </div>

              {/* Electrodes */}
              {/* Cathode (-) Left */}
              <div className="absolute left-10 top-0 bottom-4 w-12 flex flex-col items-center">
                <div className={`w-full h-full border-2 bg-slate-700 border-slate-800 shadow-lg rounded-b flex items-center justify-center relative ${phase === PHASES.COMPETING || phase === PHASES.RESULT ? 'shadow-[0_0_20px_rgba(59,130,246,0.6)]' : ''}`}>
                  {phase === PHASES.RESULT && (
                    <div className="absolute -bottom-8 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-30">
                      {currentData.products.cathode}
                    </div>
                  )}
                </div>
                <div className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded-full mt-2 absolute -bottom-6">Cathode (-)</div>
              </div>

              {/* Anode (+) Right */}
              <div className="absolute right-10 top-0 bottom-4 w-12 flex flex-col items-center">
                <div className={`w-full h-full border-2 rounded-b flex items-center justify-center relative transition-all duration-1000 ${
                  isActiveAnode ? 'bg-orange-400 border-orange-600' : 'bg-slate-700 border-slate-800'
                } ${phase === PHASES.COMPETING || phase === PHASES.RESULT ? (isActiveAnode ? 'shadow-[0_0_20px_rgba(249,115,22,0.6)] opacity-70' : 'shadow-[0_0_20px_rgba(239,68,68,0.6)]') : ''}`}>
                  
                  {isActiveAnode && phase === PHASES.RESULT && (
                    <div className="absolute inset-0 animate-pulse bg-white/30 rounded-b"></div>
                  )}

                  {phase === PHASES.RESULT && (
                    <div className="absolute -bottom-8 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-30">
                      {currentData.products.anode}
                    </div>
                  )}
                </div>
                <div className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded-full mt-2 absolute -bottom-6">Anode (+)</div>
              </div>

              {/* SVG Ion Engine */}
              <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
                <defs>
                  <radialGradient id="winnerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>
                  </radialGradient>
                </defs>

                {/* Cathode Ions (Cations move Left) */}
                {/* Winner */}
                <g transform={`translate(${
                  phase === PHASES.IDLE ? 180 :
                  phase === PHASES.RACING ? 180 - (progress / 0.4) * 110 :
                  phase === PHASES.COMPETING ? 70 : 70
                }, ${
                  phase === PHASES.IDLE ? 160 : 
                  phase === PHASES.RACING ? 160 - (progress / 0.4) * 40 :
                  phase === PHASES.COMPETING ? 120 : 120
                })`}>
                  {(phase === PHASES.COMPETING || phase === PHASES.RESULT) && (
                    <circle cx="0" cy="0" r="25" fill="url(#winnerGlow)" className="animate-pulse" />
                  )}
                  {phase !== PHASES.RESULT && (
                    <g>
                      <circle cx="0" cy="0" r="16" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
                      <text x="0" y="4" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">{currentData.cathodeWinner}</text>
                    </g>
                  )}
                </g>

                {/* Loser */}
                <g transform={`translate(${
                  phase === PHASES.IDLE ? 180 :
                  phase === PHASES.RACING ? 180 - (progress / 0.4) * 80 :
                  phase === PHASES.COMPETING ? 100 : 100
                }, ${
                  phase === PHASES.IDLE ? 80 : 
                  phase === PHASES.RACING ? 80 + (progress / 0.4) * 20 :
                  phase === PHASES.COMPETING ? 100 : 100
                })`} opacity={cathodeLoserOpacity}>
                  <circle cx="0" cy="0" r="16" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
                  <text x="0" y="4" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">{currentData.cathodeLoser}</text>
                </g>

                {/* Anode Ions (Anions move Right) */}
                {/* Winner (Only if not active anode) */}
                {!isActiveAnode && (
                  <g transform={`translate(${
                    phase === PHASES.IDLE ? 250 :
                    phase === PHASES.RACING ? 250 + (progress / 0.4) * 110 :
                    phase === PHASES.COMPETING ? 360 : 360
                  }, ${
                    phase === PHASES.IDLE ? 120 : 
                    phase === PHASES.RACING ? 120 :
                    phase === PHASES.COMPETING ? 120 : 120
                  })`}>
                    {(phase === PHASES.COMPETING || phase === PHASES.RESULT) && (
                      <circle cx="0" cy="0" r="25" fill="url(#winnerGlow)" className="animate-pulse" />
                    )}
                    {phase !== PHASES.RESULT && (
                      <g>
                        <circle cx="0" cy="0" r="16" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
                        <text x="0" y="4" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">{currentData.anodeWinner}</text>
                      </g>
                    )}
                  </g>
                )}

                {/* Loser */}
                <g transform={`translate(${
                  phase === PHASES.IDLE ? 250 :
                  phase === PHASES.RACING ? 250 + (progress / 0.4) * 80 :
                  phase === PHASES.COMPETING ? 330 : 330
                }, ${
                  phase === PHASES.IDLE ? 180 : 
                  phase === PHASES.RACING ? 180 - (progress / 0.4) * 30 :
                  phase === PHASES.COMPETING ? 150 : 150
                })`} opacity={anodeLoserOpacity}>
                  <circle cx="0" cy="0" r="16" fill="#F87171" stroke="#DC2626" strokeWidth="2" />
                  <text x="0" y="4" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">{currentData.anodeLoser}</text>
                </g>

              </svg>

            </div>
          </div>

          {/* Educational Summary Panel */}
          {phase === PHASES.RESULT && (
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl animate-in slide-in-from-bottom-4 shadow-sm">
              <h3 className="text-emerald-800 font-black flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5" /> Summary: What happened?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="block text-xs font-bold text-slate-400 uppercase">Cathode</span>
                  <span className="block font-bold text-slate-800">{currentData.products.cathode}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="block text-xs font-bold text-slate-400 uppercase">Anode</span>
                  <span className="block font-bold text-slate-800">{currentData.products.anode}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="block text-xs font-bold text-slate-400 uppercase">Remaining in Solution</span>
                  <span className="block font-bold text-slate-800">{currentData.products.remaining}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Observation Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-800 text-slate-300 p-5 rounded-2xl border border-slate-700 flex-1 shadow-sm flex flex-col">
            <h3 className="font-black text-white uppercase tracking-wider text-sm mb-4 border-b border-slate-700 pb-2">Observation Panel</h3>
            
            {phase === PHASES.IDLE && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Info className="w-8 h-8 mb-2" />
                <p className="text-sm font-bold">Waiting for Electrolysis</p>
                <p className="text-xs">Click Start to watch ions compete.</p>
              </div>
            )}

            {phase !== PHASES.IDLE && (
              <div className="space-y-6 flex-1">
                
                {/* Cathode Observer */}
                <div className={`transition-all duration-500 ${phase === PHASES.RACING ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Cathode Winner</span>
                    {phase !== PHASES.RACING && (
                      <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-sm shadow-sm">{currentData.cathodeWinner}</span>
                    )}
                  </div>
                  {phase !== PHASES.RACING && (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm leading-relaxed border-l-4 border-l-blue-500">
                      {currentData.cathodeReason}
                    </div>
                  )}
                </div>

                {/* Anode Observer */}
                <div className={`transition-all duration-500 ${phase === PHASES.RACING ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Anode Winner</span>
                    {phase !== PHASES.RACING && (
                      <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-sm shadow-sm">{currentData.anodeWinner}</span>
                    )}
                  </div>
                  {phase !== PHASES.RACING && (
                    <div className={`bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm leading-relaxed border-l-4 border-l-red-500 ${selectedBaseId === 'concentrated_nacl' ? 'text-amber-300' : ''}`}>
                      {currentData.anodeReason}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
          
          {/* Concentration Alert */}
          {selectedBaseId === 'concentrated_nacl' && (
             <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl shadow-sm text-sm animate-in slide-in-from-right-4">
               <strong className="flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> High Concentration Exception</strong>
               In brine, the extremely high concentration of Cl⁻ overrides its position in the electrochemical series.
             </div>
          )}

          {/* Active Electrode Alert */}
          {isActiveAnode && (
             <div className="bg-orange-50 border border-orange-200 text-orange-900 p-4 rounded-xl shadow-sm text-sm animate-in slide-in-from-right-4">
               <strong className="flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> Active Electrode</strong>
               The copper anode actively dissolves because the metal itself is more easily oxidized than any dissolved anion.
             </div>
          )}

        </div>
      </div>
      
      {/* CHECKPOINT NOTIFICATION */}
      {mastered && (
        <div className="p-5 rounded-2xl border transition-all bg-emerald-50 border-emerald-200 text-emerald-900 animate-in slide-in-from-bottom-4 fade-in mt-2" role="alert">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-1">Preferential Discharge Mastered</h3>
              <p className="text-sm font-medium">
                You have demonstrated that the ion discharged at an electrode depends on its position in the electrochemical series, its concentration in solution, and the material of the electrode itself.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
