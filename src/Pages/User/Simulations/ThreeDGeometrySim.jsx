import React, { useState, useEffect } from 'react';
import { Box, Layers, Sparkles, RotateCw, Eye, CheckCircle2, Sliders } from 'lucide-react';

export default function ThreeDGeometrySim({ config = {}, onTelemetry }) {
  const [solidType, setSolidType] = useState('cuboid'); // 'cuboid' | 'pyramid'
  const [yaw, setYaw] = useState(35); // Horizontal rotation deg
  const [pitch, setPitch] = useState(25); // Vertical rotation deg
  const [activeFeature, setActiveFeature] = useState('space_diagonal'); // 'base_diagonal' | 'space_diagonal' | 'line_plane' | 'dihedral'
  const [exploredFeatures, setExploredFeatures] = useState({
    space_diagonal: true,
    base_diagonal: false,
    line_plane: false,
    dihedral: false,
  });

  const handleFeatureSelect = (feat) => {
    setActiveFeature(feat);
    setExploredFeatures(prev => ({ ...prev, [feat]: true }));
  };

  const allCompleted = exploredFeatures.space_diagonal && exploredFeatures.line_plane && exploredFeatures.dihedral;

  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_3d_geometry_explorer',
        message: 'Student explored 3D projections, space diagonals, line-plane inclinations, and dihedral angles.',
      });
    }
  }, [allCompleted, onTelemetry]);

  // 3D Projection Engine
  const CANVAS_W = 440;
  const CANVAS_H = 340;
  const CENTER_X = CANVAS_W / 2;
  const CENTER_Y = CANVAS_H / 2 + 10;
  const SCALE = 24;

  const project3D = (x, y, z) => {
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;

    // Rotate around Y-axis (Yaw)
    const x1 = x * Math.cos(radYaw) + z * Math.sin(radYaw);
    const y1 = y;
    const z1 = -x * Math.sin(radYaw) + z * Math.cos(radYaw);

    // Rotate around X-axis (Pitch)
    const x2 = x1;
    const y2 = y1 * Math.cos(radPitch) - z1 * Math.sin(radPitch);
    const z2 = y1 * Math.sin(radPitch) + z1 * Math.cos(radPitch);

    // Isometric 2D Screen Mapping
    const px = CENTER_X + x2 * SCALE;
    const py = CENTER_Y - y2 * SCALE;
    return { px, py, z: z2 };
  };

  // Cuboid Vertices (Length=6, Width=4, Height=4) centered
  // A(-3,-2,-2), B(3,-2,-2), C(3,-2,2), D(-3,-2,2)
  // E(-3,2,-2), F(3,2,-2), G(3,2,2), H(-3,2,2)
  const CUBOID_RAW = {
    A: { x: -3, y: -2, z: -2, label: 'A' },
    B: { x: 3, y: -2, z: -2, label: 'B' },
    C: { x: 3, y: -2, z: 2, label: 'C' },
    D: { x: -3, y: -2, z: 2, label: 'D' },
    E: { x: -3, y: 2, z: -2, label: 'E' },
    F: { x: 3, y: 2, z: -2, label: 'F' },
    G: { x: 3, y: 2, z: 2, label: 'G' },
    H: { x: -3, y: 2, z: 2, label: 'H' },
  };

  // Pyramid Vertices (Base side=6, Height=5)
  // Base: A(-3,-2.5,-3), B(3,-2.5,-3), C(3,-2.5,3), D(-3,-2.5,3)
  // Apex V(0, 2.5, 0), Base Center O(0, -2.5, 0), Midpoint M(0, -2.5, 3)
  const PYRAMID_RAW = {
    A: { x: -3, y: -2.5, z: -3, label: 'A' },
    B: { x: 3, y: -2.5, z: -3, label: 'B' },
    C: { x: 3, y: -2.5, z: 3, label: 'C' },
    D: { x: -3, y: -2.5, z: 3, label: 'D' },
    V: { x: 0, y: 2.5, z: 0, label: 'V' },
    O: { x: 0, y: -2.5, z: 0, label: 'O' },
    M: { x: 0, y: -2.5, z: 3, label: 'M' },
  };

  const currentRaw = solidType === 'cuboid' ? CUBOID_RAW : PYRAMID_RAW;
  const P = {};
  Object.keys(currentRaw).forEach(k => {
    const pt = currentRaw[k];
    P[k] = { ...pt, ...project3D(pt.x, pt.y, pt.z) };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-custom-forest/20 text-emerald-400 border border-emerald-500/30">
              <Box className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-sans">
              Interactive 3D Math Explorer
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            3D Solids, Projections &amp; Angle Solver
          </h3>
        </div>

        {/* Solid Switcher */}
        <div className="flex items-center bg-slate-800 p-1.5 rounded-full border border-slate-700">
          <button
            onClick={() => setSolidType('cuboid')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
              solidType === 'cuboid'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Cuboid (Rectangular Prism)
          </button>
          <button
            onClick={() => setSolidType('pyramid')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
              solidType === 'pyramid'
                ? 'bg-cyan-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Right Square Pyramid
          </button>
        </div>
      </div>

      {/* Main Content Grid: Controls/Solvers + 3D Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Feature Controls & Math Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Feature Selectors */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select 3D Feature to Visualize
            </span>

            {solidType === 'cuboid' ? (
              <>
                <button
                  onClick={() => handleFeatureSelect('base_diagonal')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold font-sans transition-all flex items-center justify-between ${
                    activeFeature === 'base_diagonal'
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                      : 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span>1. Base Face Diagonal (AC)</span>
                  <span className="font-mono text-emerald-400">AC = √(L² + W²)</span>
                </button>

                <button
                  onClick={() => handleFeatureSelect('space_diagonal')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold font-sans transition-all flex items-center justify-between ${
                    activeFeature === 'space_diagonal'
                      ? 'bg-amber-950/80 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span>2. Space Diagonal (AG)</span>
                  <span className="font-mono text-amber-400">AG = √(L² + W² + H²)</span>
                </button>

                <button
                  onClick={() => handleFeatureSelect('line_plane')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold font-sans transition-all flex items-center justify-between ${
                    activeFeature === 'line_plane'
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span>3. Line-to-Plane Angle (∠GAC)</span>
                  <span className="font-mono text-cyan-400">tan θ = H / AC</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleFeatureSelect('space_diagonal')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold font-sans transition-all flex items-center justify-between ${
                    activeFeature === 'space_diagonal'
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                      : 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span>1. Slant Edge Length (VA)</span>
                  <span className="font-mono text-emerald-400">VA = √(VO² + AO²)</span>
                </button>

                <button
                  onClick={() => handleFeatureSelect('line_plane')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold font-sans transition-all flex items-center justify-between ${
                    activeFeature === 'line_plane'
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span>2. Slant Edge to Base Angle (∠VAO)</span>
                  <span className="font-mono text-cyan-400">tan θ = VO / AO</span>
                </button>

                <button
                  onClick={() => handleFeatureSelect('dihedral')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold font-sans transition-all flex items-center justify-between ${
                    activeFeature === 'dihedral'
                      ? 'bg-amber-950/80 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span>3. Dihedral Angle Slant-Base (∠VMO)</span>
                  <span className="font-mono text-amber-400">tan θ = VO / OM</span>
                </button>
              </>
            )}
          </div>

          {/* Mathematical Solver Breakdown Card */}
          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              3D Step-by-Step Mathematical Solver
            </span>

            {solidType === 'cuboid' && (
              <div className="font-mono text-xs space-y-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1 font-sans font-bold">Given Cuboid Dimensions:</span>
                  <span className="text-emerald-400">Length L = 6 cm, Width W = 4 cm, Height H = 4 cm</span>
                </div>

                {activeFeature === 'base_diagonal' && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 space-y-1">
                    <span className="text-emerald-400 font-bold block">Base Diagonal AC (Triangle ABC):</span>
                    <p className="text-slate-300">AC = √(6² + 4²) = √(36 + 16) = √52</p>
                    <p className="text-emerald-300 font-bold text-sm">AC ≈ 7.21 cm</p>
                  </div>
                )}

                {activeFeature === 'space_diagonal' && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 space-y-1">
                    <span className="text-amber-400 font-bold block">Space Diagonal AG (Triangle ACG):</span>
                    <p className="text-slate-300">AG = √(AC² + H²) = √(52 + 4²) = √68</p>
                    <p className="text-amber-300 font-bold text-sm">AG ≈ 8.25 cm</p>
                  </div>
                )}

                {activeFeature === 'line_plane' && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30 space-y-1">
                    <span className="text-cyan-400 font-bold block">Angle AG to Base ABCD (∠GAC):</span>
                    <p className="text-slate-300">tan(∠GAC) = Height / Base Diagonal = 4 / 7.21 = 0.5547</p>
                    <p className="text-cyan-300 font-bold text-sm">∠GAC = tan⁻¹(0.5547) ≈ 29.0°</p>
                  </div>
                )}
              </div>
            )}

            {solidType === 'pyramid' && (
              <div className="font-mono text-xs space-y-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1 font-sans font-bold">Given Pyramid Dimensions:</span>
                  <span className="text-cyan-400">Square Base side s = 6 cm, Height VO = 5 cm</span>
                </div>

                {activeFeature === 'space_diagonal' && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 space-y-1">
                    <span className="text-emerald-400 font-bold block">Slant Edge VA (Triangle VOA):</span>
                    <p className="text-slate-300">Base Half-Diagonal AO = √(3² + 3²) = √18 ≈ 4.24 cm</p>
                    <p className="text-slate-300">VA = √(5² + 4.24²) = √(25 + 18) = √43</p>
                    <p className="text-emerald-300 font-bold text-sm">VA ≈ 6.56 cm</p>
                  </div>
                )}

                {activeFeature === 'line_plane' && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30 space-y-1">
                    <span className="text-cyan-400 font-bold block">Slant Edge to Base Angle (∠VAO):</span>
                    <p className="text-slate-300">tan(∠VAO) = Height / Half-Diagonal = 5 / 4.24 = 1.179</p>
                    <p className="text-cyan-300 font-bold text-sm">∠VAO = tan⁻¹(1.179) ≈ 49.7°</p>
                  </div>
                )}

                {activeFeature === 'dihedral' && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 space-y-1">
                    <span className="text-amber-400 font-bold block">Dihedral Angle Slant Face to Base (∠VMO):</span>
                    <p className="text-slate-300">OM = half base side = 3 cm</p>
                    <p className="text-slate-300">tan(∠VMO) = Height / OM = 5 / 3 = 1.667</p>
                    <p className="text-amber-300 font-bold text-sm">∠VMO = tan⁻¹(1.667) ≈ 59.0°</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rotation Controls */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-750 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" /> Orbit 3D Rotation Controls
            </span>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Yaw (Horizontal): {yaw}°</label>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={yaw}
                  onChange={(e) => setYaw(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Pitch (Vertical): {pitch}°</label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={pitch}
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D SVG Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 w-full flex justify-center shadow-inner">
            <svg width={CANVAS_W} height={CANVAS_H} className="overflow-visible">
              {/* Render Cuboid */}
              {solidType === 'cuboid' && (
                <g>
                  {/* Outer Wireframe Edges */}
                  {/* Base ABCD */}
                  <line x1={P.A.px} y1={P.A.py} x2={P.B.px} y2={P.B.py} stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1={P.B.px} y1={P.B.py} x2={P.C.px} y2={P.C.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.C.px} y1={P.C.py} x2={P.D.px} y2={P.D.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.D.px} y1={P.D.py} x2={P.A.px} y2={P.A.py} stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Top EFGH */}
                  <line x1={P.E.px} y1={P.E.py} x2={P.F.px} y2={P.F.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.F.px} y1={P.F.py} x2={P.G.px} y2={P.G.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.G.px} y1={P.G.py} x2={P.H.px} y2={P.H.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.H.px} y1={P.H.py} x2={P.E.px} y2={P.E.py} stroke="#64748b" strokeWidth="2" />

                  {/* Verticals AE, BF, CG, DH */}
                  <line x1={P.A.px} y1={P.A.py} x2={P.E.px} y2={P.E.py} stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1={P.B.px} y1={P.B.py} x2={P.F.px} y2={P.F.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.C.px} y1={P.C.py} x2={P.G.px} y2={P.G.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.D.px} y1={P.D.py} x2={P.H.px} y2={P.H.py} stroke="#64748b" strokeWidth="2" />

                  {/* Feature Overlays */}
                  {activeFeature === 'base_diagonal' && (
                    <>
                      <polygon points={`${P.A.px},${P.A.py} ${P.B.px},${P.B.py} ${P.C.px},${P.C.py}`} fill="rgba(16, 185, 129, 0.25)" />
                      <line x1={P.A.px} y1={P.A.py} x2={P.C.px} y2={P.C.py} stroke="#10b981" strokeWidth="3.5" />
                    </>
                  )}

                  {activeFeature === 'space_diagonal' && (
                    <>
                      <polygon points={`${P.A.px},${P.A.py} ${P.C.px},${P.C.py} ${P.G.px},${P.G.py}`} fill="rgba(245, 158, 11, 0.25)" />
                      <line x1={P.A.px} y1={P.A.py} x2={P.C.px} y2={P.C.py} stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />
                      <line x1={P.C.px} y1={P.C.py} x2={P.G.px} y2={P.G.py} stroke="#64748b" strokeWidth="2" />
                      <line x1={P.A.px} y1={P.A.py} x2={P.G.px} y2={P.G.py} stroke="#f59e0b" strokeWidth="3.5" />
                    </>
                  )}

                  {activeFeature === 'line_plane' && (
                    <>
                      <polygon points={`${P.A.px},${P.A.py} ${P.C.px},${P.C.py} ${P.G.px},${P.G.py}`} fill="rgba(6, 182, 212, 0.25)" />
                      <line x1={P.A.px} y1={P.A.py} x2={P.C.px} y2={P.C.py} stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="3 3" />
                      <line x1={P.C.px} y1={P.C.py} x2={P.G.px} y2={P.G.py} stroke="#06b6d4" strokeWidth="2.5" />
                      <line x1={P.A.px} y1={P.A.py} x2={P.G.px} y2={P.G.py} stroke="#06b6d4" strokeWidth="3.5" />
                    </>
                  )}

                  {/* Vertices & Labels */}
                  {Object.keys(P).map(k => (
                    <g key={k}>
                      <circle cx={P[k].px} cy={P[k].py} r="4" fill="#cbd5e1" />
                      <text x={P[k].px + 6} y={P[k].py - 6} fill="#e2e8f0" fontSize="12" fontWeight="bold">{k}</text>
                    </g>
                  ))}
                </g>
              )}

              {/* Render Pyramid */}
              {solidType === 'pyramid' && (
                <g>
                  {/* Base ABCD */}
                  <line x1={P.A.px} y1={P.A.py} x2={P.B.px} y2={P.B.py} stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1={P.B.px} y1={P.B.py} x2={P.C.px} y2={P.C.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.C.px} y1={P.C.py} x2={P.D.px} y2={P.D.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.D.px} y1={P.D.py} x2={P.A.px} y2={P.A.py} stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Slant Edges VA, VB, VC, VD */}
                  <line x1={P.V.px} y1={P.V.py} x2={P.A.px} y2={P.A.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.V.px} y1={P.V.py} x2={P.B.px} y2={P.B.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.V.px} y1={P.V.py} x2={P.C.px} y2={P.C.py} stroke="#64748b" strokeWidth="2" />
                  <line x1={P.V.px} y1={P.V.py} x2={P.D.px} y2={P.D.py} stroke="#64748b" strokeWidth="2" />

                  {/* Feature Overlays */}
                  {activeFeature === 'space_diagonal' && (
                    <>
                      <polygon points={`${P.V.px},${P.V.py} ${P.O.px},${P.O.py} ${P.A.px},${P.A.py}`} fill="rgba(16, 185, 129, 0.25)" />
                      <line x1={P.V.px} y1={P.V.py} x2={P.O.px} y2={P.O.py} stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />
                      <line x1={P.O.px} y1={P.O.py} x2={P.A.px} y2={P.A.py} stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />
                      <line x1={P.V.px} y1={P.V.py} x2={P.A.px} y2={P.A.py} stroke="#10b981" strokeWidth="3.5" />
                    </>
                  )}

                  {activeFeature === 'line_plane' && (
                    <>
                      <polygon points={`${P.V.px},${P.V.py} ${P.O.px},${P.O.py} ${P.A.px},${P.A.py}`} fill="rgba(6, 182, 212, 0.25)" />
                      <line x1={P.V.px} y1={P.V.py} x2={P.A.px} y2={P.A.py} stroke="#06b6d4" strokeWidth="3.5" />
                      <line x1={P.A.px} y1={P.A.py} x2={P.O.px} y2={P.O.py} stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="3 3" />
                      <line x1={P.V.px} y1={P.V.py} x2={P.O.px} y2={P.O.py} stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" />
                    </>
                  )}

                  {activeFeature === 'dihedral' && (
                    <>
                      <polygon points={`${P.V.px},${P.V.py} ${P.O.px},${P.O.py} ${P.M.px},${P.M.py}`} fill="rgba(245, 158, 11, 0.3)" />
                      <line x1={P.V.px} y1={P.V.py} x2={P.M.px} y2={P.M.py} stroke="#f59e0b" strokeWidth="3.5" />
                      <line x1={P.O.px} y1={P.O.py} x2={P.M.px} y2={P.M.py} stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 3" />
                      <line x1={P.V.px} y1={P.V.py} x2={P.O.px} y2={P.O.py} stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                    </>
                  )}

                  {/* Vertices & Labels */}
                  {['A', 'B', 'C', 'D', 'V', 'O', 'M'].map(k => (
                    <g key={k}>
                      <circle cx={P[k].px} cy={P[k].py} r="4" fill={['V','O','M'].includes(k) ? '#facc15' : '#cbd5e1'} />
                      <text x={P[k].px + 6} y={P[k].py - 6} fill="#e2e8f0" fontSize="12" fontWeight="bold">{k}</text>
                    </g>
                  ))}
                </g>
              )}
            </svg>
          </div>

          {/* Canvas Help Note */}
          <div className="flex items-center justify-between w-full mt-4 text-xs text-slate-400 px-2 font-mono">
            <span>• Drag Pitch/Yaw sliders on left to rotate 3D view</span>
            <span>• Colored right triangles reveal exact 2D projection</span>
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div className="mt-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
            Key Learning Insight: Extracting 2D Right Triangles from 3D Solids
          </h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            Every 3D length and angle problem boils down to finding the correct <strong>2D right-angled triangle</strong> inside the solid. Once you drop the perpendicular line to form the orthogonal projection, apply standard Pythagoras and SOH-CAH-TOA!
          </p>
        </div>
      </div>
    </div>
  );
}
