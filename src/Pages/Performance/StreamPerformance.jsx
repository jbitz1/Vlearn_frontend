import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Users, TrendingUp, Award, BookOpen, ArrowRight, Loader2, UserCheck, AlertCircle } from 'lucide-react';
import BackButton from '../../Components/Common/BackButton';
import { useSchoolContext } from '../../Context/SchoolContext';
import { performanceService, getGradeColor } from '../../services/performanceService';

export default function StreamPerformance() {
  const { streamId } = useParams();
  const { streams, classes, enrollments, teacherAssignments, school } = useSchoolContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamPerf, setStreamPerf] = useState(null);
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'students'

  const currentStream = (streams || []).find((s) => String(s.id) === String(streamId));
  const parentClass = (classes || []).find((c) => c.id === currentStream?.school_class);
  const streamName = currentStream?.name || `Stream ${streamId}`;
  const className = parentClass?.name || 'Class';

  const classTeacher = currentStream?.class_teacher_detail?.first_name
    ? `${currentStream.class_teacher_detail.first_name} ${currentStream.class_teacher_detail.last_name || ''}`.trim()
    : 'Not Assigned';

  const streamEnrollments = (enrollments || []).filter(
    (e) => (typeof e.stream === 'object' ? e.stream?.id : e.stream) === parseInt(streamId)
  );

  useEffect(() => {
    let isMounted = true;
    const fetchStreamData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await performanceService.getStreamPerformance(streamId);
        if (isMounted) {
          setStreamPerf(data);
        }
      } catch (err) {
        console.error('Failed to load stream performance:', err);
        if (isMounted) {
          setError('Failed to load stream performance metrics.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (streamId) {
      fetchStreamData();
    }
  }, [streamId]);

  const streamAvg = streamPerf?.average !== undefined && streamPerf?.average > 0 ? `${streamPerf.average}%` : 'N/A';
  const streamGrade = streamPerf?.grade && streamPerf.grade !== '-' ? streamPerf.grade : '-';
  const subjectAverages = streamPerf?.subject_averages || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="space-y-3">
        <BackButton to="/school/performance" label="Back to Performance Hub" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-heading font-black text-navy">{className} - {streamName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {streamEnrollments.length} Enrolled Students • Class Teacher: <span className="font-semibold text-slate-700">{classTeacher}</span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
            {school?.name || 'School'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Assessment Average</span>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div className="text-2xl font-black font-heading text-navy">{streamAvg}</div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${streamPerf?.average ? Math.min(streamPerf.average, 100) : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Overall Grade</span>
            <Award size={18} className="text-accent" />
          </div>
          <div className="text-2xl font-black font-heading text-navy">
            {streamGrade !== '-' ? (
              <span className={`px-2.5 py-0.5 rounded-lg text-sm font-bold ${getGradeColor(streamGrade)}`}>
                {streamGrade}
              </span>
            ) : (
              'N/A'
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">Aggregate grade across subjects</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Enrolled Students</span>
            <Users size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-heading text-navy">{streamEnrollments.length}</div>
          <p className="text-xs text-slate-400 mt-2">Active student records</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 px-4 font-black text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'subjects'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Subject Performance
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 font-black text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'students'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Roster ({streamEnrollments.length})
        </button>
      </div>

      {/* Tab 1: Subject Performance */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-navy">Subject Breakdown</h2>
            <span className="text-xs text-slate-400">{subjectAverages.length} subjects recorded</span>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
              Loading subject breakdown...
            </div>
          ) : subjectAverages.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No assessment marks entered for this stream yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Assessed Candidates</th>
                    <th className="p-4">Average Score</th>
                    <th className="p-4">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectAverages.map((sub) => (
                    <tr key={sub.subject_id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-navy">{sub.subject_name}</td>
                      <td className="p-4 text-slate-600 text-xs">{sub.candidate_count} students</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-navy">{sub.average}%</span>
                          <div className="w-20 bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(sub.average, 100)}%` }}
                            ></div>
                          </div>
                        </div>
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
      )}

      {/* Tab 2: Student Roster */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-navy">Students in {streamName}</h2>
            <span className="text-xs text-slate-400">{streamEnrollments.length} students</span>
          </div>

          {streamEnrollments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No students enrolled in this stream yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="p-4">Admission No</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {streamEnrollments.map((enr) => {
                    const student = enr.student_detail || {};
                    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.username || `Student #${enr.student}`;
                    const adm = student.admission_number || '-';
                    const email = student.email || '-';
                    const sId = student.id || enr.student;

                    return (
                      <tr key={enr.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-xs font-bold text-slate-700">{adm}</td>
                        <td className="p-4 font-bold text-navy">{fullName}</td>
                        <td className="p-4 text-slate-500 text-xs">{email}</td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/school/performance/student/${sId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors"
                          >
                            Student Profile <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
