import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Layers,
  Thermometer,
  Gauge,
  FlaskConical,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Sliders,
  Plus,
  Minus,
  CheckSquare,
  ShieldCheck
} from 'lucide-react';

const EQUILIBRIUM_SYSTEMS = [
  {
    id: 'no2_n2o4',
    name: 'Dinitrogen Tetroxide & Nitrogen Dioxide',
    equation: '2NO₂(g) [Dark Brown] ⇌ N₂O₄(g) [Colorless]',
    deltaH: -57.2, // Exothermic forward (kJ/mol)
    forwardColorName: 'Colorless (N₂O₄)',
    reverseColorName: 'Dark Brown (NO₂)',
    reactantMoles: 2,
    productMoles: 1,
    defaultTemp: 25,
    defaultPress: 1.0,
    type: 'gas',
    colorModel: (ratio) => {
      // ratio: 0 (pure NO2, brown) to 1 (pure N2O4, colorless/pale yellow)
      // Brown: rgba(180, 83, 9, opacity)
      const no2Fraction = 1 - ratio;
      const alpha = Math.max(0.1, Math.min(0.9, no2Fraction * 0.85 + 0.1));
      return `rgba(180, 83, 9, ${alpha.toFixed(2)})`;
    }
  },
  {
    id: 'iron_thiocyanate',
    name: 'Iron(III) Thiocyanate Complex',
    equation: 'Fe³⁺(aq) [Pale Yellow] + SCN⁻(aq) [Colorless] ⇌ [Fe(SCN)]²⁺(aq) [Blood Red]',
    deltaH: -12.5, // Exothermic forward
    forwardColorName: 'Deep Blood Red ([Fe(SCN)]²⁺)',
    reverseColorName: 'Pale Yellow (Fe³⁺)',
    reactantMoles: 2,
    productMoles: 1,
    defaultTemp: 20,
    defaultPress: 1.0,
    type: 'aqueous',
    colorModel: (ratio) => {
      // ratio: 0 (yellow) to 1 (blood red)
      const redFraction = ratio;
      const red = Math.round(220 * redFraction + 245 * (1 - redFraction));
      const green = Math.round(38 * redFraction + 200 * (1 - redFraction));
      const blue = Math.round(38 * redFraction + 100 * (1 - redFraction));
      const alpha = 0.2 + redFraction * 0.65;
      return `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(2)})`;
    }
  },
  {
    id: 'ammonia_synthesis',
    name: 'Haber Ammonia Equilibrium',
    equation: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    deltaH: -92.4, // Exothermic forward (kJ/mol)
    forwardColorName: 'Ammonia Product (NH₃)',
    reverseColorName: 'Reactants (N₂ + 3H₂)',
    reactantMoles: 4,
    productMoles: 2,
    defaultTemp: 450,
    defaultPress: 200,
    type: 'gas',
    colorModel: (ratio) => {
      // Blue hue for ammonia yield
      const alpha = 0.15 + ratio * 0.65;
      return `rgba(14, 165, 233, ${alpha.toFixed(2)})`;
    }
  }
];

