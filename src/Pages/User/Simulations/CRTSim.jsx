import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, HelpCircle, Eye, Sliders, Sparkles, Zap, Activity } from 'lucide-react';

export default function CRTSim({ config = {}, onTelemetry }) {
  const [acceleratingVoltage, setAcceleratingVoltage] = useState(2500); // V
  const [deflectionVoltageY, setDeflectionVoltageY] = useState(40); // V
  const [timeBaseFrequency, setTimeBaseFrequency] = useState(50); // Hz
  const [timeBaseOn, setTimeBaseOn] = useState(true);
  const [signalType, setSignalType] = useState('sine'); // 'sine' | 'dc' | 'square'
  const [isPlaying, setIsPlaying] = useState(true);
  const [practiceAns, setPracticeAns] = useState('');
  const [practiceStatus, setPracticeStatus] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  // Electron physics constants
  const e = 1.6e-19; // C
  const m = 9.11e-31; // kg
  // v = sqrt(2 * e * Va / m)
  const electronVelocity = Math.sqrt((2 * e * acceleratingVoltage) / m); // m/s
  const velocityInKmPerS = (electronVelocity / 1e3).toFixed(0);

  // Canvas trace simulation
  const animTimeRef = useRef(0);
  const animFrameRef = useRef(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let lastT = performance.now();
    const loop = (now) => {
      if (isPlaying) {
        const dt = (now - lastT) / 1000;
        animTimeRef.current += dt;
        setTime(animTimeRef.current);
      }
      lastT = now;
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  const handleReset = () => {
    setAcceleratingVoltage(2500);
    setDeflectionVoltageY(40);
    setTimeBaseFrequency(50);
    setTimeBaseOn(true);
    setSignalType('sine');
    setIsPlaying(true);
    setPracticeStatus(null);
    setPracticeAns('');
  };

  const checkPractice = (e) => {
    e.preventDefault();
    const val = parseFloat(practiceAns.trim());
    // Practice: Va = 2000V. Find velocity in 10^7 m/s
    // v = sqrt(2 * 1.6e-19 * 2000 / 9.11e-31) = sqrt(7.025e14) = 2.65e7 m/s = 2.65
    if (Math.abs(val - 2.65) < 0.1) {
      setPracticeStatus('correct');
      if (onTelemetry) onTelemetry('practice_correct', { problem: 'crt_electron_velocity' });
    } else {
      setPracticeStatus('incorrect');
    }
  };

  // Generate CRO screen trace points
  // 1 cm = 30 px, screen is 8 divisions wide (240px) and 8 divisions high (240px)
  const screenW = 260;
  const screenH = 260;
  const numDivs = 8;
  const divPx = screenW / numDivs;

  const getTracePath = () => {
    const points = [];
    const amplitudePx = (deflectionVoltageY / 20) * (divPx / 2); // 20V/div

    if (!timeBaseOn) {
      // Static line or spot
      if (signalType === 'dc') {
        const y = screenH / 2 - amplitudePx;
        return `M ${screenW / 2} ${y} L ${screenW / 2} ${y}`;
      }
      // AC without time base creates vertical straight line
      return `M ${screenW / 2} ${screenH / 2 - amplitudePx} L ${screenW / 2} ${screenH / 2 + amplitudePx}`;
    }

    // With time base on:
    const wavelengthPx = screenW / (timeBaseFrequency / 20);
    for (let x = 0; x <= screenW; x += 2) {
      let y = screenH / 2;
      const phase = (x / wavelengthPx) * 2 * Math.PI + time * 5;
      if (signalType === 'sine') {
        y = screenH / 2 - Math.sin(phase) * amplitudePx;
      } else if (signalType === 'dc') {
        y = screenH / 2 - amplitudePx;
      } else if (signalType === 'square') {
        y = screenH / 2 - (Math.sin(phase) >= 0 ? 1 : -1) * amplitudePx;
      }
      points.push(`${x},${y}`);
    }
    return 'M ' + points.join(' L ');
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-3xl p-4 sm:p-6 md:p-8 space-y-8 font-sans border border-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-2">
            <Zap className="w-3.5 h-3.5" /> Cathode Ray Tube & Oscilloscope Lab
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Electron Gun, Electrostatic Deflection & CRO Waveform Simulator
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Control accelerating anode voltage (V<sub>a</sub>), Y-plate deflection potential (V<sub>y</sub>), and time-base sweep frequency to observe electron acceleration and live CRO oscilloscope trace patterns.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Freeze Wave' : 'Live Sweep'}
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
        {/* Left: CRT Gun & CRO Phosphor Screen (Col 8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* CRT Tube Cutaway Diagram */}
            <div className="md:col-span-7 bg-slate-950 rounded-2xl p-3 border border-slate-800 overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                CRT Internal Electron Path
              </span>
              <svg viewBox="0 0 420 220" className="w-full h-auto select-none">
                {/* Glass Tube Envelope */}
                <path
                  d="M 20,80 L 140,80 L 260,30 L 400,30 L 400,190 L 260,190 L 140,140 L 20,140 Z"
                  fill="#030712"
                  stroke="#334155"
                  strokeWidth="2"
                />

                {/* Filament & Cathode */}
                <rect x="30" y="95" width="8" height="30" fill="#f59e0b" rx="2" />
                <text x="34" y="90" fill="#f59e0b" fontSize="8" textAnchor="middle">Cathode</text>

                {/* Grid */}
                <line x1="55" y1="90" x2="55" y2="130" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 2" />

                {/* Anode (+Va) */}
                <rect x="80" y="88" width="12" height="44" fill="#38bdf8" rx="2" />
                <line x1="80" y1="110" x2="92" y2="110" stroke="#030712" strokeWidth="6" />
                <text x="86" y="80" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">Anode (+Va)</text>

                {/* Y-Deflection Plates */}
                <rect x="150" y="68" width="40" height="6" fill="#f43f5e" rx="1" />
                <text x="170" y="62" fill="#f43f5e" fontSize="8" fontWeight="bold" textAnchor="middle">+Vy Plate</text>
                <rect x="150" y="146" width="40" height="6" fill="#38bdf8" rx="1" />
                <text x="170" y="164" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">-Vy Plate</text>

                {/* Electron Beam Path */}
                {/* Straight segment from cathode to plates */}
                <line x1="38" y1="110" x2="150" y2="110" stroke="#22c55e" strokeWidth="2.5" />
                {/* Curved deflection segment */}
                <path
                  d={`M 150,110 Q 190,${110 - (deflectionVoltageY / 100) * 20} 220,${110 - (deflectionVoltageY / 100) * 35} L 400,${110 - (deflectionVoltageY / 100) * 70}`}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Phosphor Screen */}
                <line x1="400" y1="30" x2="400" y2="190" stroke="#4ade80" strokeWidth="4" />
                <circle cx="400" cy={110 - (deflectionVoltageY / 100) * 70} r="5" fill="#4ade80" className="animate-pulse" />
              </svg>
            </div>

            {/* CRO Phosphor Display Graticule */}
            <div className="md:col-span-5 flex flex-col items-center">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> CRO Graticule Screen
              </span>
              <div className="w-[220px] h-[220px] bg-slate-950 rounded-2xl border-2 border-emerald-900/60 p-1 relative overflow-hidden shadow-inner shadow-emerald-950/80">
                <svg viewBox={`0 0 ${screenW} ${screenH}`} className="w-full h-full">
                  {/* Graticule 8x8 Grid */}
                  {Array.from({ length: numDivs + 1 }).map((_, i) => (
                    <React.Fragment key={i}>
                      <line
                        x1={i * divPx}
                        y1="0"
                        x2={i * divPx}
                        y2={screenH}
                        stroke="#064e3b"
                        strokeWidth={i === numDivs / 2 ? '1.5' : '0.8'}
                      />
                      <line
                        x1="0"
                        y1={i * divPx}
                        x2={screenW}
                        y2={i * divPx}
                        stroke="#064e3b"
                        strokeWidth={i === numDivs / 2 ? '1.5' : '0.8'}
                      />
                    </React.Fragment>
                  ))}

                  {/* Electron Beam Phosphor Trace */}
                  <path
                    d={getTracePath()}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls & Parameters (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Voltage & Base Controls
            </h3>

            {/* Accelerating Potential Va */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Anode Voltage ($V_a$):</span>
                <span className="font-mono font-bold text-cyan-400">{acceleratingVoltage} V</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={acceleratingVoltage}
                onChange={(e) => setAcceleratingVoltage(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Deflection Potential Vy */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Y-Plates Voltage ($V_y$):</span>
                <span className="font-mono font-bold text-rose-400">{deflectionVoltageY} V</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={deflectionVoltageY}
                onChange={(e) => setDeflectionVoltageY(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Time Base Toggle & Frequency */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold">Time-Base Generator:</span>
                <button
                  onClick={() => setTimeBaseOn(!timeBaseOn)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    timeBaseOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {timeBaseOn ? 'ON (Sweeping)' : 'OFF (Static)'}
                </button>
              </div>

              {timeBaseOn && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Sweep Frequency:</span>
                    <span className="font-mono font-bold text-emerald-400">{timeBaseFrequency} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={timeBaseFrequency}
                    onChange={(e) => setTimeBaseFrequency(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Input Waveform Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-slate-400 text-xs block">Input Signal Waveform:</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {['sine', 'dc', 'square'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSignalType(type)}
                    className={`py-1.5 rounded-lg font-bold capitalize transition border ${
                      signalType === type
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Calculated Physics Readout */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 text-xs">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1.5">
              Live Electron Electrodynamics
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Electron Speed ($v$)</span>
                <span className="text-emerald-400 font-bold">{velocityInKmPerS} km/s</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Kinetic Energy (E<sub>k</sub>)</span>
                <span className="text-cyan-400 font-bold">{acceleratingVoltage} eV</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physics Principles & Formulas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Governing Cathode Ray &amp; CRO Electrodynamics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-cyan-400">1. Electron Gun Energy Conversion</h4>
            <p className="font-mono text-white text-xs">e&middot;V<sub>a</sub> = &frac12; m&middot;v&sup2; &rArr; v = &radic;(2e&middot;V<sub>a</sub> / m)</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-cyan-400">2. Electrostatic Deflection</h4>
            <p className="font-mono text-white text-xs">y &prop; V<sub>y</sub> / V<sub>a</sub></p>
            <p className="text-slate-400 text-xs">Higher accelerating voltage reduces deflection sensitivity.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-cyan-400">3. Time-Base Generator</h4>
            <p className="text-xs text-slate-300">Applies a sawtooth voltage to X-plates to sweep the beam linearly from left to right.</p>
          </div>
        </div>
      </div>

      {/* Interactive Calculation Challenge */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm sm:text-base">
          <HelpCircle className="w-5 h-5" /> Quick Calculation Challenge
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          In a cathode ray tube, electrons are accelerated through an anode voltage of <strong>V<sub>a</sub> = 2000 V</strong>. Calculate the speed of the emitted electrons in units of <strong>&times; 10⁷ m/s</strong>. (Use e = 1.6 &times; 10⁻¹⁹ C, m = 9.11 &times; 10⁻³¹ kg).
        </p>

        <form onSubmit={checkPractice} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="number"
            step="0.01"
            placeholder="Velocity in 10^7 m/s (e.g. 2.65)"
            value={practiceAns}
            onChange={(e) => {
              setPracticeAns(e.target.value);
              setPracticeStatus(null);
            }}
            className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500 max-w-xs"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-600/20"
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
            Correct! v = &radic;(2 &times; 1.6 &times; 10⁻¹⁹ &times; 2000 / 9.11 &times; 10⁻³¹) = 2.65 &times; 10⁷ m/s.
          </div>
        )}

        {practiceStatus === 'incorrect' && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
            Incorrect. Formula: v = &radic;(2 e V<sub>a</sub> / m). Enter the decimal before 10⁷.
          </div>
        )}

        {showSolution && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300 font-mono">
            <p className="font-bold text-cyan-400">Step-by-Step Solution:</p>
            <p>1. Energy equality: e * Va = 0.5 * m * v^2</p>
            <p>2. v^2 = (2 * 1.6e-19 * 2000) / (9.11e-31) = 7.025e14</p>
            <p>3. v = sqrt(7.025e14) = 2.6508 x 10^7 m/s ≈ 2.65 x 10^7 m/s</p>
          </div>
        )}
      </div>
    </div>
  );
}
