import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft, Target, CheckCircle2, Layers, Grid, Sparkles, HelpCircle } from 'lucide-react';

const TRANSFORMATIONS = [
  { id: 'identity', name: 'Identity (No change)', matrix: [[1, 0], [0, 1]], description: 'Leaves all points in their original position.' },
  { id: 'reflect_x', name: 'Reflection in x-axis (y = 0)', matrix: [[1, 0], [0, -1]], description: 'Flips points across the horizontal x-axis.' },
  { id: 'reflect_y', name: 'Reflection in y-axis (x = 0)', matrix: [[-1, 0], [0, 1]], description: 'Flips points across the vertical y-axis.' },
  { id: 'reflect_yx', name: 'Reflection in line y = x', matrix: [[0, 1], [1, 0]], description: 'Swaps x and y coordinates.' },
  { id: 'reflect_y_neg_x', name: 'Reflection in line y = -x', matrix: [[0, -1], [-1, 0]], description: 'Swaps x and y coordinates and negates both.' },
  { id: 'rot_90_ccw', name: 'Rotation 90° CCW (Quarter Turn)', matrix: [[0, -1], [1, 0]], description: 'Rotates 90° counter-clockwise about origin.' },
  { id: 'rot_90_cw', name: 'Rotation 90° CW (-90°)', matrix: [[0, 1], [-1, 0]], description: 'Rotates 90° clockwise about origin.' },
  { id: 'rot_180', name: 'Rotation 180° (Half Turn)', matrix: [[-1, 0], [0, -1]], description: 'Rotates 180° about origin.' },
  { id: 'enlarge_2', name: 'Enlargement (Scale factor 2)', matrix: [[2, 0], [0, 2]], description: 'Doubles all distances from the origin.' },
  { id: 'shear_x_1', name: 'Shear along x-axis (k = 1)', matrix: [[1, 1], [0, 1]], description: 'Shifts x proportionally to y while keeping y fixed.' },
];

const INITIAL_TRIANGLE = [
  { label: 'P', x: 1, y: 1 },
  { label: 'Q', x: 3, y: 1 },
  { label: 'R', x: 2, y: 3 },
];

function multiplyMatrices(m1, m2) {
  return [
    [
      m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0],
      m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1],
    ],
    [
      m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0],
      m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1],
    ],
  ];
}

function applyMatrixToPoint(m, pt) {
  return {
    label: pt.label,
    x: m[0][0] * pt.x + m[0][1] * pt.y,
    y: m[1][0] * pt.x + m[1][1] * pt.y,
  };
}