export default function ChemicalSim({ config = {}, onTelemetry }) {
  const [selectedSystemIndex, setSelectedSystemIndex] = useState(0);
  const currentSystem = EQUILIBRIUM_SYSTEMS[selectedSystemIndex];

  // Stress State Variables
  const [temperature, setTemperature] = useState(currentSystem.defaultTemp);
  const [pressure, setPressure] = useState(currentSystem.defaultPress);
  const [addedReactantOffset, setAddedReactantOffset] = useState(0); // -2 to +2
  const [addedProductOffset, setAddedProductOffset] = useState(0); // -2 to +2
  const [hasCatalyst, setHasCatalyst] = useState(false);

  // Transient rate perturbation animation
  const [isPerturbed, setIsPerturbed] = useState(false);
  const [perturbationReason, setPerturbationReason] = useState('');

  // Missions & Checkpoints
  const [missions, setMissions] = useState({
    heatedSystem: false,
    cooledSystem: false,
    pressurizedGas: false,
    addedReactant: false,
    testedCatalyst: false
  });

  // Switch system reset
  const handleSelectSystem = (idx) => {
    setSelectedSystemIndex(idx);
    const sys = EQUILIBRIUM_SYSTEMS[idx];
    setTemperature(sys.defaultTemp);
    setPressure(sys.defaultPress);
    setAddedReactantOffset(0);
    setAddedProductOffset(0);
    setHasCatalyst(false);
    setIsPerturbed(false);
  };

  const resetToStandard = () => {
    setTemperature(currentSystem.defaultTemp);
    setPressure(currentSystem.defaultPress);
    setAddedReactantOffset(0);
    setAddedProductOffset(0);
    setHasCatalyst(false);
    setIsPerturbed(false);
  };

  // Equilibrium Shift Calculation based on Le Chatelier's Principle
  const equilibriumState = useMemo(() => {
    let forwardShiftScore = 0; // -100 to +100

    // 1. Temperature Effect (Exothermic forward: heat is a product)
    // Increasing Temp shifts LEFT; Decreasing Temp shifts RIGHT.
    const tempDelta = temperature - currentSystem.defaultTemp;
    const tempSensitivity = currentSystem.id === 'ammonia_synthesis' ? 0.2 : 1.2;
    forwardShiftScore -= tempDelta * tempSensitivity;

    // 2. Pressure Effect (Gases only: High pressure favors fewer gas moles)
    if (currentSystem.type === 'gas' && currentSystem.reactantMoles !== currentSystem.productMoles) {
      const moleDiff = currentSystem.reactantMoles - currentSystem.productMoles; // Positive means forward has fewer moles
      const pressDelta = pressure - currentSystem.defaultPress;
      const pressSensitivity = currentSystem.id === 'ammonia_synthesis' ? 0.3 : 15;
      forwardShiftScore += pressDelta * moleDiff * pressSensitivity;
    }

    // 3. Concentration Stress
    forwardShiftScore += addedReactantOffset * 25;
    forwardShiftScore -= addedProductOffset * 25;

    // Baseline standard equilibrium ratio is ~0.50 (balanced)
    const rawRatio = 0.50 + forwardShiftScore / 200;
    const productFraction = Math.max(0.05, Math.min(0.95, rawRatio));
    const reactantFraction = 1 - productFraction;

    // Rates calculation
    // Base rate increases with temperature and catalyst
    const kineticFactor = (1 + (temperature / (currentSystem.defaultTemp * 2))) * (hasCatalyst ? 2.2 : 1.0);
    const forwardRate = (reactantFraction * 100 * kineticFactor).toFixed(1);
    const reverseRate = (productFraction * 100 * kineticFactor).toFixed(1);

    // Shift Direction
    let shiftLabel = 'Dynamic Equilibrium (Rates Equal)';
    let shiftDirection = 'equilibrium';
    if (forwardShiftScore > 10) {
      shiftLabel = 'Shifts Right (Favours Forward / Products)';
      shiftDirection = 'right';
    } else if (forwardShiftScore < -10) {
      shiftLabel = 'Shifts Left (Favours Reverse / Reactants)';
      shiftDirection = 'left';
    }

    return {
      productFraction,
      reactantFraction,
      forwardRate,
      reverseRate,
      forwardShiftScore,
      shiftLabel,
      shiftDirection,
      kineticFactor
    };
  }, [temperature, pressure, addedReactantOffset, addedProductOffset, hasCatalyst, currentSystem]);

  // Track Checkpoints
  useEffect(() => {
    const updated = { ...missions };
    let changed = false;

    if (temperature > currentSystem.defaultTemp + 15 && !updated.heatedSystem) {
      updated.heatedSystem = true;
      changed = true;
    }
    if (temperature < currentSystem.defaultTemp - 10 && !updated.cooledSystem) {
      updated.cooledSystem = true;
      changed = true;
    }
    if (pressure > currentSystem.defaultPress * 1.5 && !updated.pressurizedGas) {
      updated.pressurizedGas = true;
      changed = true;
    }
    if (addedReactantOffset > 0 && !updated.addedReactant) {
      updated.addedReactant = true;
      changed = true;
    }
    if (hasCatalyst && !updated.testedCatalyst) {
      updated.testedCatalyst = true;
      changed = true;
    }

    if (changed) {
      setMissions(updated);
      if (typeof onTelemetry === 'function') {
        onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
          key: 'chemical_equilibrium',
          missions: updated
        });
      }
    }
  }, [temperature, pressure, addedReactantOffset, hasCatalyst, currentSystem, missions, onTelemetry]);

  // Dynamic reaction vessel styling
  const vesselBgColor = currentSystem.colorModel(equilibriumState.productFraction);

  return (
    <div className="w-full space-y-6 text-gray-900">
      {/* 1. System Selector Tabs */}
      <div className="bg-gray-50/80 p-2 sm:p-3 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-custom-blue" />
            Select Reversible Chemical System:
          </span>
          <button
            onClick={resetToStandard}
            className="text-xs font-semibold text-gray-600 hover:text-custom-blue flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-gray-200/60"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {EQUILIBRIUM_SYSTEMS.map((sys, idx) => (
            <button
              key={sys.id}
              onClick={() => handleSelectSystem(idx)}
              className={`p-2.5 sm:p-3 rounded-xl text-left font-medium transition-all text-xs sm:text-sm border cursor-pointer ${
                selectedSystemIndex === idx
                  ? 'bg-white border-custom-blue text-custom-blue shadow-xs font-bold ring-2 ring-custom-blue/20'
                  : 'bg-white/60 border-gray-200 text-gray-700 hover:bg-white'
              }`}
            >
              <div className="font-bold truncate">{sys.name}</div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">{sys.equation}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main 2-Column Split Stage */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT / TOP: Chemical Reactor & Spectrophotometer Vessel (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Reaction Vessel Card */}
          <div className="bg-slate-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
            {/* Top Bar Indicator */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  Closed Dynamic Reactor
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {currentSystem.equation}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-mono">Enthalpy Change</span>
                <span className={`text-xs font-bold font-mono ${currentSystem.deltaH < 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  ΔH = {currentSystem.deltaH} kJ/mol ({currentSystem.deltaH < 0 ? 'Exothermic' : 'Endothermic'})
                </span>
              </div>
            </div>

            {/* Dynamic Glass Flask Visualizer */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative w-48 sm:w-64 h-48 sm:h-64 rounded-3xl border-4 border-slate-700/80 shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-700 p-4"
                style={{ backgroundColor: vesselBgColor }}
              >
                {/* Moving Sub-Microscopic Particles */}
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                  <div className="w-full h-full relative">
                    <span className="absolute top-4 left-6 w-3 h-3 rounded-full bg-white animate-ping" />
                    <span className="absolute top-12 right-8 w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce" />
                    <span className="absolute bottom-8 left-12 w-3.5 h-3.5 rounded-full bg-cyan-200 animate-pulse" />
                    <span className="absolute bottom-12 right-10 w-2 h-2 rounded-full bg-amber-200 animate-ping" />
                  </div>
                </div>

                {/* Center Flask Core Reading */}
                <div className="relative z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-slate-700/60 max-w-[85%] shadow-lg">
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
                    Observed Equilibrium Color
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                    {equilibriumState.productFraction > 0.65
                      ? currentSystem.forwardColorName
                      : equilibriumState.productFraction < 0.35
                      ? currentSystem.reverseColorName
                      : 'Intermediate Mixture'}
                  </div>
                  <div className="text-[11px] text-cyan-300 font-mono mt-1">
                    Yield: {(equilibriumState.productFraction * 100).toFixed(0)}% Products
                  </div>
                </div>
              </div>

              {/* Equilibrium State Banner */}
              <div className={`mt-4 px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 transition-all ${
                equilibriumState.shiftDirection === 'right'
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                  : equilibriumState.shiftDirection === 'left'
                  ? 'bg-amber-950/90 text-amber-300 border-amber-700'
                  : 'bg-blue-950/90 text-blue-300 border-blue-700'
              }`}>
                {equilibriumState.shiftDirection === 'right' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : equilibriumState.shiftDirection === 'left' ? (
                  <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                )}
                <span>{equilibriumState.shiftLabel}</span>
              </div>
            </div>

            {/* Reaction Rates Meter (Forward Rf vs Reverse Rr) */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Dynamic Rates (R_f vs R_r)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {hasCatalyst ? 'Catalyst Active (Rates 2.2x Faster)' : 'Uncatalyzed Baseline'}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Forward Rate (R_f: Reactants → Products)</span>
                    <span className="text-cyan-400 font-bold">{equilibriumState.forwardRate} arb. units</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, equilibriumState.forwardRate * 0.8)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Reverse Rate (R_r: Products → Reactants)</span>
                    <span className="text-amber-400 font-bold">{equilibriumState.reverseRate} arb. units</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, equilibriumState.reverseRate * 0.8)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT / BOTTOM: Interactive Stress Controls (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-5">
            <h4 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <Sliders className="w-4 h-4 text-custom-blue" />
              Apply Le Chatelier Stresses
            </h4>

            {/* 1. Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-red-500" />
                  Temperature:
                </span>
                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  {temperature}°C
                </span>
              </div>
              <input
                type="range"
                min={currentSystem.id === 'ammonia_synthesis' ? 200 : 0}
                max={currentSystem.id === 'ammonia_synthesis' ? 700 : 100}
                step={currentSystem.id === 'ammonia_synthesis' ? 10 : 5}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-custom-blue cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>Cold (Ice Bath)</span>
                <span>Room Temp</span>
                <span>Hot Water</span>
              </div>
            </div>

            {/* 2. Pressure Control (Gas systems only) */}
            {currentSystem.type === 'gas' && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                    Pressure:
                  </span>
                  <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    {pressure} atm
                  </span>
                </div>
                <input
                  type="range"
                  min={currentSystem.id === 'ammonia_synthesis' ? 50 : 0.5}
                  max={currentSystem.id === 'ammonia_synthesis' ? 400 : 5.0}
                  step={currentSystem.id === 'ammonia_synthesis' ? 10 : 0.5}
                  value={pressure}
                  onChange={(e) => setPressure(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>Low Pressure ({currentSystem.reactantMoles} mol gas)</span>
                  <span>High Pressure ({currentSystem.productMoles} mol gas)</span>
                </div>
              </div>
            )}

            {/* 3. Concentration Perturbation Buttons */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-700 block">
                Concentration Stress (Add / Remove Species):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAddedReactantOffset((prev) => Math.min(prev + 1, 2))}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Reactants
                </button>
                <button
                  onClick={() => setAddedProductOffset((prev) => Math.min(prev + 1, 2))}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Products
                </button>
                <button
                  onClick={() => setAddedReactantOffset((prev) => Math.max(prev - 1, -2))}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" /> - Reactants
                </button>
                <button
                  onClick={() => setAddedProductOffset((prev) => Math.max(prev - 1, -2))}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" /> - Products
                </button>
              </div>
            </div>

            {/* 4. Catalyst Toggle Button */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => setHasCatalyst(!hasCatalyst)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                  hasCatalyst
                    ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Catalyst: {hasCatalyst ? 'ACTIVE (Speeds Up Rates)' : 'INACTIVE'}
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                  {hasCatalyst ? 'Position Unchanged' : 'Click to Add'}
                </span>
              </button>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                * Note: A catalyst increases forward and reverse rates equally without altering the equilibrium position.
              </p>
            </div>
          </div>

          {/* Le Chatelier Rule Explanation Callout */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl p-4 border border-blue-100 text-xs text-gray-700 space-y-1.5">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-custom-blue shrink-0" />
              Le Chatelier's Principle Insight:
            </div>
            <p className="leading-relaxed">
              When a system at equilibrium is disturbed by changing temperature, pressure, or concentration, the system shifts in the direction that opposes and neutralizes the applied change.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Student Learning Missions / Checkpoints Checklist */}
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Interactive Equilibrium Learning Checkpoints:
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${missions.heatedSystem ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-gray-200 text-gray-600'}`}>
            <CheckSquare className={`w-4 h-4 ${missions.heatedSystem ? 'text-emerald-600' : 'text-gray-300'}`} />
            <span>1. Heat system (shifts to endothermic side)</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${missions.cooledSystem ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-gray-200 text-gray-600'}`}>
            <CheckSquare className={`w-4 h-4 ${missions.cooledSystem ? 'text-emerald-600' : 'text-gray-300'}`} />
            <span>2. Cool system (shifts to exothermic side)</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${missions.pressurizedGas ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-gray-200 text-gray-600'}`}>
            <CheckSquare className={`w-4 h-4 ${missions.pressurizedGas ? 'text-emerald-600' : 'text-gray-300'}`} />
            <span>3. Increase pressure (shifts to fewer gas moles)</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${missions.addedReactant ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-gray-200 text-gray-600'}`}>
            <CheckSquare className={`w-4 h-4 ${missions.addedReactant ? 'text-emerald-600' : 'text-gray-300'}`} />
            <span>4. Add reactant (drives forward reaction)</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${missions.testedCatalyst ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-gray-200 text-gray-600'}`}>
            <CheckSquare className={`w-4 h-4 ${missions.testedCatalyst ? 'text-emerald-600' : 'text-gray-300'}`} />
            <span>5. Add catalyst (proves equilibrium position unchanged)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
