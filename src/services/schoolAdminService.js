import apiClient from '../config/apiClient';

export const schoolAdminService = {
  // School management
  async fetchSchools() {
    const response = await apiClient.get('/api/organizations/schools/');
    return response.data.results || response.data || [];
  },

  async createSchool(data) {
    const response = await apiClient.post('/api/organizations/schools/', data);
    return response.data;
  },

  async submitSchoolOnboarding(payload) {
    const response = await apiClient.post('/api/organizations/schools/register-profile/', payload);
    return response.data;
  },

  async fetchSetupState(schoolId) {
    const response = await apiClient.get(`/api/organizations/schools/${schoolId}/setup-state/`);
    return response.data;
  },

  async updateSchool(schoolId, data) {
    const response = await apiClient.patch(`/api/organizations/schools/${schoolId}/`, data);
    return response.data;
  },

  // Subscription
  async fetchSubscription(schoolId) {
    const response = await apiClient.get(`/api/organizations/subscriptions/?school_id=${schoolId}`);
    const subList = response.data.results || response.data || [];
    return subList.find((s) => s.is_active) || subList[0] || null;
  },

  // Academic years
  async fetchAcademicYears(schoolId) {
    const response = await apiClient.get(`/api/organizations/academic-years/?school_id=${schoolId}`);
    return response.data.results || response.data || [];
  },

  async createAcademicYear(schoolId, data) {
    const response = await apiClient.post('/api/organizations/academic-years/', { school: schoolId, ...data });
    return response.data;
  },

  // Classes & Streams
  async fetchClasses(schoolId) {
    const response = await apiClient.get(`/api/organizations/classes/?school_id=${schoolId}`);
    return response.data.results || response.data || [];
  },

  async createClass(schoolId, data) {
    const response = await apiClient.post('/api/organizations/classes/', { school: schoolId, ...data });
    return response.data;
  },

  async deleteClass(classId) {
    const response = await apiClient.delete(`/api/organizations/classes/${classId}/`);
    return response.data;
  },

  async fetchStreams(schoolId) {
    const response = await apiClient.get(`/api/organizations/streams/?school_id=${schoolId}`);
    return response.data.results || response.data || [];
  },

  async createStream(data) {
    const response = await apiClient.post('/api/organizations/streams/', data);
    return response.data;
  },

  async deleteStream(streamId) {
    const response = await apiClient.delete(`/api/organizations/streams/${streamId}/`);
    return response.data;
  },

  // Teachers / Faculty
  async fetchTeachers(schoolId) {
    const response = await apiClient.get(`/api/organizations/memberships/?school_id=${schoolId}&role=teacher`);
    return response.data.results || response.data || [];
  },

  async fetchPendingInvitations(schoolId) {
    const response = await apiClient.get(`/api/organizations/invitations/?school_id=${schoolId}&state=PENDING`);
    return response.data.results || response.data || [];
  },

  async inviteTeacher(data) {
    const response = await apiClient.post('/api/organizations/invitations/', data);
    return response.data;
  },

  async revokeInvitation(invitationId) {
    const response = await apiClient.post(`/api/organizations/invitations/${invitationId}/revoke/`);
    return response.data;
  },

  async transitionMembershipState(membershipId, newState) {
    const response = await apiClient.post(`/api/organizations/memberships/${membershipId}/transition-state/`, {
      state: newState,
    });
    return response.data;
  },

  // Students / Enrollments
  async fetchEnrollments(schoolId) {
    const response = await apiClient.get(`/api/organizations/enrollments/?school_id=${schoolId}`);
    return response.data.results || response.data || [];
  },

  async batchEnrollStudents(data) {
    const response = await apiClient.post('/api/organizations/enrollments/batch-enroll/', data);
    return response.data;
  },

  // Teacher Assignments
  async fetchTeacherAssignments(schoolId) {
    const response = await apiClient.get(`/api/organizations/teacher-assignments/?school_id=${schoolId}`);
    return response.data.results || response.data || [];
  },

  async assignTeacherToStream(data) {
    const response = await apiClient.post('/api/organizations/teacher-assignments/assign-stream/', data);
    return response.data;
  },

  async unassignTeacher(assignmentId) {
    const response = await apiClient.post('/api/organizations/teacher-assignments/unassign-stream/', {
      assignment_id: assignmentId,
    });
    return response.data;
  },

  // Curriculum reference data
  async fetchCurricula() {
    const response = await apiClient.get('/api/curriculum/curricula/');
    return response.data.results || response.data || [];
  },

  async fetchGrades(curriculumId = null) {
    const url = curriculumId ? `/api/curriculum/grades/?curriculum=${curriculumId}` : '/api/curriculum/grades/';
    const response = await apiClient.get(url);
    return response.data.results || response.data || [];
  },

  async fetchSubjects() {
    const response = await apiClient.get('/api/curriculum/subjects/');
    return response.data.results || response.data || [];
  },
};

export default schoolAdminService;
