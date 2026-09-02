import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, HelpCircle, Sliders, Sparkles, Sun, BatteryCharging } from 'lucide-react';

const METALS = {
  caesium: { name: 'Caesium (Cs)', workFunction: 2.14, color: '#f59e0b' },
  potassium: { name: 'Potassium (K)', workFunction: 2.30, color: '#eab308' },
  sodium: { name: 'Sodium (Na)', workFunction: 2.36, color: '#38bdf8' },
  zinc: { name: 'Zinc (Zn)', workFunction: 4.31, color: '#a855f7' },
  platinum: { name: 'Platinum (Pt)', workFunction: 6.35, color: '#94a3b8' },
};

export default function PhotoelectricSim({ config = {}, onTelemetry }) {
  const [selectedMetal, setSelectedMetal] = useState('caesium');
  const [wavelength, setWavelength] = useState(400); // nm (300nm - 750nm)
  const [intensity, setIntensity] = useState(60); // %
  const [retardingVoltage, setRetardingVoltage] = useState(0.0); // V (-3V to +3V)
  const [isPlaying, setIsPlaying] = useState(true);
  const [practiceAns, setPracticeAns] = useState('');
  const [practiceStatus, setPracticeStatus] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  // Fundamental physics constants
  const h = 6.63e-34; // J*s
  const c = 3.0e8; // m/s
  const e = 1.6e-19; // C

  const workFunctionEV = METALS[selectedMetal].workFunction;
  const workFunctionJ = workFunctionEV * e;

  // Photon frequency f = c / lambda
  const lambdaMeters = wavelength * 1e-9;
  const frequency = c / lambdaMeters; // Hz
  const photonEnergyJ = h * frequency; // J
  const photonEnergyEV = photonEnergyJ / e; // eV

  // Threshold frequency f0 = Phi / h, lambda0 = c / f0
  const thresholdFrequency = workFunctionJ / h;
  const thresholdWavelengthNM = (c / thresholdFrequency) * 1e9;

  // Maximum kinetic energy Kmax = hf - Phi (in eV)
  const kMaxEV = Math.max(0, photonEnergyEV - workFunctionEV);
  const isEmission = photonEnergyEV > workFunctionEV;

  // Stopping potential Vs = Kmax / e
  const stoppingPotential = kMaxEV; // in Volts

  // Photocurrent: proportional to intensity, but cut off when retarding voltage <= -Vs
  let photocurrent = 0;
  if (isEmission) {
    if (retardingVoltage >= -stoppingPotential) {
      // Linear ramp from stopping potential to saturation
      const factor = Math.min(1, (retardingVoltage + stoppingPotential) / (stoppingPotential || 0.5));
      photocurrent = (intensity / 100) * (0.2 + 0.8 * factor) * 10; // in mA
    }
  }

  // Wavelength to RGB color helper
  const getLightColor = (wl) => {
    if (wl < 380) return '#7e22ce'; // UV
    if (wl < 440) return '#6366f1'; // Violet/Indigo
    if (wl < 490) return '#0ea5e9'; // Blue
    if (wl < 560) return '#22c55e'; // Green
    if (wl < 590) return '#eab308'; // Yellow
    if (wl < 640) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const lightColor = getLightColor(wavelength);

  // Animated photon packets & photoelectrons
  const animTimeRef = useRef(0);
  const animFrameRef = useRef(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let last = performance.now();
    const loop = (now) => {
      if (isPlaying) {
        const dt = (now - last) / 1000;
        animTimeRef.current += dt;
        setFrame(Math.floor(animTimeRef.current * 30));
      }
      last = now;
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  const handleReset = () => {
    setSelectedMetal('caesium');
    setWavelength(400);
    setIntensity(60);
    setRetardingVoltage(0.0);
    setIsPlaying(true);
    setPracticeStatus(null);
    setPracticeAns('');
  };

  const checkPractice = (e) => {
    e.preventDefault();
    const val = parseFloat(practiceAns.trim());
    // Practice: Sodium Phi = 2.36 eV, lambda = 400 nm (E = 3.11 eV). Find Kmax in eV
    // Kmax = 3.11 - 2.36 = 0.75 eV
    if (Math.abs(val - 0.75) < 0.1) {
      setPracticeStatus('correct');
      if (onTelemetry) onTelemetry('practice_correct', { problem: 'photoelectric_kmax' });
    } else {
      setPracticeStatus('incorrect');
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-3xl p-4 sm:p-6 md:p-8 space-y-8 font-sans border border-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <Sun className="w-3.5 h-3.5" /> Quantum Physics Lab
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Einstein's Photoelectric Effect & Stopping Potential Simulator
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Illuminate different metal cathode surfaces with variable wavelength (&lambda;) and intensity, observe quantum photoelectron emission, and determine the stopping potential (V<sub>s</sub>) and work function (&Phi;).
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Freeze Photons' : 'Live Emission'}
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Photocell Vacuum Tube (Col 8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="w-full flex items-center justify-between text-xs font-medium text-slate-400 border-b border-slate-800 pb-2">
            <span>Evacuated Photocell & Circuit Diagram</span>
            <span className={`font-bold px-2 py-0.5 rounded ${isEmission ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {isEmission ? 'Photoelectrons Emitted' : 'Below Threshold (No Emission)'}
            </span>
          </div>

          <div className="w-full aspect-[2/1] min-h-[260px] sm:min-h-[320px] bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
            <svg viewBox="0 0 700 350" className="w-full h-full select-none">
              {/* Glass Vacuum Envelope */}
              <rect x="180" y="50" width="340" height="200" rx="30" fill="#030712" stroke="#334155" strokeWidth="2" />
              <text x="350" y="40" fill="#64748b" fontSize="10" textAnchor="middle">Evacuated Quartz Glass Tube</text>

              {/* Light Source Torch (Left) */}
              <g transform="translate(40, 100)">
                <path d="M 0,20 L 70,0 L 70,60 L 0,40 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <circle cx="70" cy="30" r="10" fill={lightColor} className="animate-pulse" />
                <text x="35" y="80" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">Light Source</text>
              </g>

              {/* Incoming Photon Wave Packets */}
              {Array.from({ length: 5 }).map((_, i) => {
                const offset = (frame * 6 + i * 40) % 150;
                const px = 110 + offset;
                const py = 120 + i * 15;
                return (
                  <circle
                    key={i}
                    cx={px}
                    cy={py}
                    r={intensity > 50 ? 4 : 2.5}
                    fill={lightColor}
                    className="drop-shadow-[0_0_6px_currentColor]"
                  />
                );
              })}

              {/* Cathode Metal Plate (Left inside tube) */}
              <rect x="220" y="80" width="14" height="140" fill="#cbd5e1" stroke={METALS[selectedMetal].color} strokeWidth="3" rx="3" />
              <text x="227" y="240" fill={METALS[selectedMetal].color} fontSize="11" fontWeight="bold" textAnchor="middle">
                Cathode ({METALS[selectedMetal].name.split(' ')[0]})
              </text>

              {/* Emitted Photoelectrons (Green dots moving right toward Anode) */}
              {isEmission && photocurrent > 0 && Array.from({ length: 8 }).map((_, i) => {
                const speed = 1.5 + kMaxEV * 2;
                const offset = (frame * speed * 2 + i * 30) % 200;
                const ex = 236 + offset;
                const ey = 95 + (i * 18);
                return (
                  <g key={i}>
                    <circle cx={ex} cy={ey} r="3.5" fill="#4ade80" className="drop-shadow-[0_0_4px_#4ade80]" />
                    <text x={ex} y={ey - 5} fill="#4ade80" fontSize="8">e⁻</text>
                  </g>
                );
              })}

              {/* Anode Collector Plate (Right inside tube) */}
              <rect x="470" y="80" width="14" height="140" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" rx="3" />
              <text x="477" y="240" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                Anode Collector
              </text>

              {/* External Circuit Wires */}
              <path d="M 227,220 L 227,290 L 320,290" fill="none" stroke="#64748b" strokeWidth="2" />
              <path d="M 477,220 L 477,290 L 380,290" fill="none" stroke="#64748b" strokeWidth="2" />

              {/* Micro-Ammeter */}
              <circle cx="350" cy="290" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <text x="350" y="288" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">A</text>
              <text x="350" y="302" fill="#4ade80" fontSize="9" fontWeight="bold" textAnchor="middle">
                {photocurrent.toFixed(2)} mA
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Controls & Parameters (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Target Metal Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Cathode Metal Surface ($\Phi$):
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {Object.keys(METALS).map((key) => {
                const m = METALS[key];
                const isSel = selectedMetal === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMetal(key)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition border text-left ${
                      isSel
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="font-mono text-[11px] text-amber-400">{m.workFunction} eV</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radiation Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-amber-400" /> Radiation Controls
            </h3>

            {/* Wavelength Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Wavelength ($\lambda$):</span>
                <span className="font-mono font-bold" style={{ color: lightColor }}>{wavelength} nm</span>
              </div>
              <input
                type="range"
                min="250"
                max="750"
                step="5"
                value={wavelength}
                onChange={(e) => setWavelength(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Intensity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Light Intensity:</span>
                <span className="font-mono font-bold text-amber-400">{intensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Retarding Potential Slider */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Retarding Potential ($V$):</span>
                <span className={`font-mono font-bold ${retardingVoltage < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {retardingVoltage > 0 ? '+' : ''}{retardingVoltage.toFixed(1)} V
                </span>
              </div>
              <input
                type="range"
                min="-4.0"
                max="3.0"
                step="0.1"
                value={retardingVoltage}
                onChange={(e) => setRetardingVoltage(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Calculated Quantum Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1.5">
              Live Quantum Calculations
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Photon Energy ($E$)</span>
                <span className="text-amber-400 font-bold">{photonEnergyEV.toFixed(2)} eV</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Work Function ($\Phi$)</span>
                <span className="text-white font-bold">{workFunctionEV} eV</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Max Kinetic Energy</span>
                <span className="text-emerald-400 font-bold">{kMaxEV.toFixed(2)} eV</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Stopping Potential</span>
                <span className="text-rose-400 font-bold">{stoppingPotential.toFixed(2)} V</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physics Principles & Einstein Equation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Einstein's Photoelectric Equation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-400">1. Photon Energy Balance</h4>
            <p className="font-mono text-white text-xs">h&middot;f = &Phi; + K<sub>max</sub></p>
            <p className="text-slate-400 text-xs">A single photon imparts its entire quantum packet hf to a single conduction electron.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-400">2. Threshold Wavelength</h4>
            <p className="font-mono text-white text-xs">&lambda;₀ = h&middot;c / &Phi;</p>
            <p className="text-slate-400 text-xs">Longer wavelengths (&lambda; &gt; &lambda;₀) contain insufficient photon energy to liberate electrons.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-400">3. Stopping Potential</h4>
            <p className="font-mono text-white text-xs">e&middot;V<sub>s</sub> = K<sub>max</sub> = h&middot;f - &Phi;</p>
            <p className="text-slate-400 text-xs">Independent of light intensity; strictly determined by radiation frequency f.</p>
          </div>
        </div>
      </div>

      {/* Quick Interactive Calculation Challenge */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
          <HelpCircle className="w-5 h-5" /> Quick Calculation Challenge
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Light of photon energy <strong>3.11 eV</strong> (&lambda; = 400 nm) shines on a sodium cathode (&Phi; = 2.36 eV). What is the maximum kinetic energy (K<sub>max</sub>) of emitted photoelectrons in <strong>eV</strong>?
        </p>

        <form onSubmit={checkPractice} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="number"
            step="0.01"
            placeholder="Kmax in eV (e.g. 0.75)"
            value={practiceAns}
            onChange={(e) => {
              setPracticeAns(e.target.value);
              setPracticeStatus(null);
            }}
            className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500 max-w-xs"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-amber-600/20"
          >
            Check Answer
          </button>
          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
          >
            {showSolution ? 'Hide Solution' : 'Show Step-by-Step Solution'}
          </button>
        </form>

        {practiceStatus === 'correct' && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Correct! K<sub>max</sub> = hf - &Phi; = 3.11 eV - 2.36 eV = 0.75 eV.
          </div>
        )}

        {practiceStatus === 'incorrect' && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
            Incorrect. Use Einstein's equation: K<sub>max</sub> = E_photon - &Phi; = 3.11 - 2.36.
          </div>
        )}

        {showSolution && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300 font-mono">
            <p className="font-bold text-amber-400">Step-by-Step Solution:</p>
            <p>1. Einstein Equation: h*f = Phi + Kmax</p>
            <p>2. Kmax = h*f - Phi</p>
            <p>3. Kmax = 3.11 eV - 2.36 eV = 0.75 eV</p>
            <p>4. Stopping Potential: Vs = Kmax / e = 0.75 V</p>
          </div>
        )}
      </div>
    </div>
  );
}
