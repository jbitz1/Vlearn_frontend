import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Target,
  CheckCircle2,
  RotateCcw,
  Play,
  Pause,
  Beaker,
  FlaskConical,
  Sparkles,
  Info,
  BookOpen,
  Check,
  X,
  Atom,
  HelpCircle
} from 'lucide-react';

const SAMPLES = {
  sample_a: {
    id: 'sample_a',
    label: 'Sample A (Ethanol)',
    name: 'Ethanol',
    formula: 'CH₃CH₂OH',
    type: 'alcohol',
    groupName: 'Hydroxyl group (-OH) / Alcohol',
    realWorld: 'Ethanol is widely used in hand sanitizers, antiseptic wipes, alcoholic beverages, and as a renewable biofuel blending component.'
  },
  sample_b: {
    id: 'sample_b',
    label: 'Sample B (Ethanoic Acid)',
    name: 'Ethanoic Acid',
    formula: 'CH₃COOH',
    type: 'carboxylic_acid',
    groupName: 'Carboxyl group (-COOH) / Carboxylic Acid',
    realWorld: 'Ethanoic acid (acetic acid) is the main component of vinegar used in food preservation, cooking, and industrial vinyl acetate production.'
  },
  sample_c: {
    id: 'sample_c',
    label: 'Sample C (Propanol)',
    name: 'Propanol',
    formula: 'CH₃CH₂CH₂OH',
    type: 'alcohol',
    groupName: 'Hydroxyl group (-OH) / Alcohol',
    realWorld: 'Propanol (1-propanol) is an important industrial solvent used in flexographic printing inks, cosmetics, and pharmaceuticals.'
  },
  sample_d: {
    id: 'sample_d',
    label: 'Sample D (Butanoic Acid)',
    name: 'Butanoic Acid',
    formula: 'CH₃CH₂CH₂COOH',
    type: 'carboxylic_acid',
    groupName: 'Carboxyl group (-COOH) / Carboxylic Acid',
    realWorld: 'Butanoic acid (butyric acid) occurs naturally in butter, parmesan cheese, and animal fats, giving them their characteristic rich aroma.'
  }
};

const TESTS = {
  sodium: {
    id: 'sodium',
    label: 'Sodium Metal Test',
    reagent: 'Sodium Metal (Na)',
    description: 'Tests for active acidic hydrogen atoms present in hydroxyl (-OH) and carboxyl (-COOH) functional groups.'
  },
  bicarbonate: {
    id: 'bicarbonate',
    label: 'Sodium Hydrogen Carbonate Test',
    reagent: 'Sodium Hydrogen Carbonate (NaHCO₃)',
    description: 'Distinguishes carboxylic acids from alcohols by testing for sufficient acidity to liberate CO₂ gas.'
  },
  can: {
    id: 'can',
    label: 'Ceric Ammonium Nitrate Test',
    reagent: 'Ceric Ammonium Nitrate [(NH₄)₂Ce(NO₃)₆]',
    description: 'Specific diagnostic test for the alcoholic hydroxyl (-OH) group, forming a red/amber alkoxycerium complex.'
  }
};

