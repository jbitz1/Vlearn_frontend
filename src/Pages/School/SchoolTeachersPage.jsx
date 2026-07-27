import React, { useState } from 'react';
import { UserPlus, Search, Clock, Key, BookOpen, Layers, X, Plus } from 'lucide-react';
import { useSchoolContext } from '../../Context/SchoolContext';
import PageHeader from '../../Components/School/PageHeader';
import schoolAdminService from '../../services/schoolAdminService';

export function SchoolTeachersPage() {
  const {
    school,
    activeAcademicYear,
    teachers,
    pendingInvitations,
    classes,
    streams,
    subjects,
    teacherAssignments,
    refreshData,
    isLoading,
  } = useSchoolContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [invitedTokenInfo, setInvitedTokenInfo] = useState(null);

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [intendedClassId, setIntendedClassId] = useState('');
  const [intendedStreamId, setIntendedStreamId] = useState('');
  const [intendedSubjectId, setIntendedSubjectId] = useState('');

  // Assign Form
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignStreamId, setAssignStreamId] = useState('');
  const [assignSubjectId, setAssignSubjectId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invite Teacher
  const handleInviteTeacher = async (e) => {
    e.preventDefault();
    if (!inviteEmail) {
      setStatusMessage({ type: 'error', text: 'Email address is required.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setInvitedTokenInfo(null);

    try {
      const invData = await schoolAdminService.inviteTeacher({
        school_id: school.id,
        email: inviteEmail.trim(),
        role: 'teacher',
        intended_class_id: intendedClassId ? parseInt(intendedClassId) : null,
        intended_stream_id: intendedStreamId ? parseInt(intendedStreamId) : null,
        intended_subject_id: intendedSubjectId ? parseInt(intendedSubjectId) : null,
      });

      setStatusMessage({
        type: 'success',
        text: `Invitation created successfully for ${inviteEmail}!`,
      });

      if (invData.raw_token) {
        setInvitedTokenInfo({
          email: inviteEmail,
          raw_token: invData.raw_token,
        });
      }

      setInviteEmail('');
      setIntendedClassId('');
      setIntendedStreamId('');
      setIntendedSubjectId('');
      setIsInviteModalOpen(false);

      await refreshData();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to issue teacher invitation.';
      setStatusMessage({ type: 'error', text: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign Teacher to Stream & Subject
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!assignTeacherId || !assignStreamId || !assignSubjectId) {
      setStatusMessage({ type: 'error', text: 'Teacher, Stream, and Subject are required.' });
      return;
    }

    if (!activeAcademicYear?.id) {
      setStatusMessage({ type: 'error', text: 'An active Academic Year must be selected for assignment.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await schoolAdminService.assignTeacherToStream({
        teacher_id: parseInt(assignTeacherId),
        stream_id: parseInt(assignStreamId),
        subject_id: parseInt(assignSubjectId),
        academic_year_id: activeAcademicYear.id,
      });

      setStatusMessage({ type: 'success', text: 'Teacher assigned to stream & subject successfully!' });
      setAssignTeacherId('');
      setAssignStreamId('');
      setAssignSubjectId('');
      setIsAssignModalOpen(false);
      await refreshData();
    } catch (err) {
      const detail = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to assign teacher.';
      setStatusMessage({ type: 'error', text: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove Assignment
  const handleUnassignTeacher = async (assignmentId) => {
    try {
      await schoolAdminService.unassignTeacher(assignmentId);
      setStatusMessage({ type: 'success', text: 'Teacher assignment removed.' });
      await refreshData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to remove assignment.' });
    }
  };

  // Transition membership state
  const handleTransitionState = async (membershipId, newNextState) => {
    try {
      await schoolAdminService.transitionMembershipState(membershipId, newNextState);
      setStatusMessage({ type: 'success', text: `Membership state updated to ${newNextState}.` });
      await refreshData();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to update membership state.';
      setStatusMessage({ type: 'error', text: detail });
    }
  };

  // Revoke Invitation
  const handleRevokeInvitation = async (invitationId, email) => {
    if (!window.confirm(`Revoke invitation for ${email}?`)) return;
    try {
      await schoolAdminService.revokeInvitation(invitationId);
      setStatusMessage({ type: 'success', text: `Invitation for ${email} revoked.` });
      await refreshData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to revoke invitation.' });
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase();
    const email = t.user_detail?.email || '';
    const name = `${t.user_detail?.first_name || ''} ${t.user_detail?.last_name || ''}`.trim();
    return email.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Teachers"
        subtitle="Manage teaching staff and academic assignments"
        actions={
          <>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Assign Subject
            </button>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-custom-blue text-white hover:bg-blue-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Invite Teacher
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

      {/* Generated Token Banner for Recent Invite */}
      {invitedTokenInfo && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-xs text-custom-blue">
          <div className="flex justify-between items-center">
            <span className="font-bold flex items-center gap-1.5">
              <Key className="w-4 h-4 text-custom-blue" /> Invitation Token Generated for {invitedTokenInfo.email}
            </span>
            <button onClick={() => setInvitedTokenInfo(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-600 text-[11px]">
            Share this invitation token with the teacher to complete sign-up:
          </p>
          <code className="block p-2.5 bg-white border border-blue-200 rounded-xl font-mono text-xs text-custom-blue select-all font-bold">
            {invitedTokenInfo.raw_token}
          </code>
        </div>
      )}

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Pending Invitations ({pendingInvitations.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-3xl border border-gray-100 bg-white shadow-xs flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-gray-900">{inv.email}</p>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Expires: {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeInvitation(inv.id, inv.email)}
                  className="text-red-600 hover:bg-red-50 font-bold px-2.5 py-1 rounded-xl transition-colors"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Faculty Table */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-base font-bold text-gray-900">
            Teaching Staff Roster ({filteredTeachers.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teacher name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-custom-blue"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading teaching staff...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 italic">No teachers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase font-bold text-gray-400">
                  <th className="py-3 px-4">Teacher Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Subjects & Streams</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
                {filteredTeachers.map((t) => {
                  const name = t.user_detail?.first_name
                    ? `${t.user_detail.first_name} ${t.user_detail.last_name || ''}`
                    : t.user_detail?.username || 'Teacher';

                  const teacherUserId = t.user || t.user_detail?.id;
                  const assignments = teacherAssignments.filter(
                    (asg) => asg.teacher === teacherUserId || asg.teacher_detail?.id === teacherUserId
                  );

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">{name}</td>
                      <td className="py-3.5 px-4 text-gray-600">{t.user_detail?.email}</td>
                      <td className="py-3.5 px-4">
                        {assignments.length === 0 ? (
                          <span className="text-gray-400 italic">No assignments</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {assignments.map((asg) => (
                              <span
                                key={asg.id}
                                className="inline-flex items-center gap-1 bg-blue-50 text-custom-blue px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-blue-100"
                              >
                                <BookOpen className="w-3 h-3" />
                                {asg.subject_name} ({asg.stream_name})
                                <button
                                  onClick={() => handleUnassignTeacher(asg.id)}
                                  className="text-gray-400 hover:text-red-600 ml-1"
                                  title="Unassign"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            t.state === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : t.state === 'SUSPENDED'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {t.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {t.state !== 'ACTIVE' && (
                            <button
                              onClick={() => handleTransitionState(t.id, 'ACTIVE')}
                              className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          {t.state === 'ACTIVE' && (
                            <button
                              onClick={() => handleTransitionState(t.id, 'SUSPENDED')}
                              className="text-[11px] bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold px-2.5 py-1 rounded-xl border border-amber-200 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal: Invite Teacher */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg">Invite Teacher</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Teacher Email</label>
                <input
                  type="email"
                  placeholder="teacher@school.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Class (Optional)</label>
                <select
                  value={intendedClassId}
                  onChange={(e) => setIntendedClassId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                >
                  <option value="">-- Optional Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Stream (Optional)</label>
                <select
                  value={intendedStreamId}
                  onChange={(e) => setIntendedStreamId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                >
                  <option value="">-- Optional Stream --</option>
                  {streams.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.class_name || 'Class'} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Subject (Optional)</label>
                <select
                  value={intendedSubjectId}
                  onChange={(e) => setIntendedSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                >
                  <option value="">-- Optional Subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-custom-blue text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Teacher to Stream & Subject */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg">Assign Teacher</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Teacher</label>
                <select
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.user} value={t.user}>
                      {t.user_detail?.first_name ? `${t.user_detail.first_name} ${t.user_detail.last_name || ''}` : t.user_detail?.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Stream</label>
                <select
                  value={assignStreamId}
                  onChange={(e) => setAssignStreamId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                >
                  <option value="">-- Select Stream --</option>
                  {streams.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.class_name || 'Class'} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Subject</label>
                <select
                  value={assignSubjectId}
                  onChange={(e) => setAssignSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
                  required
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-custom-blue text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolTeachersPage;
