import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { User, Award, TrendingUp, BookOpen, Loader2, Calendar } from 'lucide-react';
import BackButton from '../../Components/Common/BackButton';
import { useSchoolContext } from '../../Context/SchoolContext';
import { performanceService, getGradeColor } from '../../services/performanceService';

export default function StudentPerformance() {
  const { studentId } = useParams();
  const { enrollments, school } = useSchoolContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentPerf, setStudentPerf] = useState(null);

  const enrollment = (enrollments || []).find(
    (e) => String(e.student || e.student_detail?.id) === String(studentId)
  );
  const student = enrollment?.student_detail || {};
  const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.username || `Student #${studentId}`;
  const admNo = student.admission_number || enrollment?.admission_number || 'N/A';
  const streamName = enrollment?.stream_name || 'Assigned Stream';
  const studentInitials = studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';

  useEffect(() => {
    let isMounted = true;
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await performanceService.getStudentPerformance(studentId);
        if (isMounted) {
          setStudentPerf(data);
        }
      } catch (err) {
        console.error('Failed to load student performance:', err);
        if (isMounted) {
          setError('Failed to load performance record for this student.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const overallAvg = studentPerf?.average !== undefined && studentPerf?.average > 0 ? `${studentPerf.average}%` : 'N/A';
  const overallGrade = studentPerf?.grade && studentPerf.grade !== '-' ? studentPerf.grade : '-';
  const subjects = studentPerf?.subjects || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <BackButton to="/school/performance" label="Back to Performance Hub" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-bold font-heading shadow-md shadow-primary/20 shrink-0">
          {studentInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-black text-navy truncate">{studentName}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              {admNo}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {streamName} • {school?.name || 'School'}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Overall Average</span>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div className="text-2xl font-black font-heading text-navy">{overallAvg}</div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${studentPerf?.average ? Math.min(studentPerf.average, 100) : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Overall Grade</span>
            <Award size={18} className="text-accent" />
          </div>
          <div className="text-2xl font-black font-heading text-navy">
            {overallGrade !== '-' ? (
              <span className={`px-2.5 py-0.5 rounded-lg text-sm font-bold ${getGradeColor(overallGrade)}`}>
                {overallGrade}
              </span>
            ) : (
              'N/A'
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">Aggregate score ranking</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Assessed Subjects</span>
            <BookOpen size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-heading text-navy">{subjects.length}</div>
          <p className="text-xs text-slate-400 mt-2">Subjects with recorded scores</p>
        </div>
      </div>

      {/* Subject Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-heading font-bold text-navy">Assessment Scores</h2>
          <span className="text-xs text-slate-400">{subjects.length} exam entries</span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
            Loading assessment scores...
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No exam marks recorded for this student yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Examination</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-navy">{sub.subject_name}</td>
                    <td className="p-4 text-slate-600 text-xs">{sub.exam_name || 'Assessment'}</td>
                    <td className="p-4 font-semibold text-slate-800 text-xs">
                      {sub.score} / {sub.max_score}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getGradeColor(sub.grade)}`}>
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
