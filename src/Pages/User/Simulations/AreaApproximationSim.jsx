import React, { useState, useEffect, useRef } from 'react';
import { Grid, BarChart2, Layers, Sparkles } from 'lucide-react';

export default function AreaApproximationSim({ config = {}, onTelemetry }) {
  const [mode, setMode] = useState('bounding');
  // 'bounding' | 'trapezium' | 'midordinate' | 'comparative'

  const [funcPreset, setFuncPreset] = useState('quadratic');
  const [strips, setStrips] = useState(4);
  const [lowerA] = useState(0);
  const [upperB] = useState(4);

  const [exploredFeatures, setExploredFeatures] = useState({
    bounding: false, trapezium: false, midordinate: false, comparative: false,
  });

  useEffect(() => {
    setExploredFeatures(p => ({ ...p, [mode]: true }));
  }, [mode]);

  const allDone = Object.values(exploredFeatures).every(Boolean);
  useEffect(() => {
    if (allDone && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_area_approximation_explorer',
        message: 'Student mastered rectangular bounds, trapezium rule, mid-ordinate rule, and comparative error analysis.',
      });
    }
  }, [allDone, onTelemetry]);

  // Canvas
  const SZ = 360, M = 44;
  const PW = SZ - 2 * M, PH = SZ - 2 * M;
  const MIN_X = 0, MAX_X = 4, MIN_Y = 0, MAX_Y = 22;
  const sx = x => M + ((x - MIN_X) / (MAX_X - MIN_X)) * PW;
  const sy = y => SZ - M - ((y - MIN_Y) / (MAX_Y - MIN_Y)) * PH;

  const evalF = x => {
    if (funcPreset === 'quadratic') return x * x - 2 * x + 5;
    if (funcPreset === 'cubic')     return 0.5 * x * x * x - x * x + 3;
    return 10 / (x + 0.5);
  };

  const exactIntegral = (() => {
    const n = 400;
    let sum = 0, dx = (upperB - lowerA) / n;
    for (let i = 0; i <= n; i++) {
      const w = i === 0 || i === n ? 0.5 : 1;
      sum += w * evalF(lowerA + i * dx) * dx;
    }
    return sum;
  })();

  const h = (upperB - lowerA) / strips;

  // ── Bounding rectangles (lower + upper) ──
  const lowerSum = (() => {
    let s = 0;
    for (let i = 0; i < strips; i++) {
      const xL = lowerA + i * h, xR = xL + h;
      s += Math.min(evalF(xL), evalF(xR)) * h;
    }
    return s;
  })();

  const upperSum = (() => {
    let s = 0;
    for (let i = 0; i < strips; i++) {
      const xL = lowerA + i * h, xR = xL + h;
      s += Math.max(evalF(xL), evalF(xR)) * h;
    }
    return s;
  })();

  // ── Trapezium rule ──
  const trapeziumArea = (() => {
    let s = 0;
    for (let i = 0; i < strips; i++) {
      const xL = lowerA + i * h, xR = xL + h;
      s += 0.5 * (evalF(xL) + evalF(xR)) * h;
    }
    return s;
  })();

  // ── Mid-ordinate rule ──
  const midOrdinateArea = (() => {
    let s = 0;
    for (let i = 0; i < strips; i++) {
      const xMid = lowerA + (i + 0.5) * h;
      s += evalF(xMid) * h;
    }
    return s;
  })();

  // ── Curve polyline ──
  const curvePts = Array.from({ length: 101 }, (_, i) => {
    const x = MIN_X + (i / 100) * (MAX_X - MIN_X);
    const y = evalF(x);
    return `${sx(x)},${sy(Math.min(y, MAX_Y))}`;
  }).join(' ');

  // x-axis tick labels
  const xTicks = Array.from({ length: strips + 1 }, (_, i) => lowerA + i * h);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-sans">
              Area Approximation Explorer
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            Rectangular Bounds · Trapezium · Mid-Ordinate · Error Analysis
          </h3>
        </div>
        {/* Mode tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 font-mono text-xs overflow-x-auto">
          {[
            { id: 'bounding',     label: 'Rect. Bounds' },
            { id: 'trapezium',    label: 'Trapezium' },
            { id: 'midordinate',  label: 'Mid-Ordinate' },
            { id: 'comparative',  label: 'Error Compare' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                mode === m.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-5">

          {/* Function selector */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Select Function f(x)</span>
            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
              {[
                { id: 'quadratic', label: 'f(x) = x² − 2x + 5' },
                { id: 'cubic',     label: 'f(x) = ½x³ − x² + 3' },
                { id: 'rational',  label: 'f(x) = 10 / (x + 0.5)' },
              ].map(p => (
                <button key={p.id} onClick={() => setFuncPreset(p.id)}
                  className={`p-2.5 rounded-xl border font-bold transition-all text-left ${
                    funcPreset === p.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Strip count slider (not for comparative) */}
          {mode !== 'comparative' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/30 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">Number of Strips n</span>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>n = <span className="text-amber-300 font-bold">{strips}</span></span>
                <span>h = {h.toFixed(3)} (strip width)</span>
              </div>
              <input type="range" min="2" max="20" step="1" value={strips}
                onChange={e => setStrips(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer" />

              {/* Results */}
              <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/20 space-y-1.5 text-xs font-mono">
                <p className="text-slate-400">Exact integral ≈ <span className="text-white font-bold">{exactIntegral.toFixed(4)}</span></p>
                {mode === 'bounding' && <>
                  <p className="text-sky-400">Lower bound = <span className="font-bold">{lowerSum.toFixed(4)}</span>  (underestimate)</p>
                  <p className="text-rose-400">Upper bound = <span className="font-bold">{upperSum.toFixed(4)}</span>  (overestimate)</p>
                  <p className="text-slate-300 text-[11px]">{lowerSum.toFixed(3)} &lt; Exact &lt; {upperSum.toFixed(3)}</p>
                </>}
                {mode === 'trapezium' && <>
                  <p className="text-emerald-400">Trapezium area = <span className="font-bold">{trapeziumArea.toFixed(4)}</span></p>
                  <p className="text-slate-300 text-[11px]">Error = {Math.abs(trapeziumArea - exactIntegral).toFixed(4)}</p>
                </>}
                {mode === 'midordinate' && <>
                  <p className="text-fuchsia-400">Mid-ordinate area = <span className="font-bold">{midOrdinateArea.toFixed(4)}</span></p>
                  <p className="text-slate-300 text-[11px]">Error = {Math.abs(midOrdinateArea - exactIntegral).toFixed(4)}</p>
                </>}
              </div>
            </div>
          )}

          {/* Comparative table */}
          {mode === 'comparative' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-fuchsia-500/30 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400 block">Error Comparison (n = 8 strips)</span>
              <div className="text-xs font-mono space-y-2">
                {(() => {
                  const n8 = 8, h8 = (upperB - lowerA) / n8;
                  let trap = 0, mid = 0, lo = 0, hi = 0;
                  for (let i = 0; i < n8; i++) {
                    const xL = lowerA + i * h8, xR = xL + h8, xM = xL + h8 / 2;
                    trap += 0.5 * (evalF(xL) + evalF(xR)) * h8;
                    mid  += evalF(xM) * h8;
                    lo   += Math.min(evalF(xL), evalF(xR)) * h8;
                    hi   += Math.max(evalF(xL), evalF(xR)) * h8;
                  }
                  const rows = [
                    { label: 'Lower Rect.', val: lo,   color: 'text-sky-400',     err: Math.abs(lo - exactIntegral) },
                    { label: 'Upper Rect.', val: hi,   color: 'text-rose-400',    err: Math.abs(hi - exactIntegral) },
                    { label: 'Trapezium',   val: trap, color: 'text-emerald-400', err: Math.abs(trap - exactIntegral) },
                    { label: 'Mid-Ordinate',val: mid,  color: 'text-fuchsia-400', err: Math.abs(mid - exactIntegral) },
                    { label: 'Exact',       val: exactIntegral, color:'text-amber-300', err: 0 },
                  ];
                  return (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-700 text-[11px]">
                          <th className="text-left pb-1">Method</th>
                          <th className="text-right pb-1">Area</th>
                          <th className="text-right pb-1">|Error|</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.label} className={`${r.color} border-b border-slate-800/60`}>
                            <td className="py-1.5 font-bold">{r.label}</td>
                            <td className="py-1.5 text-right">{r.val.toFixed(3)}</td>
                            <td className="py-1.5 text-right text-slate-300">{r.err > 0 ? r.err.toFixed(3) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
                <p className="text-amber-300 font-bold text-[11px] pt-1">Mid-Ordinate typically gives LESS error than Trapezium for convex curves!</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 shadow-inner">
            <svg width={SZ} height={SZ} className="overflow-visible w-full" viewBox={`0 0 ${SZ} ${SZ}`}>
              {/* Axes */}
              <line x1={M} y1={sy(0)} x2={SZ - M + 10} y2={sy(0)} stroke="#475569" strokeWidth="2"/>
              <line x1={sx(0)} y1={M} x2={sx(0)} y2={SZ - M + 10} stroke="#475569" strokeWidth="2"/>
              {/* Axis labels */}
              <text x={SZ - M + 14} y={sy(0) + 4} fill="#64748b" fontSize="12" fontWeight="bold">x</text>
              <text x={sx(0) - 4} y={M - 8} fill="#64748b" fontSize="12" fontWeight="bold">y</text>

              {/* x-axis ticks */}
              {xTicks.map((xv, i) => (
                <g key={i}>
                  <line x1={sx(xv)} y1={sy(0)} x2={sx(xv)} y2={sy(0) + 5} stroke="#475569" strokeWidth="1.5"/>
                  <text x={sx(xv)} y={sy(0) + 16} fill="#64748b" fontSize="10" textAnchor="middle">{xv.toFixed(1)}</text>
                </g>
              ))}

              {/* ── BOUNDING RECTANGLES ── */}
              {mode === 'bounding' && Array.from({ length: strips }, (_, i) => {
                const xL = lowerA + i * h, xR = xL + h;
                const yLow = Math.min(evalF(xL), evalF(xR));
                const yHigh = Math.max(evalF(xL), evalF(xR));
                return (
                  <g key={i}>
                    {/* lower (blue) */}
                    <rect x={sx(xL)} y={sy(yLow)} width={sx(xR) - sx(xL)} height={sy(0) - sy(yLow)}
                      fill="#38bdf8" opacity="0.20" stroke="#38bdf8" strokeWidth="1.2"/>
                    {/* upper (red) */}
                    <rect x={sx(xL)} y={sy(yHigh)} width={sx(xR) - sx(xL)} height={sy(yLow) - sy(yHigh)}
                      fill="#f87171" opacity="0.18" stroke="#f87171" strokeWidth="1" strokeDasharray="3 2"/>
                  </g>
                );
              })}

              {/* ── TRAPEZIUM RULE ── */}
              {mode === 'trapezium' && Array.from({ length: strips }, (_, i) => {
                const xL = lowerA + i * h, xR = xL + h;
                const pts = `${sx(xL)},${sy(0)} ${sx(xL)},${sy(evalF(xL))} ${sx(xR)},${sy(evalF(xR))} ${sx(xR)},${sy(0)}`;
                return (
                  <polygon key={i} points={pts} fill="#10b981" opacity="0.25"
                    stroke="#10b981" strokeWidth="1.4"/>
                );
              })}

              {/* ── MID-ORDINATE ── */}
              {mode === 'midordinate' && Array.from({ length: strips }, (_, i) => {
                const xL = lowerA + i * h, xR = xL + h, xM = xL + h / 2;
                const yM = evalF(xM);
                return (
                  <g key={i}>
                    <rect x={sx(xL)} y={sy(yM)} width={sx(xR) - sx(xL)} height={sy(0) - sy(yM)}
                      fill="#a855f7" opacity="0.22" stroke="#a855f7" strokeWidth="1.3"/>
                    {/* mid-ordinate vertical tick */}
                    <line x1={sx(xM)} y1={sy(0)} x2={sx(xM)} y2={sy(yM)}
                      stroke="#e879f9" strokeWidth="1.2" strokeDasharray="3 2"/>
                    <circle cx={sx(xM)} cy={sy(yM)} r="4" fill="#e879f9"/>
                  </g>
                );
              })}

              {/* ── COMPARATIVE (trapezium shaded) ── */}
              {mode === 'comparative' && Array.from({ length: strips }, (_, i) => {
                const xL = lowerA + i * h, xR = xL + h;
                const pts = `${sx(xL)},${sy(0)} ${sx(xL)},${sy(evalF(xL))} ${sx(xR)},${sy(evalF(xR))} ${sx(xR)},${sy(0)}`;
                return <polygon key={i} points={pts} fill="#10b981" opacity="0.18" stroke="#10b981" strokeWidth="1"/>;
              })}

              {/* Curve (always on top) */}
              <polyline points={curvePts} fill="none" stroke="#facc15" strokeWidth="3"/>

              {/* f(x) label at top of curve */}
              <text x={sx(3.6)} y={sy(evalF(3.6)) - 10} fill="#facc15" fontSize="13" fontWeight="bold">f(x)</text>
            </svg>
          </div>

          {/* Insight */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 font-mono text-xs space-y-1.5">
            <div className="text-amber-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0"/>
              <span>Key Insight</span>
            </div>
            {mode === 'bounding' && <p className="text-slate-300 text-[11px] leading-relaxed">The <span className="text-sky-400 font-bold">lower bound</span> always underestimates and the <span className="text-rose-400 font-bold">upper bound</span> always overestimates. As n→∞ (strips→∞), both bounds <strong>squeeze</strong> toward the exact integral!</p>}
            {mode === 'trapezium' && <p className="text-slate-300 text-[11px] leading-relaxed">Each trapezium uses the formula ½(y₁ + y₂)×h. The rule combines ALL ordinates: <strong>½(y₀ + yn) + y₁ + y₂ + … + yₙ₋₁</strong>, then multiply by h. Don't double-count the first and last!</p>}
            {mode === 'midordinate' && <p className="text-slate-300 text-[11px] leading-relaxed">Sample f(x) at the <span className="text-fuchsia-400 font-bold">midpoint</span> of each strip. The overestimate on one side cancels the underestimate on the other — giving <strong>less error</strong> than using endpoints!</p>}
            {mode === 'comparative' && <p className="text-slate-300 text-[11px] leading-relaxed">For <strong>concave-up</strong> (convex) curves: Trapezium <em>overestimates</em>, Mid-Ordinate <em>underestimates</em>. For <strong>concave-down</strong>: the reverse. More strips always reduces error for both!</p>}
          </div>
        </div>
      </div>

      {/* KCSE tip */}
      <div className="mt-6 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-0.5"/>
        <div>
          <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide">KCSE Exam Rules: Area Approximation</h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            <strong className="text-emerald-400">Trapezium Rule:</strong> Area = h ×[½(y₀ + yₙ) + y₁ + y₂ + … + yₙ₋₁].{' '}
            <strong className="text-fuchsia-400">Mid-Ordinate Rule:</strong> Area = h × (m₁ + m₂ + … + mₙ) where mᵢ = f(midpoint of strip i).{' '}
            Always state the number of strips and strip width h = (b−a)/n in your working!
          </p>
        </div>
      </div>
    </div>
  );
}
