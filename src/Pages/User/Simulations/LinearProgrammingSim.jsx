import React, { useState, useEffect } from 'react';
import { Layers, Sliders, CheckCircle2, AlertTriangle, Sparkles, MoveRight, Eye } from 'lucide-react';

export default function LinearProgrammingSim({ config = {}, onTelemetry }) {
  // Constraint Parameters
  // L1: x + y <= c1 (default 50)
  // L2: 2x + y <= c2 (default 80)
  const [c1, setC1] = useState(50);
  const [c2, setC2] = useState(80);

  // Objective Function Coefficients: P = a*x + b*y
  const [coeffA, setCoeffA] = useState(300);
  const [coeffB, setCoeffB] = useState(400);

  // Search Line Slider Value k: ax + by = k
  const [searchK, setSearchK] = useState(17000);

  // Toggles
  const [kcseShading, setKcseShading] = useState(true); // KCSE Shading: Shade UNWANTED
  const [showSearchLine, setShowSearchLine] = useState(true);
  const [showIntegerLattice, setShowIntegerLattice] = useState(false);

  const [exploredFeatures, setExploredFeatures] = useState({
    constraints: false,
    shadingToggle: false,
    searchLine: false,
    cornerEvaluation: false,
  });

  useEffect(() => {
    if (c1 !== 50 || c2 !== 80) setExploredFeatures(prev => ({ ...prev, constraints: true }));
    if (!kcseShading) setExploredFeatures(prev => ({ ...prev, shadingToggle: true }));
    if (searchK !== 17000) setExploredFeatures(prev => ({ ...prev, searchLine: true }));
    if (coeffA !== 300 || coeffB !== 400) setExploredFeatures(prev => ({ ...prev, cornerEvaluation: true }));
  }, [c1, c2, kcseShading, searchK, coeffA, coeffB]);

  const allCompleted = exploredFeatures.constraints && exploredFeatures.shadingToggle && exploredFeatures.searchLine && exploredFeatures.cornerEvaluation;

  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_linear_programming_explorer',
        message: 'Student mastered formulation of linear inequalities, KCSE feasible region shading, corner-point evaluation, and parallel search-line optimization.',
      });
    }
  }, [allCompleted, onTelemetry]);

  // Calculate Corner Points of Feasible Region R:
  // Constraints: x >= 0, y >= 0, x + y <= c1, 2x + y <= c2
  // Intersections:
  // A: (0, 0)
  // B: (c2/2, 0) if c2/2 <= c1 else (c1, 0) -> intersection of 2x + y = c2 with y=0 -> x = c2/2
  // Intersect 2x + y = c2 and x + y = c1 -> subtract: x = c2 - c1, y = 2*c1 - c2
  // C: (c2 - c1, 2*c1 - c2)
  // D: (0, c1)

  const ptA = { x: 0, y: 0 };

  const xB_val = Math.max(0, c2 / 2);
  const ptB = { x: xB_val, y: 0 };

  const xC_val = Math.max(0, c2 - c1);
  const yC_val = Math.max(0, 2 * c1 - c2);
  const ptC = { x: xC_val, y: yC_val };

  const yD_val = Math.max(0, c1);
  const ptD = { x: 0, y: yD_val };

  const evaluateP = (pt) => coeffA * pt.x + coeffB * pt.y;

  const corners = [
    { label: 'A', pt: ptA, val: evaluateP(ptA) },
    { label: 'B', pt: ptB, val: evaluateP(ptB) },
    { label: 'C', pt: ptC, val: evaluateP(ptC) },
    { label: 'D', pt: ptD, val: evaluateP(ptD) },
  ];

  // Find max corner
  const maxCorner = corners.reduce((prev, curr) => (curr.val > prev.val ? curr : prev), corners[0]);

  // SVG Canvas Scale Math (Canvas 360x360, Grid range [0, 80] x [0, 80])
  const CANVAS_SIZE = 360;
  const MARGIN = 40;
  const PLOT_SIZE = CANVAS_SIZE - 2 * MARGIN;
  const MAX_VAL = 80;

  const toSvgX = (x) => MARGIN + (x / MAX_VAL) * PLOT_SIZE;
  const toSvgY = (y) => CANVAS_SIZE - MARGIN - (y / MAX_VAL) * PLOT_SIZE;

  // SVG Points string for Feasible Polygon R
  const polyPointsSvg = `${toSvgX(ptA.x)},${toSvgY(ptA.y)} ${toSvgX(ptB.x)},${toSvgY(ptB.y)} ${toSvgX(ptC.x)},${toSvgY(ptC.y)} ${toSvgX(ptD.x)},${toSvgY(ptD.y)}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-sans">
              KCSE Linear Programming &amp; Optimization
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            Feasible Region R &amp; Parallel Search-Line Explorer
          </h3>
        </div>

        {/* KCSE Shading Pill */}
        <button
          onClick={() => setKcseShading(!kcseShading)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-mono font-bold ${
            kcseShading
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{kcseShading ? 'KCSE Rule: Shade UNWANTED (Region R Clean)' : 'Standard Rule: Shade WANTED'}</span>
        </button>
      </div>

      {/* Main Grid: Controls (5 cols) + 2D Plotter & Evaluation (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Constraints & Objective Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Constraints Sliders */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Constraint Boundary Lines
            </span>

            <div className="text-xs font-mono space-y-3">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Line L₁: x + y ≤ {c1}</span>
                  <span className="text-cyan-400 font-bold">c₁ = {c1}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="70"
                  step="5"
                  value={c1}
                  onChange={(e) => setC1(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Line L₂: 2x + y ≤ {c2}</span>
                  <span className="text-emerald-400 font-bold">c₂ = {c2}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={c2}
                  onChange={(e) => setC2(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Objective Function & Search-Line Controls */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/30 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Objective Function &amp; Parallel Search Line
            </span>

            <div className="text-xs font-mono space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/20 text-amber-300 font-bold flex items-center justify-between">
                <span>Objective P = {coeffA}x + {coeffB}y</span>
                <span className="text-slate-400 font-normal">Slope m = -{coeffA}/{coeffB}</span>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Search Line Value k: ({coeffA}x + {coeffB}y = k)</span>
                  <span className="text-amber-400 font-bold">k = {searchK.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35000"
                  step="500"
                  value={searchK}
                  onChange={(e) => setSearchK(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showSearchLine}
                    onChange={(e) => setShowSearchLine(e.target.checked)}
                    className="accent-amber-400 rounded"
                  />
                  <span>Show Search Line</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showIntegerLattice}
                    onChange={(e) => setShowIntegerLattice(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span>Integer Grid Points</span>
                </label>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSearchK(maxCorner.val)}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-sans text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Snap Search Line to Maximum
            </button>
          </div>
        </div>

        {/* Right Column: 2D Feasible Region Plotter & Corner Evaluation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 2D Grid SVG Plotter */}
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center shadow-inner min-h-[320px]">
            <svg width={CANVAS_SIZE} height={CANVAS_SIZE} className="overflow-visible">
              <defs>
                {/* KCSE Unwanted Hatched Pattern */}
                <pattern id="unwantedHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" stroke="#f87171" strokeWidth="2.5" opacity="0.4" />
                </pattern>
              </defs>

              {/* Grid Background Lines */}
              {[10, 20, 30, 40, 50, 60, 70].map((v) => (
                <g key={v}>
                  <line x1={toSvgX(v)} y1={MARGIN} x2={toSvgX(v)} y2={CANVAS_SIZE - MARGIN} stroke="#1e293b" strokeWidth="1" />
                  <line x1={MARGIN} y1={toSvgY(v)} x2={CANVAS_SIZE - MARGIN} y2={toSvgY(v)} stroke="#1e293b" strokeWidth="1" />
                  <text x={toSvgX(v)} y={CANVAS_SIZE - MARGIN + 15} fill="#64748b" fontSize="10" textAnchor="middle">{v}</text>
                  <text x={MARGIN - 12} y={toSvgY(v) + 4} fill="#64748b" fontSize="10" textAnchor="end">{v}</text>
                </g>
              ))}

              {/* Axes X and Y */}
              <line x1={MARGIN} y1={CANVAS_SIZE - MARGIN} x2={CANVAS_SIZE - MARGIN + 15} y2={CANVAS_SIZE - MARGIN} stroke="#94a3b8" strokeWidth="2.5" />
              <line x1={MARGIN} y1={CANVAS_SIZE - MARGIN} x2={MARGIN} y2={MARGIN - 15} stroke="#94a3b8" strokeWidth="2.5" />
              <text x={CANVAS_SIZE - MARGIN + 20} y={CANVAS_SIZE - MARGIN + 4} fill="#94a3b8" fontSize="12" fontWeight="bold">x</text>
              <text x={MARGIN} y={MARGIN - 20} fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">y</text>

              {/* Boundary Line L1: x + y = c1 */}
              <line x1={toSvgX(0)} y1={toSvgY(c1)} x2={toSvgX(c1)} y2={toSvgY(0)} stroke="#38bdf8" strokeWidth="3" />

              {/* Boundary Line L2: 2x + y = c2 */}
              <line x1={toSvgX(0)} y1={toSvgY(c2)} x2={toSvgX(c2 / 2)} y2={toSvgY(0)} stroke="#10b981" strokeWidth="3" />

              {/* Feasible Region R Fill (Clean White if KCSE Shading; Colored if Standard) */}
              {kcseShading ? (
                <>
                  {/* Unwanted Shading Background */}
                  <rect x={MARGIN} y={MARGIN} width={PLOT_SIZE} height={PLOT_SIZE} fill="url(#unwantedHatch)" />
                  {/* Clean Feasible Region R */}
                  <polygon points={polyPointsSvg} fill="#ffffff" stroke="#38bdf8" strokeWidth="2.5" />
                </>
              ) : (
                <polygon points={polyPointsSvg} fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" stroke-width="2.5" />
              )}

              {/* Search Line: ax + by = k -> y = (k - ax)/b */}
              {showSearchLine && (
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(searchK / coeffB)}
                  x2={toSvgX(searchK / coeffA)}
                  y2={toSvgY(0)}
                  stroke="#facc15"
                  strokeWidth="3.5"
                  strokeDasharray="6 3"
                />
              )}

              {/* Corner Points A, B, C, D */}
              {corners.map((c) => (
                <g key={c.label}>
                  <circle
                    cx={toSvgX(c.pt.x)}
                    cy={toSvgY(c.pt.y)}
                    r={c.label === maxCorner.label ? '7' : '5'}
                    fill={c.label === maxCorner.label ? '#facc15' : '#38bdf8'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={toSvgX(c.pt.x) + (c.pt.x === 0 ? 12 : -12)}
                    y={toSvgY(c.pt.y) + (c.pt.y === 0 ? -10 : 18)}
                    fill={c.label === maxCorner.label ? '#facc15' : '#ffffff'}
                    fontSize="13"
                    fontWeight="bold"
                  >
                    {c.label}({c.pt.x}, {c.pt.y})
                  </text>
                </g>
              ))}
            </svg>

            <div className="absolute bottom-2 left-4 text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">― L₁: x+y={c1}</span> | <span className="text-emerald-400 font-bold">― L₂: 2x+y={c2}</span> | <span className="text-amber-400 font-bold">--- Search Line</span>
            </div>
          </div>

          {/* Corner-Point Algebraic Evaluation Table */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 font-mono text-xs space-y-3">
            <span className="text-xs font-bold font-sans uppercase tracking-wider text-cyan-400 flex items-center justify-between">
              <span>Algebraic Corner-Point Evaluation Table</span>
              <span className="text-amber-400 text-[11px]">P = {coeffA}x + {coeffB}y</span>
            </span>

            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              {corners.map((c) => (
                <div
                  key={c.label}
                  className={`p-3 rounded-xl border transition-all ${
                    c.label === maxCorner.label
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-2 ring-amber-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">Vertex {c.label}</p>
                  <p className="text-[11px] text-slate-400">({c.pt.x}, {c.pt.y})</p>
                  <p className="text-sm font-bold pt-1">P = {c.val.toLocaleString()}</p>
                  {c.label === maxCorner.label && (
                    <span className="inline-block mt-1 text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded uppercase font-bold">
                      Maximum
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KCSE Exam Tip Card */}
      <div className="mt-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
            KCSE Exam Rule: Feasible Region Shading Convention
          </h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            In KCSE Mathematics exams, always <strong className="text-red-400">SHADE OUT THE UNWANTED REGIONS</strong>! The required <strong className="text-emerald-400 font-bold">Feasible Region R</strong> MUST be left <strong className="text-white font-bold uppercase underline">unshaded (clean)</strong> on your graph paper. Label the clean region with a bold capital letter <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">R</code>!
          </p>
        </div>
      </div>
    </div>
  );
}
