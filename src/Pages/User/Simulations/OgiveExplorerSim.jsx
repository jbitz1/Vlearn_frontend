import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle2, Sparkles, HelpCircle, Sliders, Target } from 'lucide-react';

const DATASET = [
  { lower: 0, upper: 10, f: 4, cf: 4 },
  { lower: 10, upper: 20, f: 8, cf: 12 },
  { lower: 20, upper: 30, f: 14, cf: 26 },
  { lower: 30, upper: 40, f: 22, cf: 48 },
  { lower: 40, upper: 50, f: 26, cf: 74 },
  { lower: 50, upper: 60, f: 16, cf: 90 },
  { lower: 60, upper: 70, f: 7, cf: 97 },
  { lower: 70, upper: 80, f: 3, cf: 100 },
];

const TOTAL_N = 100;

// Ogive points: (0,0), (10,4), (20,12), (30,26), (40,48), (50,74), (60,90), (70,97), (80,100)
const OGIVE_POINTS = [{ x: 0, y: 0 }, ...DATASET.map(d => ({ x: d.upper, y: d.cf }))];

// Linear interpolation helper for a given cf target (y-value)
function interpolateX(targetCf) {
  if (targetCf <= 0) return 0;
  if (targetCf >= TOTAL_N) return 80;

  for (let i = 0; i < DATASET.length; i++) {
    const row = DATASET[i];
    const prevCf = i === 0 ? 0 : DATASET[i - 1].cf;
    if (targetCf >= prevCf && targetCf <= row.cf) {
      const L = row.lower;
      const f = row.f;
      const c = row.upper - row.lower;
      const x = L + ((targetCf - prevCf) / f) * c;
      return { x: Math.round(x * 10) / 10, L, prevCf, f, c, upper: row.upper };
    }
  }
  return { x: 40, L: 30, prevCf: 26, f: 22, c: 10, upper: 40 };
}

