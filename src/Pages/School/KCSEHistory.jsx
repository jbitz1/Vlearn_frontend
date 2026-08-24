import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function KCSEHistory() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8 min-h-screen pb-10">
      <header className="bg-white rounded-3xl p-6 md:p-8 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-navy mb-1">KCSE History</h1>
          <p className="text-slate-500 font-medium text-sm">Final Exam Performance Trends</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Results
        </button>
      </header>

      {/* 4-year vertical bar chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-navy mb-6">Mean Score Trend (Last 4 Years)</h3>
        <div className="h-64 flex items-end gap-8 pb-8 border-b border-slate-100">
          {[
            { year: 2020, score: 6.2 },
            { year: 2021, score: 6.5 },
            { year: 2022, score: 7.1 },
            { year: 2023, score: 7.8, active: true },
          ].map((item) => (
            <div key={item.year} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="font-bold text-sm text-slate-500 group-hover:text-navy transition-colors">{item.score}</span>
              <div 
                className={`w-16 rounded-t-lg transition-all ${item.active ? 'bg-[#02A0BF]' : 'bg-slate-200 group-hover:bg-slate-300'}`}
                style={{ height: `${(item.score / 12) * 100}%` }}
              ></div>
              <span className={`font-bold mt-2 ${item.active ? 'text-[#02A0BF]' : 'text-slate-400'}`}>{item.year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate & grade breakdown table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-navy">Grade Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Year</th>
                <th className="p-4">Candidates</th>
                <th className="p-4">Mean Grade</th>
                <th className="p-4">Mean Pts</th>
                <th className="p-4">A</th>
                <th className="p-4">A-</th>
                <th className="p-4">B+</th>
                <th className="p-4">B</th>
                <th className="p-4">B-</th>
                <th className="p-4">C+</th>
                <th className="p-4">C</th>
                <th className="p-4">C-</th>
                <th className="p-4">D+</th>
                <th className="p-4">D</th>
                <th className="p-4">D-</th>
                <th className="p-4">E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="bg-primary/5">
                <td className="p-4 font-bold text-primary">2023</td>
                <td className="p-4">120</td>
                <td className="p-4 font-bold">C+</td>
                <td className="p-4">7.8</td>
                <td className="p-4">2</td>
                <td className="p-4">5</td>
                <td className="p-4">12</td>
                <td className="p-4">18</td>
                <td className="p-4">20</td>
                <td className="p-4">25</td>
                <td className="p-4">15</td>
                <td className="p-4">10</td>
                <td className="p-4">8</td>
                <td className="p-4">3</td>
                <td className="p-4">2</td>
                <td className="p-4">0</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-600">2022</td>
                <td className="p-4">115</td>
                <td className="p-4 font-bold">C</td>
                <td className="p-4">7.1</td>
                <td className="p-4">1</td>
                <td className="p-4">3</td>
                <td className="p-4">8</td>
                <td className="p-4">15</td>
                <td className="p-4">22</td>
                <td className="p-4">20</td>
                <td className="p-4">18</td>
                <td className="p-4">12</td>
                <td className="p-4">10</td>
                <td className="p-4">4</td>
                <td className="p-4">2</td>
                <td className="p-4">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-navy text-xl">Add KCSE Results</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-navy">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Year</label>
                <input type="number" className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Total Candidates</label>
                  <input type="number" className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mean Points</label>
                  <input type="number" step="0.01" className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">Save Results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
