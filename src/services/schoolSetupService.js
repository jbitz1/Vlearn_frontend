import apiClient from '../config/apiClient';

const schoolSetupService = {
  // Wizard state
  getWizardState: () => apiClient.get('/api/organizations/setup-wizard/'),
  saveWizardStep: (step, data) => apiClient.patch('/api/organizations/setup-wizard/', { step, data }),
  
  // Subjects
  getAvailableSubjects: () => apiClient.get('/api/curriculum/subjects/'),
  
  // Teachers
  uploadTeachers: (formData) => apiClient.post('/api/organizations/bulk-upload/teachers/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadTeacherTemplate: () => apiClient.get('/api/organizations/download-template/?type=teacher', {
    responseType: 'blob'
  }),
  
  // Students
  uploadStudents: (formData) => apiClient.post('/api/organizations/bulk-upload/students/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadStudentTemplate: () => apiClient.get('/api/organizations/download-template/?type=student', {
    responseType: 'blob'
  }),
  
  // Forms/Classes
  createClass: (data) => apiClient.post('/api/organizations/classes/', data),
  createStream: (data) => apiClient.post('/api/organizations/streams/', data),
  
  // Teacher assignments
  createTeacherAssignment: (data) => apiClient.post('/api/organizations/teacher-assignments/', data),
  
  // Exam configuration
  saveExamConfig: (data) => apiClient.post('/api/organizations/exam-configurations/', data),
  
  // Teacher specialties
  createSpecialty: (data) => apiClient.post('/api/organizations/teacher-specialties/', data),
  
  // Terms
  createTerm: (data) => apiClient.post('/api/organizations/terms/', data),
};

export default schoolSetupService;
