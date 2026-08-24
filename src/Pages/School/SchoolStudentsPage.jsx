import React, { useState } from 'react';
import { UserPlus, Search, X, Upload, Download, FileText, CheckCircle2 } from 'lucide-react';
import { useSchoolContext } from '../../Context/SchoolContext';
import PageHeader from '../../Components/School/PageHeader';
import schoolAdminService from '../../services/schoolAdminService';
import BASE_URL from '../../config';

export function SchoolStudentsPage() {
  const {
    school,
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
  const [enrollmentMode, setEnrollmentMode] = useState('excel'); // 'excel' | 'single'

  // Single Student Form
  const [singleName, setSingleName] = useState('');
  const [singleAdmNo, setSingleAdmNo] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [singleEmail, setSingleEmail] = useState('');

  // Bulk File Upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnrollStudents = async (e) => {
    e.preventDefault();
    if (!enrollStreamId) {
      setStatusMessage({ type: 'error', text: 'Target stream selection is required.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setUploadStats(null);

    try {
      if (enrollmentMode === 'excel') {
        if (!selectedFile) {
          setStatusMessage({ type: 'error', text: 'Please select an Excel or CSV file to upload.' });
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('stream', enrollStreamId);
        formData.append('file', selectedFile);

        const response = await schoolAdminService.bulkUploadStudents(formData);
        const createdCount = response.created?.length || 0;
        const errorsCount = response.errors?.length || 0;

        if (createdCount > 0) {
          setStatusMessage({
            type: 'success',
            text: `Successfully imported ${createdCount} student(s)!${errorsCount > 0 ? ` (${errorsCount} row errors encountered)` : ''}`,
          });
          setSelectedFile(null);
          setIsEnrollModalOpen(false);
          await refreshData();
        } else {
          setStatusMessage({
            type: 'error',
            text: `Import failed: ${response.errors?.[0]?.error || 'No valid student rows found in file.'}`,
          });
        }
      } else {
        // Single student registration
        if (!singleName.trim() || !singleAdmNo.trim()) {
          setStatusMessage({ type: 'error', text: 'Student name and admission number are required.' });
          setIsSubmitting(false);
          return;
        }

        const response = await schoolAdminService.batchEnrollStudents({
          stream_id: parseInt(enrollStreamId),
          academic_year_id: activeAcademicYear?.id,
          student_name: singleName.trim(),
          admission_number: singleAdmNo.trim(),
          phone_number: singlePhone.trim() || null,
          student_emails: singleEmail.trim() ? [singleEmail.trim()] : [],
          student_ids: [],
        });

        setStatusMessage({
          type: 'success',
          text: `Successfully enrolled ${singleName.trim()} (${singleAdmNo.trim()})!`,
        });

        setSingleName('');
        setSingleAdmNo('');
        setSinglePhone('');
        setSingleEmail('');
        setIsEnrollModalOpen(false);
        await refreshData();
      }
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
    const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.username || '';
    const admNo = student.admission_number || '';
    const email = student.email || '';
    const q = searchQuery.toLowerCase();

    const matchesQuery =
      name.toLowerCase().includes(q) ||
      admNo.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      (e.stream_name || '').toLowerCase().includes(q);
    const matchesStream = selectedStreamFilter ? e.stream === parseInt(selectedStreamFilter) : true;

    return matchesQuery && matchesStream;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <PageHeader
        title="Students"
        subtitle="Manage student enrollments, admission numbers, and stream placements"
        actions={
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="bg-primary text-white hover:bg-primary-dark px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Enroll Students
          </button>
        }
      />

      {/* Alert Status Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Student Roster Table */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold font-heading text-navy">
              Enrolled Students ({filteredEnrollments.length})
            </h2>
            <p className="text-xs text-slate-400">Identified by admission number unique to this school</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Filter by Stream */}
            <select
              value={selectedStreamFilter}
              onChange={(e) => setSelectedStreamFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="">All Streams</option>
              {streams.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.class_name || 'Class'} — {s.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, adm no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading student enrollments...</div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">No enrolled students found. Click "Enroll Students" to add students.</div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Adm No.</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Stream</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredEnrollments.map((e) => {
                    const student = e.student_detail || {};
                    const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.username || 'Student';
                    const admNo = student.admission_number || e.admission_number || '—';
                    const contact = student.phone_number || student.email || '—';

                    return (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs font-heading shrink-0">
                              {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="font-bold text-navy">{name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">{admNo}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{e.class_name || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-primary bg-primary-light px-2.5 py-0.5 rounded-md border border-primary/20">
                            {e.stream_name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{contact}</td>
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
                const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.username || 'Student';
                const admNo = student.admission_number || e.admission_number || '—';

                return (
                  <div key={e.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-navy text-sm">{name}</p>
                        <p className="text-slate-500 font-mono text-xs">Adm: {admNo}</p>
                      </div>
                      <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {e.status || 'active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-semibold">{e.class_name || 'N/A'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-primary bg-primary-light px-2 py-0.5 rounded border border-primary/20">
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
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold font-heading text-navy text-lg">Enroll Students</h3>
                <p className="text-xs text-slate-500">Add individual students or import a batch roster</p>
              </div>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudents} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Stream *</label>
                <select
                  value={enrollStreamId}
                  onChange={(e) => setEnrollStreamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
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
              <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEnrollmentMode('excel')}
                  className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    enrollmentMode === 'excel'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-navy'
                  }`}
                >
                  <Upload size={14} /> Batch Excel / CSV
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollmentMode('single')}
                  className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    enrollmentMode === 'single'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-navy'
                  }`}
                >
                  <UserPlus size={14} /> Add Individual Student
                </button>
              </div>

              {enrollmentMode === 'excel' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-600">
                      Upload Roster File (.xlsx or .csv)
                    </label>
                    <a
                      href={`${BASE_URL}/api/organizations/download-template/?type=student`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <Download size={13} /> Download Template
                    </a>
                  </div>

                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-xs font-semibold text-success mt-2 flex items-center justify-center gap-1">
                        <CheckCircle2 size={13} /> Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Template columns: <code>Student Name</code> and <code>Admission Number</code>.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Samuel Mutiso"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Admission Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. ADM-3048"
                      value={singleAdmNo}
                      onChange={(e) => setSingleAdmNo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Phone (Optional)</label>
                    <input
                      type="text"
                      placeholder="07XX XXX XXX"
                      value={singlePhone}
                      onChange={(e) => setSinglePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="optional@example.com"
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Enrolling...' : enrollmentMode === 'excel' ? 'Upload & Enroll' : 'Save Student'}
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
