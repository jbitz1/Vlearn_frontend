import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, HelpCircle, Wind, Layers, ArrowRight } from 'lucide-react';

const GASES_B = [
  { name: 'Hydrogen', formula: 'H₂', M: 2.0, color: '#ec4899', desc: 'Ultra-light gas' },
  { name: 'Methane', formula: 'CH₄', M: 16.0, color: '#38bdf8', desc: 'Slightly lighter than NH₃' },
  { name: 'Hydrogen Chloride', formula: 'HCl', M: 36.5, color: '#a855f7', desc: 'Classic KLB experiment — forms NH₄Cl' },
  { name: 'Carbon Dioxide', formula: 'CO₂', M: 44.0, color: '#fb923c', desc: 'Heavier than air' },
  { name: 'Sulphur Dioxide', formula: 'SO₂', M: 64.0, color: '#facc15', desc: 'Heavy dense gas' },
  { name: 'Chlorine', formula: 'Cl₂', M: 71.0, color: '#a3e635', desc: 'Very heavy halogen gas' },
];

export default function GrahamsLawSim({ config = {}, onTelemetry }) {
  const MA = 17.0; // NH3 molar mass in g/mol
  const [gasBIndex, setGasBIndex] = useState(2); // default HCl
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isDiffusing, setIsDiffusing] = useState(false);
  const [practiceAns, setPracticeAns] = useState('');
  const [practiceStatus, setPracticeStatus] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  const timerRef = useRef(null);
  const selectedGasB = GASES_B[gasBIndex];
  const MB = selectedGasB.M;

  // Rate of diffusion R ∝ 1 / sqrt(M)
  // Rate ratio RA / RB = sqrt(MB / MA)
  const rateRatio = Math.sqrt(MB / MA);

  // Meeting point fraction from left (NH3 side)
  // Distance_A / Distance_B = rateRatio -> x / (1 - x) = rateRatio -> x = rateRatio / (1 + rateRatio)
  const meetFraction = rateRatio / (1 + rateRatio);

  useEffect(() => {
    if (isDiffusing) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            setIsDiffusing(false);
            return 1;
          }
          return prev + 0.018;
        });
      }, 35);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isDiffusing]);

  const handleStartRelease = () => {
    setProgress(0);
    setIsDiffusing(true);
  };

  const handleReset = () => {
    setIsDiffusing(false);
    setProgress(0);
  };

  const handleSelectGasB = (idx) => {
    setGasBIndex(idx);
    handleReset();
  };

  const handleCheckPractice = () => {
    const val = parseFloat(practiceAns);
    // Problem: H2 (M=2.0) vs O2 (M=32.0) -> R(H2)/R(O2) = sqrt(32 / 2) = sqrt(16) = 4.0
    if (!isNaN(val) && Math.abs(val - 4.0) < 0.2) {
      setPracticeStatus('correct');
      if (typeof onTelemetry === 'function') {
        onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
          simulation: 'chem_grahams_law_diffusion',
          score: 1.0,
        });
      }
    } else {
      setPracticeStatus('incorrect');
    }
  };

  // Tube visual geometry
  const tubeW = 580;
  const tubeH = 46;
  const tubeX = 50;
  const tubeY = 50;

  // Current progress positions
  const posA = tubeX + progress * meetFraction * tubeW;
  const posB = tubeX + tubeW - progress * (1 - meetFraction) * tubeW;
  const meetX = tubeX + meetFraction * tubeW;

  // Graph geometry
  const pad = 44;
  const gw = 320;
  const gh = 220;
  const x0 = pad;
  const y0 = gh - pad;
  const x1 = gw - 16;
  const y1 = 20;
  const Xmax = 0.75;
  const Ymax = 0.75;
  const sx = (v) => x0 + (v / Xmax) * (x1 - x0);
  const sy = (v) => y0 - (v / Ymax) * (y0 - y1);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-slate-900">
      {/* 1. Unified Widescreen Interactive Diffusion Lab Stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-purple-300 uppercase">
              Graham's Law Diffusion Race Tube & Rate Graph
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
              Identical T & P
            </span>
            <span className="text-[11px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full">
              Rate(NH₃) / Rate({selectedGasB.formula}) = {rateRatio.toFixed(2)}×
            </span>
          </div>
        </div>

        {/* Expansive Horizontal Diffusion Tube Viewport */}
        <div className="bg-slate-950/90 rounded-2xl p-4 sm:p-6 border border-slate-800/90 shadow-inner flex flex-col items-center justify-center">
          <svg viewBox="0 0 680 140" className="w-full max-w-[680px] h-auto select-none">
            <defs>
              <linearGradient id="gasAGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="gasBGrad" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor={selectedGasB.color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={selectedGasB.color} stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Glass Tube Body */}
            <rect
              x={tubeX}
              y={tubeY}
              width={tubeW}
              height={tubeH}
              rx="8"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="2.5"
            />

            {/* Gas A Diffusing Front (Left -> Right) */}
            {posA > tubeX && (
              <rect
                x={tubeX + 16}
                y={tubeY + 2}
                width={Math.max(0, posA - (tubeX + 16))}
                height={tubeH - 4}
                fill="url(#gasAGrad)"
                opacity="0.85"
              />
            )}

            {/* Gas B Diffusing Front (Right -> Left) */}
            {posB < tubeX + tubeW && (
              <rect
                x={posB}
                y={tubeY + 2}
                width={Math.max(0, tubeX + tubeW - 16 - posB)}
                height={tubeH - 4}
                fill="url(#gasBGrad)"
                opacity="0.85"
              />
            )}

            {/* White Ring Formation when fronts meet */}
            {progress >= 0.98 && (
              <g>
                <rect
                  x={meetX - 4}
                  y={tubeY - 4}
                  width="8"
                  height={tubeH + 8}
                  rx="3"
                  fill="#ffffff"
                  className="animate-pulse"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                />
                <text
                  x={meetX}
                  y={tubeY - 10}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  WHITE RING
                </text>
              </g>
            )}

            {/* Left Cotton Wool Plug (NH3) */}
            <rect
              x={tubeX}
              y={tubeY}
              width="16"
              height={tubeH}
              rx="4"
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <text
              x={tubeX + 8}
              y={tubeY - 12}
              textAnchor="middle"
              fill="#2dd4bf"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              NH₃ (M=17)
            </text>

            {/* Right Cotton Wool Plug (Gas B) */}
            <rect
              x={tubeX + tubeW - 16}
              y={tubeY}
              width="16"
              height={tubeH}
              rx="4"
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <text
              x={tubeX + tubeW - 8}
              y={tubeY - 12}
              textAnchor="middle"
              fill={selectedGasB.color}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {selectedGasB.formula} (M={MB.toFixed(1)})
            </text>
          </svg>
        </div>

        {/* 2-Column Unified Sub-Grid: Gas Selector & Controls | Live Rate vs 1/√M Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Gas B Selector, Action Buttons & Telemetry (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 bg-slate-950/70 rounded-2xl p-4 sm:p-5 border border-slate-800/70">
            {/* Gas B Selector Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-300 font-bold uppercase tracking-wider">
                Select Gas B to Race Against NH₃ (Ammonia):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {GASES_B.map((g, idx) => (
                  <button
                    key={g.formula}
                    onClick={() => handleSelectGasB(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      gasBIndex === idx
                        ? 'bg-purple-950/80 border-purple-400 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-mono">{g.formula}</span>
                      <span className="text-[9px] font-mono text-slate-400">{g.M}g</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-0.5 truncate">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleStartRelease}
                disabled={isDiffusing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {progress >= 1 ? 'Race Again' : isDiffusing ? 'Diffusing Along Tube...' : 'Release Both Gases'}
              </button>
              <button
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Tube
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[9px] uppercase text-slate-400">Gas A: NH₃</span>
                <span className="text-sm font-bold text-teal-300 mt-0.5">
                  M<sub>A</sub> = 17.0 g/mol
                </span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[9px] uppercase text-slate-400">Gas B: {selectedGasB.name}</span>
                <span className="text-sm font-bold text-purple-300 mt-0.5">
                  M<sub>B</sub> = {MB.toFixed(1)} g/mol
                </span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[9px] uppercase text-slate-400">Rate Ratio</span>
                <span className="text-sm font-bold text-amber-400 mt-0.5">
                  R(NH₃) / R({selectedGasB.formula}) = {rateRatio.toFixed(2)}×
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Rate vs 1/√M Graph (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/70 rounded-2xl p-4 border border-slate-800/70 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                Live Rate vs. 1/√(Molar Mass)
              </span>
              <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                Rate ∝ 1/√M
              </span>
            </div>

            <div className="flex items-center justify-center my-auto py-1">
              <svg viewBox={`0 0 ${gw} ${gh}`} className="w-full max-w-[300px] h-auto">
                <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="#64748b" strokeWidth="1.5" />
                <line x1={x0} y1={y0} x2={x0} y2={y1} stroke="#64748b" strokeWidth="1.5" />
                <text x={(x0 + x1) / 2} y={gh - 8} textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                  1 / √(Molar Mass)
                </text>
                <text x={12} y={(y0 + y1) / 2} textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace" transform={`rotate(-90 12 ${(y0 + y1) / 2})`}>
                  Relative Rate
                </text>

                {/* Linear trend through origin */}
                <line x1={sx(0)} y1={sy(0)} x2={sx(Xmax)} y2={sy(Xmax)} stroke="#f59e0b" strokeWidth="2" opacity="0.6" />

                {/* Other gases */}
                {GASES_B.map((g, i) => {
                  const xv = 1 / Math.sqrt(g.M);
                  const isCurrent = i === gasBIndex;
                  return (
                    <g key={g.formula}>
                      <circle
                        cx={sx(xv)}
                        cy={sy(xv)}
                        r={isCurrent ? 6 : 3.5}
                        fill={isCurrent ? '#a855f7' : '#475569'}
                        stroke={isCurrent ? '#ffffff' : 'none'}
                        strokeWidth={isCurrent ? 2 : 0}
                      />
                      <text
                        x={sx(xv)}
                        y={sy(xv) - 9}
                        textAnchor="middle"
                        fill={isCurrent ? '#a855f7' : '#64748b'}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight={isCurrent ? 'bold' : 'normal'}
                      >
                        {g.formula}
                      </text>
                    </g>
                  );
                })}

                {/* NH3 fixed point */}
                <circle cx={sx(1 / Math.sqrt(MA))} cy={sy(1 / Math.sqrt(MA))} r="5" fill="#2dd4bf" stroke="#ffffff" strokeWidth="1.5" />
                <text x={sx(1 / Math.sqrt(MA))} y={sy(1 / Math.sqrt(MA)) - 9} textAnchor="middle" fill="#2dd4bf" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  NH₃
                </text>
              </svg>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-[10px] font-mono text-center text-purple-300">
              Lighter molecules travel faster · Rate ∝ 1/√M
            </div>
          </div>
        </div>
      </div>

      {/* 2. Formula & Practice Problem Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Graham's Law Formula */}
        <div className="lg:col-span-6 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase">
              Graham's Law Mathematical Formula
            </span>
            <div className="text-xl font-bold font-serif text-gray-900 mt-2 flex items-center gap-2 flex-wrap">
              <span>R<sub>A</sub> / R<sub>B</sub> = √(M<sub>B</sub> / M<sub>A</sub>) = t<sub>B</sub> / t<sub>A</sub></span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2 font-mono text-xs text-gray-700">
            <div className="flex justify-between">
              <span>Molar mass of NH₃ (M<sub>A</sub>):</span>
              <span className="font-bold text-teal-700">17.0 g/mol</span>
            </div>
            <div className="flex justify-between">
              <span>Molar mass of {selectedGasB.formula} (M<sub>B</sub>):</span>
              <span className="font-bold text-purple-700">{MB.toFixed(1)} g/mol</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-purple-900 bg-purple-50/70 p-2.5 rounded-xl font-bold">
              <span>Relative Rate Ratio:</span>
              <span>
                √({MB.toFixed(1)} / 17.0) = {rateRatio.toFixed(2)}×
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Knowledge Check Challenge */}
        <div className="lg:col-span-6 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            Quick Calculation Challenge
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Hydrogen gas (<strong className="text-gray-900">H₂, M = 2.0 g/mol</strong>) and oxygen gas (<strong className="text-gray-900">O₂, M = 32.0 g/mol</strong>) diffuse under identical conditions. How many times faster does hydrogen diffuse than oxygen?
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              placeholder="Rate ratio"
              value={practiceAns}
              onChange={(e) => setPracticeAns(e.target.value)}
              className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold focus:outline-purple-500"
            />
            <button
              onClick={handleCheckPractice}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Check Answer
            </button>
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="text-xs text-purple-800 font-semibold underline ml-auto cursor-pointer"
            >
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
          </div>

          {practiceStatus === 'correct' && (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Correct! R(H₂) / R(O₂) = √(32.0 / 2.0) = √16 = 4.0× faster.</span>
            </div>
          )}
          {practiceStatus === 'incorrect' && (
            <div className="text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs font-medium">
              Use R<sub>A</sub> / R<sub>B</sub> = √(M<sub>B</sub> / M<sub>A</sub>) with M(O₂) = 32 and M(H₂) = 2. Try again!
            </div>
          )}

          {showSolution && (
            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-amber-200 space-y-1 font-mono text-gray-700">
              <p>1. Formula: R(H₂) / R(O₂) = √(M(O₂) / M(H₂))</p>
              <p>2. Substitute masses: √(32.0 / 2.0) = √16.0 = <strong>4.0</strong></p>
              <p>3. Hydrogen gas diffuses 4 times faster than oxygen gas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
