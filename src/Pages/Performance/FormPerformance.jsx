import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Layers, Users, TrendingUp, Award, ArrowRight, Loader2 } from 'lucide-react';
import BackButton from '../../Components/Common/BackButton';
import { useSchoolContext } from '../../Context/SchoolContext';
import { performanceService, getGradeColor } from '../../services/performanceService';

export default function FormPerformance() {
  const { formId } = useParams();
  const { classes, streams, enrollments, school } = useSchoolContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formPerf, setFormPerf] = useState(null);

  const currentClass = (classes || []).find((c) => String(c.id) === String(formId));
  const className = currentClass?.name || `Form ${formId}`;

  const classStreams = (streams || []).filter((s) => String(s.school_class) === String(formId));
  const classStudentCount = (enrollments || []).filter((e) =>
    classStreams.some((st) => st.id === (typeof e.stream === 'object' ? e.stream?.id : e.stream))
  ).length;

  useEffect(() => {
    let isMounted = true;
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await performanceService.getFormPerformance(formId);
        if (isMounted) {
          setFormPerf(data);
        }
      } catch (err) {
        console.error('Failed to load form performance:', err);
        if (isMounted) {
          setError('Unable to load performance metrics for this form.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (formId) {
      fetchPerformance();
    }
  }, [formId]);

  // Combine backend streams with context streams
  const streamRows = classStreams.map((st) => {
    const backendStream = formPerf?.streams?.find((bs) => bs.stream_id === st.id);
    const count = (enrollments || []).filter(
      (e) => (typeof e.stream === 'object' ? e.stream?.id : e.stream) === st.id
    ).length;
    const teacherName = st.class_teacher_detail?.first_name
      ? `${st.class_teacher_detail.first_name} ${st.class_teacher_detail.last_name || ''}`.trim()
      : backendStream?.class_teacher || 'Not Assigned';
    const avg = backendStream?.average !== undefined ? backendStream.average : null;
    const grade = backendStream?.grade || '-';

    return {
      id: st.id,
      name: st.name,
      teacher: teacherName,
      studentCount: count,
      average: avg,
      grade: grade,
    };
  });

  const overallAvg = formPerf?.average !== undefined && formPerf?.average > 0 ? `${formPerf.average}%` : 'N/A';
  const overallGrade = formPerf?.grade && formPerf.grade !== '-' ? formPerf.grade : '-';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="space-y-3">
        <BackButton to="/school/performance" label="Back to Performance Hub" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-heading font-black text-navy">{className} Performance</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Form-wide stream comparisons and aggregated assessment records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
              {school?.name || 'School'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Overall Average</span>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div className="text-2xl font-black font-heading text-navy">{overallAvg}</div>
          <p className="text-xs text-slate-400 mt-1">Aggregated across all streams</p>
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
          <p className="text-xs text-slate-400 mt-1">Standard 12-point grading</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Active Streams</span>
            <Layers size={18} className="text-navy" />
          </div>
          <div className="text-2xl font-black font-heading text-navy">{classStreams.length}</div>
          <p className="text-xs text-slate-400 mt-1">Streams in this form</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Enrolled Students</span>
            <Users size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-heading text-navy">{classStudentCount}</div>
          <p className="text-xs text-slate-400 mt-1">Total active students</p>
        </div>
      </div>

      {/* Streams Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-heading font-bold text-navy">Streams in {className}</h2>
          <span className="text-xs text-slate-400">{streamRows.length} streams</span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
            Loading stream metrics...
          </div>
        ) : streamRows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No streams created for this class yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="p-4">Stream</th>
                  <th className="p-4">Class Teacher</th>
                  <th className="p-4">Students</th>
                  <th className="p-4">Overall Average</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {streamRows.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-navy">{st.name}</td>
                    <td className="p-4 text-slate-500 text-xs">{st.teacher}</td>
                    <td className="p-4 text-slate-600 text-xs">{st.studentCount} students</td>
                    <td className="p-4">
                      {st.average !== null && st.average > 0 ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-navy">{st.average}%</span>
                          <div className="w-20 bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(st.average, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No exams yet</span>
                      )}
                    </td>
                    <td className="p-4">
                      {st.grade !== '-' ? (
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getGradeColor(st.grade)}`}>
                          {st.grade}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/school/performance/stream/${st.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors"
                      >
                        View Stream <ArrowRight size={12} />
                      </Link>
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
