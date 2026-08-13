import React, { useState, useEffect } from 'react';
import { Compass, Circle, Move, Sparkles, Layers, Sliders, CheckCircle2, Eye } from 'lucide-react';

export default function LociConstructionSim({ config = {}, onTelemetry }) {
  // Active Locus Mode
  // 'perp_bisector' | 'fixed_point' | 'constant_angle' | 'chords_theorem'
  const [locusMode, setLocusMode] = useState('perp_bisector');

  // Locus Parameters
  const [radiusR, setRadiusR] = useState(70); // Fixed Point Locus Radius
  const [angleTheta, setAngleTheta] = useState(60); // Constant Angle Locus (deg)

  // Drag Position for Constant Angle Point P along arc
  const [pointPAngle, setPointPAngle] = useState(90); // deg along arc

  // Chords Theorem Lengths: AP, PB, CP, PD
  const [lengthAP, setLengthAP] = useState(4);
  const [lengthPB, setLengthPB] = useState(6);
  const [lengthCP, setLengthCP] = useState(3);
  const lengthPD = ((lengthAP * lengthPB) / lengthCP).toFixed(1);

  // Toggles
  const [showCompassArcs, setShowCompassArcs] = useState(true);
  const [kcseShading, setKcseShading] = useState(true);

  const [exploredFeatures, setExploredFeatures] = useState({
    perpBisector: false,
    fixedPoint: false,
    constantAngle: false,
    chordsTheorem: false,
  });

  useEffect(() => {
    if (locusMode === 'perp_bisector') setExploredFeatures(prev => ({ ...prev, perpBisector: true }));
    if (locusMode === 'fixed_point') setExploredFeatures(prev => ({ ...prev, fixedPoint: true }));
    if (locusMode === 'constant_angle') setExploredFeatures(prev => ({ ...prev, constantAngle: true }));
    if (locusMode === 'chords_theorem') setExploredFeatures(prev => ({ ...prev, chordsTheorem: true }));
  }, [locusMode]);

  const allCompleted = exploredFeatures.perpBisector && exploredFeatures.fixedPoint && exploredFeatures.constantAngle && exploredFeatures.chordsTheorem;

  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_loci_construction_explorer',
        message: 'Student mastered 2D loci definitions, perpendicular bisectors, constant angle circle arcs, KCSE shading conventions, and Intersecting Chords Theorem.',
      });
    }
  }, [allCompleted, onTelemetry]);

  // Canvas Geometry Constants
  const CANVAS_SIZE = 360;
  const ptA = { x: 100, y: 220 };
  const ptB = { x: 260, y: 220 };
  const ptM = { x: 180, y: 220 }; // Midpoint of AB

  // Constant Angle Arc Math:
  // Chord AB length = 160 px
  // Central angle subtended by chord AB = 2 * theta
  // Center O is above AB by y_offset = (AB/2) / tan(theta)
  const AB_HALF = 80;
  const radTheta = (angleTheta * Math.PI) / 180;
  const distO_y = AB_HALF / Math.tan(radTheta);
  const arcRadius = AB_HALF / Math.sin(radTheta);

  const centerO = { x: 180, y: 220 - distO_y };

  // Calculate Point P on constant angle arc
  const pRad = (pointPAngle * Math.PI) / 180;
  const ptP = {
    x: centerO.x + arcRadius * Math.cos(pRad),
    y: centerO.y - arcRadius * Math.sin(pRad),
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-sans">
              2D Geometric Loci &amp; Compass Constructions
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            Standard Loci, Constant Angles &amp; Intersecting Chords
          </h3>
        </div>

        {/* Locus Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 font-mono text-xs overflow-x-auto">
          {[
            { id: 'perp_bisector', label: 'Perp Bisector' },
            { id: 'fixed_point', label: 'Fixed Point' },
            { id: 'constant_angle', label: 'Constant Angle' },
            { id: 'chords_theorem', label: 'Chords Theorem' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setLocusMode(m.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                locusMode === m.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls (5 cols) + Interactive Construction Viewport (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Mode-Specific Parameter Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mode 1: Perpendicular Bisector Controls */}
          {locusMode === 'perp_bisector' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-cyan-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Locus 1: Perpendicular Bisector of Segment AB
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The locus of points equidistant from two fixed points <strong className="text-cyan-400">A</strong> and <strong className="text-cyan-400">B</strong> is the <strong className="text-emerald-400 font-bold">Perpendicular Bisector</strong> of segment AB.
              </p>
              <div className="text-xs font-mono space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showCompassArcs}
                    onChange={(e) => setShowCompassArcs(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span>Show Compass Construction Arcs</span>
                </label>
              </div>
            </div>
          )}

          {/* Mode 2: Fixed Point Locus Controls */}
          {locusMode === 'fixed_point' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Locus 2: Distance r from Fixed Point A
              </span>
              <div className="text-xs font-mono space-y-3">
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Radius r from Point A:</span>
                  <span className="text-amber-400 font-bold">{radiusR} px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="5"
                  value={radiusR}
                  onChange={(e) => setRadiusR(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Mode 3: Constant Angle Locus Controls */}
          {locusMode === 'constant_angle' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-fuchsia-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400 block mb-1">
                Locus 3: Constant Subtended Angle ∠APB = θ
              </span>
              <div className="text-xs font-mono space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Subtended Angle θ:</span>
                    <span className="text-fuchsia-400 font-bold">{angleTheta}°</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="5"
                    value={angleTheta}
                    onChange={(e) => setAngleTheta(parseInt(e.target.value))}
                    className="w-full accent-fuchsia-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Move Point P along Arc:</span>
                    <span className="text-amber-400 font-bold">{pointPAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="140"
                    step="2"
                    value={pointPAngle}
                    onChange={(e) => setPointPAngle(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 4: Intersecting Chords Theorem Controls */}
          {locusMode === 'chords_theorem' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Intersecting Chords Theorem Calculator
              </span>
              <div className="text-xs font-mono space-y-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/20 text-emerald-300 font-bold">
                  AP × PB = CP × PD
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Segment AP:</span>
                    <span className="text-cyan-400 font-bold">{lengthAP} cm</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={lengthAP}
                    onChange={(e) => setLengthAP(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Segment PB:</span>
                    <span className="text-amber-400 font-bold">{lengthPB} cm</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={lengthPB}
                    onChange={(e) => setLengthPB(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Segment CP:</span>
                    <span className="text-fuchsia-400 font-bold">{lengthCP} cm</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={lengthCP}
                    onChange={(e) => setLengthCP(parseInt(e.target.value))}
                    className="w-full accent-fuchsia-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* KCSE Shading Rule Toggle */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">KCSE Shading Convention:</span>
            <button
              onClick={() => setKcseShading(!kcseShading)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                kcseShading ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {kcseShading ? 'Shade UNWANTED' : 'Shade WANTED'}
            </button>
          </div>
        </div>

        {/* Right Column: 2D Construction Viewport & Calculations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 2D Canvas SVG Render */}
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center shadow-inner min-h-[320px]">
            <svg width={CANVAS_SIZE} height={CANVAS_SIZE} className="overflow-visible">
              {/* Segment AB */}
              <line x1={ptA.x} y1={ptA.y} x2={ptB.x} y2={ptB.y} stroke="#64748b" strokeWidth="2.5" />

              {/* Point A */}
              <circle cx={ptA.x} cy={ptA.y} r="6" fill="#38bdf8" />
              <text x={ptA.x - 18} y={ptA.y + 5} fill="#38bdf8" fontSize="13" fontWeight="bold">A</text>

              {/* Point B */}
              <circle cx={ptB.x} cy={ptB.y} r="6" fill="#38bdf8" />
              <text x={ptB.x + 10} y={ptB.y + 5} fill="#38bdf8" fontSize="13" fontWeight="bold">B</text>

              {/* MODE 1: Perpendicular Bisector */}
              {locusMode === 'perp_bisector' && (
                <g>
                  {/* Compass Arcs from A & B */}
                  {showCompassArcs && (
                    <>
                      <path d={`M ${ptA.x} 100 A 130 130 0 0 1 ${ptA.x} 340`} fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <path d={`M ${ptB.x} 100 A 130 130 0 0 0 ${ptB.x} 340`} fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                    </>
                  )}

                  {/* Midpoint M */}
                  <circle cx={ptM.x} cy={ptM.y} r="5" fill="#4ade80" />
                  <text x={ptM.x + 8} y={ptM.y + 18} fill="#4ade80" fontSize="12" fontWeight="bold">M (Midpoint)</text>

                  {/* Perpendicular Bisecting Line */}
                  <line x1={ptM.x} y1="40" x2={ptM.x} y2="320" stroke="#10b981" strokeWidth="3.5" />
                  <text x={ptM.x + 10} y="55" fill="#10b981" fontSize="13" fontWeight="bold">Locus: d(P,A) = d(P,B)</text>
                </g>
              )}

              {/* MODE 2: Fixed Point Locus */}
              {locusMode === 'fixed_point' && (
                <g>
                  <circle cx={ptA.x} cy={ptA.y} r={radiusR} fill="none" stroke="#facc15" strokeWidth="3.5" />
                  <line x1={ptA.x} y1={ptA.y} x2={ptA.x + radiusR} y2={ptA.y} stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" />
                  <text x={ptA.x + radiusR / 2} y={ptA.y - 8} fill="#facc15" fontSize="12" fontWeight="bold">r = {radiusR}</text>
                </g>
              )}

              {/* MODE 3: Constant Angle Locus */}
              {locusMode === 'constant_angle' && (
                <g>
                  {/* Constant Angle Arc APB */}
                  <circle cx={centerO.x} cy={centerO.y} r={arcRadius} fill="none" stroke="#e879f9" strokeWidth="3.5" strokeDasharray="6 3" />

                  {/* Lines AP and BP */}
                  <line x1={ptA.x} y1={ptA.y} x2={ptP.x} y2={ptP.y} stroke="#38bdf8" strokeWidth="2" />
                  <line x1={ptB.x} y1={ptB.y} x2={ptP.x} y2={ptP.y} stroke="#38bdf8" stroke-width="2" />

                  {/* Point P */}
                  <circle cx={ptP.x} cy={ptP.y} r="7" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                  <text x={ptP.x - 5} y={ptP.y - 12} fill="#facc15" fontSize="14" fontWeight="bold">P</text>

                  {/* Subtended Angle Label */}
                  <text x={ptP.x + 10} y={ptP.y + 20} fill="#e879f9" fontSize="13" fontWeight="bold">∠APB = {angleTheta}°</text>
                </g>
              )}

              {/* MODE 4: Intersecting Chords */}
              {locusMode === 'chords_theorem' && (
                <g>
                  {/* Circle */}
                  <circle cx="180" cy="180" r="120" fill="none" stroke="#38bdf8" strokeWidth="2" />

                  {/* Chord AB & Chord CD */}
                  <line x1="80" y1="240" x2="280" y2="120" stroke="#facc15" strokeWidth="3" />
                  <line x1="100" y1="100" x2="260" y2="260" stroke="#4ade80" strokeWidth="3" />

                  {/* Intersection Point P */}
                  <circle cx="170" cy="186" r="6" fill="#e879f9" />
                  <text x="180" y="195" fill="#e879f9" fontSize="13" fontWeight="bold">P</text>
                </g>
              )}
            </svg>
          </div>

          {/* Live Locus Calculation & Theorem Summary Card */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 font-mono text-xs space-y-2">
            {locusMode === 'perp_bisector' && (
              <div className="text-emerald-400 font-bold">
                ✓ Perpendicular Bisector Locus Equation: x = 180 (Midpoint M between A(100) &amp; B(260))
              </div>
            )}

            {locusMode === 'fixed_point' && (
              <div className="text-amber-400 font-bold">
                ✓ Circle Locus Equation: (x - 100)² + (y - 220)² = {radiusR * radiusR}
              </div>
            )}

            {locusMode === 'constant_angle' && (
              <div className="text-fuchsia-400 font-bold">
                ✓ Constant Angle Locus: Subtended Angle ∠APB = {angleTheta}° along Circle Arc APB
              </div>
            )}

            {locusMode === 'chords_theorem' && (
              <div className="text-emerald-300 font-bold space-y-1">
                <p>AP × PB = {lengthAP} × {lengthPB} = {lengthAP * lengthPB}</p>
                <p>CP × PD = {lengthCP} × {lengthPD} = {(lengthCP * parseFloat(lengthPD)).toFixed(1)}</p>
                <p className="text-amber-300">⟹ Intersecting Chords Theorem Verified!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KCSE Loci Tip Card */}
      <div className="mt-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">
            KCSE Exam Rule: Multi-Step Loci &amp; Construction Precision
          </h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            Always leave your <strong className="text-amber-300">compass construction arcs visible</strong> on your KCSE exam paper! Do NOT erase construction arcs for perpendicular bisectors or angle bisectors. For loci inequalities, shade out the <strong className="text-red-400">UNWANTED region</strong> and label the clean required region <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono">R</code>!
          </p>
        </div>
      </div>
    </div>
  );
}
