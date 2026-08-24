import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  UserCheck, 
  Building2, 
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import apiClient from '../../../config/apiClient';

const TeacherAssignmentsStep = ({ 
  data = {}, 
  schoolId, 
  updateData, 
  subjects = [], 
  teachers = [], 
  formsAndStreams = {} 
}) => {
  const formsList = formsAndStreams.forms || Object.keys(formsAndStreams.streams || formsAndStreams);
  const streamsMap = formsAndStreams.streams || formsAndStreams;

  const [viewMode, setViewMode] = useState('by_teacher'); // 'by_teacher' | 'by_stream'
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedForm, setSelectedForm] = useState(formsList[0] || '');
  const [selectedStream, setSelectedStream] = useState(streamsMap[formsList[0]]?.[0] || '');

  const [dbStreams, setDbStreams] = useState([]);
  const [dbSubjects, setDbSubjects] = useState([]);
  const [dbAssignments, setDbAssignments] = useState([]);
  const [academicYearId, setAcademicYearId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTeacherSubjects, setActiveTeacherSubjects] = useState({}); // { [teacherId]: [subjectName1, subjectName2] }

  // Eligible teachers with persisted DB IDs
  const eligibleTeachers = teachers.filter(t => t.id || t.membership_id);

  // Synchronize academic structure and existing assignments
  const syncAcademicStructure = async () => {
    if (!schoolId) return;
    setIsSyncing(true);
    try {
      // 1. Get or create Academic Year
      const yearRes = await apiClient.get(`/api/organizations/academic-years/?school=${schoolId}`);
      let years = yearRes.data?.results || yearRes.data || [];
      let activeYear = years.find(y => y.is_current) || years[0];
      if (!activeYear) {
        const currentYear = new Date().getFullYear();
        const createYearRes = await apiClient.post('/api/organizations/academic-years/', {
          school: schoolId,
          name: `${currentYear} Academic Year`,
          start_date: `${currentYear}-01-01`,
          end_date: `${currentYear}-12-31`,
          is_current: true
        });
        activeYear = createYearRes.data;
      }
      setAcademicYearId(activeYear.id);

      // 2. Fetch all grades to match curriculum_grade
      const gradesRes = await apiClient.get('/api/curriculum/grades/');
      const allGrades = gradesRes.data?.results || gradesRes.data || [];

      // 3. Fetch existing SchoolClasses and Streams
      const [classRes, streamRes] = await Promise.all([
        apiClient.get(`/api/organizations/classes/?school=${schoolId}`),
        apiClient.get(`/api/organizations/streams/?school=${schoolId}`)
      ]);
      const existingClasses = classRes.data?.results || classRes.data || [];
      const existingStreams = streamRes.data?.results || streamRes.data || [];

      // 4. Ensure all forms exist in database
      const forms = formsList;
      const classMap = {};
      for (const formName of forms) {
        let schoolClass = existingClasses.find(c => c.name.toLowerCase() === formName.toLowerCase());
        if (!schoolClass) {
          const matchedGrade = allGrades.find(g => g.name.toLowerCase() === formName.toLowerCase());
          const payload = {
            school: schoolId,
            name: formName,
            curriculum_grade: matchedGrade ? matchedGrade.id : null
          };
          const createClassRes = await apiClient.post('/api/organizations/classes/', payload);
          schoolClass = createClassRes.data;
        }
        classMap[formName] = schoolClass;
      }

      // 5. Ensure all streams exist in database
      const finalStreams = [];
      for (const formName of forms) {
        const schoolClass = classMap[formName];
        if (!schoolClass) continue;

        const streamNames = streamsMap[formName] || [];
        for (const sName of streamNames) {
          let streamObj = existingStreams.find(s => 
            s.school_class === schoolClass.id && s.name.toLowerCase() === sName.toLowerCase()
          );
          if (!streamObj) {
            const createStreamRes = await apiClient.post('/api/organizations/streams/', {
              school_class: schoolClass.id,
              name: sName
            });
            streamObj = createStreamRes.data;
          }
          finalStreams.push({
            ...streamObj,
            formName,
            streamName: sName
          });
        }
      }
      setDbStreams(finalStreams);

      // 6. Fetch subjects from curriculum
      const subRes = await apiClient.get('/api/curriculum/subjects/');
      const allDbSubjects = subRes.data?.results || subRes.data || [];
      setDbSubjects(allDbSubjects);

      // 7. Fetch existing assignments
      const assignmentsRes = await apiClient.get(`/api/organizations/teacher-assignments/?school_id=${schoolId}`);
      const assignments = assignmentsRes.data?.results || assignmentsRes.data || [];
      setDbAssignments(assignments);

      // 8. Build initial activeTeacherSubjects map from specialties and existing assignments
      const initialTeacherSubjs = {};
      eligibleTeachers.forEach(t => {
        const specs = typeof t.specialties === 'string'
          ? t.specialties.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(t.specialties) ? t.specialties : []);
        
        // Add subjects this teacher already teaches in DB
        const teacherAssignedSubjs = assignments
          .filter(a => a.teacher === t.id)
          .map(a => a.subject_name);
        
        const combined = Array.from(new Set([...specs, ...teacherAssignedSubjs]));
        initialTeacherSubjs[t.id] = combined.length > 0 ? combined : (subjects.length > 0 ? [subjects[0]] : []);
      });
      setActiveTeacherSubjects(initialTeacherSubjs);

      if (eligibleTeachers.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(eligibleTeachers[0].id);
      }

      // Sync wizardData format
      syncWizardState(finalStreams, assignments);

    } catch (err) {
      console.error('Failed to synchronize teaching setup structure:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      syncAcademicStructure();
    }
  }, [schoolId]);

  // Synchronize wizardData to keep parent and ReviewStep live
  const syncWizardState = (streams = dbStreams, assignments = dbAssignments) => {
    const byTeacher = {};
    const assignmentsList = [];
    const classTeachers = {};

    streams.forEach(st => {
      if (st.class_teacher) {
        const ctObj = eligibleTeachers.find(t => t.id === st.class_teacher);
        classTeachers[st.id] = {
          streamId: st.id,
          formName: st.formName,
          streamName: st.streamName || st.name,
          teacherId: st.class_teacher,
          teacherName: ctObj?.name || 'Class Teacher'
        };
      }
    });

    assignments.forEach(ass => {
      const tId = ass.teacher;
      const tObj = eligibleTeachers.find(t => t.id === tId);
      const stObj = streams.find(s => s.id === ass.stream);

      if (!byTeacher[tId]) {
        byTeacher[tId] = {
          teacherName: tObj?.name || 'Teacher',
          subjects: {}
        };
      }
      if (!byTeacher[tId].subjects[ass.subject_name]) {
        byTeacher[tId].subjects[ass.subject_name] = [];
      }
      const streamDisplayName = stObj ? `${stObj.formName} ${stObj.streamName || stObj.name}` : `Stream #${ass.stream}`;
      if (!byTeacher[tId].subjects[ass.subject_name].includes(streamDisplayName)) {
        byTeacher[tId].subjects[ass.subject_name].push(streamDisplayName);
      }

      assignmentsList.push({
        id: ass.id,
        teacherId: tId,
        teacherName: tObj?.name || 'Teacher',
        subjectName: ass.subject_name,
        streamId: ass.stream,
        streamName: stObj?.streamName || stObj?.name || '',
        formName: stObj?.formName || ''
      });
    });

    updateData({
      byTeacher,
      assignmentsList,
      classTeachers
    });
  };

  // Helper to find DB subject
  const findDbSubject = (subjectName, streamObj) => {
    const classObj = dbStreams.find(s => s.id === streamObj?.id);
    const gradeId = classObj?.curriculum_grade;

    let sub = dbSubjects.find(s => 
      s.name.toLowerCase() === subjectName.toLowerCase() && (!gradeId || s.grade === gradeId)
    );
    if (!sub) {
      sub = dbSubjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
    }
    return sub;
  };

  // Toggle Stream assignment for a specific Teacher and Subject
  const handleToggleStreamAssignment = async (teacherId, subjectName, streamObj) => {
    if (!teacherId || !academicYearId) return;

    const subjectObj = findDbSubject(subjectName, streamObj);
    if (!subjectObj) {
      alert(`Subject "${subjectName}" not found in curriculum.`);
      return;
    }

    const existingAss = dbAssignments.find(a => 
      a.teacher === teacherId && a.stream === streamObj.id && a.subject === subjectObj.id
    );

    try {
      if (existingAss) {
        // Unassign
        await apiClient.post('/api/organizations/teacher-assignments/unassign-stream/', {
          assignment_id: existingAss.id
        });
        const updated = dbAssignments.filter(a => a.id !== existingAss.id);
        setDbAssignments(updated);
        syncWizardState(dbStreams, updated);
      } else {
        // Assign
        const res = await apiClient.post('/api/organizations/teacher-assignments/assign-stream/', {
          teacher: teacherId,
          stream: streamObj.id,
          subject: subjectObj.id,
          academic_year: academicYearId
        });
        const newAss = {
          ...res.data,
          subject_name: subjectName,
          stream: streamObj.id,
          teacher: teacherId
        };
        const updated = [...dbAssignments, newAss];
        setDbAssignments(updated);
        syncWizardState(dbStreams, updated);
      }
    } catch (err) {
      console.error('Failed to update stream assignment:', err);
      alert(err.response?.data?.detail || 'Failed to update teaching setup.');
    }
  };

  // Toggle Subject for active teacher
  const handleToggleTeacherSubject = (teacherId, subjectName) => {
    setActiveTeacherSubjects(prev => {
      const current = prev[teacherId] || [];
      const isSelected = current.includes(subjectName);
      const next = isSelected 
        ? current.filter(s => s !== subjectName)
        : [...current, subjectName];
      return { ...prev, [teacherId]: next };
    });
  };

  // Class Teacher assignment
  const handleClassTeacherChange = async (streamId, teacherId) => {
    try {
      const parsedTeacherId = teacherId ? parseInt(teacherId) : null;
      await apiClient.patch(`/api/organizations/streams/${streamId}/`, {
        class_teacher: parsedTeacherId
      });
      const updatedStreams = dbStreams.map(s => s.id === streamId ? { ...s, class_teacher: parsedTeacherId } : s);
      setDbStreams(updatedStreams);
      syncWizardState(updatedStreams, dbAssignments);
    } catch (err) {
      console.error('Failed to update class teacher:', err);
      alert('Failed to save class teacher assignment.');
    }
  };

  const hasStreams = formsList.length > 0 && 
                     formsList.some(form => (streamsMap[form] || []).length > 0);

  if (isSyncing) {
    return (
      <div className="space-y-6 text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Synchronizing teaching setup with academic structure...</p>
      </div>
    );
  }

  if (!hasStreams || subjects.length === 0 || eligibleTeachers.length === 0) {
    return (
      <div className="space-y-6 text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8">
        <Users className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold font-heading text-navy">Teaching Setup</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please ensure you have configured subjects (Step 2), added teachers (Step 3), and created forms & streams (Step 4) to set up teaching responsibilities.
        </p>
      </div>
    );
  }

  const activeTeacher = eligibleTeachers.find(t => t.id === selectedTeacherId) || eligibleTeachers[0];
  const teacherSubjs = activeTeacherSubjects[activeTeacher?.id] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black font-heading text-navy">Teaching Setup</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Choose the subjects each teacher teaches and the classes or streams they teach them in.
          </p>
        </div>

        {/* View Toggle: By Teacher vs By Stream */}
        <div className="flex bg-slate-100 rounded-xl p-1 text-xs font-bold shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('by_teacher')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'by_teacher' ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-navy'
            }`}
          >
            By Teacher ({eligibleTeachers.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('by_stream')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'by_stream' ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-navy'
            }`}
          >
            By Stream ({dbStreams.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: BY TEACHER (Teacher -> Subject -> Stream) */}
      {viewMode === 'by_teacher' && (
        <div className="space-y-6">
          {/* Teacher Selector Pills */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
              Select Teacher
            </label>
            <div className="flex flex-wrap gap-2">
              {eligibleTeachers.map(t => {
                const isSelected = (activeTeacher?.id === t.id);
                const assignedCount = dbAssignments.filter(a => a.teacher === t.id).length;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTeacherId(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                        : 'border-slate-200 bg-white text-navy hover:border-slate-300'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {assignedCount} {assignedCount === 1 ? 'class' : 'classes'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Teacher Card */}
          {activeTeacher && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Teacher Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-navy">{activeTeacher.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {activeTeacher.phone} {activeTeacher.email ? `• ${activeTeacher.email}` : ''}
                  </p>
                </div>
                {activeTeacher.specialties && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400">Specialties:</span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      {activeTeacher.specialties}
                    </span>
                  </div>
                )}
              </div>

              {/* 1. Subjects Taught by this Teacher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Subjects Taught by {activeTeacher.name}
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Click to add/remove subjects
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(subj => {
                    const isChecked = teacherSubjs.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => handleToggleTeacherSubject(activeTeacher.id, subj)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                          isChecked ? 'bg-primary text-white' : 'border border-slate-300'
                        }`}>
                          {isChecked && <Check size={10} strokeWidth={3} className="text-white" />}
                        </div>
                        <span>{subj}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Streams Assigned per Subject */}
              <div className="space-y-6 pt-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  Assign Streams / Classes for Each Subject
                </label>

                {teacherSubjs.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-500">
                      No subjects selected for {activeTeacher.name}. Select subjects above to assign classes.
                    </p>
                  </div>
                ) : (
                  teacherSubjs.map(subj => (
                    <div key={subj} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <h4 className="font-black text-navy text-sm">{subj}</h4>
                      </div>

                      {/* Grouped Streams Checkbox Grid */}
                      <div className="space-y-3 pt-1">
                        {formsList.map(formName => {
                          const formStreams = dbStreams.filter(s => s.formName === formName);
                          if (formStreams.length === 0) return null;

                          return (
                            <div key={formName} className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {formName}
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {formStreams.map(st => {
                                  const subjectObj = findDbSubject(subj, st);
                                  const isAssigned = subjectObj && dbAssignments.some(a => 
                                    a.teacher === activeTeacher.id && a.stream === st.id && a.subject === subjectObj.id
                                  );

                                  return (
                                    <button
                                      key={st.id}
                                      type="button"
                                      onClick={() => handleToggleStreamAssignment(activeTeacher.id, subj, st)}
                                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                                        isAssigned
                                          ? 'border-primary bg-white text-primary shadow-xs ring-1 ring-primary/20'
                                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                        isAssigned ? 'bg-primary text-white' : 'border border-slate-300'
                                      }`}>
                                        {isAssigned && <Check size={11} strokeWidth={3} className="text-white" />}
                                      </div>
                                      <span className="truncate">{st.formName} {st.streamName || st.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. Dedicated Class Teacher (Stream Supervisor) Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-navy uppercase tracking-wider">
                Class Teachers (Stream Supervisors)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Designate the supervising Class Teacher responsible for each stream's student roster and performance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dbStreams.map(st => (
                <div key={st.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-navy font-heading">
                      {st.formName} {st.streamName || st.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      Class Teacher
                    </span>
                  </div>
                  <select
                    value={st.class_teacher || ''}
                    onChange={(e) => handleClassTeacherChange(st.id, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-navy focus:border-primary focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">-- Assign Class Teacher --</option>
                    {eligibleTeachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BY STREAM (Stream -> Subject Teachers & Class Teacher) */}
      {viewMode === 'by_stream' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <select 
              className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-navy focus:border-primary bg-white cursor-pointer"
              value={selectedForm}
              onChange={(e) => {
                setSelectedForm(e.target.value);
                setSelectedStream(streamsMap[e.target.value]?.[0] || '');
              }}
            >
              {formsList.map(form => (
                <option key={form} value={form}>{form}</option>
              ))}
            </select>
            
            <select 
              className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-navy focus:border-primary bg-white cursor-pointer"
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              disabled={!(streamsMap[selectedForm] || []).length}
            >
              {(streamsMap[selectedForm] || []).map(stream => (
                <option key={stream} value={stream}>{stream}</option>
              ))}
            </select>
          </div>

          {selectedStream && (() => {
            const currentStreamObj = dbStreams.find(s => s.formName === selectedForm && (s.streamName === selectedStream || s.name === selectedStream));
            if (!currentStreamObj) return null;

            return (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
                {/* Class Teacher Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="text-sm font-black text-navy">
                      {selectedForm} {selectedStream} — Class Teacher
                    </h4>
                    <p className="text-xs text-slate-500">Supervises student roster and academic progress.</p>
                  </div>
                  <select 
                    className="sm:w-64 rounded-xl border border-slate-200 p-2 text-xs font-bold text-navy focus:border-primary bg-white cursor-pointer"
                    value={currentStreamObj.class_teacher || ''}
                    onChange={(e) => handleClassTeacherChange(currentStreamObj.id, e.target.value)}
                  >
                    <option value="">-- Assign Class Teacher --</option>
                    {eligibleTeachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Teachers Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left w-1/3">Subject</th>
                        <th className="px-4 py-3 text-left">Assigned Subject Teacher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map(subj => {
                        const subjectObj = findDbSubject(subj, currentStreamObj);
                        const ass = subjectObj && dbAssignments.find(a => 
                          a.stream === currentStreamObj.id && a.subject === subjectObj.id
                        );
                        const assignedTeacherId = ass ? ass.teacher : '';

                        return (
                          <tr key={subj} className="hover:bg-slate-50/60">
                            <td className="px-4 py-3 font-bold text-navy">{subj}</td>
                            <td className="px-4 py-3">
                              <select 
                                className="w-full max-w-sm rounded-lg border border-slate-200 p-2 text-xs font-bold text-navy focus:border-primary bg-white cursor-pointer"
                                value={assignedTeacherId}
                                onChange={async (e) => {
                                  const nextTId = e.target.value ? parseInt(e.target.value) : null;
                                  if (assignedTeacherId) {
                                    await handleToggleStreamAssignment(assignedTeacherId, subj, currentStreamObj);
                                  }
                                  if (nextTId) {
                                    await handleToggleStreamAssignment(nextTId, subj, currentStreamObj);
                                  }
                                }}
                              >
                                <option value="">-- Unassigned --</option>
                                {eligibleTeachers.map(t => {
                                  const isSpecialist = t.specialties && t.specialties.toLowerCase().includes(subj.toLowerCase());
                                  return (
                                    <option key={t.id} value={t.id}>
                                      {t.name} {isSpecialist ? '(Specialist)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentsStep;

