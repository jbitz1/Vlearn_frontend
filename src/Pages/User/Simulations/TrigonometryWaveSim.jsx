import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, RefreshCw, CheckCircle2, Sliders, Target, Eye } from 'lucide-react';

export default function TrigonometryWaveSim({ config = {}, onTelemetry }) {
  const [funcType, setFuncType] = useState('sin'); // 'sin' | 'cos'
  const [amp, setAmp] = useState(1); // Amplitude A (0.5 to 3.0)
  const [freq, setFreq] = useState(1); // Frequency B (1 to 4)
  const [phase, setPhase] = useState(0); // Phase shift C (-90 to +90 deg)
  const [vert, setVert] = useState(0); // Vertical shift D (-2 to +2)
  const [targetK, setTargetK] = useState(0.5); // Target line y = k (-3 to +3)
  const [showTargetLine, setShowTargetLine] = useState(true);

  const [unitAngle, setUnitAngle] = useState(45); // Angle theta on Unit Circle (0 to 360)

  const [exploredFeatures, setExploredFeatures] = useState({
    amplitude: false,
    period: false,
    phase: false,
    roots: false,
  });

  useEffect(() => {
    if (amp !== 1) setExploredFeatures(prev => ({ ...prev, amplitude: true }));
    if (freq !== 1) setExploredFeatures(prev => ({ ...prev, period: true }));
    if (phase !== 0) setExploredFeatures(prev => ({ ...prev, phase: true }));
    if (showTargetLine) setExploredFeatures(prev => ({ ...prev, roots: true }));
  }, [amp, freq, phase, showTargetLine]);

  const allCompleted = exploredFeatures.amplitude && exploredFeatures.period && exploredFeatures.phase && exploredFeatures.roots;

  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_trigonometry_wave_explorer',
        message: 'Student mastered wave parameters (A, B, C, D), unit circle identities, and graphical equation root solving.',
      });
    }
  }, [allCompleted, onTelemetry]);

  // Calculations
  const period = 360 / freq;
  const phaseShiftDeg = -phase / freq;
  const maxY = vert + amp;
  const minY = vert - amp;

  // Wave function y = A * sin/cos(B * x + C) + D
  const evalWave = (xDeg) => {
    const rad = ((freq * xDeg + phase) * Math.PI) / 180;
    const trigVal = funcType === 'sin' ? Math.sin(rad) : Math.cos(rad);
    return amp * trigVal + vert;
  };

  // Find root intersections for y = targetK in x in [0, 360]
  const roots = [];
  if (showTargetLine && targetK >= minY && targetK <= maxY) {
    for (let x = 0; x <= 360; x += 0.5) {
      const y1 = evalWave(x);
      const y2 = evalWave(x + 0.5);
      if ((y1 - targetK) * (y2 - targetK) <= 0) {
        roots.push(Math.round(x * 10) / 10);
      }
    }
  }
  // Deduplicate close roots
  const uniqueRoots = roots.filter((r, i, arr) => i === 0 || Math.abs(r - arr[i - 1]) > 2);

  // SVG Coordinates for Wave Canvas (440 x 260)
  const WAVE_W = 440;
  const WAVE_H = 260;
  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = 20;
  const MARGIN_TOP = 20;
  const MARGIN_BOTTOM = 30;

  const toSvgX = (xDeg) => MARGIN_LEFT + (xDeg / 360) * (WAVE_W - MARGIN_LEFT - MARGIN_RIGHT);
  const toSvgY = (yVal) => WAVE_H / 2 - (yVal / 3.5) * (WAVE_H / 2 - MARGIN_TOP);

  // Generate Wave Path SVG string
  let wavePathD = '';
  for (let x = 0; x <= 360; x += 2) {
    const y = evalWave(x);
    const sx = toSvgX(x);
    const sy = toSvgY(y);
    wavePathD += `${x === 0 ? 'M' : 'L'} ${sx} ${sy} `;
  }

  // Unit Circle SVG Coordinates (Canvas 160 x 160)
  const CIRCLE_SIZE = 160;
  const CIRCLE_CENTER = CIRCLE_SIZE / 2;
  const CIRCLE_R = 55;

  const radUnit = (unitAngle * Math.PI) / 180;
  const unitCos = Math.cos(radUnit);
  const unitSin = Math.sin(radUnit);
  const pointX = CIRCLE_CENTER + unitCos * CIRCLE_R;
  const pointY = CIRCLE_CENTER - unitSin * CIRCLE_R;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-custom-forest/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-sans">
              Interactive Math Explorer
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            Trigonometric Wave Transformations &amp; Equation Solver
          </h3>
        </div>

        {/* Function Selector */}
        <div className="flex items-center bg-slate-800 p-1.5 rounded-full border border-slate-700">
          <button
            onClick={() => setFuncType('sin')}
            className={`px-5 py-2 rounded-full font-bold text-xs transition-all ${
              funcType === 'sin'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Sine Wave: y = A sin(Bx + C) + D
          </button>
          <button
            onClick={() => setFuncType('cos')}
            className={`px-5 py-2 rounded-full font-bold text-xs transition-all ${
              funcType === 'cos'
                ? 'bg-cyan-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Cosine Wave: y = A cos(Bx + C) + D
          </button>
        </div>
      </div>

      {/* Main Grid: Wave Controls + Dual Visualizer Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Wave Parameter Sliders & Root Finder (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Wave Parameter Sliders */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Wave Transformation Sliders
            </span>

            {/* Amplitude A */}
            <div className="text-xs font-mono">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Amplitude (A):</span>
                <span className="text-emerald-400 font-bold">{amp}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={amp}
                onChange={(e) => setAmp(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Frequency B */}
            <div className="text-xs font-mono">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Frequency (B) → Period:</span>
                <span className="text-cyan-400 font-bold">B = {freq} (T = {period}°)</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={freq}
                onChange={(e) => setFreq(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Phase Shift C */}
            <div className="text-xs font-mono">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Phase Angle (C) → Shift:</span>
                <span className="text-amber-400 font-bold">C = {phase}° (Shift = {phaseShiftDeg > 0 ? `+${phaseShiftDeg}` : phaseShiftDeg}°)</span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                step="15"
                value={phase}
                onChange={(e) => setPhase(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Vertical Shift D */}
            <div className="text-xs font-mono">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Vertical Shift (D):</span>
                <span className="text-violet-400 font-bold">D = {vert}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.5"
                value={vert}
                onChange={(e) => setVert(parseFloat(e.target.value))}
                className="w-full accent-violet-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Root-Cutting Equation Solver (y = k) */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Graphical Equation Solver: {funcType === 'sin' ? 'sin' : 'cos'} wave = k
              </span>
              <button
                onClick={() => setShowTargetLine(!showTargetLine)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                {showTargetLine ? 'Hide Line' : 'Show Line'}
              </button>
            </div>

            {showTargetLine && (
              <>
                <div className="text-xs font-mono">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Target Level (k):</span>
                    <span className="text-amber-400 font-bold">y = {targetK}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.5"
                    max="2.5"
                    step="0.25"
                    value={targetK}
                    onChange={(e) => setTargetK(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 font-mono text-xs space-y-1">
                  <span className="text-slate-400 block font-sans font-bold">Intersection Roots in [0°, 360°]:</span>
                  {uniqueRoots.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {uniqueRoots.map((r, i) => (
                        <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold">
                          x_{i + 1} = {r}°
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-red-400 italic">No real root intersections (k is outside wave range [{minY}, {maxY}]).</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Dual Visualizer Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Wave Plotter SVG Canvas */}
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 w-full flex flex-col items-center shadow-inner">
            <svg width={WAVE_W} height={WAVE_H} className="overflow-visible">
              {/* Grid Lines */}
              {Array.from({ length: 5 }).map((_, i) => {
                const deg = i * 90;
                return (
                  <g key={`deg-${i}`}>
                    <line x1={toSvgX(deg)} y1={MARGIN_TOP} x2={toSvgX(deg)} y2={WAVE_H - MARGIN_BOTTOM} stroke="#1e293b" strokeWidth="1" />
                    <text x={toSvgX(deg)} y={WAVE_H - MARGIN_BOTTOM + 16} fill="#64748b" fontSize="10" textAnchor="middle">{deg}°</text>
                  </g>
                );
              })}

              {/* Y Axis Grid */}
              {[-3, -2, -1, 0, 1, 2, 3].map((val) => (
                <g key={`y-${val}`}>
                  <line x1={MARGIN_LEFT} y1={toSvgY(val)} x2={WAVE_W - MARGIN_RIGHT} y2={toSvgY(val)} stroke={val === 0 ? '#475569' : '#1e293b'} strokeWidth={val === 0 ? 2 : 1} />
                  <text x={MARGIN_LEFT - 8} y={toSvgY(val) + 3} fill="#64748b" fontSize="10" textAnchor="end">{val}</text>
                </g>
              ))}

              {/* Wave Curve */}
              <path d={wavePathD} fill="none" stroke="#10b981" strokeWidth="3.5" />

              {/* Target Line y = k */}
              {showTargetLine && (
                <g>
                  <line x1={MARGIN_LEFT} y1={toSvgY(targetK)} x2={WAVE_W - MARGIN_RIGHT} y2={toSvgY(targetK)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
                  <text x={WAVE_W - MARGIN_RIGHT - 5} y={toSvgY(targetK) - 6} fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="end">y = {targetK}</text>

                  {/* Highlight Root Intersection Circles */}
                  {uniqueRoots.map((rDeg, i) => (
                    <circle key={`root-${i}`} cx={toSvgX(rDeg)} cy={toSvgY(targetK)} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  ))}
                </g>
              )}
            </svg>
            <div className="flex items-center justify-between w-full mt-2 text-xs text-slate-400 font-mono px-2">
              <span>Max: {maxY} | Min: {minY}</span>
              <span>Period T = {period}°</span>
            </div>
          </div>

          {/* Unit Circle Mini Explorer */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} className="overflow-visible">
                {/* Circle */}
                <circle cx={CIRCLE_CENTER} cy={CIRCLE_CENTER} r={CIRCLE_R} fill="rgba(15,23,42,0.8)" stroke="#38bdf8" strokeWidth="2" />
                {/* Axes */}
                <line x1={CIRCLE_CENTER - CIRCLE_R - 10} y1={CIRCLE_CENTER} x2={CIRCLE_CENTER + CIRCLE_R + 10} y2={CIRCLE_CENTER} stroke="#334155" />
                <line x1={CIRCLE_CENTER} y1={CIRCLE_CENTER - CIRCLE_R - 10} x2={CIRCLE_CENTER} y2={CIRCLE_CENTER + CIRCLE_R + 10} stroke="#334155" />

                {/* Radius Line & Point */}
                <line x1={CIRCLE_CENTER} y1={CIRCLE_CENTER} x2={pointX} y2={pointY} stroke="#facc15" strokeWidth="2.5" />
                <circle cx={pointX} cy={pointY} r="5" fill="#facc15" />
                {/* Perpendicular for Sin/Cos */}
                <line x1={pointX} y1={pointY} x2={pointX} y2={CIRCLE_CENTER} stroke="#10b981" strokeDasharray="3 2" strokeWidth="1.5" />
              </svg>

              <div className="space-y-1 font-mono text-xs">
                <span className="text-slate-400 font-sans font-bold text-xs uppercase block">Unit Circle Identity (r = 1)</span>
                <p className="text-slate-300">Angle θ = <strong className="text-amber-400">{unitAngle}°</strong></p>
                <p className="text-cyan-400">cos({unitAngle}°) = {Math.round(unitCos * 100) / 100}</p>
                <p className="text-emerald-400">sin({unitAngle}°) = {Math.round(unitSin * 100) / 100}</p>
                <p className="text-slate-400 text-[11px]">cos²θ + sin²θ = 1.00</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <label className="text-xs text-slate-400 font-mono mb-1">Rotate θ</label>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={unitAngle}
                onChange={(e) => setUnitAngle(parseInt(e.target.value))}
                className="w-24 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div className="mt-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
            Key Learning Insight: The Wave-Cutting Root Principle
          </h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            Solving <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">y = k</code> graphically means finding where the horizontal line <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">y = k</code> cuts the wave! For any level <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">-1 ≤ k ≤ 1</code>, there are two roots in each full period <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">T = 360° / B</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
