import React, { useState, useEffect } from 'react';
import { Card } from '../../../Components/ui';
import { AlertTriangle, Loader2 } from 'lucide-react';
import apiClient from '../../../config/apiClient';

const TeacherAssignmentsStep = ({ data = {}, schoolId, updateData, subjects = [], teachers = [], formsAndStreams = {} }) => {
  const formsList = formsAndStreams.forms || Object.keys(formsAndStreams.streams || formsAndStreams);
  const streamsMap = formsAndStreams.streams || formsAndStreams;

  const [selectedForm, setSelectedForm] = useState(formsList[0] || '');
  const [selectedStream, setSelectedStream] = useState(
    streamsMap[formsList[0]]?.[0] || ''
  );

  const [dbStreams, setDbStreams] = useState([]);
  const [dbSubjects, setDbSubjects] = useState([]);
  const [academicYearId, setAcademicYearId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleFormChange = (form) => {
    setSelectedForm(form);
    setSelectedStream(streamsMap[form]?.[0] || '');
  };

  const streamKey = `${selectedForm}-${selectedStream}`;
  const currentAssignments = data[streamKey] || { classTeacher: '', subjects: {} };

  // Filter teachers to only those who have been persisted in DB (have IDs)
  const eligibleTeachers = teachers.filter(t => t.id);

  // Sync classes, streams, academic year, and load existing assignments on mount
  const syncAcademicStructure = async () => {
    if (!schoolId) return;
    setIsSyncing(true);
    try {
      // 1. Get or create Academic Year
      const yearRes = await apiClient.get(`/api/organizations/academic-years/?school=${schoolId}`);
      let years = yearRes.data?.results || yearRes.data || [];
      let activeYear = years.find(y => y.is_current);
      if (!activeYear && years.length > 0) {
        activeYear = years[0];
      }
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

      // 3. Fetch existing SchoolClasses
      const classRes = await apiClient.get(`/api/organizations/classes/?school=${schoolId}`);
      const existingClasses = classRes.data?.results || classRes.data || [];

      // 4. Fetch existing Streams
      const streamRes = await apiClient.get(`/api/organizations/streams/?school=${schoolId}`);
      const existingStreams = streamRes.data?.results || streamRes.data || [];

      // 5. Ensure all forms defined in wizardData exist in the database
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

      // 6. Ensure all streams defined in wizardData exist in the database
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

      // 7. Fetch all subjects from database to map names to database IDs
      const subRes = await apiClient.get('/api/curriculum/subjects/');
      const allDbSubjects = subRes.data?.results || subRes.data || [];
      setDbSubjects(allDbSubjects);

      // 8. Fetch existing Assignments from database
      const assignmentsRes = await apiClient.get(`/api/organizations/teacher-assignments/?school_id=${schoolId}`);
      const dbAssignments = assignmentsRes.data?.results || assignmentsRes.data || [];

      // 9. Load assignments into wizardData/UI format
      const loadedData = {};
      for (const fStream of finalStreams) {
        const key = `${fStream.formName}-${fStream.streamName}`;
        const classTeacher = fStream.class_teacher || '';
        const streamAssignments = dbAssignments.filter(a => a.stream === fStream.id);
        const subjectsMap = {};
        for (const ass of streamAssignments) {
          subjectsMap[ass.subject_name] = ass.teacher;
        }
        
        loadedData[key] = {
          classTeacher,
          subjects: subjectsMap
        };
      }
      updateData(loadedData);

    } catch (err) {
      console.error('Failed to synchronize school academic structure:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      syncAcademicStructure();
    }
  }, [schoolId]);

  const handleClassTeacherChange = async (teacherId) => {
    const currentStreamObj = dbStreams.find(s => s.formName === selectedForm && s.name === selectedStream);
    if (!currentStreamObj) return;

    try {
      const parsedTeacherId = teacherId ? parseInt(teacherId) : null;
      await apiClient.patch(`/api/organizations/streams/${currentStreamObj.id}/`, {
        class_teacher: parsedTeacherId
      });
      
      updateData({
        ...data,
        [streamKey]: { ...currentAssignments, classTeacher: parsedTeacherId || '' }
      });
      
      setDbStreams(prev => prev.map(s => s.id === currentStreamObj.id ? { ...s, class_teacher: parsedTeacherId } : s));
    } catch (err) {
      console.error('Failed to assign class teacher:', err);
      alert('Failed to save class teacher assignment.');
    }
  };

  const handleSubjectTeacherChange = async (subjectName, teacherId) => {
    const currentStreamObj = dbStreams.find(s => s.formName === selectedForm && s.name === selectedStream);
    if (!currentStreamObj) return;

    // Find class's curriculum grade
    const classRes = await apiClient.get(`/api/organizations/classes/?school=${schoolId}`);
    const classes = classRes.data?.results || classRes.data || [];
    const schoolClassObj = classes.find(c => c.id === currentStreamObj.school_class);
    const gradeId = schoolClassObj ? schoolClassObj.curriculum_grade : null;

    // Find subject ID
    let subjectObj = dbSubjects.find(sub => 
      sub.name.toLowerCase() === subjectName.toLowerCase() && sub.grade === gradeId
    );
    if (!subjectObj) {
      subjectObj = dbSubjects.find(sub => sub.name.toLowerCase() === subjectName.toLowerCase());
    }
    if (!subjectObj) {
      alert(`Subject "${subjectName}" not found in database curriculum.`);
      return;
    }

    try {
      // 1. Delete existing assignment for this stream and subject
      const existingAssRes = await apiClient.get(
        `/api/organizations/teacher-assignments/?stream_id=${currentStreamObj.id}&subject_id=${subjectObj.id}`
      );
      const existingAssignments = existingAssRes.data?.results || existingAssRes.data || [];
      for (const ass of existingAssignments) {
        await apiClient.delete(`/api/organizations/teacher-assignments/${ass.id}/`);
      }

      // 2. Create the new assignment if teacherId is provided
      if (teacherId) {
        const parsedTeacherId = parseInt(teacherId);
        await apiClient.post('/api/organizations/teacher-assignments/assign-stream/', {
          teacher: parsedTeacherId,
          stream: currentStreamObj.id,
          subject: subjectObj.id,
          academic_year: academicYearId
        });
      }

      updateData({
        ...data,
        [streamKey]: {
          ...currentAssignments,
          subjects: {
            ...currentAssignments.subjects,
            [subjectName]: teacherId ? parseInt(teacherId) : ''
          }
        }
      });
    } catch (err) {
      console.error('Failed to assign subject teacher:', err);
      alert('Failed to save subject teacher assignment.');
    }
  };

  const hasStreams = formsList.length > 0 && 
                     formsList.some(form => (streamsMap[form] || []).length > 0);

  if (isSyncing) {
    return (
      <div className="space-y-6 text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Synchronizing school academic structure...</p>
      </div>
    );
  }

  if (!hasStreams || subjects.length === 0 || eligibleTeachers.length === 0) {
    return (
      <div className="space-y-6 text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8">
        <h2 className="text-xl font-bold font-heading text-navy">Teacher Assignments</h2>
        <p className="text-sm text-slate-500">You must add subjects (Step 2), teachers (Step 3), and streams (Step 4) before assigning teachers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-navy">Teacher Assignments</h2>
        <p className="text-sm text-slate-500 mt-1">Assign subject teachers and class teachers to each stream.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <select 
          className="rounded-xl border-slate-200 p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
          value={selectedForm}
          onChange={(e) => handleFormChange(e.target.value)}
        >
          {formsList.map(form => (
            <option key={form} value={form}>{form}</option>
          ))}
        </select>
        
        <select 
          className="rounded-xl border-slate-200 p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
          disabled={!(streamsMap[selectedForm] || []).length}
        >
          {(streamsMap[selectedForm] || []).map(stream => (
            <option key={stream} value={stream}>{stream}</option>
          ))}
        </select>
      </div>

      {selectedStream ? (
        <Card className="border-slate-200 p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between max-w-xl">
              <span className="font-semibold text-sm text-navy font-heading">Class Teacher</span>
              <select 
                className="w-64 rounded-lg border-slate-200 p-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                value={currentAssignments.classTeacher || ''}
                onChange={(e) => handleClassTeacherChange(e.target.value)}
              >
                <option value="">-- Select Class Teacher --</option>
                {eligibleTeachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 w-1/3">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subject) => {
                const assignedTeacherId = currentAssignments.subjects[subject] || '';
                const assignedTeacher = eligibleTeachers.find(t => t.id === parseInt(assignedTeacherId));
                const hasMismatch = assignedTeacher && !assignedTeacher.specialties.toLowerCase().includes(subject.toLowerCase());

                return (
                  <tr key={subject} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-navy">{subject}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-md space-y-2">
                        <select 
                          className="w-full rounded-lg border-slate-200 p-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                          value={assignedTeacherId}
                          onChange={(e) => handleSubjectTeacherChange(subject, e.target.value)}
                        >
                          <option value="">-- Assign Teacher --</option>
                          {eligibleTeachers.map(t => {
                            const isSpecialist = t.specialties.toLowerCase().includes(subject.toLowerCase());
                            return (
                              <option key={t.id} value={t.id}>
                                {t.name} {isSpecialist ? '(Specialist)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        
                        {hasMismatch && (
                          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-warning-light/30 border border-warning/20 text-xs text-warning-dark">
                            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                            <span>{subject} is not listed as {assignedTeacher.name}'s usual specialty.</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
};

export default TeacherAssignmentsStep;
