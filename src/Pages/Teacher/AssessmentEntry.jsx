import React, { useState, useEffect } from 'react';
import { assessmentService } from '../../services/assessmentService';
import { gradeFromScore, getGradeColor } from '../../services/performanceService';
import { useParams } from 'react-router';

export default function AssessmentEntry() {
  const { examId } = useParams();
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const maxScore = 100;

  useEffect(() => {
    // Mocking initial data fetch for UI purposes, replace with real API call
    setLoading(true);
    setTimeout(() => {
      setStudents([
        { id: 1, name: 'John Doe', admNo: 'A001' },
        { id: 2, name: 'Jane Smith', admNo: 'A002' },
        { id: 3, name: 'Peter Jones', admNo: 'A003' }
      ]);
      setMarks({
        1: 75,
        2: 85,
        3: 40
      });
      setLoading(false);
    }, 500);
  }, [examId]);

  const handleMarkChange = (studentId, value) => {
    const val = parseInt(value, 10);
    setMarks(prev => ({ ...prev, [studentId]: isNaN(val) ? '' : val }));
  };

  const handleSave = async () => {
    setSaving(true);
    // const data = Object.keys(marks).map(studentId => ({ student_id: studentId, score: marks[studentId] }));
    // await assessmentService.saveMarks(data);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const classAvg = Object.values(marks).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0) / (Object.values(marks).filter(v => typeof v === 'number').length || 1);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading font-bold text-navy">Assessment Entry</h1>
        <div className="space-x-4">
          <button className="px-4 py-2 text-primary font-medium hover:bg-slate-50 rounded-xl">Download Template</button>
          <button className="px-4 py-2 bg-navy text-white font-medium hover:bg-navy-700 rounded-xl">Upload Excel</button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-4 py-2 bg-primary text-white font-medium hover:bg-primary-dark rounded-xl"
          >
            {saving ? 'Saving...' : 'Save Results'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-success-light text-success rounded-xl font-medium">
          Marks saved successfully.
        </div>
      )}

      <div className="p-4 bg-primary-light text-primary rounded-xl text-sm font-medium">
        Saving marks automatically updates stream, form, and school performance dashboards.
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-4 border-b border-slate-200">Adm No</th>
                <th className="p-4 border-b border-slate-200">Student Name</th>
                <th className="p-4 border-b border-slate-200">Score Input (/{maxScore})</th>
                <th className="p-4 border-b border-slate-200">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const score = marks[student.id];
                const isInvalid = score !== '' && (score < 0 || score > maxScore);
                const grade = typeof score === 'number' && !isInvalid ? gradeFromScore(score, maxScore) : '-';
                
                return (
                  <tr key={student.id} className="border-b border-slate-100 last:border-none">
                    <td className="p-4 text-slate-500">{student.admNo}</td>
                    <td className="p-4 font-medium text-navy">{student.name}</td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        value={score === undefined ? '' : score}
                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                        className={`w-24 px-3 py-2 rounded-xl border ${isInvalid ? 'border-danger focus:ring-danger/20' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} focus:outline-none focus:ring-2`}
                        min="0"
                        max={maxScore}
                      />
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${getGradeColor(grade)}`}>
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="sticky bottom-0 bg-slate-50 font-medium text-navy border-t border-slate-200">
              <tr>
                <td colSpan="2" className="p-4 text-right">Class Average:</td>
                <td className="p-4">{classAvg.toFixed(1)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${getGradeColor(gradeFromScore(classAvg, maxScore))}`}>
                    {gradeFromScore(classAvg, maxScore)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
