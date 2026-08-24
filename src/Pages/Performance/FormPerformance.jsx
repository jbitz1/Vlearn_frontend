import React from 'react';
import { useParams, Link } from 'react-router';

export default function FormPerformance() {
  const { formId } = useParams();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-heading font-bold text-navy">Form 3 Performance</h1>
      
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
            <tr>
              <th className="p-4 border-b border-slate-200">Stream</th>
              <th className="p-4 border-b border-slate-200">Class Teacher</th>
              <th className="p-4 border-b border-slate-200">Students</th>
              <th className="p-4 border-b border-slate-200">Overall Average</th>
              <th className="p-4 border-b border-slate-200">Grade</th>
              <th className="p-4 border-b border-slate-200">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium text-navy">Form 3A</td>
              <td className="p-4 text-slate-500">Mr. Smith</td>
              <td className="p-4">45</td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">68%</span>
                  <div className="w-16 bg-slate-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="px-2 py-1 rounded-md text-xs font-bold bg-primary-light text-primary">B</span>
              </td>
              <td className="p-4">
                <Link to="/school/performance/stream/3A" className="text-primary hover:text-primary-dark font-medium text-sm">
                  View Stream &rarr;
                </Link>
              </td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium text-navy">Form 3B</td>
              <td className="p-4 text-slate-500">Mrs. Doe</td>
              <td className="p-4">42</td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">62%</span>
                  <div className="w-16 bg-slate-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">B-</span>
              </td>
              <td className="p-4">
                <Link to="/school/performance/stream/3B" className="text-primary hover:text-primary-dark font-medium text-sm">
                  View Stream &rarr;
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