export default function FunctionalGroupTestsSim({ config = {}, onTelemetry }) {
  const [selectedSampleId, setSelectedSampleId] = useState('sample_a');
  const [selectedTestId, setSelectedTestId] = useState('sodium');
  
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0); // 0 to 100
  const [hasCompletedTest, setHasCompletedTest] = useState(false);

  // Checkpoints State
  const [checkpoints, setCheckpoints] = useState({
    observedAlcohol: false,
    observedCarboxylicAcid: false,
    observedPositiveTest: false,
    observedNegativeTest: false
  });
  
  const [telemetrySent, setTelemetrySent] = useState(false);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);

  const sample = SAMPLES[selectedSampleId];
  const chemicalTest = TESTS[selectedTestId];

  // Deterministic Reaction Logic
  const reactionData = useMemo(() => {
    if (!sample || !chemicalTest) return null;

    const isAlcohol = sample.type === 'alcohol';
    const isCarboxylicAcid = sample.type === 'carboxylic_acid';

    if (chemicalTest.id === 'sodium') {
      // Both alcohols and carboxylic acids react with Sodium to release H2 gas
      return {
        isPositive: true,
        reactionType: 'h2_fizz',
        reactionObserved: 'Effervescence of hydrogen gas (H₂) bubbles. Sodium metal reacts steadily in the liquid.',
        scientificExplanation: isAlcohol
          ? `Alcohols react with sodium metal to replace the acidic hydroxyl hydrogen, releasing hydrogen gas:\n2 ${sample.formula} + 2 Na → 2 CH₃CH₂ONa + H₂(g) ↑`
          : `Carboxylic acids react with sodium metal to release hydrogen gas and form a carboxylate salt:\n2 ${sample.formula} + 2 Na → 2 CH₃COONa + H₂(g) ↑`,
        whatTellsUs: 'Confirms the presence of an active acidic hydrogen atom (present in both hydroxyl -OH and carboxyl -COOH functional groups).',
        functionalGroupIdentified: 'Hydroxyl (-OH) or Carboxyl (-COOH) Group Present',
        realWorld: sample.realWorld
      };
    }

    if (chemicalTest.id === 'bicarbonate') {
      if (isCarboxylicAcid) {
        return {
          isPositive: true,
          reactionType: 'co2_effervescence',
          reactionObserved: 'Rapid CO₂ effervescence! Vigorous bubbling and gas evolution observed in the test tube.',
          scientificExplanation: `Carboxylic acids (Ka ≈ 10⁻⁵) are stronger acids than carbonic acid. They react with sodium hydrogen carbonate to produce carbon dioxide gas:\n${sample.formula} + NaHCO₃ → ${sample.name === 'Ethanoic Acid' ? 'CH₃COONa' : 'C₃H₇COONa'} + H₂O + CO₂(g) ↑`,
          whatTellsUs: 'Definitively distinguishes carboxylic acids from alcohols. Only carboxylic acids liberate CO₂ gas with sodium bicarbonate.',
          functionalGroupIdentified: 'Carboxyl group (-COOH) / Carboxylic Acid',
          realWorld: sample.realWorld
        };
      } else {
        return {
          isPositive: false,
          reactionType: 'no_reaction',
          reactionObserved: 'No reaction observed. Solution remains completely clear with no gas bubbles formed.',
          scientificExplanation: `Alcohols are extremely weak acids (Ka ≈ 10⁻¹⁶) and cannot protonate the hydrogen carbonate anion (HCO₃⁻). No carbon dioxide is evolved:\n${sample.formula} + NaHCO₃ → No Reaction`,
          whatTellsUs: 'Proves the sample is NOT a carboxylic acid. Alcohols lack sufficient acidity to react with bicarbonate.',
          functionalGroupIdentified: 'Hydroxyl group (-OH) / Alcohol (Neutral / Non-acidic)',
          realWorld: sample.realWorld
        };
      }
    }

    if (chemicalTest.id === 'can') {
      if (isAlcohol) {
        return {
          isPositive: true,
          reactionType: 'can_color_change',
          reactionObserved: 'Color change observed! Reagent turns from pale yellow to a distinct Red/Amber complex solution.',
          scientificExplanation: `Alcohols displace nitrate ligands from ceric ammonium nitrate to form a red alkoxycerium complex:\n(NH₄)₂Ce(NO₃)₆ + ${sample.formula} → [(NH₄)₂Ce(NO₃)₅(O-R)] (Red/Amber Complex) + HNO₃`,
          whatTellsUs: 'Positively identifies the alcoholic hydroxyl (-OH) group. Carboxylic acids do not form this red complex.',
          functionalGroupIdentified: 'Hydroxyl group (-OH) / Alcohol',
          realWorld: sample.realWorld
        };
      } else {
        return {
          isPositive: false,
          reactionType: 'no_reaction_yellow',
          reactionObserved: 'No color change. Solution remains pale yellow (the color of the added CAN reagent).',
          scientificExplanation: `Carboxylic acids do not coordinate with Ce(IV) ions to form a red complex. The solution retains the yellow hue of ceric ammonium nitrate:\n${sample.formula} + CAN → No Color Change (Stays Yellow)`,
          whatTellsUs: 'Confirms the absence of an alcoholic hydroxyl (-OH) group.',
          functionalGroupIdentified: 'Carboxylic Acid / Non-alcoholic compound',
          realWorld: sample.realWorld
        };
      }
    }

    return null;
  }, [sample, chemicalTest]);

  // Animation Loop
  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      const updateAnim = (now) => {
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;
        setTestProgress((prev) => {
          const next = prev + delta * 35; // ~2.8 seconds total duration
          if (next >= 100) {
            setIsRunning(false);
            setHasCompletedTest(true);
            return 100;
          }
          return next;
        });
        animRef.current = requestAnimationFrame(updateAnim);
      };
      animRef.current = requestAnimationFrame(updateAnim);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning]);

  // Update checkpoints when test completes
  useEffect(() => {
    if (hasCompletedTest && reactionData) {
      setCheckpoints((prev) => {
        const isAlcohol = sample.type === 'alcohol';
        const isCarboxylicAcid = sample.type === 'carboxylic_acid';
        const isPos = reactionData.isPositive;

        return {
          observedAlcohol: prev.observedAlcohol || isAlcohol,
          observedCarboxylicAcid: prev.observedCarboxylicAcid || isCarboxylicAcid,
          observedPositiveTest: prev.observedPositiveTest || isPos,
          observedNegativeTest: prev.observedNegativeTest || !isPos
        };
      });
    }
  }, [hasCompletedTest, reactionData, sample]);

  const allMastered = useMemo(() => {
    return (
      checkpoints.observedAlcohol &&
      checkpoints.observedCarboxylicAcid &&
      checkpoints.observedPositiveTest &&
      checkpoints.observedNegativeTest
    );
  }, [checkpoints]);

  // Telemetry Emission
  useEffect(() => {
    if (allMastered && !telemetrySent) {
      setTelemetrySent(true);
      if (typeof onTelemetry === 'function') {
        onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
          simulation: 'chem_functional_group_tests',
          sample: sample.name,
          test: chemicalTest.label,
          message: 'Student successfully completed all 4 functional group identification checkpoints.'
        });
      }
    }
  }, [allMastered, telemetrySent, onTelemetry, sample, chemicalTest]);

  const handleRunTest = () => {
    setTestProgress(0);
    setHasCompletedTest(false);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTestProgress(0);
    setHasCompletedTest(false);
  };

  // Generate Bubbles for SVG animation
  const bubbles = useMemo(() => {
    if (!reactionData) return [];
    const count = reactionData.reactionType === 'co2_effervescence' ? 32 : reactionData.reactionType === 'h2_fizz' ? 16 : 0;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        cx: 375 + (Math.sin(i * 3.7) * 45),
        baseCy: 360 - (i * 7),
        r: 3 + (i % 4) * 1.5,
        speed: 0.8 + (i % 5) * 0.4
      });
    }
    return items;
  }, [reactionData]);

  // Liquid color logic based on progress and test type
  const liquidColor = useMemo(() => {
    if (!reactionData || testProgress === 0) {
      return { fill: '#38bdf8', opacity: 0.25, stroke: '#0284c7' }; // Default clear liquid
    }

    const progressRatio = testProgress / 100;

    if (reactionData.reactionType === 'can_color_change') {
      // Transition from clear -> yellow reagent drop -> deep Red/Amber complex
      if (progressRatio < 0.2) {
        return { fill: '#38bdf8', opacity: 0.25, stroke: '#0284c7' };
      }
      return { fill: '#dc2626', opacity: 0.55 + (progressRatio * 0.3), stroke: '#991b1b' };
    }

    if (reactionData.reactionType === 'no_reaction_yellow') {
      // Pale yellow from added CAN reagent, no red complex
      return { fill: '#facc15', opacity: 0.45, stroke: '#eab308' };
    }

    if (reactionData.reactionType === 'co2_effervescence') {
      return { fill: '#0ea5e9', opacity: 0.35, stroke: '#0284c7' };
    }

    if (reactionData.reactionType === 'h2_fizz') {
      return { fill: '#38bdf8', opacity: 0.3, stroke: '#0284c7' };
    }

    return { fill: '#38bdf8', opacity: 0.25, stroke: '#0284c7' };
  }, [reactionData, testProgress]);

  return (
    <div
      className="flex flex-col gap-6 max-w-6xl mx-auto p-3 sm:p-5 bg-slate-50 rounded-3xl font-sans"
      role="region"
      aria-label="Functional Groups & Chemical Tests Simulation"
    >
      {/* 1. MISSION BANNER */}
      {allMastered ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-emerald-100">
                Simulation Verified
              </span>
              <h2 className="text-base sm:text-lg font-black mt-0.5">
                Functional Groups Mastered! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                You have successfully identified alcohols and carboxylic acids using chemical tests!
              </p>
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-yellow-300 animate-pulse hidden sm:block shrink-0" />
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-custom-orange text-white flex items-center justify-center shrink-0 shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-custom-orange">
                  Mission Challenge
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                🧪 Identify the unknown compound using chemical tests. Observe each reaction and determine which functional group is present.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHECKPOINTS TRACKER BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div
          className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border transition-all ${
            checkpoints.observedAlcohol
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {checkpoints.observedAlcohol ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
          )}
          <span>Observed an Alcohol</span>
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border transition-all ${
            checkpoints.observedCarboxylicAcid
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {checkpoints.observedCarboxylicAcid ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
          )}
          <span>Observed a Carboxylic Acid</span>
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border transition-all ${
            checkpoints.observedPositiveTest
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {checkpoints.observedPositiveTest ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
          )}
          <span>Observed a Positive Test</span>
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border transition-all ${
            checkpoints.observedNegativeTest
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {checkpoints.observedNegativeTest ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
          )}
          <span>Observed a Negative Test</span>
        </div>
      </div>

      {/* 2. STUDENT INPUT CONTROLS PANEL (ONLY 2 CONTROLS + BUTTONS) */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-3xl shadow-md border border-slate-800 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* CONTROL 1: UNKNOWN SAMPLE */}
          <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              1. Select Unknown Sample
            </label>
            <select
              value={selectedSampleId}
              onChange={(e) => {
                setSelectedSampleId(e.target.value);
                handleReset();
              }}
              disabled={isRunning}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-bold rounded-xl p-3 focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {Object.values(SAMPLES).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 font-medium">
              Formula: <span className="font-mono text-amber-300">{sample.formula}</span>
            </p>
          </div>

          {/* CONTROL 2: CHEMICAL TEST */}
          <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <label className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Beaker className="w-4 h-4 text-cyan-400" />
              2. Select Chemical Test
            </label>
            <select
              value={selectedTestId}
              onChange={(e) => {
                setSelectedTestId(e.target.value);
                handleReset();
              }}
              disabled={isRunning}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-bold rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {Object.values(TESTS).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 font-medium">
              Reagent: <span className="font-semibold text-cyan-300">{chemicalTest.reagent}</span>
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer ${
              isRunning
                ? 'bg-amber-500 text-slate-950 opacity-90'
                : 'bg-gradient-to-r from-custom-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Run Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. SVG ANIMATED TEST TUBE / BEAKER VISUALIZATION */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center">
        {/* Status Header Overlay */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white text-xs font-bold flex items-center gap-2 shadow-md">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning
                  ? 'bg-amber-400 animate-ping'
                  : hasCompletedTest
                  ? reactionData?.isPositive
                    ? 'bg-emerald-400'
                    : 'bg-slate-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span>
              Status:{' '}
              {isRunning
                ? 'Reaction in progress...'
                : hasCompletedTest
                ? reactionData?.isPositive
                  ? 'Positive Reaction Observed!'
                  : 'No Reaction (Negative Test)'
                : 'Ready — Click "Run Test"'}
            </span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white text-xs font-mono font-bold shadow-md">
            Progress: {Math.round(testProgress)}%
          </div>
        </div>

        {/* MAIN SVG CANVAS */}
        <svg
          viewBox="0 0 800 480"
          className="w-full h-auto max-h-[480px] select-none"
          style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
        >
          <defs>
            {/* Glass Tube Gradient */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="20%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="80%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
            </linearGradient>

            {/* Red/Amber CAN Complex Gradient */}
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Sodium Metal Metallic Gradient */}
            <linearGradient id="naGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Test Tube Stand */}
          <rect x="300" y="440" width="200" height="20" rx="4" fill="#334155" stroke="#475569" strokeWidth="2" />
          <rect x="390" y="380" width="20" height="60" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <rect x="330" y="160" width="140" height="14" rx="4" fill="#334155" stroke="#475569" strokeWidth="2" />

          {/* Pipette / Reagent Dropper (drops down during test) */}
          <g transform={`translate(0, ${isRunning && testProgress < 40 ? (testProgress / 40) * 40 : 0})`}>
            {/* Pipette Body */}
            <path d="M 390 20 L 410 20 L 406 100 L 394 100 Z" fill="#94a3b8" opacity="0.6" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Rubber Bulb */}
            <path d="M 386 5 C 386 -10, 414 -10, 414 5 L 410 20 L 390 20 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
            {/* Pipette Tip */}
            <path d="M 396 100 L 404 100 L 401 125 L 399 125 Z" fill="#cbd5e1" opacity="0.8" />
          </g>

          {/* Falling Reagent Drops during animation */}
          {isRunning && testProgress > 10 && testProgress < 50 && (
            <g>
              {selectedTestId === 'sodium' ? (
                /* Falling Sodium Piece */
                <rect
                  x="394"
                  y={125 + ((testProgress - 10) / 40) * 120}
                  width="12"
                  height="12"
                  rx="2"
                  fill="url(#naGrad)"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              ) : (
                /* Liquid Drops */
                <circle
                  cx="400"
                  cy={125 + (((testProgress % 15) / 15) * 120)}
                  r="5"
                  fill={selectedTestId === 'can' ? '#facc15' : '#38bdf8'}
                  opacity="0.9"
                />
              )}
            </g>
          )}

          {/* MAIN TEST TUBE SVG */}
          <g transform="translate(0, 0)">
            {/* Liquid Level inside tube */}
            <path
              d="M 345 220 L 455 220 L 455 390 C 455 425, 345 425, 345 390 Z"
              fill={liquidColor.fill}
              fillOpacity={liquidColor.opacity}
              stroke={liquidColor.stroke}
              strokeWidth="2"
              className="transition-all duration-700"
            />

            {/* Submerged Sodium Metal Block */}
            {selectedTestId === 'sodium' && (testProgress > 35 || hasCompletedTest) && (
              <g transform="translate(392, 385)">
                <rect x="0" y="0" width="16" height="14" rx="3" fill="url(#naGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
                {isRunning && (
                  <circle cx="8" cy="7" r="12" fill="#e2e8f0" opacity="0.3" className="animate-ping" />
                )}
              </g>
            )}

            {/* Reaction Bubbles (H2 or CO2) */}
            {(testProgress > 30 || hasCompletedTest) &&
              (reactionData?.reactionType === 'h2_fizz' || reactionData?.reactionType === 'co2_effervescence') && (
                <g>
                  {bubbles.map((b) => {
                    const riseOffset = isRunning ? ((testProgress * b.speed * 2.5) % 160) : (b.id * 5) % 150;
                    const bubbleCy = Math.max(225, b.baseCy - riseOffset);
                    return (
                      <circle
                        key={b.id}
                        cx={b.cx + Math.sin((testProgress + b.id) * 0.2) * 4}
                        cy={bubbleCy}
                        r={b.r}
                        fill="#ffffff"
                        opacity={reactionData.reactionType === 'co2_effervescence' ? 0.85 : 0.65}
                        stroke="#e0f2fe"
                        strokeWidth="1"
                      />
                    );
                  })}
                </g>
              )}

            {/* Surface Gas Foam / Froth for CO2 Effervescence */}
            {(testProgress > 40 || hasCompletedTest) && reactionData?.reactionType === 'co2_effervescence' && (
              <g>
                <ellipse cx="400" cy="220" rx="52" ry="7" fill="#ffffff" opacity="0.8" />
                {Array.from({ length: 12 }).map((_, idx) => (
                  <circle
                    key={idx}
                    cx={355 + idx * 8}
                    cy={218 + (idx % 3) * 2}
                    r={3 + (idx % 3)}
                    fill="#ffffff"
                    opacity="0.9"
                  />
                ))}
              </g>
            )}

            {/* Test Tube Glass Outline */}
            <path
              d="M 340 100 L 340 390 C 340 435, 460 435, 460 390 L 460 100"
              fill="url(#glassGrad)"
              stroke="#94a3b8"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Rim of test tube */}
            <ellipse cx="400" cy="100" rx="63" ry="10" fill="none" stroke="#cbd5e1" strokeWidth="4" />
            <ellipse cx="400" cy="100" rx="60" ry="8" fill="none" stroke="#64748b" strokeWidth="2" />
          </g>

          {/* Dynamic Floating Labels on Canvas */}
          <g>
            {/* Reagent Label */}
            <rect x="180" y="80" width="140" height="34" rx="8" fill="#0f172a" opacity="0.85" stroke="#334155" strokeWidth="1.5" />
            <text x="250" y="101" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="extrabold">
              {chemicalTest.reagent}
            </text>
            <line x1="320" y1="97" x2="380" y2="97" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Sample Label */}
            <rect x="500" y="270" width="160" height="42" rx="10" fill="#0f172a" opacity="0.85" stroke="#334155" strokeWidth="1.5" />
            <text x="580" y="289" textAnchor="middle" fill="#facc15" fontSize="12" fontWeight="extrabold">
              {sample.name}
            </text>
            <text x="580" y="304" textAnchor="middle" fill="#94a3b8" fontSize="10" fontStyle="italic">
              {sample.formula}
            </text>
            <line x1="460" y1="290" x2="500" y2="290" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Gas Evolved Label (when positive reaction occurs) */}
            {hasCompletedTest && reactionData?.isPositive && (
              <g className="animate-fade-in">
                <rect
                  x="200"
                  y="200"
                  width="120"
                  height="30"
                  rx="8"
                  fill="#065f46"
                  opacity="0.9"
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
                <text x="260" y="219" textAnchor="middle" fill="#a7f3d0" fontSize="11" fontWeight="black">
                  {reactionData.reactionType === 'can_color_change'
                    ? '✨ Red Complex'
                    : reactionData.reactionType === 'co2_effervescence'
                    ? '💨 CO₂ Gas ↑'
                    : '🫧 H₂ Gas ↑'}
                </text>
              </g>
            )}
          </g>
        </svg>

        {/* Footer Bar on Visualization */}
        <div className="w-full bg-slate-950/90 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-custom-orange" />
            <span>
              Target Compound: <strong className="text-white">{sample.name}</strong> ({sample.formula})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Reagent Added:</span>
            <span className="font-semibold text-cyan-400">{chemicalTest.reagent}</span>
          </div>
        </div>
      </div>

      {/* 4. OBSERVATION PANEL (STRICTLY 5 MANDATORY SECTIONS) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-custom-blue" />
            Chemical Reaction Observation & Analysis Panel
          </h3>
          <span className="text-xs font-bold uppercase tracking-wider text-custom-orange bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            {hasCompletedTest ? 'Test Analysis Complete' : 'Run Test to View Observations'}
          </span>
        </div>

        {!hasCompletedTest ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-sm">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No test observations recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Select an unknown sample and a chemical test above, then click <strong>"Run Test"</strong> to perform the reaction.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. REACTION OBSERVED */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  1. Reaction Observed
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    reactionData.isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {reactionData.isPositive ? 'Positive Reaction' : 'Negative Reaction'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                {reactionData.reactionObserved}
              </p>
            </div>

            {/* 2. SCIENTIFIC EXPLANATION */}
            <div className="bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-200 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                2. Scientific Explanation
              </span>
              <p className="text-xs sm:text-sm text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                {reactionData.scientificExplanation}
              </p>
            </div>

            {/* 3. WHAT THIS TELLS US */}
            <div className="bg-purple-50/60 p-4 sm:p-5 rounded-2xl border border-purple-200 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900">
                3. What This Tells Us
              </span>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {reactionData.whatTellsUs}
              </p>
            </div>

            {/* 4. FUNCTIONAL GROUP IDENTIFIED */}
            <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                4. Functional Group Identified
              </span>
              <div className="mt-1">
                <span className="inline-block px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs sm:text-sm font-black border border-amber-300">
                  {reactionData.functionalGroupIdentified}
                </span>
              </div>
            </div>

            {/* 5. REAL-WORLD EXAMPLE (SPAN FULL WIDTH) */}
            <div className="md:col-span-2 bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                5. Real-World Application & Occurrence
              </span>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {reactionData.realWorld}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
