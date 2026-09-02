import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Beaker,
  Droplets,
  RotateCcw,
  Play,
  Pause,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  Flame,
  ArrowRight,
  TrendingDown,
  Target,
  Plus,
} from 'lucide-react';

const MODES = {
  direct: {
    key: 'direct',
    label: "Direct Titration — Strong Acid / Strong Base",
    analyteLabel: "25.0 cm³ NaOH (0.10 M) + phenolphthalein",
    titrantName: "HCl (0.10 M)",
    titrantConc: 0.1,
    analyteConc: 0.1,
    analyteVol: 25.0,
    ratioTitrantToAnalyte: 1,
    indicator: "Phenolphthalein",
    equivVol: 25.0,
    startColor: "#f472b6", // Vibrant Pink
    endColor: "#f8fafc",   // Colourless / clear
    overshootColor: "#f8fafc",
    colorDirection: "fade",
    equation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)",
    predict: {
      q: "As standard 0.10 M HCl is added from the burette into the pink NaOH solution, what will you observe at the exact stoichiometric equivalence point?",
      opts: [
        { t: "The solution permanently turns from pink to colourless upon one final drop", correct: true },
        { t: "The solution turns from colourless to a deep dark pink", correct: false },
        { t: "A dense white precipitate forms with no colour change", correct: false }
      ]
    },
    explain: [
      "Phenolphthalein is a pH indicator that is pink in alkaline solutions (pH > 8.2) due to excess OH⁻ ions.",
      "As HCl is delivered drop-by-drop, H⁺ ions react with OH⁻ ions to form neutral water: H⁺(aq) + OH⁻(aq) → H₂O(l).",
      "Near the equivalence point, the pH drops steeply from alkaline to neutral (pH 7).",
      "One single drop of acid neutralises the last trace of hydroxide, turning the solution permanently colourless.",
      "At equivalence, moles of HCl added = moles of NaOH originally present (1 : 1 stoichiometric ratio)."
    ],
    challenge: "Target: Carefully add HCl to achieve the exact end point (first permanent colourless state). Stop within ±0.2 cm³ of 25.0 cm³ without overshooting."
  },
  back: {
    key: 'back',
    label: "Back Titration — Insoluble Carbonate with Excess Acid",
    analyteLabel: "0.50 g MCO₃ + 30.00 cm³ HCl (0.50 M) excess, titrate with NaOH",
    titrantName: "NaOH (1.00 M)",
    titrantConc: 1.0,
    analyteConc: null,
    analyteVol: null,
    excessAcidRemaining: 0.20,
    ratioTitrantToAnalyte: 1,
    indicator: "Phenolphthalein",
    equivVol: 5.0,
    startColor: "#f8fafc", // Colourless
    endColor: "#f472b6",   // Faint permanent pink
    overshootColor: "#ec4899", // Deep intense magenta
    colorDirection: "appear",
    equation: "MCO₃(s) + 2HCl(aq) → MCl₂(aq) + CO₂(g) + H₂O(l)  [Residual HCl + NaOH → NaCl + H₂O]",
    predict: {
      q: "The insoluble carbonate reacted with a known excess of HCl. When standard NaOH is added to titrate the unreacted excess acid, what will you see at the end point?",
      opts: [
        { t: "The colourless solution turns permanently faint pink at the end point", correct: true },
        { t: "The solution remains colourless regardless of how much NaOH is added", correct: false },
        { t: "Effervescence of CO₂ gas resumes at the end point", correct: false }
      ]
    },
    explain: [
      "An insoluble metal carbonate (MCO₃) is dissolved in a known excess of standard hydrochloric acid.",
      "Standard sodium hydroxide (NaOH) in the burette is then used to titrate the unreacted excess acid remaining in the flask.",
      "While excess acid remains, phenolphthalein stays in its colourless acidic form.",
      "When the last trace of excess acid is neutralised, the next fraction of a drop of NaOH makes the flask slightly alkaline, turning it permanently faint pink.",
      "Moles of acid reacted with MCO₃ = Total initial moles of HCl − Moles of excess HCl neutralised by NaOH."
    ],
    challenge: "Target: Titrate the leftover excess acid with NaOH until the solution just turns faint pink. Stop within ±0.2 cm³ of 5.0 cm³ without overshooting."
  },
  redox: {
    key: 'redox',
    label: "Redox Titration — Iron(II) Salt Oxidised by KMnO₄",
    analyteLabel: "25.0 cm³ Fe²⁺ solution + dilute H₂SO₄",
    titrantName: "KMnO₄ (0.02 M)",
    titrantConc: 0.02,
    analyteConc: 0.1,
    analyteVol: 25.0,
    ratioTitrantToAnalyte: 0.2, // 1 MnO4- reacts with 5 Fe2+
    indicator: "Self-indicating (KMnO₄ purple ion)",
    equivVol: 22.5,
    startColor: "#f8fafc", // Colourless/pale
    endColor: "#e9d5ff",   // Faint permanent violet/pink
    overshootColor: "#7e22ce", // Deep dark purple
    colorDirection: "appear",
    equation: "MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)",
    predict: {
      q: "Potassium manganate(VII) is intensely purple; its reduced product Mn²⁺ is virtually colourless. As KMnO₄ is dripped into acidified Fe²⁺, what indicates the end point?",
      opts: [
        { t: "Each drop decolourises until one drop gives a permanent faint pink that persists for 30s", correct: true },
        { t: "The solution turns intensely green from the very first drop", correct: false },
        { t: "A separate starch indicator must be added to produce a blue-black complex", correct: false }
      ]
    },
    explain: [
      "Purple MnO₄⁻ ions are strong oxidising agents in acidic medium (H₂SO₄). They oxidise Fe²⁺ to yellow-orange Fe³⁺ while being reduced to colourless Mn²⁺.",
      "As long as unreacted Fe²⁺ is present in the flask, every drop of purple KMnO₄ is instantly bleached colourless.",
      "This reaction is self-indicating — no external indicator is required.",
      "The end point occurs when all Fe²⁺ has been completely consumed. The next drop of KMnO₄ cannot react and gives the solution its first permanent faint pink/purple tinge.",
      "Stoichiometric ratio: 1 mol MnO₄⁻ reacts with 5 mol Fe²⁺ (1 : 5 mole ratio)."
    ],
    challenge: "Target: Deliver KMnO₄ until the very first persistent faint pink tinge appears. Stop within ±0.2 cm³ of 22.5 cm³ without overshooting."
  }
};

