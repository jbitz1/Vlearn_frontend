import React, { useState, useEffect, useMemo } from 'react';
import { Play, RotateCcw, Activity, Info, Zap, Settings, ShieldCheck, CheckCircle2, FlaskConical, Watch, BatteryCharging } from 'lucide-react';

const PLATING_CONFIG = {
  metals: {
    copper: {
      id: 'copper',
      name: 'Copper',
      symbol: 'Cu',
      ion: 'Cu²⁺',
      valency: 2,
      molarMass: 63.55, // g/mol
      electrolyte: 'CuSO₄(aq)',
      color: 'bg-orange-600',
      textColor: 'text-orange-600',
      anodeColor: 'bg-orange-500 border-orange-700',
      solutionColor: 'bg-blue-400/30' // Copper sulfate is blue
    },
    silver: {
      id: 'silver',
      name: 'Silver',
      symbol: 'Ag',
      ion: 'Ag⁺',
      valency: 1,
      molarMass: 107.87, // g/mol
      electrolyte: 'AgNO₃(aq)',
      color: 'bg-slate-300',
      textColor: 'text-slate-500',
      anodeColor: 'bg-slate-300 border-slate-500',
      solutionColor: 'bg-slate-200/20' // Silver nitrate is colorless
    },
    nickel: {
      id: 'nickel',
      name: 'Nickel',
      symbol: 'Ni',
      ion: 'Ni²⁺',
      valency: 2,
      molarMass: 58.69, // g/mol
      electrolyte: 'NiSO₄(aq)',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      anodeColor: 'bg-emerald-300 border-emerald-600',
      solutionColor: 'bg-emerald-400/30' // Nickel sulfate is green
    }
  },
  objects: {
    spoon: { id: 'spoon', name: 'Steel Spoon', initialMass: 25.00 },
    key: { id: 'key', name: 'Brass Key', initialMass: 12.50 },
    ring: { id: 'ring', name: 'Iron Ring', initialMass: 5.20 }
  },
  anodeInitialMass: 50.00 // g
};

// Faraday's Constant
const F = 96485; // C/mol
// Simulation speed multiplier (1 real second = 600 simulated seconds)
const TIME_MULTIPLIER = 600; 

