import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Eye, EyeOff, CheckCircle2, HelpCircle, Flame, Snowflake, ChevronRight, ChevronLeft } from 'lucide-react';

export default function CharlesLawGuidedSim({ config = {}, onTelemetry }) {
  const T1C = 25; // 25°C baseline
  const T1K = T1C + 273; // 298 K
  const V1 = 50.0; // cm3 baseline

  const [tempC, setTempC] = useState(25);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playDir, setPlayDir] = useState(1);
  const [showParticles, setShowParticles] = useState(true);
  const [lastTemp, setLastTemp] = useState(25);
  const [currentStep, setCurrentStep] = useState(0); // 0 to 6
  const [predictedChoice, setPredictedChoice] = useState(null);
  const [practiceAns, setPracticeAns] = useState('');
  const [practiceStatus, setPracticeStatus] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  const NPART = 24;
  const particlesRef = useRef(
    Array.from({ length: NPART }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.015,
      vy: (Math.random() - 0.5) * 0.015,
    }))
  );

  const animFrameRef = useRef(null);
  const playTimerRef = useRef(null);

  // Derived metrics
  const tempK = tempC + 273;
  // V = V1 * (T / T1K)
  const volume = V1 * (tempK / T1K);

  // Particle animation
  useEffect(() => {
    const loop = () => {
      if (showParticles) {
        // particle velocity scales with sqrt(T_K / 298)
        const speedFactor = Math.max(0.2, Math.sqrt(tempK / 298));
        particlesRef.current.forEach((p) => {
          p.x += p.vx * speedFactor;
          p.y += p.vy * speedFactor;
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
  }, [showParticles, tempK]);

  // Auto-cycle loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setTempC((prev) => {
          let next = prev + playDir * 2.5;
          if (next >= 150) {
            next = 150;
            setPlayDir(-1);
          } else if (next <= -30) {
            next = -30;
            setPlayDir(1);
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
    const val = parseFloat(e.target.value);
    setLastTemp(tempC);
    setTempC(val);
  };

  const setTempCState = (val) => {
    setLastTemp(tempC);
    setTempC(val);
  };

  const toggleAutoCycle = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTempC(25);
    setLastTemp(25);
  };

  const handleCheckPractice = () => {
    const val = parseFloat(practiceAns);
    // Problem: V1 = 60.0 cm3 at 20°C (293 K), heated to 85°C (358 K)
    // V2 = (60.0 * 358) / 293 = 73.3 cm3
    if (!isNaN(val) && Math.abs(val - 73.3) <= 1.0) {
      setPracticeStatus('correct');
      if (typeof onTelemetry === 'function') {
        onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
          simulation: 'chem_charles_law_guided',
          score: 1.0,
        });
      }
    } else {
      setPracticeStatus('incorrect');
    }
  };

  // Cylinder/Piston geometry
  const barrelX = 80;
  const barrelYtop = 30;
  const barrelW = 140;
  const barrelHmax = 160;
  const frac = Math.max(0.18, Math.min(1.0, volume / (V1 * 1.7)));
  const gasH = barrelHmax * frac;
  const gasY = barrelYtop + (barrelHmax - gasH);
  const pistonY = gasY - 10;
  const flameColor = tempC >= 25 ? '#f97316' : '#38bdf8';

  // Graph geometry
  const pad = 44;
  const gw = 340;
  const gh = 230;
  const x0 = pad;
  const y0 = gh - pad;
  const x1 = gw - 16;
  const y1 = 20;
  const Tmax = 480; // K
  const VmaxG = 85; // cm3
  const sx = (t) => x0 + (t / Tmax) * (x1 - x0);
  const sy = (v) => y0 - (v / VmaxG) * (y0 - y1);

  // Steps definition
  const STEP_LABELS = ['Observe', 'Interact', 'Notice', 'Explain', 'Represent', 'Formalize', 'Apply'];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-slate-900">
      {/* 1. Unified Widescreen Thermal Chamber & Live V-T Graph Stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-orange-300 uppercase">
              Charles's Law Thermal Chamber & Live V–T Graph
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-orange-500/10 text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full">
              Pressure = 1.00 atm (Constant)
            </span>
            <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              V / T = {(volume / tempK).toFixed(3)} cm³/K
            </span>
          </div>
        </div>

        {/* 3-Column Unified Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
          {/* Column 1: Cylinder Apparatus & Bunsen/Ice Bath (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/90 rounded-2xl p-4 border border-slate-800/90 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                1. Thermal Chamber
              </span>
              <span className="text-[10px] font-mono text-orange-400">
                {tempC > 25 ? 'Heating (Expanded) ↑' : tempC < 25 ? 'Cooling (Contracted) ↓' : 'Equilibrium'}
              </span>
            </div>

            <div className="flex items-center justify-center my-auto py-1">
              <svg viewBox="0 0 300 270" className="w-full max-w-[280px] h-auto select-none">
                <defs>
                  <linearGradient id="charlesGasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={flameColor} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={flameColor} stopOpacity="0.08" />
                  </linearGradient>
                  <clipPath id="charlesGasClip">
                    <rect x={barrelX} y={gasY} width={barrelW} height={gasH} rx="4" />
                  </clipPath>
                </defs>

                {/* Cylinder Outer Housing */}
                <rect
                  x={barrelX - 4}
                  y={barrelYtop - 4}
                  width={barrelW + 8}
                  height={barrelHmax + 8}
                  rx="8"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2"
                  opacity="0.6"
                />

                {/* Gas Volume Chamber */}
                <rect
                  x={barrelX}
                  y={gasY}
                  width={barrelW}
                  height={gasH}
                  fill="url(#charlesGasGrad)"
                  rx="4"
                />

                {/* Gas Particles */}
                {showParticles && (
                  <g clipPath="url(#charlesGasClip)">
                    {particlesRef.current.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={barrelX + p.x * barrelW}
                        cy={gasY + p.y * gasH}
                        r="3.2"
                        fill={flameColor}
                        opacity="0.85"
                      />
                    ))}
                  </g>
                )}

                {/* Cylinder Outline */}
                <rect
                  x={barrelX}
                  y={barrelYtop}
                  width={barrelW}
                  height={barrelHmax}
                  rx="4"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2.5"
                />

                {/* Base Plate */}
                <rect
                  x={barrelX - 10}
                  y={barrelYtop + barrelHmax}
                  width={barrelW + 20}
                  height="10"
                  rx="3"
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="1.5"
                />

                {/* Movable Piston */}
                <rect
                  x={barrelX - 6}
                  y={pistonY}
                  width={barrelW + 12}
                  height="12"
                  rx="3"
                  fill="#ea580c"
                  stroke="#fb923c"
                  strokeWidth="1.5"
                />
                <rect
                  x={barrelX + barrelW / 2 - 5}
                  y={pistonY - 32}
                  width="10"
                  height="32"
                  fill="#94a3b8"
                />
                <rect
                  x={barrelX + barrelW / 2 - 22}
                  y={pistonY - 40}
                  width="44"
                  height="8"
                  rx="3"
                  fill="#64748b"
                />

                {/* Heat Source or Ice Bath */}
                {tempC >= 25 ? (
                  <g transform={`translate(${barrelX + barrelW / 2}, ${barrelYtop + barrelHmax + 20})`}>
                    <path
                      d="M -18 18 Q -10 -4 0 -18 Q 10 -4 18 18 Q 0 10 -18 18 Z"
                      fill="#f97316"
                      opacity="0.9"
                    />
                    <path
                      d="M -10 18 Q -4 4 0 -8 Q 4 4 10 18 Q 0 14 -10 18 Z"
                      fill="#facc15"
                    />
                    <text x="0" y="32" textAnchor="middle" fill="#fdba74" fontSize="9" fontFamily="monospace">
                      BUNSEN FLAME 🔥
                    </text>
                  </g>
                ) : (
                  <g transform={`translate(${barrelX + barrelW / 2}, ${barrelYtop + barrelHmax + 18})`}>
                    <rect x="-35" y="0" width="70" height="20" rx="4" fill="#0284c7" opacity="0.6" />
                    <text x="0" y="14" textAnchor="middle" fill="#e0f2fe" fontSize="9" fontFamily="monospace">
                      ICE BATH ❄️
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-[11px] font-mono text-center text-slate-400">
              Constant Mass & Pressure · Direct Thermal Expansion
            </div>
          </div>

          {/* Column 2: Live V-T Graph with Absolute Zero Extrapolation (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/90 rounded-2xl p-4 border border-slate-800/90 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                2. Live V–T Graph (Kelvin)
              </span>
              <span className="text-[10px] font-mono bg-orange-500/10 text-orange-300 px-2 py-0.5 rounded border border-orange-500/20">
                V ∝ T
              </span>
            </div>

            <div className="flex items-center justify-center my-auto py-1">
              <svg viewBox={`0 0 ${gw} ${gh}`} className="w-full max-w-[320px] h-auto">
                <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="#64748b" strokeWidth="1.5" />
                <line x1={x0} y1={y0} x2={x0} y2={y1} stroke="#64748b" strokeWidth="1.5" />

                <text x={(x0 + x1) / 2} y={gh - 8} textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                  Temperature T (Kelvin)
                </text>
                <text x={12} y={(y0 + y1) / 2} textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace" transform={`rotate(-90 12 ${(y0 + y1) / 2})`}>
                  Volume V (cm³)
                </text>

                {/* Linear Curve through (0,0) */}
                <line
                  x1={sx(0)}
                  y1={sy(0)}
                  x2={sx(460)}
                  y2={sy(460 * (V1 / T1K))}
                  stroke="#f97316"
                  strokeWidth="2.5"
                />

                {/* Origin Tick / 0 K mark */}
                <text x={sx(0)} y={y0 + 14} textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  0K
                </text>
                <text x={sx(273)} y={y0 + 14} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                  273K
                </text>
                <text x={sx(373)} y={y0 + 14} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                  373K
                </text>

                {/* Live Tracking Crosshairs & Point */}
                <line
                  x1={sx(tempK)}
                  y1={sy(volume)}
                  x2={sx(tempK)}
                  y2={y0}
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <line
                  x1={x0}
                  y1={sy(volume)}
                  x2={sx(tempK)}
                  y2={sy(volume)}
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={sx(tempK)}
                  cy={sy(volume)}
                  r="6"
                  fill="#38bdf8"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-[10px] font-mono text-center text-orange-300">
              Live Coordinate: ({tempK} K, {volume.toFixed(1)} cm³) · Extrapolates to 0 K
            </div>
          </div>

          {/* Column 3: Controls & Telemetry Deck (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3 bg-slate-950/70 rounded-2xl p-4 border border-slate-800/70">
            {/* Live Readouts */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between text-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Temp (°C)</span>
                <div className="mt-0.5 text-lg font-bold font-mono text-orange-400">
                  {tempC}°C
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between text-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Temp (K)</span>
                <div className="mt-0.5 text-lg font-bold font-mono text-purple-300">
                  {tempK} <span className="text-[10px] font-normal text-slate-400">K</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between text-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Volume</span>
                <div className="mt-0.5 text-lg font-bold font-mono text-teal-300">
                  {volume.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">cm³</span>
                </div>
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-200">Adjust Temperature</span>
                <span className="text-orange-300 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                  T = {tempC}°C ({tempK} K)
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="180"
                step="1"
                value={tempC}
                onChange={handleSliderChange}
                className="w-full accent-orange-400 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Freeze (-30°C)</span>
                <span>Flame (180°C)</span>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => setTempCState(0)}
                  className="flex-1 py-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                >
                  Ice (0°C)
                </button>
                <button
                  onClick={() => setTempCState(25)}
                  className="flex-1 py-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                >
                  Room (25°C)
                </button>
                <button
                  onClick={() => setTempCState(100)}
                  className="flex-1 py-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                >
                  Boil (100°C)
                </button>
              </div>
            </div>

            {/* Auto Cycle & Reset */}
            <div className="flex gap-2">
              <button
                onClick={toggleAutoCycle}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-orange-500 hover:bg-orange-600 text-slate-950'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Cycle
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Auto-Cycle Heat
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset to 25°C"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Kinetic Observation Narrative */}
            <div className="bg-orange-950/40 border-l-4 border-orange-400 rounded-r-xl p-3 text-[11px] leading-relaxed text-orange-100">
              <p>
                <strong>Kinetic Observation:</strong>{' '}
                {tempC > 25
                  ? `Heating to ${tempK} K boosts particle kinetic energy (KE = ½mv²). Faster collisions push the piston outward to ${volume.toFixed(1)} cm³.`
                  : tempC < 25
                  ? `Cooling to ${tempK} K slows particle motion. Collisions weaken, allowing 1 atm atmospheric pressure to compress the piston to ${volume.toFixed(1)} cm³.`
                  : `At 298 K (25°C), the trapped gas maintains its standard equilibrium volume of 50.0 cm³.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step Guided Navigation Rail */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Step Navigation Rail */}
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2 border-b border-gray-100">
          {STEP_LABELS.map((label, idx) => (
            <button
              key={label}
              onClick={() => setCurrentStep(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                currentStep === idx
                  ? 'bg-orange-500 text-white shadow-xs'
                  : currentStep > idx
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${
                currentStep === idx ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {currentStep > idx ? '✓' : idx + 1}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Step Content Cards */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <span className="text-[11px] font-mono font-bold text-orange-600 uppercase tracking-wider">Step 1 · Observe</span>
            <h3 className="text-xl font-bold text-gray-900">Meet the Experimental Setup</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
              A fixed mass of gas is trapped inside a cylinder fitted with a frictionless, movable piston. 
              The external atmospheric pressure is constant at <strong>1.00 atm</strong>. As we heat or cool the cylinder,
              the piston can move freely to adjust volume.
            </p>
            <div className="bg-orange-50/60 border border-orange-200/60 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-orange-950">Make a prediction: If we heat the gas, what will happen to the piston?</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setPredictedChoice('expand')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    predictedChoice === 'expand' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Piston pushes outward (Expands)
                </button>
                <button
                  onClick={() => setPredictedChoice('contract')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    predictedChoice === 'contract' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Piston moves inward (Contracts)
                </button>
              </div>
              {predictedChoice === 'expand' && (
                <p className="text-xs text-emerald-800 font-medium">✓ Correct hypothesis! Heat increases particle kinetic energy, expanding the volume.</p>
              )}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <span className="text-[11px] font-mono font-bold text-orange-600 uppercase tracking-wider">Step 2 · Interact</span>
            <h3 className="text-xl font-bold text-gray-900">Heat and Cool the Gas</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
              Drag the temperature slider in the simulator above. Heat it up past 100°C, then cool it down below 0°C. 
              Notice how the piston height responds immediately to your temperature changes.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 font-mono">
              Current temperature: <strong>{tempC}°C ({tempK} K)</strong> → Current volume: <strong>{volume.toFixed(1)} cm³</strong>.
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <span className="text-[11px] font-mono font-bold text-orange-600 uppercase tracking-wider">Step 3 · Notice</span>
            <h3 className="text-xl font-bold text-gray-900">Variables Move in the Same Direction</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
              Unlike Boyle's Law where pressure and volume moved oppositely, in Charles's Law temperature and volume move <strong>together</strong>:
              Temperature ↑ leads to Volume ↑. Temperature ↓ leads to Volume ↓.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl text-xs">
                <span className="font-bold text-orange-900">Independent Variable</span>
                <p className="text-orange-700 font-semibold mt-1">Temperature (T in Kelvin)</p>
              </div>
              <div className="bg-teal-50 border border-teal-200 p-3.5 rounded-2xl text-xs">
                <span className="font-bold text-teal-900">Dependent Variable</span>
                <p className="text-teal-700 font-semibold mt-1">Volume (V in cm³)</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <span className="text-[11px] font-mono font-bold text-orange-600 uppercase tracking-wider">Step 4 · Explain</span>
            <h3 className="text-xl font-bold text-gray-900">Microscopic Kinetic Theory Explanation</h3>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 text-sm text-gray-800 space-y-2">
              <p>
                <strong>1. Higher Kinetic Energy:</strong> Heating increases the average kinetic energy (<code className="font-mono">KE = ½mv²</code>) of the gas molecules.
              </p>
              <p>
                <strong>2. Harder & More Frequent Collisions:</strong> Faster-moving particles collide with the walls and piston with greater force.
              </p>
              <p>
                <strong>3. Piston Expansion:</strong> To keep internal pressure equal to external atmospheric pressure (1 atm), the piston pushes outward until the gas occupies a larger volume.
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <span className="text-[11px] font-mono font-bold text-orange-600 uppercase tracking-wider">Step 5 · Represent</span>
            <h3 className="text-xl font-bold text-gray-900">Volume–Temperature Graph & Absolute Zero (0 K)</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              When volume is plotted against temperature in <strong>Kelvin</strong>, it forms a straight line passing directly through the origin (0 K, -273°C).
            </p>
            <div className="bg-slate-950 rounded-2xl p-4 flex flex-col items-center max-w-xl mx-auto">
              <svg viewBox={`0 0 ${gw} ${gh}`} className="w-full h-auto">
                <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="#64748b" strokeWidth="1.5" />
                <line x1={x0} y1={y0} x2={x0} y2={y1} stroke="#64748b" strokeWidth="1.5" />
                <text x={(x0 + x1) / 2} y={gh - 8} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Temperature T (Kelvin)
                </text>
                <text x={12} y={(y0 + y1) / 2} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" transform={`rotate(-90 12 ${(y0 + y1) / 2})`}>
                  Volume V (cm³)
                </text>
                {/* Straight line through (0,0) */}
                <line x1={sx(0)} y1={sy(0)} x2={sx(450)} y2={sy(450 * (V1 / T1K))} stroke="#f97316" strokeWidth="2.5" />
                {/* Current point */}
                <circle cx={sx(tempK)} cy={sy(volume)} r="6" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
                <line x1={sx(tempK)} y1={sy(volume)} x2={sx(tempK)} y2={y0} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={x0} y1={sy(volume)} x2={sx(tempK)} y2={sy(volume)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <span className="text-[11px] font-mono font-bold text-orange-600 uppercase tracking-wider">Step 6 · Formalize</span>
            <h3 className="text-xl font-bold text-gray-900">Charles's Law Mathematical Formula</h3>
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 text-center space-y-2">
              <div className="text-3xl font-extrabold font-serif text-orange-400 tracking-wide">
                V₁ / T₁ = V₂ / T₂
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Temperatures MUST always be converted to Kelvin: <code className="text-teal-300">T(K) = T(°C) + 273</code>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-700 flex justify-between items-center">
              <span>Current Ratio Verification:</span>
              <span className="font-bold text-emerald-700">
                {V1.toFixed(1)} / {T1K} = {(V1 / T1K).toFixed(4)} ≡ {volume.toFixed(1)} / {tempK} = {(volume / tempK).toFixed(4)} ✓
              </span>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-4">
            <span className="text-[11px] font-mono font-bold text-orange-600 uppercase tracking-wider">Step 7 · Apply</span>
            <h3 className="text-xl font-bold text-gray-900">Solve a Charles's Law Problem</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                A sample of gas has a volume of <strong>60.0 cm³</strong> at <strong>20°C</strong>. What will its volume be when heated to <strong>85°C</strong> at constant pressure?
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="number"
                  placeholder="V₂ in cm³"
                  value={practiceAns}
                  onChange={(e) => setPracticeAns(e.target.value)}
                  className="w-36 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold focus:outline-orange-500"
                />
                <button
                  onClick={handleCheckPractice}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Check Answer
                </button>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="text-xs text-orange-800 font-semibold underline ml-auto cursor-pointer"
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
              </div>

              {practiceStatus === 'correct' && (
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Correct! T₁ = 293 K, T₂ = 358 K → V₂ = (60.0 × 358) / 293 = 73.3 cm³.
                </div>
              )}
              {practiceStatus === 'incorrect' && (
                <div className="text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs font-medium">
                  Remember to convert temperatures from °C to K (add 273) before using V₁/T₁ = V₂/T₂. Try again!
                </div>
              )}

              {showSolution && (
                <div className="text-xs bg-white p-3.5 rounded-xl border border-amber-200 space-y-1.5 font-mono text-gray-700">
                  <p>1. Convert to Kelvin: T₁ = 20 + 273 = 293 K, T₂ = 85 + 273 = 358 K</p>
                  <p>2. Charles's Law: V₁ / T₁ = V₂ / T₂</p>
                  <p>3. Rearrange for V₂: V₂ = (V₁ × T₂) / T₁ = (60.0 × 358) / 293 = <strong>73.3 cm³</strong></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setCurrentStep((prev) => Math.min(STEP_LABELS.length - 1, prev + 1))}
            disabled={currentStep === STEP_LABELS.length - 1}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
