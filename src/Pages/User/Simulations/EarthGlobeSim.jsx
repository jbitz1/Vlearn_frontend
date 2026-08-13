import React, { useState, useEffect } from 'react';
import { Globe, Compass, Clock, Navigation, ShieldCheck, Sparkles, Sliders } from 'lucide-react';

export default function EarthGlobeSim({ config = {}, onTelemetry }) {
  // Point P coordinates
  const [latP, setLatP] = useState(40); // Latitude P (-80 to 80 deg)
  const [lonP, setLonP] = useState(-30); // Longitude P (-180 to 180 deg)

  // Point Q coordinates
  const [latQ, setLatQ] = useState(40); // Latitude Q (-80 to 80 deg)
  const [lonQ, setLonQ] = useState(60); // Longitude Q (-180 to 180 deg)

  // Flight speed in knots
  const [speedKnots, setSpeedKnots] = useState(400);

  // Globe rotation angles for 3D visualization
  const [viewRotY, setViewRotY] = useState(15);
  const [viewRotX, setViewRotX] = useState(20);

  const [exploredFeatures, setExploredFeatures] = useState({
    coordinates: false,
    smallCircle: false,
    timeDifference: false,
    flightSpeed: false,
  });

  useEffect(() => {
    if (latP !== 40 || lonP !== -30) setExploredFeatures(prev => ({ ...prev, coordinates: true }));
    if (latP === latQ && lonP !== lonQ) setExploredFeatures(prev => ({ ...prev, smallCircle: true }));
    if (Math.abs(lonP - lonQ) > 0) setExploredFeatures(prev => ({ ...prev, timeDifference: true }));
    if (speedKnots !== 400) setExploredFeatures(prev => ({ ...prev, flightSpeed: true }));
  }, [latP, lonP, latQ, lonQ, speedKnots]);

  const allCompleted = exploredFeatures.coordinates && exploredFeatures.smallCircle && exploredFeatures.timeDifference && exploredFeatures.flightSpeed;

  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_earth_globe_explorer',
        message: 'Student mastered Earth coordinates, Great vs Small circle distances, longitude-time conversions, and navigation speed in knots.',
      });
    }
  }, [allCompleted, onTelemetry]);

  // Spherical Math Constants & Calculations
  const EARTH_R_KM = 6370;

  // Lat / Lon to Radians
  const radLatP = (latP * Math.PI) / 180;
  const radLonP = (lonP * Math.PI) / 180;
  const radLatQ = (latQ * Math.PI) / 180;
  const radLonQ = (lonQ * Math.PI) / 180;

  // Small circle radius at latitude P
  const smallRadiusKm = Math.round(EARTH_R_KM * Math.cos(radLatP));

  // Angular difference for Great Circle distance
  // cos(theta) = sin(latP)*sin(latQ) + cos(latP)*cos(latQ)*cos(lonP - lonQ)
  const cosTheta = Math.sin(radLatP) * Math.sin(radLatQ) + Math.cos(radLatP) * Math.cos(radLatQ) * Math.cos(radLonP - radLonQ);
  const thetaRad = Math.acos(Math.min(1, Math.max(-1, cosTheta)));
  const thetaDeg = Math.round(((thetaRad * 180) / Math.PI) * 10) / 10;

  // Great Circle Distance
  const distGreatNm = Math.round(thetaDeg * 60);
  const distGreatKm = Math.round((thetaDeg / 360) * 2 * Math.PI * EARTH_R_KM);

  // Small Circle Distance (if along same parallel)
  const deltaLon = Math.abs(lonP - lonQ);
  const effectiveDeltaLon = deltaLon > 180 ? 360 - deltaLon : deltaLon;
  const distSmallNm = Math.round(effectiveDeltaLon * 60 * Math.cos(radLatP));
  const distSmallKm = Math.round((effectiveDeltaLon / 360) * 2 * Math.PI * EARTH_R_KM * Math.cos(radLatP));

  // Time difference across longitudes (15 deg = 1 hour, 1 deg = 4 mins)
  const totalTimeMins = Math.round(effectiveDeltaLon * 4);
  const timeHours = Math.floor(totalTimeMins / 60);
  const timeMinsRem = totalTimeMins % 60;

  // Flight duration at speed (knots)
  const flightHoursGreat = (distGreatNm / speedKnots).toFixed(1);
  const flightHoursSmall = (distSmallNm / speedKnots).toFixed(1);

  // 3D Globe Projection Math (Orthographic projection onto SVG canvas 320x320)
  const GLOBE_CENTER = 160;
  const GLOBE_R = 110;

  const project3D = (latDeg, lonDeg) => {
    const phi = (latDeg * Math.PI) / 180;
    const lambda = ((lonDeg + viewRotY) * Math.PI) / 180;
    const tilt = (viewRotX * Math.PI) / 180;

    // Standard 3D sphere coordinates
    const x3d = Math.cos(phi) * Math.sin(lambda);
    const y3d = Math.sin(phi);
    const z3d = Math.cos(phi) * Math.cos(lambda);

    // Rotate around X axis (tilt)
    const yRot = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
    const zRot = y3d * Math.sin(tilt) + z3d * Math.cos(tilt);

    return {
      x: GLOBE_CENTER + x3d * GLOBE_R,
      y: GLOBE_CENTER - yRot * GLOBE_R,
      visible: zRot > 0,
    };
  };

  const posP = project3D(latP, lonP);
  const posQ = project3D(latQ, lonQ);

  // Helper string for latitude N/S
  const formatLat = (val) => (val >= 0 ? `${val}°N` : `${Math.abs(val)}°S`);
  const formatLon = (val) => (val >= 0 ? `${val}°E` : `${Math.abs(val)}°W`);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-sans">
              3D Spherical Geometry Explorer
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            Longitudes, Latitudes &amp; Great Circle Navigation
          </h3>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700 text-xs font-mono">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">Earth R = {EARTH_R_KM} km (3437 nm)</span>
        </div>
      </div>

      {/* Main Grid: Controls (5 cols) + 3D Visualizer & Results (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Coordinate Sliders & Navigation Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Point P Controls */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Position P ({formatLat(latP)}, {formatLon(lonP)})
              </span>
            </div>

            <div className="text-xs font-mono space-y-2">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Latitude α₁:</span>
                  <span className="text-amber-400 font-bold">{formatLat(latP)}</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="5"
                  value={latP}
                  onChange={(e) => setLatP(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Longitude λ₁:</span>
                  <span className="text-amber-400 font-bold">{formatLon(lonP)}</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="10"
                  value={lonP}
                  onChange={(e) => setLonP(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Point Q Controls */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Position Q ({formatLat(latQ)}, {formatLon(lonQ)})
              </span>
              <button
                onClick={() => setLatQ(latP)}
                className="text-[11px] bg-slate-700 hover:bg-slate-600 text-cyan-300 px-2 py-1 rounded transition-all"
              >
                Match P's Latitude
              </button>
            </div>

            <div className="text-xs font-mono space-y-2">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Latitude α₂:</span>
                  <span className="text-cyan-400 font-bold">{formatLat(latQ)}</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="5"
                  value={latQ}
                  onChange={(e) => setLatQ(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Longitude λ₂:</span>
                  <span className="text-cyan-400 font-bold">{formatLon(lonQ)}</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="10"
                  value={lonQ}
                  onChange={(e) => setLonQ(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Flight Speed & Globe Rotate Sliders */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Flight Speed &amp; 3D Globe Controls
            </span>

            <div className="text-xs font-mono">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Flight Speed (Knots):</span>
                <span className="text-emerald-400 font-bold">{speedKnots} knots</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="50"
                value={speedKnots}
                onChange={(e) => setSpeedKnots(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="text-xs font-mono pt-1">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Rotate 3D Globe Y:</span>
                <span className="text-slate-400">{viewRotY}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={viewRotY}
                onChange={(e) => setViewRotY(parseInt(e.target.value))}
                className="w-full accent-slate-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: 3D Globe Viewport & Live Calculations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3D Globe SVG Render */}
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center shadow-inner min-h-[300px]">
            <svg width="320" height="320" className="overflow-visible">
              {/* Globe Outer Sphere */}
              <circle cx={GLOBE_CENTER} cy={GLOBE_CENTER} r={GLOBE_R} fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2.5" />

              {/* Equator Line */}
              <ellipse cx={GLOBE_CENTER} cy={GLOBE_CENTER} rx={GLOBE_R} ry={GLOBE_R * Math.sin((viewRotX * Math.PI) / 180)} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Small Circle Parallel at latP */}
              {Math.abs(latP) < 85 && (
                <ellipse
                  cx={GLOBE_CENTER}
                  cy={GLOBE_CENTER - GLOBE_R * Math.sin((latP * Math.PI) / 180) * Math.cos((viewRotX * Math.PI) / 180)}
                  rx={GLOBE_R * Math.cos((latP * Math.PI) / 180)}
                  ry={GLOBE_R * Math.cos((latP * Math.PI) / 180) * Math.sin((viewRotX * Math.PI) / 180)}
                  fill="none"
                  stroke="#e879f9"
                  strokeWidth="2"
                />
              )}

              {/* Line P to Q (Great Circle Shortcut Vector) */}
              {posP.visible && posQ.visible && (
                <line x1={posP.x} y1={posP.y} x2={posQ.x} y2={posQ.y} stroke="#facc15" strokeWidth="3" />
              )}

              {/* Point P */}
              {posP.visible && (
                <g>
                  <circle cx={posP.x} cy={posP.y} r="7" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                  <text x={posP.x + 10} y={posP.y - 5} fill="#facc15" fontSize="12" fontWeight="bold">P</text>
                </g>
              )}

              {/* Point Q */}
              {posQ.visible && (
                <g>
                  <circle cx={posQ.x} cy={posQ.y} r="7" fill="#22d3ee" stroke="#ffffff" strokeWidth="2" />
                  <text x={posQ.x + 10} y={posQ.y - 5} fill="#22d3ee" fontSize="12" fontWeight="bold">Q</text>
                </g>
              )}
            </svg>

            <div className="absolute bottom-3 left-4 text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 font-bold">― Equator</span> | <span className="text-fuchsia-400 font-bold">― Parallel {formatLat(latP)} (r = {smallRadiusKm} km)</span>
            </div>
          </div>

          {/* Live Navigation Calculations Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Great Circle Distance */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-amber-500/40 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between text-amber-400 font-sans font-bold">
                <span>Great Circle Route (Shortest)</span>
                <Navigation className="w-4 h-4" />
              </div>
              <p className="text-slate-300 pt-1">Subtended Angle θ = <strong className="text-amber-400">{thetaDeg}°</strong></p>
              <p className="text-white font-bold text-sm">D = {distGreatNm.toLocaleString()} nm</p>
              <p className="text-slate-400">({distGreatKm.toLocaleString()} km)</p>
              <div className="pt-2 text-emerald-400 font-sans font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Flight Time: {flightHoursGreat} hours @ {speedKnots} kts
              </div>
            </div>

            {/* Small Circle / Longitude Time */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-cyan-500/40 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between text-cyan-400 font-sans font-bold">
                <span>Longitude-Time &amp; Small Circle</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-slate-300 pt-1">ΔLongitude = <strong className="text-cyan-400">{effectiveDeltaLon}°</strong></p>
              <p className="text-amber-300 font-bold">Time Difference: {timeHours}h {timeMinsRem}m</p>

              {latP === latQ ? (
                <>
                  <p className="text-fuchsia-300">Parallel Distance: {distSmallNm.toLocaleString()} nm</p>
                  <p className="text-slate-400">Flight: {flightHoursSmall} hours</p>
                </>
              ) : (
                <p className="text-slate-400 italic text-[11px] pt-1">Select same latitude for P &amp; Q to calculate small circle parallel route.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Insight Card */}
      <div className="mt-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">
            Key Learning Insight: Great Circle vs. Small Circle Distances
          </h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            1 minute of arc along any <strong className="text-amber-300">Great Circle</strong> equals <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">1 Nautical Mile (nm)</code>. Along a <strong className="text-fuchsia-300">Small Circle Parallel (Latitude α)</strong>, the circle radius shrinks to <code className="bg-slate-900 px-1.5 py-0.5 rounded text-fuchsia-300 font-mono">r = R cos α</code>, so distance along latitude equals <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono">d = 60 × Δλ × cos α nm</code>!
          </p>
        </div>
      </div>
    </div>
  );
}
