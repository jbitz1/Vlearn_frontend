import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  FileText, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  Users, 
  BookOpen, 
  Download, 
  Upload, 
  Building2,
  Calendar
} from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';
import { gradeFromScore, getGradeColor } from '../../services/performanceService';
import teacherCurriculumService from '../../services/teacherCurriculumService';
import TeacherContext from '../../Context/TeacherContext';

export default function AssessmentEntry() {
  const { examId: paramExamId } = useParams();
  const navigate = useNavigate();
  const { activeSchool } = useContext(TeacherContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Teaching context
  const [workspaceData, setWorkspaceData] = useState({ by_subject: [], by_class: [] });
  const [examinations, setExaminations] = useState([]);
  
  const [selectedExamId, setSelectedExamId] = useState(paramExamId ? Number(paramExamId) : null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedStreamId, setSelectedStreamId] = useState(null);

  // Student roster & marks
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);

  const maxScore = 100;

  // 1. Initial Load: Workspace & Exams
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [ws, examsRes] = await Promise.all([
          teacherCurriculumService.getTeachingWorkspace(),
          assessmentService.getExaminations()
        ]);

        if (isMounted) {
          setWorkspaceData(ws);
          const examList = Array.isArray(examsRes) ? examsRes : (examsRes?.results || []);
          setExaminations(examList);

          if (examList.length > 0) {
            const initialExam = paramExamId 
              ? examList.find(e => String(e.id) === String(paramExamId)) || examList[0]
              : examList[0];
            setSelectedExamId(initialExam.id);
          }

          if (ws?.by_subject && ws.by_subject.length > 0) {
            const firstSubj = ws.by_subject[0];
            setSelectedSubjectId(firstSubj.id);
            if (firstSubj.streams && firstSubj.streams.length > 0) {
              setSelectedStreamId(firstSubj.streams[0].stream_id);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing assessment entry:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialData();
    return () => { isMounted = false; };
  }, [activeSchool, paramExamId]);

  // 2. Fetch Students & Existing Marks when (Stream, Subject, Exam) changes
  useEffect(() => {
    if (!selectedStreamId || !selectedSubjectId || !selectedExamId) return;

    let isMounted = true;
    const fetchRosterAndMarks = async () => {
      try {
        setLoadingStudents(true);
        const [classRes, marksRes] = await Promise.all([
          teacherCurriculumService.getMyClassDetails(selectedStreamId),
          assessmentService.getMarks({
            examination: selectedExamId,
            subject: selectedSubjectId,
            stream: selectedStreamId
          })
        ]);

        if (isMounted) {
          const studentList = classRes?.students || [];
          setStudents(studentList);

          // Populate existing marks
          const marksList = Array.isArray(marksRes) ? marksRes : (marksRes?.results || []);
          const markMap = {};
          marksList.forEach(m => {
            if (m.student && m.score !== null) {
              markMap[m.student] = Number(m.score);
            }
          });
          setMarks(markMap);
        }
      } catch (err) {
        console.error('Failed to load students/marks:', err);
      } finally {
        if (isMounted) setLoadingStudents(false);
      }
    };

    fetchRosterAndMarks();
    return () => { isMounted = false; };
  }, [selectedStreamId, selectedSubjectId, selectedExamId]);

  const activeSubject = workspaceData.by_subject?.find(s => s.id === selectedSubjectId);
  const availableStreams = activeSubject?.streams || [];

  const handleMarkChange = (studentId, value) => {
    const val = parseFloat(value);
    setMarks(prev => ({ ...prev, [studentId]: isNaN(val) ? '' : val }));
  };

  const handleSave = async () => {
    if (!selectedExamId || !selectedSubjectId || !selectedStreamId) {
      setSaveError('Please select an examination, subject, and stream.');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      const marksPayload = Object.entries(marks)
        .filter(([_, score]) => typeof score === 'number' && score >= 0 && score <= maxScore)
        .map(([studentId, score]) => ({
          student_id: Number(studentId),
          score: score
        }));

      await assessmentService.saveMarks({
        marks: marksPayload,
        examination_id: selectedExamId,
        subject_id: selectedSubjectId,
        stream_id: selectedStreamId
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving marks:', err);
      setSaveError(err.response?.data?.error || 'Failed to save marks. Please check input bounds (0-100).');
    } finally {
      setSaving(false);
    }
  };

  const validScores = Object.values(marks).filter(v => typeof v === 'number' && v >= 0 && v <= maxScore);
  const classAvg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading assessment workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center text-xs font-bold text-slate-400 hover:text-navy mb-3 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-full">
              Marks Entry
            </span>
            <h1 className="text-3xl font-black text-navy mt-1">Assessment Marks Entry</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Select your assigned subject and stream to upload or enter examination results.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || students.length === 0}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm shadow-md shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Marks...' : 'Save Results'}
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-success/10 border border-success/20 text-success rounded-2xl font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Marks saved successfully! Performance dashboards have been updated.
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl font-bold text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {saveError}
        </div>
      )}

      {/* Context Switcher: Exam + Subject + Stream */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Select Assessment Context
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Examination */}
          <div>
            <label className="text-xs font-bold text-navy block mb-1.5">Examination</label>
            <select
              value={selectedExamId || ''}
              onChange={(e) => setSelectedExamId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy focus:outline-none focus:border-primary cursor-pointer"
            >
              {examinations.length === 0 ? (
                <option value="">No examinations open</option>
              ) : (
                examinations.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name || `Exam #${exam.id}`} {exam.term ? `(Term ${exam.term})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-bold text-navy block mb-1.5">Subject</label>
            <select
              value={selectedSubjectId || ''}
              onChange={(e) => {
                const subId = Number(e.target.value);
                setSelectedSubjectId(subId);
                const subj = workspaceData.by_subject?.find(s => s.id === subId);
                if (subj?.streams && subj.streams.length > 0) {
                  setSelectedStreamId(subj.streams[0].stream_id);
                } else {
                  setSelectedStreamId(null);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy focus:outline-none focus:border-primary cursor-pointer"
            >
              {(!workspaceData.by_subject || workspaceData.by_subject.length === 0) ? (
                <option value="">No subjects assigned</option>
              ) : (
                workspaceData.by_subject.map(subj => (
                  <option key={subj.id} value={subj.id}>
                    {subj.academic_title || subj.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Stream */}
          <div>
            <label className="text-xs font-bold text-navy block mb-1.5">Stream / Class</label>
            <select
              value={selectedStreamId || ''}
              onChange={(e) => setSelectedStreamId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy focus:outline-none focus:border-primary cursor-pointer"
            >
              {availableStreams.length === 0 ? (
                <option value="">No streams assigned for this subject</option>
              ) : (
                availableStreams.map(st => (
                  <option key={st.stream_id} value={st.stream_id}>
                    {st.form_name} {st.stream_name} ({st.student_count} students)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </section>

      {/* Marks Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loadingStudents ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Loading enrolled student roster...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-navy">No Enrolled Students</h3>
            <p className="text-xs text-slate-500">
              There are no active students enrolled in this stream yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="p-4 pl-6">Adm No</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4 w-48">Score Input (/{maxScore})</th>
                  <th className="p-4 pr-6">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(student => {
                  const score = marks[student.id];
                  const isInvalid = score !== '' && score !== undefined && (score < 0 || score > maxScore);
                  const grade = typeof score === 'number' && !isInvalid ? gradeFromScore(score, maxScore) : '—';
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-500">
                        {student.admission_number || '—'}
                      </td>
                      <td className="p-4 font-black text-navy text-sm">
                        {student.name}
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={score === undefined ? '' : score}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          placeholder="Score"
                          className={`w-28 px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${
                            isInvalid 
                              ? 'border-danger text-danger bg-danger/5 focus:ring-danger/20' 
                              : 'border-slate-200 text-navy bg-slate-50 focus:border-primary focus:bg-white'
                          } focus:outline-none focus:ring-2`}
                          min="0"
                          max={maxScore}
                        />
                      </td>
                      <td className="p-4 pr-6">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          grade === 'A' || grade === 'A-' || grade === 'B+' ? 'bg-success/10 text-success' :
                          grade === 'B' || grade === 'B-' || grade === 'C+' ? 'bg-primary/10 text-primary' :
                          grade === 'C' || grade === 'C-' ? 'bg-amber-50 text-amber-700' :
                          grade === '—' ? 'bg-slate-100 text-slate-400' : 'bg-danger/10 text-danger'
                        }`}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-navy border-t border-slate-200">
                <tr>
                  <td colSpan="2" className="p-4 pl-6 text-right text-xs font-black uppercase text-slate-500">
                    Stream Average ({validScores.length}/{students.length} entered):
                  </td>
                  <td className="p-4 font-black text-navy text-base">
                    {classAvg.toFixed(1)}%
                  </td>
                  <td className="p-4 pr-6">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-primary/10 text-primary">
                      {gradeFromScore(classAvg, maxScore)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

