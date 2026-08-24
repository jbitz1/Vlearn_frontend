import React from 'react';
import { useParams } from 'react-router';

export default function StudentPerformance() {
  const { studentId } = useParams();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center space-x-6">
        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold font-heading">
          JD
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy">John Doe</h1>
          <p className="text-slate-500">Adm: A001 • Form 3A</p>
        </div>
      </div>

      {/* Current Term */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-heading font-bold text-navy mb-4">Current Term Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-4 border-b border-slate-200">Subject</th>
                <th className="p-4 border-b border-slate-200">Score</th>
                <th className="p-4 border-b border-slate-200">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="p-4 font-medium text-navy">Mathematics</td>
                <td className="p-4">75/100</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-success-light text-success">A-</span>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-4 font-medium text-navy">Physics</td>
                <td className="p-4">65/100</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-primary-light text-primary">B</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical */}
      <div className="space-y-4">
        <h2 className="text-lg font-heading font-bold text-navy">Academic History</h2>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-bold text-navy">2025 • Form 2</h3>
            <span className="text-sm font-medium text-slate-500">Overall: B+</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-bold text-navy">2024 • Form 1</h3>
            <span className="text-sm font-medium text-slate-500">Overall: B-</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
            <div className="bg-slate-400 h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
