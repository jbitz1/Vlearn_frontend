import apiClient from '../config/apiClient';

export const performanceService = {
  getStudentPerformance: async (studentId, params) => {
    const response = await apiClient.get(`/api/performance/student/${studentId}/`, { params });
    return response.data;
  },

  getStreamPerformance: async (streamId, params) => {
    const response = await apiClient.get(`/api/performance/stream/${streamId}/`, { params });
    return response.data;
  },

  getFormPerformance: async (formId, params) => {
    const response = await apiClient.get(`/api/performance/form/${formId}/`, { params });
    return response.data;
  },

  getSchoolPerformance: async (schoolId, params) => {
    const response = await apiClient.get(`/api/performance/school/${schoolId}/`, { params });
    return response.data;
  },

  getClassTeacherStream: async (streamId, params) => {
    const response = await apiClient.get(`/api/performance/class-teacher/stream/${streamId}/`, { params });
    return response.data;
  },
};

export const gradeFromScore = (score, maxScore = 100) => {
  if (score === null || score === undefined || isNaN(score)) return '-';
  const pct = (score / maxScore) * 100;
  if (pct >= 80) return 'A';
  if (pct >= 75) return 'A-';
  if (pct >= 70) return 'B+';
  if (pct >= 65) return 'B';
  if (pct >= 60) return 'B-';
  if (pct >= 55) return 'C+';
  if (pct >= 50) return 'C';
  if (pct >= 45) return 'C-';
  if (pct >= 40) return 'D+';
  if (pct >= 35) return 'D';
  if (pct >= 30) return 'D-';
  return 'E';
};

export const getGradeColor = (grade) => {
  if (['A', 'A-'].includes(grade)) return 'bg-success-light text-success';
  if (['B+', 'B'].includes(grade)) return 'bg-primary-light text-primary';
  if (['B-', 'C+'].includes(grade)) return 'bg-slate-100 text-slate-700';
  if (['C', 'C-'].includes(grade)) return 'bg-warning-light text-warning';
  if (['D+', 'D', 'D-'].includes(grade)) return 'bg-orange-100 text-orange-600';
  if (grade === 'E') return 'bg-danger-light text-danger';
  return 'bg-slate-100 text-slate-500';
};