function lerpColor(hexA, hexB, t) {
  const normT = Math.max(0, Math.min(1, t));
  const parse = (h) => {
    const c = h.replace('#', '');
    return [parseInt(c.substring(0, 2), 16), parseInt(c.substring(2, 4), 16), parseInt(c.substring(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(r1 + (r2 - r1) * normT);
  const g = Math.round(g1 + (g2 - g1) * normT);
  const b = Math.round(b1 + (b2 - b1) * normT);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function TitrationSim({ config = {}, onTelemetry }) {
  const [modeKey, setModeKey] = useState('direct');
  const [vol, setVol] = useState(0.0);
  const [trials, setTrials] = useState([]);
  const [isFastAdding, setIsFastAdding] = useState(false);
  const [predictedChoice, setPredictedChoice] = useState(null);
  const [isPredicted, setIsPredicted] = useState(false);
  const [activeTab, setActiveTab] = useState('predict'); // 'predict' | 'explain' | 'challenge'
  const [challengeStatus, setChallengeStatus] = useState(null); // 'running' | 'win' | 'lose' | null
  const [isDropping, setIsDropping] = useState(false);

  const activeMode = MODES[modeKey] || MODES.direct;
  const fastTimerRef = useRef(null);

  // Stopcock fast-add interval
  useEffect(() => {
    if (isFastAdding) {
      fastTimerRef.current = setInterval(() => {
        setVol((prev) => {
          const next = Number((prev + 0.2).toFixed(1));
          if (next >= 50.0) {
            setIsFastAdding(false);
            return 50.0;
          }
          return next;
        });
      }, 75);
    } else {
      clearInterval(fastTimerRef.current);
    }
    return () => clearInterval(fastTimerRef.current);
  }, [isFastAdding]);

  // Color determination
  const flaskColor = useMemo(() => {
    const eq = activeMode.equivVol;
    if (activeMode.colorDirection === 'fade') {
      if (vol < eq - 0.4) return activeMode.startColor;
      if (vol < eq + 0.2) {
        const t = (vol - (eq - 0.4)) / 0.6;
        return lerpColor(activeMode.startColor, activeMode.endColor, t);
      }
      return activeMode.endColor;
    } else {
      if (vol < eq - 0.4) return activeMode.startColor;
      if (vol < eq + 0.2) {
        const t = (vol - (eq - 0.4)) / 0.6;
        return lerpColor(activeMode.startColor, activeMode.endColor, t);
      }
      const overshootFrac = Math.min(1, (vol - eq) / 4.0);
      return lerpColor(activeMode.endColor, activeMode.overshootColor, overshootFrac);
    }
  }, [vol, activeMode]);

  // Equivalence state evaluation
  const endpointState = useMemo(() => {
    const diff = vol - activeMode.equivVol;
    if (Math.abs(diff) <= 0.2) return 'at';
    if (diff < -0.2) return 'before';
    return 'after';
  }, [vol, activeMode]);

  // Telemetry and Challenge evaluation
  useEffect(() => {
    if (challengeStatus === 'running' && endpointState === 'at') {
      setChallengeStatus('win');
      if (typeof onTelemetry === 'function') {
        onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
          simulation: 'chem_titration_volumetric_analysis',
          mode: modeKey,
          titre: vol,
          target: activeMode.equivVol,
        });
      }
    } else if (challengeStatus === 'running' && endpointState === 'after') {
      setChallengeStatus('lose');
    }
  }, [endpointState, challengeStatus, activeMode.equivVol, modeKey, onTelemetry, vol]);

  const handleModeChange = (newMode) => {
    setModeKey(newMode);
    setVol(0.0);
    setTrials([]);
    setIsFastAdding(false);
    setPredictedChoice(null);
    setIsPredicted(false);
    setChallengeStatus(null);
  };

  const triggerDropAnimation = () => {
    setIsDropping(true);
    setTimeout(() => setIsDropping(false), 400);
  };

  const addVolume = (amount) => {
    setVol((prev) => {
      const next = Math.max(0, Math.min(50.0, Number((prev + amount).toFixed(1))));
      return next;
    });
    triggerDropAnimation();
  };

  const handleRecordTitre = () => {
    if (vol > 0) {
      setTrials((prev) => [...prev, vol]);
    }
  };

  const handleReset = () => {
    setIsFastAdding(false);
    setVol(0.0);
    setChallengeStatus(null);
  };

  const handleStartChallenge = () => {
    setVol(0.0);
    setChallengeStatus('running');
  };

  // Moles calculation
  const molesAdded = ((vol / 1000) * activeMode.titrantConc).toFixed(4);
  const molesReacted = useMemo(() => {
    const molT = (vol / 1000) * activeMode.titrantConc;
    if (modeKey === 'direct') {
      return Math.min(molT, (activeMode.analyteVol / 1000) * activeMode.analyteConc).toFixed(4);
    } else if (modeKey === 'back') {
      return Math.min(molT, 0.005).toFixed(4);
    } else {
      return Math.min(molT / activeMode.ratioTitrantToAnalyte, (activeMode.analyteVol / 1000) * activeMode.analyteConc).toFixed(4);
    }
  }, [vol, activeMode, modeKey]);

  const averageTitre = useMemo(() => {
    if (trials.length === 0) return null;
    const sum = trials.reduce((acc, curr) => acc + curr, 0);
    return (sum / trials.length).toFixed(2);
  }, [trials]);

  // Burette SVG dimensions
  const buretteMaxH = 175;
  const drainedFrac = Math.min(1, vol / 50.0);
  const liquidHeight = buretteMaxH * (1 - drainedFrac);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-slate-900">
      {/* 1. TOP CONTROL BAR & MODE TABS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              Form 3 Volumetric Analysis Laboratory
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            {activeMode.label}
          </h2>
          <p className="text-xs font-mono text-slate-300">
            {activeMode.equation}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start md:self-center">
          <button
            onClick={() => handleModeChange('direct')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modeKey === 'direct'
                ? 'bg-custom-blue text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => handleModeChange('back')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modeKey === 'back'
                ? 'bg-custom-blue text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Back Titration
          </button>
          <button
            onClick={() => handleModeChange('redox')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modeKey === 'redox'
                ? 'bg-custom-blue text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Redox (KMnO₄)
          </button>
        </div>
      </div>

      {/* 2. THREE-COLUMN APPARATUS & EXPERIMENT STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Burette & Conical Flask Rig (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col items-center justify-between min-h-[520px] relative">
          {/* Readout Badges */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Burette: <strong className="text-custom-blue">{vol.toFixed(1)} cm³</strong>
            </span>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              endpointState === 'at'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : endpointState === 'after'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {endpointState === 'at' ? '✓ End Point' : endpointState === 'after' ? 'Overshot' : 'Titrating'}
            </span>
          </div>

          {/* SVG Apparatus */}
          <div className="w-full max-w-[280px] my-auto py-3 relative flex justify-center items-center">
            <svg viewBox="0 0 300 420" className="w-full h-auto select-none overflow-visible">
              {/* Retort Stand */}
              <rect x="50" y="390" width="200" height="12" rx="3" fill="#64748b" />
              <rect x="75" y="30" width="8" height="365" fill="#94a3b8" />
              <rect x="75" y="110" width="55" height="6" fill="#64748b" />
              <rect x="75" y="220" width="55" height="6" fill="#64748b" />

              {/* Burette Glass Barrel */}
              <rect x="128" y="20" width="44" height="200" rx="4" fill="#f0f9ff" stroke="#94a3b8" strokeWidth="1.8" />
              
              {/* Burette Liquid */}
              <rect
                x="130"
                y={24 + (buretteMaxH - liquidHeight)}
                width="40"
                height={liquidHeight}
                fill={modeKey === 'redox' ? '#c084fc' : '#bae6fd'}
                opacity="0.85"
                rx="2"
              />

              {/* Burette Graduated Scale Marks */}
              {[0, 10, 20, 30, 40, 50].map((tickVal, idx) => {
                const y = 26 + idx * 34;
                return (
                  <g key={tickVal}>
                    <line x1="128" y1={y} x2="138" y2={y} stroke="#475569" strokeWidth="1.2" />
                    <text x="142" y={y + 3} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      {tickVal}
                    </text>
                  </g>
                );
              })}

              {/* Stopcock valve */}
              <path d="M143 220 L157 220 L152 236 L148 236 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="150" cy="228" r="6" fill="#0284c7" />
              <line x1="142" y1="228" x2="158" y2="228" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

              {/* Falling Droplet animation */}
              {isDropping && (
                <circle
                  cx="150"
                  cy="255"
                  r="3.5"
                  fill={modeKey === 'redox' ? '#9333ea' : '#38bdf8'}
                  className="animate-bounce"
                />
              )}

              {/* Conical Flask */}
              <path
                d="M110 270 L190 270 L172 340 Q150 358 128 340 Z"
                fill="#f8fafc"
                stroke="#94a3b8"
                strokeWidth="2"
              />
              <rect x="140" y="250" width="20" height="24" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
              
              {/* Conical Flask Solution with dynamic interpolated colour */}
              <path
                d="M118 310 L182 310 L172 340 Q150 358 128 340 Z"
                fill={flaskColor}
                stroke="#cbd5e1"
                strokeWidth="1"
                className="transition-colors duration-300"
              />

              {/* White Tile underneath flask */}
              <rect x="100" y="375" width="100" height="8" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
              <text x="150" y="396" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">White Tile</text>
            </svg>
          </div>

          <p className="text-[11px] text-center font-medium text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 w-full mt-2">
            {activeMode.analyteLabel}
          </p>
        </div>

        {/* Column 2: Interactive Controls & Stopcock Manipulation (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reaction Status Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
              Real-Time Reaction State
            </span>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium min-h-[60px]">
              {vol === 0 ? (
                "Burette is at 0.0 cm³. Turn the stopcock or tap the drop buttons to release standard titrant into the conical flask."
              ) : endpointState === 'before' ? (
                modeKey === 'direct' ? (
                  <>Added <strong className="text-custom-blue">{vol.toFixed(1)} cm³</strong> of HCl. Hydroxide ions (OH⁻) remain in excess, so phenolphthalein stays pink.</>
                ) : modeKey === 'back' ? (
                  <>Added <strong className="text-custom-blue">{vol.toFixed(1)} cm³</strong> of NaOH. Unreacted excess HCl still predominates, so the solution remains colourless.</>
                ) : (
                  <>Added <strong className="text-custom-blue">{vol.toFixed(1)} cm³</strong> of KMnO₄. Fe²⁺ ions are in excess, decolourising every drop of purple manganate.</>
                )
              ) : endpointState === 'at' ? (
                modeKey === 'direct' ? (
                  <span className="text-emerald-800 font-bold">End Point Reached! Pink colour has completely vanished at {vol.toFixed(1)} cm³. Moles of acid = moles of base originally present.</span>
                ) : modeKey === 'back' ? (
                  <span className="text-emerald-800 font-bold">End Point Reached! Solution turned permanently faint pink at {vol.toFixed(1)} cm³. All excess HCl is neutralised.</span>
                ) : (
                  <span className="text-emerald-800 font-bold">End Point Reached! First permanent faint pink/violet tinge persists for 30s at {vol.toFixed(1)} cm³. All Fe²⁺ oxidised.</span>
                )
              ) : (
                <span className="text-rose-700 font-semibold">
                  Overshot by {(vol - activeMode.equivVol).toFixed(1)} cm³! Excess titrant has accumulated. For analytical accuracy, reset and approach the end point drop-wise.
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Stoichiometric Equivalence:</span>
              <span className="font-bold text-slate-800">{activeMode.equivVol.toFixed(1)} cm³</span>
            </div>
          </div>

          {/* Stopcock Controls Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-custom-blue" />
                Burette Volume Slider
              </label>
              <span className="text-xs font-mono font-bold bg-blue-50 text-custom-blue px-2.5 py-1 rounded-lg border border-blue-200">
                {vol.toFixed(1)} cm³
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="50"
              step="0.1"
              value={vol}
              onChange={(e) => setVol(parseFloat(e.target.value))}
              className="w-full accent-custom-blue cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
            />

            {/* Quick Increment Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => addVolume(0.1)}
                disabled={vol >= 50}
                className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <Plus className="w-3 h-3" /> 0.1 cm³
              </button>
              <button
                onClick={() => addVolume(1.0)}
                disabled={vol >= 50}
                className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <Plus className="w-3 h-3" /> 1.0 cm³
              </button>
              <button
                onClick={() => setIsFastAdding((prev) => !prev)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  isFastAdding
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {isFastAdding ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isFastAdding ? 'Stop' : 'Fast Add'}
              </button>
              <button
                onClick={handleReset}
                className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <button
              onClick={handleRecordTitre}
              disabled={vol <= 0}
              className="w-full py-3 bg-custom-orange hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" /> Record Titre Reading
            </button>
          </div>
        </div>

        {/* Column 3: Analytical Data, Trials & Theory Deck (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Stoichiometry Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
              Quantitative Measurements
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Standard Titrant:</span>
                <span className="font-bold text-slate-800">{activeMode.titrantName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Moles Titrant Added:</span>
                <span className="font-bold text-custom-blue">{molesAdded} mol</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Moles Analyte Reacted:</span>
                <span className="font-bold text-emerald-700">{molesReacted} mol</span>
              </div>
              <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-1.5">
                <span>Indicator Used:</span>
                <span className="font-bold text-purple-700">{activeMode.indicator}</span>
              </div>
            </div>
          </div>

          {/* Recorded Titre Table */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                Titre Recordings ({trials.length})
              </span>
              {averageTitre && (
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Average = {averageTitre} cm³
                </span>
              )}
            </div>

            {trials.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">
                No trials recorded yet. Titrate to end point and tap "Record Titre Reading".
              </p>
            ) : (
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {trials.map((tVal, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500">Trial {idx + 1}:</span>
                    <span className="font-bold text-slate-800">{tVal.toFixed(1)} cm³</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pedagogical Tabs: Predict, Explain, Challenge */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('predict')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'predict' ? 'bg-white text-custom-blue shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Predict
              </button>
              <button
                onClick={() => setActiveTab('explain')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'explain' ? 'bg-white text-custom-blue shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Explain
              </button>
              <button
                onClick={() => setActiveTab('challenge')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'challenge' ? 'bg-white text-custom-blue shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Challenge
              </button>
            </div>

            {/* Predict Tab */}
            {activeTab === 'predict' && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  {activeMode.predict.q}
                </p>
                <div className="space-y-2">
                  {activeMode.predict.opts.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={isPredicted}
                      onClick={() => {
                        setIsPredicted(true);
                        setPredictedChoice(idx);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        isPredicted
                          ? opt.correct
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : predictedChoice === idx
                            ? 'bg-rose-50 border-rose-300 text-rose-900'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                          : 'bg-slate-50 hover:bg-blue-50/60 border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt.t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Explain Tab */}
            {activeTab === 'explain' && (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {activeMode.explain.map((text, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-custom-blue font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Challenge Tab */}
            {activeTab === 'challenge' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-relaxed">
                  {activeMode.challenge}
                </p>

                {challengeStatus === null && (
                  <button
                    onClick={handleStartChallenge}
                    className="w-full py-2.5 bg-custom-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5" /> Start Precision Challenge
                  </button>
                )}

                {challengeStatus === 'running' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium animate-pulse">
                    Challenge active! Carefully manipulate the stopcock until the end point is reached.
                  </div>
                )}

                {challengeStatus === 'win' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Precision Target Achieved!</span>
                    </div>
                    <p className="text-[11px] font-normal text-emerald-800">
                      You stopped at {vol.toFixed(1)} cm³ (within ±0.2 cm³ of the true {activeMode.equivVol.toFixed(1)} cm³ equivalence point).
                    </p>
                  </div>
                )}

                {challengeStatus === 'lose' && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 font-medium space-y-1">
                    <p className="font-bold">Overshot the End Point!</p>
                    <p className="text-[11px]">
                      You stopped at {vol.toFixed(1)} cm³. True equivalence was {activeMode.equivVol.toFixed(1)} cm³. Tap Reset to try again!
                    </p>
                    <button
                      onClick={handleStartChallenge}
                      className="mt-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
                    >
                      Retry Challenge
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
