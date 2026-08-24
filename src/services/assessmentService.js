import apiClient from '../config/apiClient';

export const assessmentService = {
  getExaminations: async (params) => {
    const response = await apiClient.get('/api/assessments/examinations/', { params });
    return response.data;
  },

  createExamination: async (data) => {
    const response = await apiClient.post('/api/assessments/examinations/', data);
    return response.data;
  },

  getMarks: async (params) => {
    const response = await apiClient.get('/api/assessments/marks/', { params });
    return response.data;
  },

  saveMarks: async (data) => {
    if (Array.isArray(data)) {
      const response = await apiClient.post('/api/assessments/marks/bulk/', data);
      return response.data;
    } else {
      const response = await apiClient.post('/api/assessments/marks/', data);
      return response.data;
    }
  },

  uploadMarks: async (formData) => {
    const response = await apiClient.post('/api/assessments/marks/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadTemplate: async (streamId, subjectId) => {
    const response = await apiClient.get('/api/assessments/marks/template/download/', {
      params: { stream: streamId, subject: subjectId },
      responseType: 'blob',
    });
    return response.data;
  },
};
