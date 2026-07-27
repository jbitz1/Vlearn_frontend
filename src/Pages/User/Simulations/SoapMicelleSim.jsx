import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Droplets,
  AlertTriangle,
  Info,
  ShieldCheck,
  Target,
  Award,
  Beaker,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function SoapMicelleSim({ config = {}, onTelemetry }) {
  // Config defaults
  const initialSoapAmount = config.initial_soap_amount || 2; // 1: Low, 2: Medium, 3: High
  const initialWaterType = config.initial_water_type || 'soft'; // 'soft' | 'hard'

  // Student Controls (Strictly 2 controls + buttons)
  const [soapAmount, setSoapAmount] = useState(initialSoapAmount); // 1, 2, 3
  const [waterType, setWaterType] = useState(initialWaterType); // 'soft' | 'hard'

  // Animation State
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100

  // Checkpoints State
  const [checkpoints, setCheckpoints] = useState({
    observedSoftSuccess: false,
    observedHardFailure: false,
    comparedBoth: false,
    observedMicelle: false
  });
  const [telemetryEmitted, setTelemetryEmitted] = useState(false);

  // Animation Loop using requestAnimationFrame
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      const step = (time) => {
        const dt = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;
        setProgress((prev) => {
          const next = prev + dt * 22; // ~4.5 sec total duration
          if (next >= 100) {
            setIsRunning(false);
            return 100;
          }
          return next;
        });
        animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning]);

  // Handle checkpoint logic upon animation progression
  useEffect(() => {
    if (progress >= 85) {
      setCheckpoints((prev) => {
        const nextSoft = prev.observedSoftSuccess || waterType === 'soft';
        const nextHard = prev.observedHardFailure || waterType === 'hard';
        const nextMicelle = prev.observedMicelle || waterType === 'soft';
        const nextCompared = nextSoft && nextHard;
        return {
          observedSoftSuccess: nextSoft,
          observedHardFailure: nextHard,
          comparedBoth: nextCompared,
          observedMicelle: nextMicelle
        };
      });
    }
  }, [progress, waterType]);

  // Mastered check
  const isMastered = useMemo(() => {
    return (
      checkpoints.observedSoftSuccess &&
      checkpoints.observedHardFailure &&
      checkpoints.comparedBoth &&
      checkpoints.observedMicelle
    );
  }, [checkpoints]);

  // Telemetry Emission
  useEffect(() => {
    if (isMastered && !telemetryEmitted) {
      setTelemetryEmitted(true);
      if (typeof onTelemetry === 'function') {
        onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
          simulation: 'chem_soap_micelle_action',
          checkpointsCompleted: 4,
          soapAmount,
          waterType
        });
      }
    }
  }, [isMastered, telemetryEmitted, onTelemetry, soapAmount, waterType]);

  // Reset & Control Handlers
  const handleReset = () => {
    setIsRunning(false);
    setProgress(0);
  };

  const handleRun = () => {
    if (progress >= 100) setProgress(0);
    setIsRunning(true);
  };

  // Deterministic Metrics Calculation
  const metrics = useMemo(() => {
    const totalSoap = soapAmount === 1 ? 8 : soapAmount === 2 ? 16 : 24;
    const isSoft = waterType === 'soft';

    const activeSoapCount = isSoft ? totalSoap : Math.floor(totalSoap * 0.25);
    const scumCount = isSoft ? 0 : totalSoap - activeSoapCount;
    const micellesFormed = isSoft ? (soapAmount === 1 ? 1 : soapAmount === 2 ? 2 : 3) : 0;

    const cleaningEfficiency = isSoft
      ? soapAmount === 1 ? 85 : soapAmount === 2 ? 94 : 98
      : soapAmount === 1 ? 25 : soapAmount === 2 ? 32 : 38;

    return {
      totalSoap,
      activeSoapCount,
      scumCount,
      micellesFormed,
      cleaningEfficiency
    };
  }, [soapAmount, waterType]);

  // Generate deterministic molecule data
  const moleculesData = useMemo(() => {
    const count = metrics.totalSoap;
    const items = [];
    const radiusScatter = 140;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      // Scatter positions
      const scatterX = 400 + (radiusScatter + (i % 3) * 25) * Math.cos(angle);
      const scatterY = 220 + (radiusScatter + (i % 3) * 25) * Math.sin(angle);

      // Micelle target positions around oil droplet (r = 44 for tail tip, r = 68 for head)
      const micelleAngle = angle;
      const targetTailX = 400 + 44 * Math.cos(micelleAngle);
      const targetTailY = 310 + 44 * Math.sin(micelleAngle);
      const targetHeadX = 400 + 68 * Math.cos(micelleAngle);
      const targetHeadY = 310 + 68 * Math.sin(micelleAngle);

      // Ca2+ hard water reaction target positions (4 Ca2+ clusters)
      const caClusterIdx = i % 4;
      const caAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
      const caCX = 400 + 170 * Math.cos(caAngles[caClusterIdx]);
      const caCY = 230 + 90 * Math.sin(caAngles[caClusterIdx]);

      items.push({
        id: i,
        angle,
        scatterX,
        scatterY,
        targetTailX,
        targetTailY,
        targetHeadX,
        targetHeadY,
        caCX,
        caCY,
        isScumTarget: i >= metrics.activeSoapCount
      });
    }
    return items;
  }, [metrics.totalSoap, metrics.activeSoapCount]);

  // Position calculations based on animation progress
  const isSoft = waterType === 'soft';
  const pNorm = progress / 100;

  // Oil droplet position
  let oilY = 310;
  if (isSoft && pNorm > 0.65) {
    // Lift away in soft water
    oilY = 310 - (pNorm - 0.65) * 450;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-3 sm:p-5 bg-white rounded-3xl shadow-sm border border-slate-100">
      {/* 1. MISSION BANNER & MASTERED STATUS */}
      <div className="flex flex-col gap-3">
        {isMastered ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between shadow-md animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-emerald-100">
                  Simulation Verified
                </span>
                <h2 className="text-base sm:text-lg font-black mt-0.5">Soap Action Mastered! 🎉</h2>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                  You have successfully explored micelle formation in soft water and scum precipitation in hard water!
                </p>
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse hidden sm:block" />
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    Mission Challenge
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                  🫧 Help soap remove grease by forming micelles. Watch molecules reorganize around oil.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CHECKPOINT PROGRESS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className={`flex items-center gap-2 text-xs font-semibold p-2 rounded-xl border ${checkpoints.observedSoftSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'}`}>
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${checkpoints.observedSoftSuccess ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span>Soft Water Clean</span>
          </div>
          <div className={`flex items-center gap-2 text-xs font-semibold p-2 rounded-xl border ${checkpoints.observedHardFailure ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'}`}>
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${checkpoints.observedHardFailure ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span>Hard Water Failure</span>
          </div>
          <div className={`flex items-center gap-2 text-xs font-semibold p-2 rounded-xl border ${checkpoints.comparedBoth ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'}`}>
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${checkpoints.comparedBoth ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span>Compared Both</span>
          </div>
          <div className={`flex items-center gap-2 text-xs font-semibold p-2 rounded-xl border ${checkpoints.observedMicelle ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'}`}>
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${checkpoints.observedMicelle ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span>Micelle Formed</span>
          </div>
        </div>
      </div>

      {/* 2. STUDENT CONTROLS (Only 2 controls + buttons) */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-md border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* CONTROL 1: SOAP AMOUNT SLIDER */}
          <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Beaker className="w-4 h-4 text-amber-400" />
                Soap Amount
              </label>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {soapAmount === 1 ? 'Low (8 Molecules)' : soapAmount === 2 ? 'Medium (16 Molecules)' : 'High (24 Molecules)'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={soapAmount}
              onChange={(e) => {
                setSoapAmount(parseInt(e.target.value, 10));
                handleReset();
              }}
              disabled={isRunning}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-50"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          {/* CONTROL 2: WATER TYPE DROPDOWN */}
          <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <label className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Water Type
            </label>
            <select
              value={waterType}
              onChange={(e) => {
                setWaterType(e.target.value);
                handleReset();
              }}
              disabled={isRunning}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="soft">Soft Water (No Calcium / Magnesium ions)</option>
              <option value="hard">Hard Water (Contains Ca²⁺ ions)</option>
            </select>
            <p className="text-[11px] text-slate-400 font-medium">
              {waterType === 'soft'
                ? 'Allows full micelle formation and optimal cleaning.'
                : 'Contains Ca²⁺ ions which react with soap to produce insoluble scum flakes.'}
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={isRunning ? () => setIsRunning(false) : handleRun}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> {progress > 0 && progress < 100 ? 'Resume' : 'Run Simulation'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. VISUALIZATION: LARGE CENTRAL SVG ANIMATION */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center">
        {/* Header Overlay inside SVG container */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs font-bold flex items-center gap-2 shadow-md">
            <span className={`w-2.5 h-2.5 rounded-full ${waterType === 'soft' ? 'bg-cyan-400 animate-ping' : 'bg-red-400'}`} />
            <span>Environment: {waterType === 'soft' ? 'Soft Water Solution' : 'Hard Water (Ca²⁺ Present)'}</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs font-mono font-bold shadow-md">
            Progress: {Math.round(progress)}%
          </div>
        </div>

        {/* MAIN SVG ANIMATION CANVAS */}
        <svg
          viewBox="0 0 800 450"
          className="w-full h-auto max-h-[480px] select-none"
          style={{ background: waterType === 'soft' ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(180deg, #0f172a 0%, #334155 100%)' }}
        >
          <defs>
            {/* Oil Droplet Gradient */}
            <radialGradient id="oilGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>

            {/* Hydrophilic Blue Head Gradient */}
            <radialGradient id="headGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="70%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </radialGradient>

            {/* Scum Flake Pattern/Gradient */}
            <radialGradient id="scumGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="60%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>
          </defs>

          {/* WATER CONTAINER / BEAKER BACKGROUND */}
          <rect x="30" y="20" width="740" height="410" rx="20" fill={waterType === 'soft' ? '#0284c7' : '#475569'} opacity="0.1" stroke="#334155" strokeWidth="2" />
          
          {/* Water level wave decor */}
          <path d="M 30 60 Q 200 45, 400 60 T 770 60 L 770 420 L 30 420 Z" fill={waterType === 'soft' ? '#0ea5e9' : '#64748b'} opacity="0.08" />

          {/* FABRIC SURFACE AT BOTTOM */}
          <g>
            <rect x="60" y="380" width="680" height="35" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            {/* Fabric texture lines */}
            {Array.from({ length: 28 }).map((_, i) => (
              <line key={i} x1={75 + i * 24} y1={383} x2={85 + i * 24} y2={412} stroke="#475569" strokeWidth="1.5" opacity="0.4" />
            ))}
            <text x="400" y="402" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold" letterSpacing="1">
              SOILED FABRIC SURFACE
            </text>
          </g>

          {/* HARD WATER CALCIUM IONS (Ca2+) IF HARD WATER */}
          {waterType === 'hard' && (
            <g>
              {[
                { x: 230, y: 140 },
                { x: 570, y: 140 },
                { x: 200, y: 280 },
                { x: 600, y: 280 }
              ].map((ion, idx) => (
                <g key={idx} className="animate-pulse">
                  <circle cx={ion.x} cy={ion.y} r="18" fill="#ef4444" opacity="0.2" />
                  <circle cx={ion.x} cy={ion.y} r="12" fill="#dc2626" stroke="#fca5a5" strokeWidth="1.5" />
                  <text x={ion.x} y={ion.y + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="extrabold">
                    Ca²⁺
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* OIL DROPLET / GREASE SPOT */}
          <g>
            {/* Shadow under oil droplet if on surface */}
            {oilY > 250 && (
              <ellipse cx="400" cy="372" rx={50 * (1 - (310 - oilY) / 100)} ry="8" fill="#000000" opacity="0.4" />
            )}

            {/* Main Oil Droplet */}
            <circle cx="400" cy={oilY} r="40" fill="url(#oilGrad)" stroke="#d97706" strokeWidth="2.5" />
            {/* Specular highlight */}
            <circle cx="386" cy={oilY - 14} r="10" fill="#ffffff" opacity="0.35" />
            <text x="400" y={oilY + 4} textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="extrabold">
              OIL / GREASE
            </text>
          </g>

          {/* HARD WATER SCUM PRECIPITATE CLOUDS */}
          {waterType === 'hard' && pNorm > 0.35 && (
            <g>
              {[
                { x: 230, y: 140 },
                { x: 570, y: 140 },
                { x: 200, y: 280 },
                { x: 600, y: 280 }
              ].map((scum, idx) => {
                const opacity = Math.min(0.9, (pNorm - 0.35) * 2);
                return (
                  <g key={idx} opacity={opacity}>
                    <path
                      d={`M ${scum.x - 30} ${scum.y - 15} Q ${scum.x} ${scum.y - 35}, ${scum.x + 35} ${scum.y - 10} Q ${scum.x + 45} ${scum.y + 20}, ${scum.x + 10} ${scum.y + 30} Q ${scum.x - 25} ${scum.y + 35}, ${scum.x - 35} ${scum.y + 5} Z`}
                      fill="url(#scumGrad)"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <text x={scum.x} y={scum.y + 3} textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="black">
                      Scum (RCOO)₂Ca↓
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* SOAP MOLECULES (TADPOLE SHAPE) */}
          <g>
            {moleculesData.map((m) => {
              let currHeadX = m.scatterX;
              let currHeadY = m.scatterY;
              let currTailX = m.scatterX - 25 * Math.cos(m.angle);
              let currTailY = m.scatterY - 25 * Math.sin(m.angle);
              let isScum = false;

              if (isSoft) {
                // Soft water animation:
                if (pNorm <= 0.65) {
                  // Phase 1: Move from scatter to micelle position around (400, 310)
                  const subP = pNorm / 0.65;
                  currHeadX = m.scatterX + (m.targetHeadX - m.scatterX) * subP;
                  currHeadY = m.scatterY + (m.targetHeadY - m.scatterY) * subP;
                  currTailX = m.scatterX - 25 * Math.cos(m.angle) + (m.targetTailX - (m.scatterX - 25 * Math.cos(m.angle))) * subP;
                  currTailY = m.scatterY - 25 * Math.sin(m.angle) + (m.targetTailY - (m.scatterY - 25 * Math.sin(m.angle))) * subP;
                } else {
                  // Phase 2: Lift away with oil droplet
                  const liftDy = (pNorm - 0.65) * 450;
                  currHeadX = m.targetHeadX;
                  currHeadY = m.targetHeadY - liftDy;
                  currTailX = m.targetTailX;
                  currTailY = m.targetTailY - liftDy;
                }
              } else {
                // Hard water animation:
                if (m.isScumTarget) {
                  isScum = true;
                  const subP = Math.min(1, pNorm / 0.5);
                  currHeadX = m.scatterX + (m.caCX - m.scatterX) * subP;
                  currHeadY = m.scatterY + (m.caCY - m.scatterY) * subP;
                  currTailX = currHeadX - 20 * Math.cos(m.angle);
                  currTailY = currHeadY - 20 * Math.sin(m.angle);
                } else {
                  // Remaining 25% soap moves weakly towards oil
                  const subP = Math.min(1, pNorm / 0.7);
                  currHeadX = m.scatterX + (m.targetHeadX - m.scatterX) * subP * 0.7;
                  currHeadY = m.scatterY + (m.targetHeadY - m.scatterY) * subP * 0.7;
                  currTailX = currHeadX - 22 * Math.cos(m.angle);
                  currTailY = currHeadY - 22 * Math.sin(m.angle);
                }
              }

              // Angle of vector from tail to head
              const dx = currHeadX - currTailX;
              const dy = currHeadY - currTailY;
              const rotAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

              return (
                <g key={m.id} transform={`translate(${currTailX}, ${currTailY}) rotate(${rotAngle})`}>
                  {/* Wavy Hydrophobic Tail (Yellow) */}
                  <path
                    d="M 0 0 Q 5 -5, 10 0 T 20 0 T 30 0"
                    stroke={isScum && pNorm > 0.4 ? '#64748b' : '#f59e0b'}
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Hydrophilic Polar Head (Blue) */}
                  <circle
                    cx="36"
                    cy="0"
                    r="8"
                    fill={isScum && pNorm > 0.4 ? '#475569' : 'url(#headGrad)'}
                    stroke={isScum && pNorm > 0.4 ? '#334155' : '#1d4ed8'}
                    strokeWidth="1.5"
                  />
                  {/* Minus sign on head */}
                  <text x="36" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                    ⁻
                  </text>
                </g>
              );
            })}
          </g>

          {/* MICELLE CAPTION & WATER ACTION OVERLAY */}
          {isSoft && pNorm > 0.55 && (
            <g className="animate-fade-in">
              <rect x="300" y={oilY - 80} width="200" height="28" rx="8" fill="#0f172a" opacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="400" y={oilY - 62} textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="extrabold">
                ✨ Formed Micelle Lifts Grease!
              </text>
            </g>
          )}

          {/* HARD WATER FAILURE ANNOTATION */}
          {!isSoft && pNorm > 0.6 && (
            <g className="animate-fade-in">
              <rect x="270" y="335" width="260" height="30" rx="8" fill="#450a0a" opacity="0.9" stroke="#f87171" strokeWidth="1.5" />
              <text x="400" y={354} textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="extrabold">
                ⚠️ Scum Precipitate Traps Soap! Oil Remains.
              </text>
            </g>
          )}
        </svg>

        {/* Legend Ribbon below SVG */}
        <div className="w-full bg-slate-950/90 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-around gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-2 bg-amber-500 rounded-full" />
            <span className="font-semibold text-amber-400">Hydrophobic Tail</span> (Non-polar oil-loving)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-[9px] text-white font-bold">
              ⁻
            </div>
            <span className="font-semibold text-blue-400">Hydrophilic Head</span> (Polar water-loving)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full fill-amber-500 bg-amber-500 border border-amber-600" />
            <span className="font-semibold text-amber-300">Oil Droplet</span> (Grease)
          </div>
          {waterType === 'hard' && (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-500 border border-slate-300" />
              <span className="font-semibold text-slate-300">Scum Flake</span> (Insoluble precipitate)
            </div>
          )}
        </div>
      </div>

      {/* 4. OBSERVATION PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Soap Available</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{metrics.totalSoap}</span>
            <span className="text-xs text-slate-500 font-semibold">Molecules</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Active: <span className="font-bold text-blue-600">{metrics.activeSoapCount}</span> | Scum Locked: <span className="font-bold text-red-500">{metrics.scumCount}</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Micelles Formed</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{metrics.micellesFormed}</span>
            <span className="text-xs text-slate-500 font-semibold">Structures</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {waterType === 'soft' ? 'Spherical alignment around oil' : '0 due to Ca²⁺ interference'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Cleaning Efficiency</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${metrics.cleaningEfficiency >= 80 ? 'text-emerald-600' : 'text-red-500'}`}>
              {metrics.cleaningEfficiency}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${metrics.cleaningEfficiency >= 80 ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${metrics.cleaningEfficiency}%` }}
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Water Environment</span>
          <div className="mt-2">
            <span className={`text-sm font-extrabold px-2.5 py-1 rounded-lg inline-block ${waterType === 'soft' ? 'bg-cyan-100 text-cyan-800' : 'bg-red-100 text-red-800'}`}>
              {waterType === 'soft' ? 'Soft Water' : 'Hard Water'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {waterType === 'soft' ? 'Free carboxylate ions' : 'High Ca²⁺ concentration'}
          </p>
        </div>
      </div>

      {/* 5. SCIENTIFIC EXPLANATION & REAL-WORLD APPLICATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Scientific Explanation */}
        <div className="bg-blue-50/60 border border-blue-200 p-4 sm:p-5 rounded-3xl space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            Scientific Explanation
          </h4>
          {waterType === 'soft' ? (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Soap molecules contain a <strong>hydrophilic (polar) carboxylate head</strong> (<code>-COO⁻</code>) and a <strong>hydrophobic (non-polar) hydrocarbon tail</strong>. In soft water, the tails dissolve into non-polar oil/grease while heads face outward towards water, forming a <strong>spherical micelle</strong> that emulsifies oil and washes it away.
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Hard water contains dissolved <strong>calcium (Ca²⁺)</strong> and <strong>magnesium (Mg²⁺)</strong> ions. These divalent cations react with soap anions to form insoluble precipitate called <strong>scum</strong>:
              <br />
              <code className="block my-1.5 p-2 bg-white rounded-lg border border-red-200 text-red-700 font-mono text-[11px]">
                2 RCOO⁻(aq) + Ca²⁺(aq) → (RCOO)₂Ca(s) ↓
              </code>
              This consumes soap molecules before micelles can enclose the grease.
            </p>
          )}
        </div>

        {/* Real-World Application */}
        <div className="bg-emerald-50/60 border border-emerald-200 p-4 sm:p-5 rounded-3xl space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Real-World Application
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            <strong>Detergents vs. Soap:</strong> Synthetic detergents (e.g. alkylbenzene sulfonates) do not form insoluble scum with hard water because their calcium and magnesium salts are water-soluble. Water softening techniques (such as adding washing soda Na₂CO₃ or using ion-exchange resins) remove Ca²⁺ ions to restore soap efficiency in laundry.
          </p>
        </div>
      </div>
    </div>
  );
}