export default function OgiveExplorerSim({ config = {}, onTelemetry }) {
  const [activeTab, setActiveTab] = useState('quartiles'); // 'quartiles' | 'percentile' | 'passmark'
  const [percentileVal, setPercentileVal] = useState(70); // 70th percentile
  const [passMarkVal, setPassMarkVal] = useState(40); // 40 marks
  const [exploredTabs, setExploredTabs] = useState({ quartiles: true, percentile: false, passmark: false });

  const q1Info = interpolateX(25);
  const q2Info = interpolateX(50);
  const q3Info = interpolateX(75);
  const iqr = Math.round((q3Info.x - q1Info.x) * 10) / 10;

  const targetPercentileCf = (percentileVal / 100) * TOTAL_N;
  const customPercentileInfo = interpolateX(targetPercentileCf);

  // For pass mark: find cumulative frequency at pass mark x
  const passMarkRow = DATASET.find(d => passMarkVal >= d.lower && passMarkVal <= d.upper) || DATASET[3];
  const passMarkPrevCf = DATASET.indexOf(passMarkRow) === 0 ? 0 : DATASET[DATASET.indexOf(passMarkRow) - 1].cf;
  const passMarkCf = Math.round(passMarkPrevCf + ((passMarkVal - passMarkRow.lower) / (passMarkRow.upper - passMarkRow.lower)) * passMarkRow.f);
  const failedStudents = passMarkCf;
  const passedStudents = TOTAL_N - passMarkCf;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setExploredTabs(prev => ({ ...prev, [tab]: true }));
  };

  const allCompleted = exploredTabs.quartiles && exploredTabs.percentile && exploredTabs.passmark;

  useEffect(() => {
    if (allCompleted && typeof onTelemetry === 'function') {
      onTelemetry('SIMULATION_CHECKPOINT_VERIFIED', {
        simulation: 'math_statistics_ogive_explorer',
        message: 'Student mastered reading quartiles, percentiles, and pass thresholds from an Ogive curve.',
      });
    }
  }, [allCompleted, onTelemetry]);

  // SVG Coordinates (Canvas 440 x 360)
  const SVG_W = 440;
  const SVG_H = 340;
  const MARGIN_LEFT = 45;
  const MARGIN_BOTTOM = 40;
  const MARGIN_TOP = 20;
  const MARGIN_RIGHT = 20;

  const toSvgX = (valX) => MARGIN_LEFT + (valX / 80) * (SVG_W - MARGIN_LEFT - MARGIN_RIGHT);
  const toSvgY = (valY) => SVG_H - MARGIN_BOTTOM - (valY / 100) * (SVG_H - MARGIN_TOP - MARGIN_BOTTOM);

  // Ogive SVG path d string
  const pathD = OGIVE_POINTS.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x)} ${toSvgY(pt.y)}`).join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white max-w-5xl mx-auto shadow-2xl my-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-custom-forest/20 text-emerald-400 border border-emerald-500/30">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-sans">
              Interactive Math Explorer
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">
            Cumulative Frequency &amp; Ogive Explorer
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-800 p-1.5 rounded-full border border-slate-700">
          <button
            onClick={() => handleTabChange('quartiles')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
              activeTab === 'quartiles'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Quartiles (Q₁, Q₂, Q₃)
          </button>

          <button
            onClick={() => handleTabChange('percentile')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
              activeTab === 'percentile'
                ? 'bg-cyan-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Custom Percentile
          </button>

          <button
            onClick={() => handleTabChange('passmark')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
              activeTab === 'passmark'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Pass Mark Threshold
          </button>
        </div>
      </div>

      {/* Main Content Grid: Controls/Data + Ogive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Data Controls & Formula Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Mode Explanation & Controls */}
          {activeTab === 'quartiles' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Quartiles &amp; Interquartile Range (IQR)
              </span>

              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-750">
                  <span className="text-slate-400">Lower Quartile (Q₁):</span>
                  <span className="text-emerald-400 font-bold">25th % = {q1Info.x} marks</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-750">
                  <span className="text-slate-400">Median (Q₂):</span>
                  <span className="text-amber-400 font-bold">50th % = {q2Info.x} marks</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-750">
                  <span className="text-slate-400">Upper Quartile (Q₃):</span>
                  <span className="text-cyan-400 font-bold">75th % = {q3Info.x} marks</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/40">
                  <span className="text-slate-200 font-sans font-bold text-xs uppercase">Interquartile Range (IQR = Q₃ - Q₁):</span>
                  <span className="text-emerald-300 font-bold">{iqr} marks</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'percentile' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Custom Percentile (P_{percentileVal})
                </span>
                <span className="font-mono text-cyan-400 font-bold text-lg">{percentileVal}th Percentile</span>
              </div>

              <input
                type="range"
                min="5"
                max="95"
                step="1"
                value={percentileVal}
                onChange={(e) => setPercentileVal(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 font-mono text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cumulative Frequency Target:</span>
                  <span className="text-slate-200">{targetPercentileCf} students</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Corresponding Score (P_{percentileVal}):</span>
                  <span className="text-cyan-400 font-bold">{customPercentileInfo.x} marks</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">
                {percentileVal}% of students scored below {customPercentileInfo.x} marks, and {100 - percentileVal}% scored above.
              </p>
            </div>
          )}

          {activeTab === 'passmark' && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Pass Mark Threshold Analysis
                </span>
                <span className="font-mono text-amber-400 font-bold text-lg">{passMarkVal} Marks</span>
              </div>

              <input
                type="range"
                min="15"
                max="75"
                step="1"
                value={passMarkVal}
                onChange={(e) => setPassMarkVal(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl">
                  <span className="text-xs text-red-300 font-sans uppercase font-bold block">Failed (&lt; {passMarkVal})</span>
                  <span className="text-xl font-bold font-mono text-red-400">{failedStudents}% ({failedStudents} students)</span>
                </div>
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                  <span className="text-xs text-emerald-300 font-sans uppercase font-bold block">Passed (≥ {passMarkVal})</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{passedStudents}% ({passedStudents} students)</span>
                </div>
              </div>
            </div>
          )}

          {/* Grouped Frequency Table Preview */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 overflow-x-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Grouped Frequency Table Data ($N = 100$)
            </span>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="pb-2">Class Interval</th>
                  <th className="pb-2">Freq ($f$)</th>
                  <th className="pb-2">Upper Boundary</th>
                  <th className="pb-2 text-emerald-400">Cum. Freq ($cf$)</th>
                </tr>
              </thead>
              <tbody>
                {DATASET.map((d, i) => (
                  <tr key={i} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                    <td className="py-1 text-slate-300">{d.lower} – {d.upper}</td>
                    <td className="py-1 text-slate-400">{d.f}</td>
                    <td className="py-1 text-slate-300 font-bold">{d.upper}</td>
                    <td className="py-1 text-emerald-400 font-bold">{d.cf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Ogive Interactive SVG Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 w-full flex justify-center shadow-inner">
            <svg width={SVG_W} height={SVG_H} className="overflow-visible">
              {/* Grid Lines */}
              {Array.from({ length: 9 }).map((_, i) => {
                const xVal = i * 10;
                return (
                  <g key={`x-${i}`}>
                    <line x1={toSvgX(xVal)} y1={MARGIN_TOP} x2={toSvgX(xVal)} y2={SVG_H - MARGIN_BOTTOM} stroke="#1e293b" strokeWidth="1" />
                    <text x={toSvgX(xVal)} y={SVG_H - MARGIN_BOTTOM + 18} fill="#64748b" fontSize="10" textAnchor="middle">{xVal}</text>
                  </g>
                );
              })}

              {Array.from({ length: 6 }).map((_, i) => {
                const yVal = i * 20;
                return (
                  <g key={`y-${i}`}>
                    <line x1={MARGIN_LEFT} y1={toSvgY(yVal)} x2={SVG_W - MARGIN_RIGHT} y2={toSvgY(yVal)} stroke="#1e293b" strokeWidth="1" />
                    <text x={MARGIN_LEFT - 8} y={toSvgY(yVal) + 4} fill="#64748b" fontSize="10" textAnchor="end">{yVal}</text>
                  </g>
                );
              })}

              {/* Axis Labels */}
              <text x={SVG_W / 2} y={SVG_H - 8} fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">Upper Class Boundaries (Marks)</text>
              <text x={12} y={SVG_H / 2} fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 12 ${SVG_H / 2})`}>Cumulative Frequency (cf)</text>

              {/* Plotted Ogive Path */}
              <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3.5" />

              {/* Plotted Points */}
              {OGIVE_POINTS.map((pt, i) => (
                <circle key={i} cx={toSvgX(pt.x)} cy={toSvgY(pt.y)} r="4" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              ))}

              {/* Active Tab Projection Overlay Lines */}
              {activeTab === 'quartiles' && (
                <>
                  {/* Q1 (25) */}
                  <line x1={MARGIN_LEFT} y1={toSvgY(25)} x2={toSvgX(q1Info.x)} y2={toSvgY(25)} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1={toSvgX(q1Info.x)} y1={toSvgY(25)} x2={toSvgX(q1Info.x)} y2={SVG_H - MARGIN_BOTTOM} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx={toSvgX(q1Info.x)} cy={toSvgY(25)} r="5" fill="#10b981" />
                  <text x={toSvgX(q1Info.x)} y={toSvgY(25) - 8} fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">Q₁({q1Info.x})</text>

                  {/* Q2 (50) */}
                  <line x1={MARGIN_LEFT} y1={toSvgY(50)} x2={toSvgX(q2Info.x)} y2={toSvgY(50)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1={toSvgX(q2Info.x)} y1={toSvgY(50)} x2={toSvgX(q2Info.x)} y2={SVG_H - MARGIN_BOTTOM} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx={toSvgX(q2Info.x)} cy={toSvgY(50)} r="5" fill="#f59e0b" />
                  <text x={toSvgX(q2Info.x)} y={toSvgY(50) - 8} fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">Q₂({q2Info.x})</text>

                  {/* Q3 (75) */}
                  <line x1={MARGIN_LEFT} y1={toSvgY(75)} x2={toSvgX(q3Info.x)} y2={toSvgY(75)} stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1={toSvgX(q3Info.x)} y1={toSvgY(75)} x2={toSvgX(q3Info.x)} y2={SVG_H - MARGIN_BOTTOM} stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx={toSvgX(q3Info.x)} cy={toSvgY(75)} r="5" fill="#06b6d4" />
                  <text x={toSvgX(q3Info.x)} y={toSvgY(75) - 8} fill="#06b6d4" fontSize="11" fontWeight="bold" textAnchor="middle">Q₃({q3Info.x})</text>

                  {/* IQR Highlight band on X-axis */}
                  <rect x={toSvgX(q1Info.x)} y={SVG_H - MARGIN_BOTTOM} width={toSvgX(q3Info.x) - toSvgX(q1Info.x)} height="6" fill="#10b981" opacity="0.6" rx="2" />
                </>
              )}

              {activeTab === 'percentile' && (
                <>
                  <line x1={MARGIN_LEFT} y1={toSvgY(targetPercentileCf)} x2={toSvgX(customPercentileInfo.x)} y2={toSvgY(targetPercentileCf)} stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 3" />
                  <line x1={toSvgX(customPercentileInfo.x)} y1={toSvgY(targetPercentileCf)} x2={toSvgX(customPercentileInfo.x)} y2={SVG_H - MARGIN_BOTTOM} stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 3" />
                  <circle cx={toSvgX(customPercentileInfo.x)} cy={toSvgY(targetPercentileCf)} r="6" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                  <text x={toSvgX(customPercentileInfo.x)} y={toSvgY(targetPercentileCf) - 10} fill="#06b6d4" fontSize="12" fontWeight="bold" textAnchor="middle">
                    P_{percentileVal} = {customPercentileInfo.x}
                  </text>
                </>
              )}

              {activeTab === 'passmark' && (
                <>
                  <line x1={toSvgX(passMarkVal)} y1={SVG_H - MARGIN_BOTTOM} x2={toSvgX(passMarkVal)} y2={toSvgY(passMarkCf)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
                  <line x1={toSvgX(passMarkVal)} y1={toSvgY(passMarkCf)} x2={MARGIN_LEFT} y2={toSvgY(passMarkCf)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
                  <circle cx={toSvgX(passMarkVal)} cy={toSvgY(passMarkCf)} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <text x={toSvgX(passMarkVal)} y={toSvgY(passMarkCf) - 10} fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Pass Cutoff ({passMarkVal} marks → cf = {passMarkCf})
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Legend below canvas */}
          <div className="flex items-center justify-between w-full mt-4 text-xs text-slate-400 px-2 font-mono">
            <span>• Always plot Upper Class Boundaries on X-axis</span>
            <span>• Drop vertical projection to read Mark values</span>
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div className="mt-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
            Key Learning Insight: Linear Interpolation Formula Connection
          </h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            Reading quantiles off an Ogive graphically is identical to using the linear interpolation formula:{' '}
            <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-mono">Q = L + [(kN/4 - cf_b) / f] × c</code>. The vertical dashed line lands at the exact fraction inside class interval <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">[L, U]</code>!
          </p>
        </div>
      </div>
    </div>
  );
}
