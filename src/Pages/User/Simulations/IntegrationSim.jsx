import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Layers, Sparkles, ArrowRight } from 'lucide-react';

export default function IntegrationSim({ config = {}, onTelemetry }) {
  // Mode: 'family_curves' | 'particular' | 'definite_area' | 'intersecting'
  const [mode, setMode] = useState('family_curves');

  // Function: 'quadratic' | 'cubic'
  const [funcPreset, setFuncPreset] = useState('quadratic');

  // Sliders
  const [constC, setConstC] = useState(0);       // +C family of curves
  const [lowerA, setLowerA] = useState(0);       // definite lower limit
  const [upperB, setUpperB] = useState(3);       // definite upper limit
  const [anchorX, setAnchorX] = useState(1);     // particular solution anchor x0
  const [anchorY, setAnchorY] = useState(2);     // particular solution anchor y0

  const [exploredFeatures, setExploredFeatures] = useState({
    familyCurves: false, particular: false, definiteArea: false, intersecting: false,
  });

  useEffect(() => {
    if (mode === 'family_curves') setExploredFeatures(p => ({ ...p, familyCurves: true }));
    if (mode === 'particular')    setExploredFeatures(p => ({ ...p, particular: true }));
    if (mode === 'definite_area') setExploredFeatures(p => ({ ...p, definiteArea: true }));
    if (mode === 'intersecting')  setExploredFeatures(p => ({ ...p, intersecting: true }));
  }, [mode]);

  const allCompleted = Object.values(exploredFeatures).every(Boolean);

  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_integration_explorer',
        message: 'Student mastered indefinite integration (family of curves +C), particular solutions (boundary anchors), definite integration (area accumulation), and area between intersecting curves.',
      });
    }
  }, [allCompleted, onTelemetry]);

  // Canvas layout constants
  const SZ = 360, M = 40, PW = SZ - 2 * M, PH = SZ - 2 * M;
  const MIN_X = -1, MAX_X = 5, MIN_Y = -6, MAX_Y = 10;
  const sx = x => M + ((x - MIN_X) / (MAX_X - MIN_X)) * PW;
  const sy = y => SZ - M - ((y - MIN_Y) / (MAX_Y - MIN_Y)) * PH;

  // f(x) = derivative → 2x - 4 (from y=x²-4x) or 3x²-6x (from y=x³-3x²)
  // antiderivative F(x) = x²-4x+C  or  x³-3x²+C
  const evalF = x => funcPreset === 'quadratic' ? x * x - 4 * x + constC : x * x * x - 3 * x * x + constC;
  const evalFParticular = x => {
    // Solve: F(anchorX) = anchorY => constC_anchor = anchorY - base(anchorX)
    const base = funcPreset === 'quadratic'
      ? anchorX * anchorX - 4 * anchorX
      : anchorX * anchorX * anchorX - 3 * anchorX * anchorX;
    const cVal = anchorY - base;
    return funcPreset === 'quadratic'
      ? x * x - 4 * x + cVal
      : x * x * x - 3 * x * x + cVal;
  };
  const cParticular = (() => {
    const base = funcPreset === 'quadratic'
      ? anchorX * anchorX - 4 * anchorX
      : anchorX * anchorX * anchorX - 3 * anchorX * anchorX;
    return (anchorY - base).toFixed(2);
  })();

  // Numerical definite integral (trapezoidal)
  const numericIntegral = (() => {
    const n = 200;
    let sum = 0;
    const dx = (upperB - lowerA) / n;
    for (let i = 0; i <= n; i++) {
      const xi = lowerA + i * dx;
      const yi = funcPreset === 'quadratic' ? xi * xi - 4 * xi : xi * xi * xi - 3 * xi * xi;
      const w = i === 0 || i === n ? 0.5 : 1;
      sum += w * yi * dx;
    }
    return sum;
  })();

  // Polyline for curve
  const makeCurve = (evalFn, color = '#38bdf8', dasharray = 'none') => {
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const xv = MIN_X + (i / 100) * (MAX_X - MIN_X);
      const yv = evalFn(xv);
      if (yv >= MIN_Y - 1 && yv <= MAX_Y + 1) pts.push(`${sx(xv)},${sy(yv)}`);
    }
    return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="3" strokeDasharray={dasharray} />;
  };

  // Shaded area polygon between [lowerA, upperB] and x-axis
  const areaPolygon = (() => {
    const pts = [`${sx(lowerA)},${sy(0)}`];
    for (let i = 0; i <= 80; i++) {
      const xv = lowerA + (i / 80) * (upperB - lowerA);
      const yv = funcPreset === 'quadratic' ? xv * xv - 4 * xv : xv * xv * xv - 3 * xv * xv;
      pts.push(`${sx(xv)},${sy(yv)}`);
    }
    pts.push(`${sx(upperB)},${sy(0)}`);
    return pts.join(' ');
  })();

  // Intersection curve y=x² and y=x+2 (intersecting mode)
  const parabolaPts = [];
  const linePts = [];
  for (let i = 0; i <= 100; i++) {
    const xv = MIN_X + (i / 100) * (MAX_X - MIN_X);
    const yp = xv * xv - 2;
    const yl = xv + 1;
    if (yp >= MIN_Y - 1 && yp <= MAX_Y + 1) parabolaPts.push(`${sx(xv)},${sy(yp)}`);
    if (yl >= MIN_Y - 1 && yl <= MAX_Y + 1) linePts.push(`${sx(xv)},${sy(yl)}`);
  }
  // intersecting area polygon
  const interAreaPts = (() => {
    // x²-2 = x+1 → x²-x-3=0 → x≈-1.30, 2.30
    const x1 = (1 - Math.sqrt(13)) / 2, x2 = (1 + Math.sqrt(13)) / 2;
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const xv = x1 + (i / 80) * (x2 - x1);
      const ytop = xv + 1;
      pts.push(`${sx(xv)},${sy(ytop)}`);
    }
    for (let i = 80; i >= 0; i--) {
      const xv = x1 + (i / 80) * (x2 - x1);
      const ybot = xv * xv - 2;
      pts.push(`${sx(xv)},${sy(ybot)}`);
    }
    return pts.join(' ');
  })();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-sans">
              Integration &amp; Area Under Curves Explorer
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            Family of Curves, Definite Integrals &amp; Intersecting Areas
          </h3>
        </div>
        {/* Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 font-mono text-xs overflow-x-auto">
          {[
            { id: 'family_curves', label: '+C Family' },
            { id: 'particular',    label: 'Particular' },
            { id: 'definite_area', label: 'Definite ∫' },
            { id: 'intersecting',  label: 'Between Curves' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                mode === m.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Preset selector (modes 1-3) */}
          {mode !== 'intersecting' && (
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Select Antiderivative F(x)</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { id: 'quadratic', label: 'F(x) = x² − 4x + C' },
                  { id: 'cubic',     label: 'F(x) = x³ − 3x² + C' },
                ].map(p => (
                  <button key={p.id} onClick={() => setFuncPreset(p.id)}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      funcPreset === p.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode 1: Family of Curves +C */}
          {mode === 'family_curves' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">Integration Constant +C (Vertical Shift)</span>
              <div className="text-xs font-mono space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Constant C:</span>
                    <span className="text-emerald-400 font-bold">C = {constC}</span>
                  </div>
                  <input type="range" min="-4" max="6" step="1" value={constC}
                    onChange={e => setConstC(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer" />
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/20 space-y-1 text-slate-300">
                  <p>F(x) = {funcPreset === 'quadratic' ? `x² − 4x + ${constC}` : `x³ − 3x² + ${constC}`}</p>
                  <p className="text-emerald-400 font-bold text-[11px] pt-1">Each value of C gives a DIFFERENT curve — all sharing the same gradient function!</p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Particular Solution */}
          {mode === 'particular' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-cyan-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">Boundary Point Anchor (x₀, y₀)</span>
              <div className="text-xs font-mono space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Anchor x₀:</span>
                    <span className="text-cyan-400 font-bold">x₀ = {anchorX}</span>
                  </div>
                  <input type="range" min="0" max="4" step="0.5" value={anchorX}
                    onChange={e => setAnchorX(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Anchor y₀:</span>
                    <span className="text-amber-400 font-bold">y₀ = {anchorY}</span>
                  </div>
                  <input type="range" min="-4" max="8" step="1" value={anchorY}
                    onChange={e => setAnchorY(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer" />
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20 space-y-1 text-slate-300">
                  <p>Boundary: F({anchorX}) = {anchorY}</p>
                  <p className="text-cyan-400 font-bold">Particular C = <span className="text-amber-300">{cParticular}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Definite Integral */}
          {mode === 'definite_area' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">Definite Integral Limits [a, b]</span>
              <div className="text-xs font-mono space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Lower Limit a:</span>
                    <span className="text-amber-400 font-bold">a = {lowerA}</span>
                  </div>
                  <input type="range" min="-1" max="3" step="0.5" value={lowerA}
                    onChange={e => setLowerA(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Upper Limit b:</span>
                    <span className="text-emerald-400 font-bold">b = {upperB}</span>
                  </div>
                  <input type="range" min="1" max="5" step="0.5" value={upperB}
                    onChange={e => setUpperB(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer" />
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/20">
                  <p className="text-amber-400 font-bold">∫<sub>{lowerA}</sub><sup>{upperB}</sup> f(x) dx ≈ <span className="text-white">{numericIntegral.toFixed(3)}</span></p>
                  {numericIntegral < 0 && (
                    <p className="text-red-400 text-[11px] pt-1">⚠ Negative value = curve below x-axis → take |value| for area!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mode 4: Area Between Intersecting Curves */}
          {mode === 'intersecting' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-fuchsia-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400 block">Area Between y = x+1 and y = x² − 2</span>
              <div className="text-xs font-mono space-y-2 text-slate-300">
                <div className="p-3 bg-slate-900 rounded-xl border border-fuchsia-500/20 space-y-1">
                  <p>Intersections: x² − 2 = x + 1</p>
                  <p>x² − x − 3 = 0 → x ≈ <span className="text-fuchsia-400 font-bold">−1.30, 2.30</span></p>
                  <p className="pt-1">Area = ∫ (top − bottom) dx</p>
                  <p>= ∫ [(x+1) − (x²−2)] dx</p>
                  <p className="text-emerald-400 font-bold">≈ 8.17 sq. units</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                  KCSE Rule: Always integrate (UPPER − LOWER) curve to get positive area!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center shadow-inner min-h-[320px]">
            <svg width={SZ} height={SZ} className="overflow-visible">
              {/* Axes */}
              <line x1={M} y1={sy(0)} x2={SZ - M} y2={sy(0)} stroke="#475569" strokeWidth="2"/>
              <line x1={sx(0)} y1={M} x2={sx(0)} y2={SZ - M} stroke="#475569" strokeWidth="2"/>

              {mode === 'family_curves' && (
                <>
                  {/* Ghost curves at C-2, C-1, C+1, C+2 */}
                  {[-2, -1, 1, 2].map(dc => {
                    const ghostC = constC + dc;
                    const pts = [];
                    for (let i = 0; i <= 100; i++) {
                      const xv = MIN_X + (i / 100) * (MAX_X - MIN_X);
                      const yv = funcPreset === 'quadratic' ? xv * xv - 4 * xv + ghostC : xv * xv * xv - 3 * xv * xv + ghostC;
                      if (yv >= MIN_Y - 1 && yv <= MAX_Y + 1) pts.push(`${sx(xv)},${sy(yv)}`);
                    }
                    return <polyline key={dc} points={pts.join(' ')} fill="none" stroke="#1e3a2f" strokeWidth="1.5" />;
                  })}
                  {/* Active curve */}
                  {makeCurve(evalF, '#10b981')}
                  {/* C label */}
                  <text x={SZ - M - 10} y={sy(evalF(MAX_X - 0.3)) - 8} fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="end">C = {constC}</text>
                </>
              )}

              {mode === 'particular' && (
                <>
                  {/* General curve (ghost) */}
                  {makeCurve(x => funcPreset === 'quadratic' ? x * x - 4 * x : x * x * x - 3 * x * x, '#1e3a2f')}
                  {/* Particular curve */}
                  {makeCurve(evalFParticular, '#22d3ee')}
                  {/* Anchor dot */}
                  <circle cx={sx(anchorX)} cy={sy(anchorY)} r="8" fill="#facc15" stroke="#fff" strokeWidth="2"/>
                  <text x={sx(anchorX) + 12} y={sy(anchorY) - 8} fill="#facc15" fontSize="12" fontWeight="bold">({anchorX}, {anchorY})</text>
                </>
              )}

              {mode === 'definite_area' && (
                <>
                  {/* Shaded area */}
                  <polygon points={areaPolygon} fill={numericIntegral >= 0 ? '#10b981' : '#ef4444'} opacity="0.25"/>
                  {/* Curve */}
                  {makeCurve(x => funcPreset === 'quadratic' ? x * x - 4 * x : x * x * x - 3 * x * x, '#10b981')}
                  {/* Limit lines */}
                  <line x1={sx(lowerA)} y1={sy(MIN_Y)} x2={sx(lowerA)} y2={sy(MAX_Y)} stroke="#facc15" strokeWidth="1.5" strokeDasharray="4 2"/>
                  <line x1={sx(upperB)} y1={sy(MIN_Y)} x2={sx(upperB)} y2={sy(MAX_Y)} stroke="#4ade80" strokeWidth="1.5" strokeDasharray="4 2"/>
                  <text x={sx(lowerA)} y={sy(MIN_Y) + 16} fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">a={lowerA}</text>
                  <text x={sx(upperB)} y={sy(MIN_Y) + 16} fill="#4ade80" fontSize="12" fontWeight="bold" textAnchor="middle">b={upperB}</text>
                </>
              )}

              {mode === 'intersecting' && (
                <>
                  {/* Shaded enclosed area */}
                  <polygon points={interAreaPts} fill="#a855f7" opacity="0.25"/>
                  {/* Parabola y=x²-2 */}
                  <polyline points={parabolaPts.join(' ')} fill="none" stroke="#facc15" strokeWidth="3"/>
                  {/* Line y=x+1 */}
                  <polyline points={linePts.join(' ')} fill="none" stroke="#e879f9" strokeWidth="3"/>
                  {/* Intersection dots */}
                  {[[-1.30, -0.30], [2.30, 3.30]].map(([ix, iy]) => (
                    <circle key={ix} cx={sx(ix)} cy={sy(iy)} r="6" fill="#fff" stroke="#a855f7" strokeWidth="2"/>
                  ))}
                  {/* Legend */}
                  <text x={M + 5} y={M + 15} fill="#facc15" fontSize="12" fontWeight="bold">y = x² − 2</text>
                  <text x={M + 5} y={M + 32} fill="#e879f9" fontSize="12" fontWeight="bold">y = x + 1</text>
                </>
              )}
            </svg>
          </div>

          {/* Insight card */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 font-mono text-xs space-y-2">
            <div className="text-emerald-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Integration Mastery Insight</span>
            </div>
            {mode === 'family_curves' && <p className="text-slate-300 text-[11px] leading-relaxed">Drag +C to see an entire <strong className="text-emerald-300">family of antiderivatives</strong>! All curves have the same gradient function — the constant C shifts them vertically without changing their shape.</p>}
            {mode === 'particular' && <p className="text-slate-300 text-[11px] leading-relaxed">A <strong className="text-cyan-300">boundary condition</strong> pins down exactly ONE curve from the infinite family. Substitute the given point (x₀, y₀) into F(x) = ... + C and solve for C.</p>}
            {mode === 'definite_area' && <p className="text-slate-300 text-[11px] leading-relaxed">The <strong className="text-amber-300">shaded region = ∫ₐᵇ f(x) dx</strong>. If the curve dips below the x-axis, the integral becomes negative — always take the <strong className="text-red-400">absolute value</strong> and split into sub-regions!</p>}
            {mode === 'intersecting' && <p className="text-slate-300 text-[11px] leading-relaxed">Area between curves = ∫ <strong className="text-fuchsia-300">(UPPER − LOWER)</strong> dx between intersection points. Always set top − bottom to guarantee a positive area result.</p>}
          </div>
        </div>
      </div>

      {/* KCSE Tip */}
      <div className="mt-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">KCSE Exam Rules: Integration Precision</h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            Always include <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono">+ C</code> for indefinite integrals — omitting it loses marks! For area calculations when the curve is below the x-axis, <strong className="text-red-400">split the integral</strong> at the root and take absolute values separately. For area between curves, integrate <strong className="text-amber-300">(top − bottom)</strong> between intersection x-values.
          </p>
        </div>
      </div>
    </div>
  );
}
