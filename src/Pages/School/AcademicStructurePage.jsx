import React, { useState } from 'react';
import { Layers, Plus, Trash2, ChevronDown, ChevronRight, X, Calendar, BookOpen } from 'lucide-react';
import { useSchoolContext } from '../../Context/SchoolContext';
import PageHeader from '../../Components/School/PageHeader';
import schoolAdminService from '../../services/schoolAdminService';

export function AcademicStructurePage() {
  const {
    school,
    activeAcademicYear,
    academicYears,
    classes,
    streams,
    grades,
    teachers,
    refreshData,
    isLoading,
  } = useSchoolContext();

  const [expandedClasses, setExpandedClasses] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');

  const [selectedClassForStream, setSelectedClassForStream] = useState('');
  const [newStreamName, setNewStreamName] = useState('');
  const [selectedClassTeacherId, setSelectedClassTeacherId] = useState('');

  const [newYearName, setNewYearName] = useState('');
  const [isYearCurrent, setIsYearCurrent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleClassExpand = (classId) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [classId]: prev[classId] === undefined ? false : !prev[classId],
    }));
  };

  // Create Class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName || !selectedGradeId) {
      setStatusMessage({ type: 'error', text: 'Class name and curriculum grade are required.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await schoolAdminService.createClass(school.id, {
        name: newClassName,
        code: newClassCode || newClassName.toUpperCase().replace(/\s+/g, '-'),
        curriculum_grade: parseInt(selectedGradeId),
      });

      setStatusMessage({ type: 'success', text: `Class "${newClassName}" created successfully!` });
      setNewClassName('');
      setNewClassCode('');
      setSelectedGradeId('');
      setIsClassModalOpen(false);
      await refreshData();
    } catch (err) {
      const detail = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to create class.';
      setStatusMessage({ type: 'error', text: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Class
  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`Delete "${className}"? All associated streams will also be removed.`)) return;
    try {
      await schoolAdminService.deleteClass(classId);
      setStatusMessage({ type: 'success', text: `Class "${className}" deleted.` });
      await refreshData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to delete class.' });
    }
  };

  // Create Stream
  const handleCreateStream = async (e) => {
    e.preventDefault();
    if (!selectedClassForStream || !newStreamName) {
      setStatusMessage({ type: 'error', text: 'Class and Stream name are required.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await schoolAdminService.createStream({
        school_class: parseInt(selectedClassForStream),
        name: newStreamName,
        class_teacher: selectedClassTeacherId ? parseInt(selectedClassTeacherId) : null,
      });

      setStatusMessage({ type: 'success', text: `Stream "${newStreamName}" created successfully!` });
      setNewStreamName('');
      setSelectedClassForStream('');
      setSelectedClassTeacherId('');
      setIsStreamModalOpen(false);
      await refreshData();
    } catch (err) {
      const detail = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to create stream.';
      setStatusMessage({ type: 'error', text: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Stream
  const handleDeleteStream = async (streamId, streamName) => {
    if (!window.confirm(`Delete stream "${streamName}"?`)) return;
    try {
      await schoolAdminService.deleteStream(streamId);
      setStatusMessage({ type: 'success', text: `Stream "${streamName}" deleted.` });
      await refreshData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to delete stream.' });
    }
  };

  // Create Academic Year
  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!newYearName) {
      setStatusMessage({ type: 'error', text: 'Academic year name is required.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await schoolAdminService.createAcademicYear(school.id, {
        name: newYearName,
        is_current: isYearCurrent,
      });

      setStatusMessage({ type: 'success', text: `Academic Year "${newYearName}" created!` });
      setNewYearName('');
      setIsYearCurrent(false);
      setIsYearModalOpen(false);
      await refreshData();
    } catch (err) {
      const detail = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to create academic year.';
      setStatusMessage({ type: 'error', text: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Academic Structure"
        subtitle="Manage academic years, classes, and stream hierarchies"
        actions={
          <>
            <button
              onClick={() => setIsYearModalOpen(true)}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> Add Year
            </button>

            <button
              onClick={() => setIsClassModalOpen(true)}
              className="bg-gray-900 text-white hover:bg-black px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Class
            </button>

            <button
              onClick={() => setIsStreamModalOpen(true)}
              className="bg-custom-blue text-white hover:bg-blue-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Stream
            </button>
          </>
        }
      />

      {/* Alert Status Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Academic Year Banner */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {activeAcademicYear?.name || activeAcademicYear?.year || 'Active Academic Year'}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Current active period for school class and stream configurations
            </p>
          </div>
        </div>

        <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
          Active Period
        </span>
      </div>

      {/* Hierarchical Structure View (Year → Class → Stream) */}
      <section className="space-y-4">
        <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
          Class & Stream Hierarchy
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 text-sm">
            No classes created yet. Click "Create Class" above to configure your school structure.
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((cls) => {
              const classStreams = streams.filter((s) => s.school_class === cls.id);
              const isCollapsed = expandedClasses[cls.id] === false;

              return (
                <div
                  key={cls.id}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm transition-all"
                >
                  {/* Class Header Row */}
                  <div className="p-5 flex items-center justify-between bg-white hover:bg-gray-50/50 transition-colors">
                    <div
                      onClick={() => toggleClassExpand(cls.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <button className="text-gray-400 p-1">
                        {isCollapsed ? (
                          <ChevronRight className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <div className="p-2.5 bg-blue-50 text-custom-blue rounded-xl">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                          {cls.name}
                          {cls.code && (
                            <span className="text-xs text-gray-400 font-mono font-normal">
                              ({cls.code})
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {classStreams.length} {classStreams.length === 1 ? 'Stream' : 'Streams'}
                          {cls.curriculum_grade_name ? ` • ${cls.curriculum_grade_name}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedClassForStream(cls.id);
                          setIsStreamModalOpen(true);
                        }}
                        className="text-xs font-bold text-custom-blue hover:underline px-3 py-1 rounded-xl bg-blue-50 border border-blue-100"
                      >
                        + Add Stream
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="text-gray-400 hover:text-red-600 p-1.5 transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Streams List (Expanded) */}
                  {!isCollapsed && (
                    <div className="bg-gray-50/60 p-4 pt-2 border-t border-gray-100 space-y-2">
                      {classStreams.length === 0 ? (
                        <p className="text-xs text-gray-400 italic pl-12 py-2">
                          No streams in this class yet.
                        </p>
                      ) : (
                        classStreams.map((st) => (
                          <div
                            key={st.id}
                            className="ml-10 bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <Layers className="w-4 h-4 text-custom-blue" />
                              <span className="font-bold text-sm text-gray-900">{st.name}</span>
                              {st.class_teacher_detail && (
                                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-0.5 rounded-full">
                                  Teacher: {st.class_teacher_detail.first_name || st.class_teacher_detail.email}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteStream(st.id, st.name)}
                              className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                              title="Delete Stream"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal: Create Class */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg">Create New Class</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. Form 4, Grade 10"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Class Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. F4, G10"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Curriculum Grade Level</label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                >
                  <option value="">-- Select Curriculum Grade --</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.level_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-custom-blue text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Stream */}
      {isStreamModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg">Create New Stream</h3>
              <button onClick={() => setIsStreamModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStream} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parent Class</label>
                <select
                  value={selectedClassForStream}
                  onChange={(e) => setSelectedClassForStream(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.curriculum_grade_name || 'Grade'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stream Name</label>
                <input
                  type="text"
                  placeholder="e.g. North, South, East, West"
                  value={newStreamName}
                  onChange={(e) => setNewStreamName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Class Teacher (Optional)</label>
                <select
                  value={selectedClassTeacherId}
                  onChange={(e) => setSelectedClassTeacherId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                >
                  <option value="">-- Select Class Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.user} value={t.user}>
                      {t.user_detail?.first_name ? `${t.user_detail.first_name} ${t.user_detail.last_name || ''}` : t.user_detail?.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStreamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-custom-blue text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Stream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Academic Year */}
      {isYearModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg">Add Academic Year</h3>
              <button onClick={() => setIsYearModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateYear} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Academic Year Name</label>
                <input
                  type="text"
                  placeholder="e.g. 2025 Academic Year"
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrentYear"
                  checked={isYearCurrent}
                  onChange={(e) => setIsYearCurrent(e.target.checked)}
                  className="rounded text-custom-blue focus:ring-custom-blue"
                />
                <label htmlFor="isCurrentYear" className="text-xs font-semibold text-gray-700">
                  Set as active academic year
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsYearModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-custom-blue text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademicStructurePage;