export default function MatrixTransformationSim({ config = {}, onTelemetry }) {
  const [t1Id, setT1Id] = useState('reflect_x');
  const [t2Id, setT2Id] = useState('rot_90_ccw');
  const [showIntermediate, setShowIntermediate] = useState(true);
  const [swapped, setSwapped] = useState(false);
  const [discoveries, setDiscoveries] = useState({
    composed: false,
    orderDifferenceSeen: false,
    identityUnderstood: false,
  });

  const t1Obj = TRANSFORMATIONS.find(t => t.id === t1Id) || TRANSFORMATIONS[0];
  const t2Obj = TRANSFORMATIONS.find(t => t.id === t2Id) || TRANSFORMATIONS[0];

  const firstTrans = swapped ? t2Obj : t1Obj;
  const secondTrans = swapped ? t1Obj : t2Obj;

  const compositeMatrix = multiplyMatrices(secondTrans.matrix, firstTrans.matrix);

  const intermediateTriangle = INITIAL_TRIANGLE.map(pt => applyMatrixToPoint(firstTrans.matrix, pt));
  const finalTriangle = INITIAL_TRIANGLE.map(pt => applyMatrixToPoint(compositeMatrix, pt));

  const allCompleted = discoveries.composed && discoveries.orderDifferenceSeen;

  useEffect(() => {
    if (t1Id !== 'identity' || t2Id !== 'identity') {
      setDiscoveries(prev => ({ ...prev, composed: true }));
    }
  }, [t1Id, t2Id]);

  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_matrix_transformation',
        message: 'Student explored matrix composition and order dependence.',
      });
    }
  }, [allCompleted, onTelemetry]);

  const handleSwapOrder = () => {
    setSwapped(!swapped);
    setDiscoveries(prev => ({ ...prev, orderDifferenceSeen: true }));
  };

  const SVG_SIZE = 420;
  const GRID_BOUND = 6;
  const toSvgX = (x) => SVG_SIZE / 2 + (x / GRID_BOUND) * (SVG_SIZE / 2 - 20);
  const toSvgY = (y) => SVG_SIZE / 2 - (y / GRID_BOUND) * (SVG_SIZE / 2 - 20);

  const formatPointsPath = (points) => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' ') + ' Z';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-custom-forest/20 text-emerald-400 border border-emerald-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-sans">
              Interactive Math Explorer
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            2D Matrix Transformations &amp; Composition
          </h3>
        </div>

        <button
          onClick={handleSwapOrder}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${
            swapped
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 ring-2 ring-amber-300/50'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          {swapped ? 'Order: T₁ ∘ T₂ (Swapped)' : 'Swap Order (T₂ ∘ T₁)'}
        </button>
      </div>

      {/* Main Grid: Control Controls + Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Selectors and Matrix Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Transformation 1 */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              First Transformation ({swapped ? 'T₂' : 'T₁'})
            </label>
            <select
              value={swapped ? t2Id : t1Id}
              onChange={(e) => (swapped ? setT2Id(e.target.value) : setT1Id(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-emerald-400"
            >
              {TRANSFORMATIONS.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-2 italic">{firstTrans.description}</p>
            <div className="mt-3 flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-750">
              <span className="text-xs font-mono text-slate-400">Matrix:</span>
              <span className="font-mono text-sm text-emerald-400 font-semibold">
                [{firstTrans.matrix[0].join(', ')} ; {firstTrans.matrix[1].join(', ')}]
              </span>
            </div>
          </div>

          {/* Transformation 2 */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Second Transformation ({swapped ? 'T₁' : 'T₂'})
            </label>
            <select
              value={swapped ? t1Id : t2Id}
              onChange={(e) => (swapped ? setT1Id(e.target.value) : setT2Id(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-cyan-400"
            >
              {TRANSFORMATIONS.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-2 italic">{secondTrans.description}</p>
            <div className="mt-3 flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-750">
              <span className="text-xs font-mono text-slate-400">Matrix:</span>
              <span className="font-mono text-sm text-cyan-400 font-semibold">
                [{secondTrans.matrix[0].join(', ')} ; {secondTrans.matrix[1].join(', ')}]
              </span>
            </div>
          </div>

          {/* Composite Result Matrix */}
          <div className="bg-gradient-to-br from-slate-850 to-slate-800 p-5 rounded-2xl border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Composite Matrix C = {swapped ? 'T₁ × T₂' : 'T₂ × T₁'}
              </span>
              <button
                onClick={() => setShowIntermediate(!showIntermediate)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                {showIntermediate ? 'Hide Step 1' : 'Show Step 1'}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 py-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-3xl text-slate-500 font-thin">(</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-center font-mono text-xl font-bold text-amber-400">
                <div>{compositeMatrix[0][0]}</div>
                <div>{compositeMatrix[0][1]}</div>
                <div>{compositeMatrix[1][0]}</div>
                <div>{compositeMatrix[1][1]}</div>
              </div>
              <span className="text-3xl text-slate-500 font-thin">)</span>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Multiplying matrices applies transformations sequentially right-to-left.
            </p>
          </div>
        </div>

        {/* Right Column: Cartesian Canvas & Point Coordinates (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 w-full flex justify-center shadow-inner">
            <svg width={SVG_SIZE} height={SVG_SIZE} className="overflow-visible">
              {/* Grid Lines */}
              {Array.from({ length: GRID_BOUND * 2 + 1 }).map((_, i) => {
                const val = i - GRID_BOUND;
                return (
                  <g key={i}>
                    {/* Vertical Grid Line */}
                    <line
                      x1={toSvgX(val)}
                      y1={0}
                      x2={toSvgX(val)}
                      y2={SVG_SIZE}
                      stroke={val === 0 ? '#64748b' : '#1e293b'}
                      strokeWidth={val === 0 ? 2 : 1}
                    />
                    {/* Horizontal Grid Line */}
                    <line
                      x1={0}
                      y1={toSvgY(val)}
                      x2={SVG_SIZE}
                      y2={toSvgY(val)}
                      stroke={val === 0 ? '#64748b' : '#1e293b'}
                      strokeWidth={val === 0 ? 2 : 1}
                    />
                    {/* Tick Labels */}
                    {val !== 0 && (
                      <>
                        <text
                          x={toSvgX(val)}
                          y={toSvgY(0) + 15}
                          fill="#475569"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {val}
                        </text>
                        <text
                          x={toSvgX(0) - 12}
                          y={toSvgY(val) + 3}
                          fill="#475569"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {val}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Original Triangle PQR (Blue) */}
              <path
                d={formatPointsPath(INITIAL_TRIANGLE)}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              {INITIAL_TRIANGLE.map((pt, i) => (
                <g key={`orig-${i}`}>
                  <circle cx={toSvgX(pt.x)} cy={toSvgY(pt.y)} r="4" fill="#3b82f6" />
                  <text
                    x={toSvgX(pt.x) + 8}
                    y={toSvgY(pt.y) - 6}
                    fill="#60a5fa"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {pt.label}({pt.x},{pt.y})
                  </text>
                </g>
              ))}

              {/* Intermediate Triangle (Cyan) */}
              {showIntermediate && (
                <>
                  <path
                    d={formatPointsPath(intermediateTriangle)}
                    fill="rgba(6, 182, 212, 0.15)"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  {intermediateTriangle.map((pt, i) => (
                    <circle
                      key={`inter-${i}`}
                      cx={toSvgX(pt.x)}
                      cy={toSvgY(pt.y)}
                      r="3"
                      fill="#06b6d4"
                    />
                  ))}
                </>
              )}

              {/* Final Transformed Triangle P''Q''R'' (Amber/Golden) */}
              <path
                d={formatPointsPath(finalTriangle)}
                fill="rgba(245, 158, 11, 0.3)"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />
              {finalTriangle.map((pt, i) => (
                <g key={`final-${i}`}>
                  <circle cx={toSvgX(pt.x)} cy={toSvgY(pt.y)} r="5" fill="#f59e0b" />
                  <text
                    x={toSvgX(pt.x) + 8}
                    y={toSvgY(pt.y) - 6}
                    fill="#fbbf24"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {pt.label}''({Math.round(pt.x * 10) / 10},{Math.round(pt.y * 10) / 10})
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend below canvas */}
          <div className="flex items-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-400" />
              <span className="text-slate-300 font-medium">Original PQR</span>
            </div>
            {showIntermediate && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 border border-cyan-300" />
                <span className="text-slate-300 font-medium">After Step 1</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-400" />
              <span className="text-amber-400 font-bold">Final Image P''Q''R''</span>
            </div>
          </div>
        </div>
      </div>

      {/* Concept Key Insight Box */}
      <div className="mt-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
            Key Learning Insight: Order Matters (Non-Commutative)
          </h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            Clicking <strong className="text-amber-300">"Swap Order"</strong> changes matrix multiplication from{' '}
            <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">T₂ × T₁</code> to{' '}
            <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-400 font-mono">T₁ × T₂</code>. Watch how the final image position changes! In transformation geometry, applying reflection then rotation produces a different result than rotation then reflection.
          </p>
        </div>
      </div>
    </div>
  );
}
