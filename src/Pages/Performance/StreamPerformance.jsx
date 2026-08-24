import React from 'react';
import { useParams, Link } from 'react-router';

export default function StreamPerformance() {
  const { streamId } = useParams();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy">Form 3A Performance</h1>
        <p className="text-slate-500">45 Students • Class Teacher: Mr. Smith</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Assessment Average</div>
          <div className="text-3xl font-heading font-bold text-navy">68%</div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
            <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Learning Progress</div>
          <div className="text-3xl font-heading font-bold text-navy">72%</div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
            <div className="bg-accent h-2 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 border-l-4 border-l-danger">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Needs Attention</div>
          <div className="text-3xl font-heading font-bold text-danger">4</div>
          <div className="text-sm text-slate-500 mt-2">Students below 40%</div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
            <tr>
              <th className="p-4 border-b border-slate-200">Subject</th>
              <th className="p-4 border-b border-slate-200">Teacher</th>
              <th className="p-4 border-b border-slate-200">Learning Progress</th>
              <th className="p-4 border-b border-slate-200">Assessment Average</th>
              <th className="p-4 border-b border-slate-200">Grade</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
              <td className="p-4 font-medium text-navy hover:text-primary">Mathematics</td>
              <td className="p-4 text-slate-500">Mr. Smith</td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">75%</span>
                  <div className="w-16 bg-slate-100 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </td>
              <td className="p-4">72%</td>
              <td className="p-4">
                <span className="px-2 py-1 rounded-md text-xs font-bold bg-primary-light text-primary">B+</span>
              </td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
              <td className="p-4 font-medium text-navy hover:text-primary">Physics</td>
              <td className="p-4 text-slate-500">Mrs. Doe</td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">60%</span>
                  <div className="w-16 bg-slate-100 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </td>
              <td className="p-4">58%</td>
              <td className="p-4">
                <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">C+</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
