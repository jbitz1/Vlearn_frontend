import React, { useState } from 'react';
import { UserPlus, Search, X } from 'lucide-react';
import { useSchoolContext } from '../../Context/SchoolContext';
import PageHeader from '../../Components/School/PageHeader';
import schoolAdminService from '../../services/schoolAdminService';

export function SchoolStudentsPage() {
  const {
    activeAcademicYear,
    enrollments,
    streams,
    refreshData,
    isLoading,
  } = useSchoolContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStreamFilter, setSelectedStreamFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Enroll Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollStreamId, setEnrollStreamId] = useState('');
  const [batchEmailsText, setBatchEmailsText] = useState('');
  const [singleStudentEmail, setSingleStudentEmail] = useState('');
  const [enrollmentMode, setEnrollmentMode] = useState('batch');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnrollStudents = async (e) => {
    e.preventDefault();
    if (!enrollStreamId) {
      setStatusMessage({ type: 'error', text: 'Stream selection is required.' });
      return;
    }

    if (!activeAcademicYear?.id) {
      setStatusMessage({ type: 'error', text: 'An active Academic Year must be selected.' });
      return;
    }

    let emailsToEnroll = [];
    if (enrollmentMode === 'batch') {
      emailsToEnroll = batchEmailsText
        .split(/[\n,]+/)
        .map((e) => e.trim())
        .filter((e) => e.length > 0);
    } else {
      if (singleStudentEmail.trim()) {
        emailsToEnroll = [singleStudentEmail.trim()];
      }
    }

    if (emailsToEnroll.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please enter at least one valid student email.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await schoolAdminService.batchEnrollStudents({
        stream_id: parseInt(enrollStreamId),
        academic_year_id: activeAcademicYear.id,
        student_emails: emailsToEnroll,
        student_ids: [],
      });

      const count = Array.isArray(response) ? response.length : 1;
      setStatusMessage({
        type: 'success',
        text: `Successfully enrolled ${count} student(s) into stream!`,
      });

      setBatchEmailsText('');
      setSingleStudentEmail('');
      setEnrollStreamId('');
      setIsEnrollModalOpen(false);

      await refreshData();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to enroll students.';
      setStatusMessage({ type: 'error', text: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const student = e.student_detail || {};
    const name = `${student.first_name || ''} ${student.last_name || ''}`.trim();
    const email = student.email || '';
    const q = searchQuery.toLowerCase();

    const matchesQuery = email.toLowerCase().includes(q) || name.toLowerCase().includes(q) || (e.stream_name || '').toLowerCase().includes(q);
    const matchesStream = selectedStreamFilter ? e.stream === parseInt(selectedStreamFilter) : true;

    return matchesQuery && matchesStream;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Students"
        subtitle="Manage student enrollments and stream placements"
        actions={
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="bg-custom-blue text-white hover:bg-blue-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Enroll Students
          </button>
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

      {/* Student Roster Table */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-base font-bold text-gray-900">
            Enrolled Students ({filteredEnrollments.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Filter by Stream */}
            <select
              value={selectedStreamFilter}
              onChange={(e) => setSelectedStreamFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-custom-blue"
            >
              <option value="">All Streams</option>
              {streams.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.class_name || 'Class'} — {s.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search student or stream..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-custom-blue"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading student enrollments...</div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 italic">No enrolled students found.</div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase font-bold text-gray-400">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Stream</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
                  {filteredEnrollments.map((e) => {
                    const student = e.student_detail || {};
                    const name = student.first_name
                      ? `${student.first_name} ${student.last_name || ''}`
                      : student.username || 'Student';

                    return (
                      <tr key={e.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{name}</td>
                        <td className="py-3.5 px-4 text-gray-600">{student.email || 'N/A'}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-800">{e.class_name || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-custom-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            {e.stream_name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {e.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Stack View */}
            <div className="block md:hidden space-y-3">
              {filteredEnrollments.map((e) => {
                const student = e.student_detail || {};
                const name = student.first_name
                  ? `${student.first_name} ${student.last_name || ''}`
                  : student.username || 'Student';

                return (
                  <div key={e.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{name}</p>
                        <p className="text-gray-500 text-xs">{student.email || 'N/A'}</p>
                      </div>
                      <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {e.status || 'active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100 text-xs">
                      <span className="text-gray-500 font-semibold">{e.class_name || 'N/A'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="font-bold text-custom-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {e.stream_name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Modal: Enroll Students */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg">Enroll Students</h3>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudents} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Stream</label>
                <select
                  value={enrollStreamId}
                  onChange={(e) => setEnrollStreamId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                >
                  <option value="">-- Select Target Stream --</option>
                  {streams.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.class_name || 'Class'} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle */}
              <div className="flex border-b border-gray-200 gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEnrollmentMode('batch')}
                  className={`pb-2 border-b-2 transition-all ${
                    enrollmentMode === 'batch'
                      ? 'border-custom-blue text-custom-blue'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  Batch Email Import
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollmentMode('single')}
                  className={`pb-2 border-b-2 transition-all ${
                    enrollmentMode === 'single'
                      ? 'border-custom-blue text-custom-blue'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  Single Email
                </button>
              </div>

              {enrollmentMode === 'batch' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Student Emails (Comma or Newline Separated)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="student1@school.com&#10;student2@school.com"
                    value={batchEmailsText}
                    onChange={(e) => setBatchEmailsText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none font-mono"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Student Email Address</label>
                  <input
                    type="email"
                    placeholder="student@school.com"
                    value={singleStudentEmail}
                    onChange={(e) => setSingleStudentEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-custom-blue text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Enrolling...' : 'Enroll Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolStudentsPage;
