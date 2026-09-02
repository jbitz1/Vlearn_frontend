import React, { useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, HelpCircle, ArrowRight, Eye, Sliders, Sparkles } from 'lucide-react';

export default function OpticsSim({ config = {}, onTelemetry }) {
  const [lensType, setLensType] = useState('convex'); // 'convex' | 'concave'
  const [focalLength, setFocalLength] = useState(15); // cm
  const [objectDist, setObjectDist] = useState(25); // cm
  const [objectHeight, setObjectHeight] = useState(6); // cm
  const [showRays, setShowRays] = useState(true);
  const [practiceAns, setPracticeAns] = useState('');
  const [practiceStatus, setPracticeStatus] = useState(null); // 'correct' | 'incorrect' | null
  const [showSolution, setShowSolution] = useState(false);

  // Optics calculations
  // 1/f = 1/u + 1/v => 1/v = 1/f - 1/u => v = (u * f) / (u - f) for convex
  // For concave lens, focal length is negative: f_eff = -focalLength
  const effectiveF = lensType === 'convex' ? focalLength : -focalLength;
  const isAtFocalPoint = lensType === 'convex' && Math.abs(objectDist - focalLength) < 0.2;

  let imageDist = 0;
  let isVirtual = false;
  let magnification = 1;
  let imageHeight = 0;

  if (isAtFocalPoint) {
    imageDist = Infinity;
    isVirtual = false;
    magnification = Infinity;
    imageHeight = Infinity;
  } else {
    // 1/v = 1/effectiveF - 1/objectDist = (objectDist - effectiveF) / (effectiveF * objectDist)
    // v = (effectiveF * objectDist) / (objectDist - effectiveF)
    imageDist = (effectiveF * objectDist) / (objectDist - effectiveF);
    isVirtual = imageDist < 0;
    magnification = Math.abs(imageDist / objectDist);
    imageHeight = magnification * objectHeight;
  }

  // Canvas coordinates setup
  // Optical centre O at (400, 200)
  const scale = 8; // 8 pixels per cm
  const cx = 400;
  const cy = 200;

  const objX = cx - objectDist * scale;
  const objY = cy - objectHeight * scale;

  const f1X = cx - focalLength * scale;
  const f2X = cx + focalLength * scale;
  const twoF1X = cx - 2 * focalLength * scale;
  const twoF2X = cx + 2 * focalLength * scale;

  let imgX = cx;
  let imgY = cy;
  if (!isAtFocalPoint && isFinite(imageDist)) {
    imgX = cx + imageDist * scale;
    // Real image is inverted (below axis), virtual image is upright (above axis)
    imgY = isVirtual ? cy - imageHeight * scale : cy + imageHeight * scale;
  }

  const handleReset = () => {
    setLensType('convex');
    setFocalLength(15);
    setObjectDist(25);
    setObjectHeight(6);
    setShowRays(true);
    setPracticeStatus(null);
    setPracticeAns('');
  };

  const checkPractice = (e) => {
    e.preventDefault();
    const val = parseFloat(practiceAns.trim());
    // Practice question: f = 10, u = 15. Find v.
    // 1/v = 1/10 - 1/15 = 1/30 => v = 30 cm
    if (Math.abs(val - 30.0) < 0.5) {
      setPracticeStatus('correct');
      if (onTelemetry) onTelemetry('practice_correct', { problem: 'optics_lens_formula' });
    } else {
      setPracticeStatus('incorrect');
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-3xl p-4 sm:p-6 md:p-8 space-y-8 font-sans border border-slate-800">
      {/* Top Banner / Controls Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Thin Lens Ray Tracing Lab
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Geometric Optics & Image Formation Simulator
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Manipulate object distance (u), focal length (f), and lens geometry in real-time to observe the 3 principal ray paths and calculate image distance (v) and magnification (m).
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setLensType(lensType === 'convex' ? 'concave' : 'convex')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              lensType === 'convex'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
          >
            {lensType === 'convex' ? 'Convex (Converging)' : 'Concave (Diverging)'}
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Optical Bench (Col 8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col items-center overflow-hidden shadow-2xl">
          <div className="w-full flex items-center justify-between px-2 pb-2 text-xs font-medium text-slate-400 border-b border-slate-800">
            <span>Optical Bench Canvas</span>
            <button
              onClick={() => setShowRays(!showRays)}
              className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {showRays ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
              {showRays ? 'Hide Principal Rays' : 'Show Principal Rays'}
            </button>
          </div>

          <div className="w-full aspect-[2/1] min-h-[280px] sm:min-h-[340px] flex items-center justify-center relative">
            <svg viewBox="0 0 800 400" className="w-full h-full select-none">
              {/* Background Grid */}
              <defs>
                <pattern id="optics-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
                <marker id="arrow-obj" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill="#38bdf8" />
                </marker>
                <marker id="arrow-img" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill={isVirtual ? "#f43f5e" : "#22c55e"} />
                </marker>
              </defs>

              <rect width="800" height="400" fill="url(#optics-grid)" />

              {/* Principal Axis */}
              <line x1="20" y1={cy} x2="780" y2={cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" />

              {/* Focal Points and 2F Markers */}
              {/* F1 (Left) */}
              <circle cx={f1X} cy={cy} r="4" fill="#f59e0b" />
              <text x={f1X} y={cy + 18} fill="#f59e0b" fontSize="11" fontWeight="700" textAnchor="middle">F₁ ({focalLength}cm)</text>

              {/* 2F1 (Left) */}
              <circle cx={twoF1X} cy={cy} r="3" fill="#cbd5e1" />
              <text x={twoF1X} y={cy + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">2F₁</text>

              {/* F2 (Right) */}
              <circle cx={f2X} cy={cy} r="4" fill="#f59e0b" />
              <text x={f2X} y={cy + 18} fill="#f59e0b" fontSize="11" fontWeight="700" textAnchor="middle">F₂ ({focalLength}cm)</text>

              {/* 2F2 (Right) */}
              <circle cx={twoF2X} cy={cy} r="3" fill="#cbd5e1" />
              <text x={twoF2X} y={cy + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">2F₂</text>

              {/* Centre Line of Lens at cx = 400 */}
              <line x1={cx} y1="30" x2={cx} y2="370" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

              {/* Lens Body */}
              {lensType === 'convex' ? (
                <path
                  d={`M ${cx},40 Q ${cx - 20},200 ${cx},360 Q ${cx + 20},200 ${cx},40 Z`}
                  fill="#0284c722"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
              ) : (
                <path
                  d={`M ${cx - 15},40 Q ${cx + 8},200 ${cx - 15},360 L ${cx + 15},360 Q ${cx - 8},200 ${cx + 15},40 Z`}
                  fill="#0284c722"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
              )}
              <text x={cx} y="30" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                {lensType === 'convex' ? 'Convex Lens' : 'Concave Lens'}
              </text>

              {/* Object Arrow */}
              <line x1={objX} y1={cy} x2={objX} y2={objY} stroke="#38bdf8" strokeWidth="3.5" markerEnd="url(#arrow-obj)" />
              <text x={objX} y={objY - 8} fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                Object ({objectHeight}cm)
              </text>

              {/* Image Arrow (if not at focal point infinity) */}
              {!isAtFocalPoint && isFinite(imageDist) && (
                <>
                  <line
                    x1={imgX}
                    y1={cy}
                    x2={imgX}
                    y2={imgY}
                    stroke={isVirtual ? '#f43f5e' : '#22c55e'}
                    strokeWidth="3.5"
                    strokeDasharray={isVirtual ? '4 3' : 'none'}
                    markerEnd="url(#arrow-img)"
                  />
                  <text
                    x={imgX}
                    y={isVirtual ? imgY - 8 : imgY + 18}
                    fill={isVirtual ? '#f43f5e' : '#22c55e'}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {isVirtual ? 'Virtual Image' : 'Real Image'} ({imageHeight.toFixed(1)}cm)
                  </text>
                </>
              )}

              {/* Principal Rays */}
              {showRays && !isAtFocalPoint && (
                <>
                  {/* Ray 1: Parallel to Principal Axis -> Refracts through F2 (convex) or diverges from F1 (concave) */}
                  <line x1={objX} y1={objY} x2={cx} y2={objY} stroke="#f59e0b" strokeWidth="1.5" />
                  {lensType === 'convex' ? (
                    <>
                      <line x1={cx} y1={objY} x2={imgX || 780} y2={imgY || cy + 100} stroke="#f59e0b" strokeWidth="1.5" />
                      {isVirtual && (
                        <line x1={cx} y1={objY} x2={imgX} y2={imgY} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" />
                      )}
                    </>
                  ) : (
                    <>
                      <line x1={cx} y1={objY} x2={780} y2={objY - 60} stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1={cx} y1={objY} x2={f1X} y2={cy} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" />
                    </>
                  )}

                  {/* Ray 2: Straight through Optical Centre O (undeflected) */}
                  <line x1={objX} y1={objY} x2={imgX || 780} y2={imgY || cy + 120} stroke="#a855f7" strokeWidth="1.5" />
                  {isVirtual && (
                    <line x1={objX} y1={objY} x2={imgX} y2={imgY} stroke="#a855f7" strokeWidth="1.2" strokeDasharray="3 3" />
                  )}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Controls & Real-Time Parameter Sliders (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-amber-400" /> Optical Parameters
            </h3>

            {/* Object Distance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Object Distance ($u$):</span>
                <span className="font-mono font-bold text-amber-400">{objectDist} cm</span>
              </div>
              <input
                type="range"
                min="4"
                max="45"
                step="0.5"
                value={objectDist}
                onChange={(e) => setObjectDist(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Focal Length Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Focal Length ($f$):</span>
                <span className="font-mono font-bold text-amber-400">{focalLength} cm</span>
              </div>
              <input
                type="range"
                min="8"
                max="22"
                step="1"
                value={focalLength}
                onChange={(e) => setFocalLength(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Object Height Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Object Height ($h_o$):</span>
                <span className="font-mono font-bold text-amber-400">{objectHeight} cm</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={objectHeight}
                onChange={(e) => setObjectHeight(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Calculated Optical Properties */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
              Live Image Characteristics
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Image Distance ($v$)</span>
                <span className="font-mono font-bold text-white text-sm">
                  {isAtFocalPoint ? '∞ (Infinity)' : `${imageDist > 0 ? '+' : ''}${imageDist.toFixed(1)} cm`}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Magnification ($m$)</span>
                <span className="font-mono font-bold text-white text-sm">
                  {isAtFocalPoint ? '∞' : `${magnification.toFixed(2)}×`}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Image Nature</span>
                <span className={`font-bold text-xs ${isVirtual ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isAtFocalPoint ? 'No Image (Parallel)' : isVirtual ? 'Virtual & Upright' : 'Real & Inverted'}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Size Scaling</span>
                <span className="font-bold text-amber-400 text-xs">
                  {isAtFocalPoint ? 'Infinity' : magnification > 1 ? 'Magnified' : magnification === 1 ? 'Same Size' : 'Diminished'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Derivation & Physics Principles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          The Thin Lens Formula & Sign Conventions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400">1. Thin Lens Equation</h4>
            <p className="font-mono text-white text-sm">1/f = 1/u + 1/v</p>
            <p className="text-slate-400 text-xs">Relates object distance (u), image distance (v), and focal length (f).</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400">2. Linear Magnification</h4>
            <p className="font-mono text-white text-sm">m = h<sub>i</sub> / h<sub>o</sub> = v / u</p>
            <p className="text-slate-400 text-xs">Dimensionless ratio comparing image size to physical object size.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400">3. 'Real-is-Positive' Rule</h4>
            <p className="text-xs text-slate-300">
              - Real focus &amp; real image &rarr; <strong>+f, +v</strong><br />
              - Virtual focus &amp; virtual image &rarr; <strong>-f, -v</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Interactive Calculation Challenge */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
          <HelpCircle className="w-5 h-5" /> Quick Calculation Challenge
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          An object is placed <strong>15 cm</strong> in front of a converging convex lens of focal length <strong>10 cm</strong>. What is the calculated image distance (v in cm)?
        </p>

        <form onSubmit={checkPractice} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="number"
            step="0.1"
            placeholder="Image distance v in cm"
            value={practiceAns}
            onChange={(e) => {
              setPracticeAns(e.target.value);
              setPracticeStatus(null);
            }}
            className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500 max-w-xs"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-amber-600/20"
          >
            Check Answer
          </button>
          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
          >
            {showSolution ? 'Hide Solution' : 'Show Step-by-Step Solution'}
          </button>
        </form>

        {practiceStatus === 'correct' && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Correct! 1/v = 1/10 - 1/15 = 1/30 &rArr; v = +30 cm (Real, inverted, magnified image).
          </div>
        )}

        {practiceStatus === 'incorrect' && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
            Incorrect. Remember: 1/v = 1/f - 1/u. Substitute f = 10 cm and u = 15 cm.
          </div>
        )}

        {showSolution && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300 font-mono">
            <p className="font-bold text-amber-400">Step-by-Step Solution:</p>
            <p>1. Lens Formula: 1/f = 1/u + 1/v</p>
            <p>2. Rearranging: 1/v = 1/f - 1/u = 1/10 - 1/15</p>
            <p>3. Common denominator (30): 1/v = (3 - 2)/30 = 1/30</p>
            <p>4. Inverting: v = +30 cm (Real image on opposite side of lens)</p>
          </div>
        )}
      </div>
    </div>
  );
}
