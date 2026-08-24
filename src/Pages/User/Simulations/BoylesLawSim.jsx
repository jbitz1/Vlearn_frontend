import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Eye, EyeOff, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

export default function BoylesLawSim({ config = {}, onTelemetry }) {
  const V1 = 50.0;
  const P1 = 1.0;
  const NPART = 28;

  const [volume, setVolume] = useState(50.0);
  const [showParticles, setShowParticles] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playDir, setPlayDir] = useState(-1);
  const [lastVolume, setLastVolume] = useState(50.0);
  const [practiceAns, setPracticeAns] = useState('');
  const [practiceStatus, setPracticeStatus] = useState(null); // 'correct' | 'incorrect' | null
  const [showSolution, setShowSolution] = useState(false);

  const particlesRef = useRef(
    Array.from({ length: NPART }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.018,
      vy: (Math.random() - 0.5) * 0.018,
    }))
  );

  const animFrameRef = useRef(null);
  const playTimerRef = useRef(null);

  // Pressure P = (P1 * V1) / V
  const pressure = (P1 * V1) / volume;

  // Track trend & explanations
  const trend = volume < lastVolume - 0.05 ? 'compressing' : volume > lastVolume + 0.05 ? 'expanding' : 'stable';

  // Particle animation loop
  useEffect(() => {
    const loop = () => {
      if (showParticles) {
        // speed increases slightly as gas is compressed
        const speedMultiplier = 1 + (1 - volume / 50) * 0.8;
        particlesRef.current.forEach((p) => {
          p.x += p.vx * speedMultiplier;
          p.y += p.vy * speedMultiplier;
          if (p.x <= 0.02 || p.x >= 0.98) p.vx *= -1;
          if (p.y <= 0.02 || p.y >= 0.98) p.vy *= -1;
          p.x = Math.max(0.01, Math.min(0.99, p.x));
          p.y = Math.max(0.01, Math.min(0.99, p.y));
        });
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [showParticles, volume]);

  // Auto-cycle
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setVolume((prev) => {
          let next = prev + playDir * 0.7;
          if (next <= 12) {
            next = 12;
            setPlayDir(1);
          } else if (next >= 50) {
            next = 50;
            setPlayDir(-1);
          }
          return next;
        });
      }, 45);
    } else {
      clearInterval(playTimerRef.current);
    }
    return () => clearInterval(playTimerRef.current);
  }, [isPlaying, playDir]);

  const handleSliderChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setLastVolume(volume);
    setVolume(newVol);
  };

  const setVolumeState = (newVol, dir = 'stable') => {
    setLastVolume(volume);
    setVolume(newVol);
  };

  const toggleAutoCycle = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setVolume(50.0);
    setLastVolume(50.0);
  };

  const handleCheckPractice = () => {
    const val = parseFloat(practiceAns);
    // Problem: V1=40 cm3, P1=1.5 atm, P2=3.0 atm -> V2 = (1.5 * 40) / 3 = 20.0 cm3
    if (!isNaN(val) && Math.abs(val - 20.0) < 0.5) {
      setPracticeStatus('correct');
      if (typeof onTelemetry === 'function') {
        onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
          simulation: 'chem_boyles_law',
          score: 1.0,
        });
      }
    } else {
      setPracticeStatus('incorrect');
    }
  };

  // Syringe geometry
  const barrelX = 70;
  const barrelYtop = 40;
  const barrelW = 160;
  const barrelHmax = 190;
  const frac = volume / V1; // 1 = full, 0.24 = max compression
  const gasH = barrelHmax * frac;
  const gasY = barrelYtop + (barrelHmax - gasH);
  const plungerY = gasY - 10;

  // Graph geometry
  const pad = 44;
  const gw = 340;
  const gh = 230;
  const x0 = pad;
  const y0 = gh - pad;
  const x1 = gw - 16;
  const y1 = 20;
  const Vmax = 55;
  const Pmax = 4.5;
  const sx = (v) => x0 + (v / Vmax) * (x1 - x0);
  const sy = (p) => y0 - (p / Pmax) * (y0 - y1);

  // Curve path
  let curvePath = '';
  for (let v = 10; v <= Vmax; v += 1) {
    const p = (P1 * V1) / v;
    const X = sx(v);
    const Y = sy(Math.min(p, Pmax));
    curvePath += (v === 10 ? 'M ' : 'L ') + X.toFixed(1) + ' ' + Y.toFixed(1) + ' ';
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-slate-900">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-teal-300 uppercase">
              Boyle's Law Interactive Syringe & Real-Time Isotherm
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full">
              Temp = 25°C (Constant)
            </span>
            <span className="text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
              P × V = {(pressure * volume).toFixed(1)} atm·cm³
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/90 rounded-2xl p-4 border border-slate-800/90 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                1. Syringe Apparatus
              </span>
              <span className="text-[10px] font-mono text-teal-400">
                {trend === 'compressing' ? 'Compressing ↓' : trend === 'expanding' ? 'Expanding ↑' : 'Static'}
              </span>
            </div>

            <div className="flex items-center justify-center my-auto py-1">
              <svg viewBox="0 0 340 280" className="w-full max-w-[300px] h-auto select-none">
                <defs>
                  <linearGradient id="boyleGasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity="0.15" />
                  </linearGradient>
                  <clipPath id="boyleGasClip">
                    <rect x={barrelX} y={gasY} width={barrelW} height={gasH} rx="4" />
                  </clipPath>
                </defs>
                <rect x={barrelX - 4} y={barrelYtop - 4} width={barrelW + 8} height={barrelHmax + 8} rx="8" fill="none" stroke="#334155" strokeWidth="2" opacity="0.6" />
                <rect x={barrelX} y={gasY} width={barrelW} height={gasH} fill="url(#boyleGasGrad)" rx="4" />
                {[10, 20, 30, 40, 50].map((v) => {
                  const markFrac = v / 50;
                  const markY = barrelYtop + (barrelHmax - barrelHmax * markFrac);
                  return (
                    <g key={v}>
                      <line x1={barrelX + 4} y1={markY} x2={barrelX + 16} y2={markY} stroke="#64748b" strokeWidth="1" />
                      <text x={barrelX + 22} y={markY + 3.5} fill="#94a3b8" fontSize="9" fontFamily="monospace">{v} mL</text>
                    </g>
                  );
                })}
                <path d={`M ${barrelX + barrelW / 2 - 12} ${barrelYtop + barrelHmax + 4} L ${barrelX + barrelW / 2 + 12} ${barrelYtop + barrelHmax + 4} L ${barrelX + barrelW / 2 + 6} ${barrelYtop + barrelHmax + 28} L ${barrelX + barrelW / 2 - 6} ${barrelYtop + barrelHmax + 28} Z`} fill="#475569" stroke="#334155" />
                <circle cx={barrelX + barrelW / 2} cy={barrelYtop + barrelHmax + 28} r="6" fill="#ef4444" />
                <text x={barrelX + barrelW / 2} y={barrelYtop + barrelHmax + 44} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">SEALED CAP</text>
                {showParticles && (
                  <g clipPath="url(#boyleGasClip)">
                    {particlesRef.current.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={barrelX + p.x * barrelW}
                        cy={gasY + p.y * gasH}
                        r="3.5"
                        fill="#5eead4"
                        opacity="0.9"
                      />
                    ))}
                  </g>
                )}
                <rect x={barrelX} y={plungerY} width={barrelW} height={12} rx="2" fill="#0ea5e9" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x={barrelX + barrelW / 2 - 6} y={plungerY - 36} width={12} height={36} fill="#64748b" />
                <rect x={barrelX + barrelW / 2 - 28} y={plungerY - 44} width={56} height={8} rx="3" fill="#0ea5e9" />
                {trend === 'compressing' && <text x={barrelX + barrelW / 2} y={plungerY - 50} textAnchor="middle" fill="#f59e0b" fontFamily="monospace" fontSize="10" fontWeight="bold">PUSH ↓</text>}
              </svg>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-center text-slate-400">
              Trapped Gas Moles = Constant · Collisions ↑ with Compression
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/90 rounded-2xl p-4 border border-slate-800/90 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">2. Live P–V Isotherm Graph</span>
              <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded border border-teal-500/20">P ∝ 1/V</span>
            </div>
            <div className="flex items-center justify-center my-auto py-1">
              <svg viewBox={`0 0 ${gw} ${gh}`} className="w-full max-w-[320px] h-auto">
                <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="#64748b" strokeWidth="1.5" />
                <line x1={x0} y1={y0} x2={x0} y2={y1} stroke="#64748b" strokeWidth="1.5" />
                <text x={(x0 + x1) / 2} y={gh - 8} textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">Volume V (cm³)</text>
                <text x={12} y={(y0 + y1) / 2} textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace" transform={`rotate(-90 12 ${(y0 + y1) / 2})`}>Pressure P (atm)</text>
                {[10, 20, 30, 40, 50].map((v) => <text key={v} x={sx(v)} y={y0 + 14} textAnchor="middle" fill="#64748b" fontSize="8.5" fontFamily="monospace">{v}</text>)}
                {[1, 2, 3, 4].map((p) => <text key={p} x={x0 - 8} y={sy(p) + 3} textAnchor="end" fill="#64748b" fontSize="8.5" fontFamily="monospace">{p}</text>)}
                <path d={curvePath} fill="none" stroke="#2dd4bf" strokeWidth="2.5" opacity="0.8" />
                <line x1={sx(volume)} y1={sy(Math.min(pressure, Pmax))} x2={sx(volume)} y2={y0} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
                <line x1={x0} y1={sy(Math.min(pressure, Pmax))} x2={sx(volume)} y2={sy(Math.min(pressure, Pmax))} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
                <circle cx={sx(volume)} cy={sy(Math.min(pressure, Pmax))} r="6" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
              </svg>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-[10px] font-mono text-center text-amber-300">
              Live Coordinate: ({volume.toFixed(1)} cm³, {pressure.toFixed(2)} atm)
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between space-y-3 bg-slate-950/70 rounded-2xl p-4 border border-slate-800/70">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between text-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Volume</span>
                <div className="mt-0.5 text-lg font-bold font-mono text-teal-300">{volume.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">cm³</span></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between text-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Pressure</span>
                <div className="mt-0.5 text-lg font-bold font-mono text-amber-400">{pressure.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">atm</span></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between text-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Temp</span>
                <div className="mt-0.5 text-lg font-bold font-mono text-purple-300">25 <span className="text-[10px] font-normal text-slate-400">°C</span></div>
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-200">Push / Pull Plunger</span>
                <span className="text-teal-300 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-700">V = {volume.toFixed(1)} cm³</span>
              </div>
              <input type="range" min="12" max="50" step="0.5" value={volume} onChange={handleSliderChange} className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none" />
              <div className="flex justify-between text-[10px] font-mono text-slate-400"><span>12 cm³ (Max P)</span><span>50 cm³ (Min P)</span></div>
              <div className="flex gap-1.5 pt-1">
                <button onClick={() => setVolumeState(12.0, 'compressing')} className="flex-1 py-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors">Max Push</button>
                <button onClick={() => setVolumeState(30.0, 'stable')} className="flex-1 py-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors">Mid (30mL)</button>
                <button onClick={() => setVolumeState(50.0, 'expanding')} className="flex-1 py-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors">Max Pull</button>
              </div>
            </div>
            <button onClick={toggleAutoCycle} className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${isPlaying ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-teal-500 hover:bg-teal-600 text-slate-950'}`}>
              {isPlaying ? <><Pause className="w-3.5 h-3.5" /> Pause Auto Cycle</> : <><Play className="w-3.5 h-3.5" /> Auto-Cycle Compression</>}
            </button>
            <div className="bg-teal-950/40 border-l-4 border-teal-400 rounded-r-xl p-3 text-[11px] leading-relaxed text-teal-100">
              {trend === 'compressing' && <p><strong>Compressing Gas:</strong> As volume drops to <span className="text-teal-300 font-mono font-bold">{volume.toFixed(1)} cm³</span>, gas molecules collide with the walls more frequently, driving pressure up to <span className="text-amber-400 font-mono font-bold">{pressure.toFixed(2)} atm</span>.</p>}
              {trend === 'expanding' && <p><strong>Expanding Gas:</strong> Pulling the plunger increases volume to <span className="text-teal-300 font-mono font-bold">{volume.toFixed(1)} cm³</span>. Particles hit the walls less frequently, dropping pressure to <span className="text-amber-400 font-mono font-bold">{pressure.toFixed(2)} atm</span>.</p>}
              {trend === 'stable' && <p><strong>Equilibrium State:</strong> Volume is <span className="text-teal-300 font-mono font-bold">{volume.toFixed(1)} cm³</span> and pressure is <span className="text-amber-400 font-mono font-bold">{pressure.toFixed(2)} atm</span>. The product <span className="font-mono text-purple-300">P × V = {(pressure * volume).toFixed(1)}</span> remains constant.</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-wider text-custom-blue bg-blue-50 px-2.5 py-1 rounded-full uppercase">Mathematical Derivation</span>
            <h3 className="text-lg font-bold text-gray-900 mt-2">P₁V₁ = P₂V₂ &nbsp;<span className="text-xs text-gray-400 font-normal">(At Constant Temperature & Mass)</span></h3>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between text-gray-600"><span>Initial State (Standard):</span><span className="font-bold text-gray-800">P₁ = 1.00 atm, V₁ = 50.0 cm³</span></div>
            <div className="flex justify-between text-gray-600"><span>Current State (Live):</span><span className="font-bold text-teal-700">P₂ = {pressure.toFixed(2)} atm, V₂ = {volume.toFixed(1)} cm³</span></div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl"><span className="font-bold">Constant Verification:</span><span className="font-bold">{P1.toFixed(2)} × {V1.toFixed(1)} = {(P1 * V1).toFixed(1)} ≡ {pressure.toFixed(2)} × {volume.toFixed(1)} = {(pressure * volume).toFixed(1)} ✓</span></div>
          </div>
        </div>
        <div className="lg:col-span-6 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs"><HelpCircle className="w-4 h-4 text-amber-600" />Quick Calculation Challenge</div>
          <p className="text-xs text-gray-700 leading-relaxed">A trapped gas occupies <strong className="text-gray-900">40.0 cm³</strong> at <strong className="text-gray-900">1.5 atm</strong>. What will its volume be if pressure is increased to <strong className="text-gray-900">3.0 atm</strong> at constant temperature?</p>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="number" placeholder="V₂ in cm³" value={practiceAns} onChange={(e) => setPracticeAns(e.target.value)} className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold focus:outline-custom-blue" />
            <button onClick={handleCheckPractice} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer">Check Answer</button>
            <button onClick={() => setShowSolution(!showSolution)} className="text-xs text-amber-800 font-semibold underline ml-auto cursor-pointer">{showSolution ? 'Hide Working' : 'Show Working'}</button>
          </div>
          {practiceStatus === 'correct' && <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs font-semibold"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />Correct! P₁V₁ = P₂V₂ → (1.5 × 40.0) / 3.0 = 20.0 cm³.</div>}
          {practiceStatus === 'incorrect' && <div className="text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs font-medium">Not quite. Use P₁V₁ = P₂V₂ → V₂ = (P₁ × V₁) / P₂. Try again!</div>}
          {showSolution && (
            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-amber-200 space-y-1 font-mono text-gray-700">
              <p>1. Given values: P₁ = 1.5 atm, V₁ = 40.0 cm³, P₂ = 3.0 atm</p>
              <p>2. Formula: P₁V₁ = P₂V₂</p>
              <p>3. Rearrange for V₂: V₂ = (P₁ × V₁) / P₂ = (1.5 × 40.0) / 3.0 = <strong>20.0 cm³</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
