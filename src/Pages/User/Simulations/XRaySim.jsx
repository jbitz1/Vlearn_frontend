import React, { useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, HelpCircle, Sliders, Sparkles, Zap, ShieldAlert } from 'lucide-react';

const TARGET_MATERIALS = {
  tungsten: { name: 'Tungsten (W)', Z: 74, kAlpha: 0.021, color: '#38bdf8' },
  molybdenum: { name: 'Molybdenum (Mo)', Z: 42, kAlpha: 0.071, color: '#a855f7' },
  copper: { name: 'Copper (Cu)', Z: 29, kAlpha: 0.154, color: '#f59e0b' },
};

export default function XRaySim({ config = {}, onTelemetry }) {
  const [acceleratingKV, setAcceleratingKV] = useState(50); // kV (10kV - 100kV)
  const [filamentCurrentMA, setFilamentCurrentMA] = useState(20); // mA (5mA - 50mA)
  const [targetMaterial, setTargetMaterial] = useState('tungsten');
  const [practiceAns, setPracticeAns] = useState('');
  const [practiceStatus, setPracticeStatus] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  // Duane-Hunt Law: lambda_min = hc / (e * V)
  // hc / e ≈ 1.24 x 10^-6 V*m = 1.24 nm*kV = 1240 pm*kV
  // lambda_min in nm: 1.24 / V_in_kV
  const lambdaMinNM = 1.24 / acceleratingKV;
  const lambdaMinPM = (lambdaMinNM * 1000).toFixed(1);

  // Electrical Power P = V * I
  const totalPowerWatts = (acceleratingKV * 1000) * (filamentCurrentMA / 1000);
  const heatPowerWatts = (totalPowerWatts * 0.992).toFixed(1);
  const xrayPowerWatts = (totalPowerWatts * 0.008).toFixed(2);

  const mat = TARGET_MATERIALS[targetMaterial];

  const handleReset = () => {
    setAcceleratingKV(50);
    setFilamentCurrentMA(20);
    setTargetMaterial('tungsten');
    setPracticeStatus(null);
    setPracticeAns('');
  };

  const checkPractice = (e) => {
    e.preventDefault();
    const val = parseFloat(practiceAns.trim());
    // Practice: Va = 62 kV. Find lambda_min in pm (picometres):
    // lambda_min = 1240 / 62 = 20.0 pm
    if (Math.abs(val - 20.0) < 0.8) {
      setPracticeStatus('correct');
      if (onTelemetry) onTelemetry('practice_correct', { problem: 'xray_duane_hunt' });
    } else {
      setPracticeStatus('incorrect');
    }
  };

  // Generate continuous Bremsstrahlung + Characteristic line spectrum points
  const graphW = 340;
  const graphH = 180;
  const maxLambda = 0.15; // nm

  const getSpectrumPath = () => {
    const points = [];
    const minX = (lambdaMinNM / maxLambda) * graphW;

    for (let x = 0; x <= graphW; x += 3) {
      if (x < minX) {
        points.push(`${x},${graphH}`);
      } else {
        const norm = (x - minX) / (graphW - minX);
        // Bremsstrahlung intensity curve: I ~ (lambda - lambda_min) / lambda^4
        const intensityNorm = Math.sin(norm * Math.PI * 0.7) * Math.exp(-norm * 2) * (filamentCurrentMA / 30);
        const y = graphH - Math.min(graphH - 10, intensityNorm * (graphH * 1.6));
        points.push(`${x},${y}`);
      }
    }
    return 'M ' + points.join(' L ');
  };

  const kAlphaX = (mat.kAlpha / maxLambda) * graphW;

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-3xl p-4 sm:p-6 md:p-8 space-y-8 font-sans border border-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <Zap className="w-3.5 h-3.5" /> Coolidge Tube & X-Ray Electrodynamics
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            X-Ray Production, Spectral Distribution & Duane-Hunt Cutoff Simulator
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Control accelerating high-tension voltage (kV) and filament current (mA) to investigate independent hardness and intensity control and observe the Duane-Hunt minimum cutoff wavelength (&lambda;<sub>min</sub>).
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
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
        {/* Left: Coolidge Tube Cutaway & Live Spectrum Graph (Col 8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Coolidge X-Ray Tube */}
            <div className="md:col-span-6 bg-slate-950 rounded-2xl p-3 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Coolidge Tube Cross-Section
              </span>
              <svg viewBox="0 0 320 200" className="w-full h-auto select-none">
                {/* Evacuated Glass Bulb */}
                <ellipse cx="160" cy="100" rx="140" ry="75" fill="#030712" stroke="#334155" strokeWidth="2" />

                {/* Filament Cathode (Left) */}
                <rect x="50" y="85" width="20" height="30" fill="#f59e0b" rx="2" />
                <text x="60" y="80" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">Cathode</text>

                {/* Electron Beam */}
                <line x1="70" y1="100" x2="210" y2="100" stroke="#38bdf8" strokeWidth="3" strokeDasharray="3 2" />
                <text x="140" y="92" fill="#38bdf8" fontSize="8">Electrons ({acceleratingKV} keV)</text>

                {/* Angled Anode Target Target (Right) */}
                <polygon points="210,70 230,70 210,130" fill={mat.color} stroke="#e2e8f0" strokeWidth="1.5" />
                <rect x="230" y="75" width="50" height="50" fill="#b45309" rx="2" />
                <text x="255" y="70" fill="#f97316" fontSize="8" fontWeight="bold" textAnchor="middle">Copper + Cooling</text>

                {/* Emitted X-Ray Beam (Downwards through lead window) */}
                <path d="M 215,105 L 180,180 L 250,180 Z" fill="#38bdf822" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                <text x="215" y="195" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">X-Rays</text>
              </svg>
            </div>

            {/* Live X-Ray Spectrum Graph */}
            <div className="md:col-span-6 bg-slate-950 rounded-2xl p-3 border border-slate-800">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Live X-Ray Emission Spectrum
              </span>
              <div className="w-full h-[180px] relative">
                <svg viewBox={`0 0 ${graphW} ${graphH}`} className="w-full h-full">
                  {/* Axes */}
                  <line x1="20" y1="160" x2="320" y2="160" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="20" y1="160" x2="20" y2="20" stroke="#64748b" strokeWidth="1.5" />
                  <text x="320" y="175" fill="#94a3b8" fontSize="8" textAnchor="end">Wavelength λ (nm)</text>
                  <text x="15" y="15" fill="#94a3b8" fontSize="8">Intensity I</text>

                  {/* Bremsstrahlung Curve */}
                  <path
                    d={getSpectrumPath()}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    className="drop-shadow-[0_0_6px_#38bdf8]"
                  />

                  {/* Characteristic K-Alpha Spike (if above threshold) */}
                  {kAlphaX > (lambdaMinNM / maxLambda) * graphW && kAlphaX < graphW && (
                    <line
                      x1={kAlphaX}
                      y1="160"
                      x2={kAlphaX}
                      y2="30"
                      stroke={mat.color}
                      strokeWidth="3"
                      className="drop-shadow-[0_0_8px_currentColor]"
                    />
                  )}

                  {/* Cutoff Marker lambda_min */}
                  <line
                    x1={(lambdaMinNM / maxLambda) * graphW}
                    y1="160"
                    x2={(lambdaMinNM / maxLambda) * graphW}
                    y2="130"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={(lambdaMinNM / maxLambda) * graphW}
                    y="125"
                    fill="#f43f5e"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    λmin ({lambdaMinPM} pm)
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls & Sliders (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-amber-400" /> Operational Controls
            </h3>

            {/* Target Material Selector */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-xs block">Anode Target Material:</span>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {Object.keys(TARGET_MATERIALS).map((key) => {
                  const m = TARGET_MATERIALS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setTargetMaterial(key)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg border transition ${
                        targetMaterial === key
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className="text-slate-500 font-mono">Z = {m.Z}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* High Tension Voltage (Hardness) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Accelerating Voltage (Hardness):</span>
                <span className="font-mono font-bold text-cyan-400">{acceleratingKV} kV</span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={acceleratingKV}
                onChange={(e) => setAcceleratingKV(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Filament Current (Intensity) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Filament Current (Intensity):</span>
                <span className="font-mono font-bold text-amber-400">{filamentCurrentMA} mA</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="2"
                value={filamentCurrentMA}
                onChange={(e) => setFilamentCurrentMA(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Energy Partition & Power Readout */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
              <span>Energy Conversion Partition</span>
              <span className="text-rose-400 font-mono text-[10px]">P = {totalPowerWatts} W</span>
            </h3>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 text-rose-400">
                <span>Thermal Heat Loss (&gt;99%):</span>
                <span className="font-bold">{heatPowerWatts} W</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 text-cyan-400">
                <span>X-Ray Beam Output (&lt;1%):</span>
                <span className="font-bold">{xrayPowerWatts} W</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physics Principles & Duane-Hunt Equation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          The Duane-Hunt Law & X-Ray Principles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-400">1. Duane-Hunt Cutoff</h4>
            <p className="font-mono text-white text-xs">&lambda;<sub>min</sub> = h&middot;c / (e&middot;V)</p>
            <p className="text-slate-400 text-xs">Minimum cutoff wavelength is inversely proportional to accelerating voltage V.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-400">2. Hard vs. Soft X-Rays</h4>
            <p className="text-slate-300 text-xs">Higher kV produces shorter &lambda;<sub>min</sub> (Hard X-rays with higher penetrating power).</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-400">3. Independent Controls</h4>
            <p className="text-slate-300 text-xs">Filament current controls photon quantity (intensity) without changing &lambda;<sub>min</sub>.</p>
          </div>
        </div>
      </div>

      {/* Quick Interactive Calculation Challenge */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm sm:text-base">
          <HelpCircle className="w-5 h-5" /> Quick Calculation Challenge
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          An X-ray tube operates at an accelerating potential of <strong>V = 62 kV</strong>. Calculate the minimum cutoff wavelength (&lambda;<sub>min</sub>) in picometres (<strong>pm</strong>). (Take hc/e &approx; 1240 pm&middot;kV).
        </p>

        <form onSubmit={checkPractice} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="number"
            step="0.1"
            placeholder="Wavelength in pm (e.g. 20.0)"
            value={practiceAns}
            onChange={(e) => {
              setPracticeAns(e.target.value);
              setPracticeStatus(null);
            }}
            className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500 max-w-xs"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-600/20"
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
            Correct! &lambda;<sub>min</sub> = 1240 pm&middot;kV / 62 kV = 20.0 pm = 2.0 &times; 10⁻¹¹ m.
          </div>
        )}

        {practiceStatus === 'incorrect' && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
            Incorrect. Formula: &lambda;<sub>min</sub> = hc / eV = 1240 pm&middot;kV / 62 kV.
          </div>
        )}

        {showSolution && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300 font-mono">
            <p className="font-bold text-cyan-400">Step-by-Step Solution:</p>
            <p>1. Duane-Hunt Law: lambda_min = hc / (e * V)</p>
            <p>2. lambda_min = (6.63e-34 * 3.0e8) / (1.6e-19 * 62,000)</p>
            <p>3. lambda_min = 2.005 x 10^-11 m = 20.05 pm ≈ 20.0 pm</p>
          </div>
        )}
      </div>
    </div>
  );
}
