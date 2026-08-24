import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '../../../config/apiClient';
import FileUploader from '../../../Components/ui/FileUploader';

const DEFAULT_SUBJECT_LIST = [
  'Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics',
  'Geography', 'History & Government', 'Christian Religious Education',
  'Agriculture', 'Business Studies', 'Computer Studies'
];

const TeachersStep = ({ teachers = [], schoolId, subjects = [], updateData }) => {
  const teacherList = Array.isArray(teachers) ? teachers : [];
  const availableSubjectsList = subjects && subjects.length > 0 ? subjects : DEFAULT_SUBJECT_LIST;
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'import'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Sync / refresh teachers from the database
  const refreshTeachersFromBackend = async () => {
    if (!schoolId) return;
    setIsLoadingList(true);
    try {
      // 1. Fetch school memberships for teachers
      const memRes = await apiClient.get(`/api/organizations/memberships/?school_id=${schoolId}&role=teacher`);
      const memberships = memRes.data?.results || memRes.data || [];
      
      // 2. Fetch teacher specialties
      const specRes = await apiClient.get(`/api/organizations/teacher-specialties/?school_id=${schoolId}`);
      const specialties = specRes.data?.results || specRes.data || [];
      
      // 3. Map to wizardData format
      const formatted = memberships.map(m => {
        const u = m.user_detail || {};
        const matchedSpecs = specialties
          .filter(s => s.teacher === u.id)
          .map(s => s.subject_name)
          .join(', ');
          
        return {
          id: u.id,
          membership_id: m.id,
          name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username,
          phone: u.phone_number || '',
          email: u.email || '',
          tsc_number: u.tsc_number || '',
          specialties: matchedSpecs,
          has_platform_access: m.has_platform_access,
          invitation_status: m.invitation_status,
          state: m.state,
          isSaved: true
        };
      });
      
      updateData(formatted);
    } catch (err) {
      console.error('Failed to load teachers from backend:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Load registered teachers on mount
  useEffect(() => {
    if (schoolId) {
      refreshTeachersFromBackend();
    }
  }, [schoolId]);

  const handleTeacherChange = (index, field, value) => {
    const updated = [...teacherList];
    updated[index] = { ...updated[index], [field]: value };
    updateData(updated);
  };

  const handleAdd = () => {
    updateData([
      ...teacherList,
      { name: '', phone: '', email: '', tsc_number: '', specialties: '', isSaved: false }
    ]);
  };

  const handleSaveTeacher = async (index) => {
    const t = teacherList[index];
    if (!t.name || !t.phone) {
      alert('Teacher Name and Phone Number are required.');
      return;
    }
    try {
      await apiClient.post('/api/organizations/memberships/add-teacher/', {
        school_id: schoolId,
        name: t.name,
        phone: t.phone,
        email: t.email,
        tsc_number: t.tsc_number,
        specialties: t.specialties
      });
      await refreshTeachersFromBackend();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save teacher to roster.');
    }
  };

  const handleSendInvite = async (index) => {
    const t = teacherList[index];
    if (!t.membership_id) {
      alert('Please save the teacher to roster first.');
      return;
    }
    try {
      await apiClient.post(`/api/organizations/memberships/${t.membership_id}/send-invite/`);
      alert(`Invitation sent to ${t.phone}!`);
      await refreshTeachersFromBackend();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send invitation.');
    }
  };

  const handleRemove = async (index) => {
    const teacher = teacherList[index];
    if (teacher?.membership_id || teacher?.id) {
      try {
        const memId = teacher.membership_id;
        if (memId) {
          await apiClient.delete(`/api/organizations/memberships/${memId}/`);
        }
      } catch (err) {
        console.error('Failed to delete teacher membership from server', err);
      }
    }
    updateData(teacherList.filter((_, i) => i !== index));
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClient.get('/api/organizations/download-template/?type=teacher', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'teacher_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download template', err);
      alert('Failed to download Excel template. Please try again.');
    }
  };

  const handleFileSelect = async (file) => {
    if (!schoolId) {
      alert('School profile registration must be completed first.');
      return;
    }
    setIsUploading(true);
    setUploadError('');
    setUploadResults(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('school', schoolId);
    
    try {
      const res = await apiClient.post('/api/organizations/bulk-upload/teachers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadResults(res.data);
      // Automatically refresh the checklist from database
      await refreshTeachersFromBackend();
    } catch (err) {
      console.error('Excel upload failed', err);
      setUploadError(err.response?.data?.detail || 'Failed to upload and parse Excel roster.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold font-heading text-navy">School Teachers</h2>
          <p className="text-sm text-slate-500">Establish your teaching staff snapshot. Platform access can be enabled now or progressively later.</p>
        </div>
        
        {/* Manual vs Import Tabs */}
        <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTab === 'manual' ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Staff Roster ({teacherList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTab === 'import' ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Import Excel
          </button>
        </div>
      </div>

      {activeTab === 'manual' ? (
        <div className="space-y-4">
          {isLoadingList ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading teaching staff...</div>
          ) : teacherList.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <p className="text-sm font-medium text-slate-600 mb-1">No teachers added yet</p>
              <p className="text-xs text-slate-400 mb-4">Add your teaching staff individually or toggle to the Excel import tab.</p>
              <button 
                type="button"
                onClick={handleAdd} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold font-heading hover:bg-navy-700 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add First Teacher
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {teacherList.map((t, i) => (
                <div key={t.membership_id || t.id || i} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white relative group shadow-xs">
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 font-heading">
                        Teacher #{i + 1}
                      </span>
                      {t.has_platform_access ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                          Platform Access Active
                        </span>
                      ) : t.invitation_status === 'PENDING' ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                          Invitation Sent (Pending)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium">
                          Roster Added (Access Not Enabled)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!t.isSaved && (
                        <button
                          type="button"
                          onClick={() => handleSaveTeacher(i)}
                          className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark cursor-pointer transition-colors"
                        >
                          Save to Roster
                        </button>
                      )}
                      {t.isSaved && !t.has_platform_access && (
                        <button
                          type="button"
                          onClick={() => handleSendInvite(i)}
                          className="px-2.5 py-1 bg-blue-50 text-custom-blue hover:bg-blue-100 text-xs font-bold rounded-lg border border-blue-200 cursor-pointer transition-colors"
                        >
                          {t.invitation_status === 'PENDING' ? 'Re-send SMS Invite' : 'Enable Platform Access'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(i)}
                        className="text-xs text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Remove teacher"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Teacher Name *</label>
                      <input
                        value={t.name || ''}
                        onChange={e => handleTeacherChange(i, 'name', e.target.value)}
                        placeholder="Full name"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Phone Number *</label>
                      <input
                        value={t.phone || ''}
                        onChange={e => handleTeacherChange(i, 'phone', e.target.value)}
                        placeholder="07XX XXX XXX"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Email (Optional)</label>
                      <input
                        type="email"
                        value={t.email || ''}
                        onChange={e => handleTeacherChange(i, 'email', e.target.value)}
                        placeholder="teacher@school.com"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">TSC Number (Optional)</label>
                      <input
                        value={t.tsc_number || ''}
                        onChange={e => handleTeacherChange(i, 'tsc_number', e.target.value)}
                        placeholder="e.g. TSC123456"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary bg-white text-slate-800"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-600">Subject Specialties (Optional)</label>
                        <span className="text-[11px] text-slate-400">Select the subjects this teacher specializes in</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(() => {
                          const currentSpecs = typeof t.specialties === 'string'
                            ? t.specialties.split(',').map(s => s.trim()).filter(Boolean)
                            : (Array.isArray(t.specialties) ? t.specialties : []);

                          return availableSubjectsList.map(subjName => {
                            const isChecked = currentSpecs.some(s => s.toLowerCase() === subjName.toLowerCase());
                            return (
                              <button
                                key={subjName}
                                type="button"
                                onClick={() => {
                                  let next;
                                  if (isChecked) {
                                    next = currentSpecs.filter(s => s.toLowerCase() !== subjName.toLowerCase());
                                  } else {
                                    next = [...currentSpecs, subjName];
                                  }
                                  handleTeacherChange(i, 'specialties', next.join(', '));
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                  isChecked
                                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                                  isChecked ? 'bg-primary text-white' : 'border border-slate-300'
                                }`}>
                                  {isChecked && <CheckCircle2 size={11} strokeWidth={3} className="text-white" />}
                                </div>
                                <span>{subjName}</span>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-600 hover:border-primary hover:text-primary transition-colors cursor-pointer font-bold w-full justify-center sm:justify-start"
              >
                <Plus size={15} /> Add Another Teacher
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {/* Download Template Card */}
          <div className="flex items-center justify-between p-4 bg-primary-light border border-primary/20 rounded-xl">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-navy font-heading">Download Roster Template</h4>
              <p className="text-xs text-slate-500">Download the expected columns format before preparing your file.</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark cursor-pointer transition-colors"
            >
              <Download size={14} /> Template.xlsx
            </button>
          </div>

          {/* File Uploader */}
          {!isUploading && !uploadResults && (
            <FileUploader 
              onFileSelect={handleFileSelect}
              accept=".xlsx,.xls,.csv"
              label="Select Teacher Roster File"
              description="Supports Microsoft Excel (.xlsx, .xls) and CSV files."
            />
          )}

          {/* Uploading State */}
          {isUploading && (
            <div className="p-8 border border-slate-200 rounded-xl bg-white flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-600">Uploading and validating roster records...</p>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle size={15} />
                <span>Upload Failed</span>
              </div>
              <p>{uploadError}</p>
              <button
                type="button"
                onClick={() => setUploadError('')}
                className="text-primary hover:underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {/* Upload Results Summary */}
          {uploadResults && (
            <div className="space-y-4">
              {/* Overall alert */}
              <div className={`p-4 border rounded-xl text-xs space-y-2 ${
                uploadResults.errors?.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                <div className="flex items-center gap-2 font-bold font-heading">
                  {uploadResults.errors?.length > 0 ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  <span>Import Completed</span>
                </div>
                <p>
                  Successfully imported <strong>{uploadResults.created?.length || 0}</strong> teachers. 
                  {uploadResults.errors?.length > 0 && ` Found errors in ${uploadResults.errors.length} rows.`}
                </p>
              </div>

              {/* Row level errors */}
              {uploadResults.errors?.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 font-heading">
                    Row-Level Import Failures
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {uploadResults.errors.map((err, idx) => (
                      <div key={idx} className="p-3 flex items-start gap-2.5">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-mono text-[10px] font-bold">
                          Row {err.row}
                        </span>
                        <span className="text-slate-600">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear / upload again button */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadResults(null);
                    setUploadError('');
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Upload Another File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadResults(null);
                    setActiveTab('manual');
                  }}
                  className="px-4 py-2 bg-navy text-white hover:bg-navy-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  View Teacher List
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeachersStep;
