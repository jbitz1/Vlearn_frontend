import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, MoveRight, Sparkles, Sliders, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function DifferentiationSim({ config = {}, onTelemetry }) {
  // Function preset selection: 'quadratic' | 'cubic' | 'kinematics'
  const [funcPreset, setFuncPreset] = useState('quadratic');

  // Mode: 'secant' | 'tangent' | 'turning' | 'kinematics'
  const [mode, setMode] = useState('secant');

  // Point x0 slider
  const [x0, setX0] = useState(1);

  // Secant step h slider
  const [hStep, setHStep] = useState(1.5);

  // Kinematics time t slider
  const [timeT, setTimeT] = useState(1);

  const [exploredFeatures, setExploredFeatures] = useState({
    secantMode: false,
    tangentMode: false,
    turningMode: false,
    kinematicsMode: false,
  });

  useEffect(() => {
    if (mode === 'secant') setExploredFeatures(prev => ({ ...prev, secantMode: true }));
    if (mode === 'tangent') setExploredFeatures(prev => ({ ...prev, tangentMode: true }));
    if (mode === 'turning') setExploredFeatures(prev => ({ ...prev, turningMode: true }));
    if (mode === 'kinematics') setExploredFeatures(prev => ({ ...prev, kinematicsMode: true }));
  }, [mode]);

  const allCompleted = exploredFeatures.secantMode && exploredFeatures.tangentMode && exploredFeatures.turningMode && exploredFeatures.kinematicsMode;

  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_differentiation_explorer',
        message: 'Student mastered secant-to-tangent limits, power rule derivatives, tangent & normal line equations, turning point classification, and kinematics motion.',
      });
    }
  }, [allCompleted, onTelemetry]);

  // Function Math:
  // Quadratic: y = x^2 - 4x + 3 -> f'(x) = 2x - 4
  // Cubic: y = 0.2*(x^3 - 6x^2 + 9x) -> f'(x) = 0.2*(3x^2 - 12x + 9)
  const evalF = (x) => {
    if (funcPreset === 'quadratic') return x * x - 4 * x + 3;
    return 0.2 * (x * x * x - 6 * x * x + 9 * x);
  };

  const evalDeriv = (x) => {
    if (funcPreset === 'quadratic') return 2 * x - 4;
    return 0.2 * (3 * x * x - 12 * x + 9);
  };

  // Coordinates of P(x0, y0) and Q(x0+h, y0+h)
  const y0 = evalF(x0);
  const xQ = x0 + hStep;
  const yQ = evalF(xQ);

  const secantSlope = (yQ - y0) / hStep;
  const tangentSlope = evalDeriv(x0);
  const normalSlope = tangentSlope !== 0 ? -1 / tangentSlope : 999;

  // Kinematics Math: s(t) = t^3 - 6t^2 + 9t
  // v(t) = 3t^2 - 12t + 9 = 3(t - 1)(t - 3)
  // a(t) = 6t - 12
  const dispS = timeT * timeT * timeT - 6 * timeT * timeT + 9 * timeT;
  const velV = 3 * timeT * timeT - 12 * timeT + 9;
  const accA = 6 * timeT - 12;

  // SVG Canvas Scale Math (Canvas 360x360, x in [-3, 6], y in [-6, 8])
  const CANVAS_SIZE = 360;
  const MARGIN = 35;
  const PLOT_W = CANVAS_SIZE - 2 * MARGIN;
  const PLOT_H = CANVAS_SIZE - 2 * MARGIN;

  const MIN_X = -2;
  const MAX_X = 6;
  const MIN_Y = -6;
  const MAX_Y = 8;

  const toSvgX = (x) => MARGIN + ((x - MIN_X) / (MAX_X - MIN_X)) * PLOT_W;
  const toSvgY = (y) => CANVAS_SIZE - MARGIN - ((y - MIN_Y) / (MAX_Y - MIN_Y)) * PLOT_H;

  // Polyline for curve y = f(x)
  const steps = 100;
  const curvePoints = [];
  for (let i = 0; i <= steps; i++) {
    const xVal = MIN_X + (i / steps) * (MAX_X - MIN_X);
    const yVal = evalF(xVal);
    if (yVal >= MIN_Y - 2 && yVal <= MAX_Y + 2) {
      curvePoints.push(`${toSvgX(xVal)},${toSvgY(yVal)}`);
    }
  }
  const curveSvgStr = curvePoints.join(' ');

  // Polyline for derivative curve y = f'(x)
  const derivPoints = [];
  for (let i = 0; i <= steps; i++) {
    const xVal = MIN_X + (i / steps) * (MAX_X - MIN_X);
    const yVal = evalDeriv(xVal);
    if (yVal >= MIN_Y - 2 && yVal <= MAX_Y + 2) {
      derivPoints.push(`${toSvgX(xVal)},${toSvgY(yVal)}`);
    }
  }
  const derivSvgStr = derivPoints.join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-sans">
              Calculus &amp; Differentiation Explorer
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            Secant-to-Tangent Limits, Turning Points &amp; Kinematics
          </h3>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 font-mono text-xs overflow-x-auto">
          {[
            { id: 'secant', label: 'Secant → Tangent' },
            { id: 'tangent', label: 'Tangent & Normal' },
            { id: 'turning', label: 'Turning Points' },
            { id: 'kinematics', label: 'Kinematics' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                mode === m.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls (5 cols) + Interactive Calculus Viewport (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders & Preset Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Preset Function Selector */}
          {mode !== 'kinematics' && (
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Select Curve Function
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => setFuncPreset('quadratic')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    funcPreset === 'quadratic' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  y = x² - 4x + 3
                </button>
                <button
                  onClick={() => setFuncPreset('cubic')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    funcPreset === 'cubic' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  y = 0.2(x³ - 6x² + 9x)
                </button>
              </div>
            </div>
          )}

          {/* Mode 1: Secant-to-Tangent Controls */}
          {mode === 'secant' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-cyan-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                First Principles Limit: h → 0
              </span>

              <div className="text-xs font-mono space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Point x₀:</span>
                    <span className="text-cyan-400 font-bold">x₀ = {x0}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.5"
                    value={x0}
                    onChange={(e) => setX0(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Secant Step h:</span>
                    <span className="text-amber-400 font-bold">h = {hStep}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={hStep}
                    onChange={(e) => setHStep(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/20 space-y-1">
                  <p className="text-slate-300">Secant Chord Slope: <strong className="text-amber-400">{secantSlope.toFixed(3)}</strong></p>
                  <p className="text-slate-300">Tangent Limit (h→0): <strong className="text-cyan-400">{tangentSlope.toFixed(3)}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Tangent & Normal Controls */}
          {mode === 'tangent' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Tangent &amp; Normal Equations
              </span>

              <div className="text-xs font-mono space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Tangent Point x₀:</span>
                    <span className="text-emerald-400 font-bold">x₀ = {x0}</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="5"
                    step="0.5"
                    value={x0}
                    onChange={(e) => setX0(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/20 space-y-1 text-slate-300">
                  <p>Tangent Slope m<sub>T</sub> = <strong className="text-cyan-400">{tangentSlope.toFixed(2)}</strong></p>
                  <p>Normal Slope m<sub>N</sub> = <strong className="text-fuchsia-400">{normalSlope.toFixed(2)}</strong></p>
                  <p className="text-slate-400 pt-1 text-[11px]">m<sub>T</sub> × m<sub>N</sub> = -1 (Perpendicular 90°)</p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Turning Points Controls */}
          {mode === 'turning' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Stationary Points Classifier (f'(x) = 0)
              </span>

              <div className="text-xs font-mono space-y-2 text-slate-300">
                {funcPreset === 'quadratic' ? (
                  <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30">
                    <p className="text-emerald-400 font-bold">Local Minimum at x = 2, y = -1</p>
                    <p className="text-slate-400 text-[11px]">f'(x) sign changes from - to 0 to +</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-amber-500/30">
                      <p className="text-amber-400 font-bold">Local Maximum at x = 1, y = 0.8</p>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-emerald-500/30">
                      <p className="text-emerald-400 font-bold">Local Minimum at x = 3, y = 0</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode 4: Kinematics Controls */}
          {mode === 'kinematics' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-fuchsia-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400 block mb-1">
                Kinematics: s(t) = t³ - 6t² + 9t
              </span>

              <div className="text-xs font-mono space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Time t (seconds):</span>
                    <span className="text-fuchsia-400 font-bold">t = {timeT} s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4.5"
                    step="0.25"
                    value={timeT}
                    onChange={(e) => setTimeT(parseFloat(e.target.value))}
                    className="w-full accent-fuchsia-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-fuchsia-500/20 space-y-1.5 text-slate-300">
                  <p>Displacement s(t) = <strong className="text-cyan-400">{dispS.toFixed(2)} m</strong></p>
                  <p>Velocity v(t) = ds/dt = <strong className="text-amber-400">{velV.toFixed(2)} m/s</strong></p>
                  <p>Acceleration a(t) = dv/dt = <strong className="text-fuchsia-400">{accA.toFixed(2)} m/s²</strong></p>
                </div>

                {velV === 0 && (
                  <div className="p-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-center">
                    ⚡ Instantaneous Rest (Velocity = 0)!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Canvas Viewport & Gauges (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 2D Canvas SVG Render */}
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center shadow-inner min-h-[320px]">
            {mode !== 'kinematics' ? (
              <svg width={CANVAS_SIZE} height={CANVAS_SIZE} className="overflow-visible">
                {/* Axes */}
                <line x1={MARGIN} y1={toSvgY(0)} x2={CANVAS_SIZE - MARGIN} y2={toSvgY(0)} stroke="#475569" strokeWidth="2" />
                <line x1={toSvgX(0)} y1={MARGIN} x2={toSvgX(0)} y2={CANVAS_SIZE - MARGIN} stroke="#475569" strokeWidth="2" />

                {/* Main Curve y = f(x) */}
                <polyline points={curveSvgStr} fill="none" stroke="#38bdf8" strokeWidth="3.5" />

                {/* Derivative Curve y = f'(x) if turning mode */}
                {mode === 'turning' && (
                  <polyline points={derivSvgStr} fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="4 2" />
                )}

                {/* MODE 1: Secant Line Chord PQ */}
                {mode === 'secant' && (
                  <g>
                    {/* Secant Line */}
                    <line
                      x1={toSvgX(x0 - 1)}
                      y1={toSvgY(y0 - secantSlope * 1)}
                      x2={toSvgX(xQ + 1)}
                      y2={toSvgY(yQ + secantSlope * 1)}
                      stroke="#facc15"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                    />

                    {/* Point P(x0, y0) */}
                    <circle cx={toSvgX(x0)} cy={toSvgY(y0)} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                    <text x={toSvgX(x0) - 15} y={toSvgY(y0) - 10} fill="#38bdf8" fontSize="12" fontWeight="bold">P({x0})</text>

                    {/* Point Q(x0+h, y0+h) */}
                    <circle cx={toSvgX(xQ)} cy={toSvgY(yQ)} r="6" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                    <text x={toSvgX(xQ) + 8} y={toSvgY(yQ) - 10} fill="#facc15" fontSize="12" fontWeight="bold">Q({xQ.toFixed(1)})</text>
                  </g>
                )}

                {/* MODE 2: Tangent & Normal Lines */}
                {mode === 'tangent' && (
                  <g>
                    {/* Tangent Line (Cyan) */}
                    <line
                      x1={toSvgX(x0 - 2)}
                      y1={toSvgY(y0 - tangentSlope * 2)}
                      x2={toSvgX(x0 + 2)}
                      y2={toSvgY(y0 + tangentSlope * 2)}
                      stroke="#22d3ee"
                      strokeWidth="3.5"
                    />

                    {/* Normal Line (Magenta) */}
                    {tangentSlope !== 0 && (
                      <line
                        x1={toSvgX(x0 - 2)}
                        y1={toSvgY(y0 - normalSlope * 2)}
                        x2={toSvgX(x0 + 2)}
                        y2={toSvgY(y0 + normalSlope * 2)}
                        stroke="#e879f9"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Point P(x0, y0) */}
                    <circle cx={toSvgX(x0)} cy={toSvgY(y0)} r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  </g>
                )}
              </svg>
            ) : (
              /* Kinematics Track Animation */
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <span className="text-xs font-mono text-slate-400">1D Particle Motion Track: s(t)</span>
                <div className="relative w-full max-w-md h-12 bg-slate-900 rounded-full border border-slate-700 flex items-center px-4">
                  <div
                    className="absolute w-8 h-8 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-500/50 flex items-center justify-center transition-all duration-300"
                    style={{ left: `${Math.min(90, Math.max(5, (dispS / 10) * 100))}%` }}
                  >
                    <span className="text-[10px] font-bold text-slate-950">P</span>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-2 left-4 text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">― Curve y=f(x)</span> | <span className="text-amber-400 font-bold">--- Derivative / Secant</span>
            </div>
          </div>

          {/* Live Calculus Insight Card */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 font-mono text-xs space-y-2">
            <div className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Calculus Mastery Insight</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              The derivative <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">f'(x) = dy/dx</code> measures the instantaneous rate of change (tangent slope) at any point! At stationary turning points, <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300">f'(x) = 0</code> because the tangent line is completely horizontal!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