export default function ElectroplatingSim({ config, onTelemetry }) {
  const [selectedMetal, setSelectedMetal] = useState('copper');
  const [selectedObject, setSelectedObject] = useState('spoon');
  const [amperage, setAmperage] = useState(2.0); // 1.0 to 5.0
  
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in simulated seconds
  const [massTransferred, setMassTransferred] = useState(0); // in grams

  const [mastered, setMastered] = useState(false);
  const [exploration, setExploration] = useState({
    metals: new Set(),
    currents: new Set(),
    objects: new Set()
  });

  const metal = PLATING_CONFIG.metals[selectedMetal];
  const obj = PLATING_CONFIG.objects[selectedObject];

  // Reset state when configuration changes
  useEffect(() => {
    setIsRunning(false);
    setElapsedTime(0);
    setMassTransferred(0);
  }, [selectedMetal, selectedObject]);

  // Main Simulation Loop
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + TIME_MULTIPLIER / 10; // 10 updates per second
          // Faraday's Law: m = (I * t * M) / (n * F)
          const m = (amperage * newTime * metal.molarMass) / (metal.valency * F);
          setMassTransferred(m);
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, amperage, metal]);

  // Track Exploration for Checkpoint
  useEffect(() => {
    if (isRunning) {
      setExploration(prev => {
        const newMetals = new Set(prev.metals).add(selectedMetal);
        const newCurrents = new Set(prev.currents).add(amperage);
        const newObjects = new Set(prev.objects).add(selectedObject);
        return { metals: newMetals, currents: newCurrents, objects: newObjects };
      });
    }
  }, [isRunning, selectedMetal, amperage, selectedObject]);

  // Check Mastery
  useEffect(() => {
    if (exploration.metals.size > 1 && exploration.currents.size > 1 && exploration.objects.size > 1 && !mastered) {
      setMastered(true);
      if (onTelemetry) {
        onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
          checkpoint: 'Electroplating Mastered'
        });
      }
    }
  }, [exploration, mastered, onTelemetry]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setMassTransferred(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Particles generator
  const particles = useMemo(() => {
    if (!isRunning) return [];
    // Number of particles proportional to amperage
    const count = Math.floor(amperage * 5); 
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      delay: Math.random() * 2,
      top: Math.random() * 60 + 20,
    }));
  }, [isRunning, amperage]);

  // Anode shrinking (min 20% width)
  const anodeShrinkage = Math.min(0.8, massTransferred / PLATING_CONFIG.anodeInitialMass);
  const anodeWidth = 100 - (anodeShrinkage * 100);

  // Cathode thickening (max 10px outline/shadow)
  const cathodeThickening = Math.min(10, massTransferred * 2);

  return (
    <div className="bg-slate-50 rounded-3xl overflow-hidden shadow-sm border border-slate-200 p-6 font-sans max-w-5xl mx-auto">
      
      {/* Mission Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-5 rounded-2xl shadow-sm mb-6 flex items-start gap-4">
        <div className="bg-white/20 p-2.5 rounded-xl flex-shrink-0">
          <Zap className="w-6 h-6 text-yellow-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Mission</h2>
          <p className="text-blue-100 mt-1 max-w-3xl leading-relaxed text-sm">
            Choose an object and a coating metal. Adjust the current and watch Faraday's First Law in action (m ∝ I × t). 
            <br/>Can you produce a smooth, even metal coating and prove that mass is conserved?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls & Plating Tank */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Controls */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-indigo-500" /> Parameters
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Object</label>
                <select 
                  disabled={isRunning || elapsedTime > 0}
                  value={selectedObject} 
                  onChange={e => setSelectedObject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium text-slate-800 disabled:opacity-50"
                >
                  {Object.values(PLATING_CONFIG.objects).map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Coating Metal</label>
                <select 
                  disabled={isRunning || elapsedTime > 0}
                  value={selectedMetal} 
                  onChange={e => setSelectedMetal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium text-slate-800 disabled:opacity-50"
                >
                  {Object.values(PLATING_CONFIG.metals).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current (Amperage)</label>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{amperage.toFixed(1)} A</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={amperage}
                onChange={(e) => setAmperage(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
                <span>1.0 A (Low)</span>
                <span>5.0 A (High)</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleStartStop}
                className={`flex-1 flex justify-center items-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-colors ${isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {isRunning ? '⏸ Pause Plating' : (elapsedTime > 0 ? '▶ Resume Plating' : '▶ Start Plating')}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* Plating Tank Visualization */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            
            {/* The Power Supply & Wires */}
            <div className="relative h-16 flex items-start justify-center mb-4">
               <div className="bg-slate-800 text-white px-4 py-2 rounded-lg border-b-4 border-slate-900 shadow-sm flex items-center gap-3 z-10">
                 <BatteryCharging className="w-5 h-5 text-yellow-400" />
                 <span className="font-mono font-bold">{isRunning ? amperage.toFixed(1) + ' A' : '0.0 A'}</span>
               </div>
               {/* Wires */}
               <div className="absolute top-4 left-[25%] right-[25%] h-px border-t-2 border-slate-700 border-dashed"></div>
               <div className="absolute top-4 left-[25%] w-px h-16 border-l-2 border-slate-700 border-dashed"></div>
               <div className="absolute top-4 right-[25%] w-px h-16 border-r-2 border-slate-700 border-dashed"></div>
            </div>

            {/* The Tank */}
            <div className={`relative h-64 border-b-4 border-l-4 border-r-4 border-slate-300 rounded-b-3xl ${metal.solutionColor} transition-colors duration-1000 flex items-center justify-between px-12`}>
              
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm z-10 flex items-center gap-2">
                <FlaskConical className="w-3 h-3 text-indigo-500" />
                Electrolyte: {metal.electrolyte}
              </div>

              {/* Anode (Source Metal) */}
              <div className="relative h-full flex flex-col items-center justify-start pt-4 w-1/3">
                <div 
                  className={`transition-all duration-300 rounded-sm ${metal.anodeColor} relative z-10 flex flex-col items-center justify-center`}
                  style={{ height: '80%', width: `${anodeWidth}%` }}
                >
                  <span className="text-white font-bold text-sm bg-black/20 px-1 rounded absolute top-2">{metal.symbol} (s)</span>
                  <span className="text-white text-xs font-bold absolute bottom-2">Anode (+)</span>
                </div>
              </div>

              {/* Cathode (Object) */}
              <div className="relative h-full flex flex-col items-center justify-start pt-4 w-1/3">
                <div 
                  className="bg-slate-400 rounded-b-full w-12 h-32 relative z-10 flex items-center justify-center transition-all duration-300 border-t-4 border-slate-500 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.1)]"
                  style={{ 
                    boxShadow: massTransferred > 0 ? `0 0 0 ${cathodeThickening}px var(--tw-shadow-color)` : 'none',
                    '--tw-shadow-color': metal.color.includes('orange') ? '#ea580c' : metal.color.includes('emerald') ? '#059669' : '#cbd5e1'
                  }}
                >
                  <span className="text-slate-800 font-bold text-xs bg-white/60 px-1 rounded">{obj.name}</span>
                  <span className="text-slate-800 text-[10px] font-bold absolute -bottom-6">Cathode (-)</span>
                </div>
              </div>

              {/* Migrating Ions */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                  <div
                    key={p.id}
                    className={`absolute w-6 h-6 rounded-full ${metal.color} flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
                    style={{
                      top: `${p.top}%`,
                      left: '30%',
                      animation: `migrate ${3 - (amperage * 0.3)}s linear infinite`,
                      animationDelay: `${p.delay}s`
                    }}
                  >
                    {metal.ion}
                  </div>
                ))}
                <style>{`
                  @keyframes migrate {
                    0% { transform: translateX(0); opacity: 0; }
                    10% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateX(120px); opacity: 0; }
                  }
                `}</style>
              </div>

            </div>

            {/* Mass Scales */}
            <div className="flex justify-between mt-4 px-8">
              {/* Anode Scale */}
              <div className="bg-slate-100 border border-slate-300 rounded-lg p-2 text-center w-32 shadow-inner">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Anode Mass</div>
                <div className="font-mono text-lg font-bold text-slate-800 tracking-tight">
                  {(PLATING_CONFIG.anodeInitialMass - massTransferred).toFixed(3)}g
                </div>
              </div>

              {/* Cathode Scale */}
              <div className="bg-slate-100 border border-slate-300 rounded-lg p-2 text-center w-32 shadow-inner">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cathode Mass</div>
                <div className="font-mono text-lg font-bold text-slate-800 tracking-tight">
                  {(obj.initialMass + massTransferred).toFixed(3)}g
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Quantitative Observation */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-800 text-white rounded-2xl shadow-sm border-4 border-slate-700 p-5">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" /> Live Observation
            </h3>
            
            <div className="space-y-4">
              
              <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between border border-slate-600">
                <div className="flex items-center gap-3">
                  <Watch className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-slate-300 text-sm">Elapsed Time ($t$)</span>
                </div>
                <span className="font-mono text-xl font-bold text-blue-300">{formatTime(elapsedTime)}</span>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between border border-slate-600">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-slate-300 text-sm">Current ($I$)</span>
                </div>
                <span className="font-mono text-xl font-bold text-yellow-300">{amperage.toFixed(1)} A</span>
              </div>

              <div className="p-3 border-t border-slate-700 mt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mass Transferred ($m$)</div>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${metal.textColor}`}>{massTransferred.toFixed(4)}</span>
                  <span className="text-slate-400 font-bold pb-1">grams of {metal.name}</span>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3 text-xs font-mono text-slate-300 leading-relaxed border border-slate-600">
                <div className="font-bold text-white mb-1">Faraday's First Law</div>
                m = (I × t × M) / (n × F)<br/>
                m = ({amperage.toFixed(1)} × {Math.floor(elapsedTime)} × {metal.molarMass}) / ({metal.valency} × 96485)<br/>
                m ∝ (I × t)
              </div>

            </div>
          </div>

          {/* Educational Insights / Checkpoint */}
          {elapsedTime > 0 && !mastered && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
              <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" /> Key Discovery
              </h4>
              <p className="text-blue-900 text-sm">
                As electric current flows, metal atoms at the anode lose electrons to become ions, travel through the <strong>{metal.electrolyte}</strong> solution, and gain electrons at the cathode to form a solid coating. 
                <br/><br/>The dual mass scales prove that <strong>mass is conserved</strong>.
              </p>
            </div>
          )}

          {mastered && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm animate-pulse-once">
              <h4 className="font-extrabold text-emerald-800 text-lg flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Electroplating Mastered
              </h4>
              <p className="text-emerald-900 text-sm leading-relaxed">
                You've successfully explored multiple variables. You have proven Faraday's First Law: the amount of metal deposited ($m$) is directly proportional to the electrical current ($I$) and the time ($t$).
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
