import apiClient from '../config/apiClient';



export const studentCurriculumService = {
  async getSchoolContext() {
    try {
      const response = await apiClient.get('/api/organizations/student/my-school/');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch student school context:', err);
      return null;
    }
  },

  async getGrades() {
    try {
      const response = await apiClient.get('/api/curriculum/grades/');
      return response.data.results || response.data || [];
    } catch (err) {
      console.error('Failed to fetch grades:', err);
      return [];
    }
  },

  async getSubjects(gradeId = null, enrolled = true) {
    try {
      let url = gradeId ? `/api/curriculum/subjects/?grade=${gradeId}` : '/api/curriculum/subjects/';
      if (enrolled) {
        url += url.includes('?') ? '&enrolled=true' : '?enrolled=true';
      }
      const response = await apiClient.get(url);
      return response.data.results || response.data || [];
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      return [];
    }
  },

  async getSubjectById(subjectId) {
    try {
      const response = await apiClient.get(`/api/curriculum/subjects/${subjectId}/`);
      return response.data;
    } catch (err) {
      console.error(`Failed to fetch subject ${subjectId}:`, err);
      return null;
    }
  },

  async getTopicsForSubject(subjectId) {
    try {
      const response = await apiClient.get(`/api/curriculum/topics/?subject=${subjectId}`);
      const topics = response.data.results || response.data || [];
      return topics.filter(t => t.has_published_lesson !== false);
    } catch (err) {
      console.error(`Failed to fetch topics for subject ${subjectId}:`, err);
      return [];
    }
  },

  async getTopicById(topicId) {
    try {
      const response = await apiClient.get(`/api/curriculum/topics/${topicId}/`);
      return response.data;
    } catch (err) {
      console.error(`Failed to fetch topic ${topicId}:`, err);
      return null;
    }
  },

  async getActiveLesson(topicId) {
    try {
      const response = await apiClient.get(`/api/curriculum/topics/${topicId}/lesson/`);
      if (response.data) return response.data;
    } catch (err) {
      console.warn(`Failed to fetch active lesson via topic endpoint for topic ${topicId}:`, err.message);
    }
    try {
      const listRes = await apiClient.get(`/api/curriculum/lessons/?topic=${topicId}`);
      const list = listRes.data?.results || listRes.data || [];
      if (list.length > 0) return list[0];
    } catch (err) {
      console.error(`Failed to fetch lessons list fallback for topic ${topicId}:`, err.message);
    }
    return null;
  },

  /**
   * Fetch all recorded laboratory experiments backlog.
   */
  async getExperiments(subjectName = null) {
    try {
      const response = await apiClient.get('/experiment_videos/');
      return response.data.results || response.data || [];
    } catch (err) {
      console.error('Failed to fetch recorded experiments from backend:', err);
      return [];
    }
  },

  async getSimulations(subjectName = null) {
    try {
      const response = await apiClient.get('/api/curriculum/simulations/');
      return response.data.results || response.data || [];
    } catch (err) {
      console.error('Failed to fetch simulations:', err);
      return [];
    }
  },

  async getQuizAttempts() {
    try {
      const response = await apiClient.get('/questions/attempts/');
      return response.data.results || response.data || [];
    } catch (err) {
      console.error('Failed to fetch quiz attempts:', err);
      return [];
    }
  },

  getRecentLearningModules(userId = 'anonymous') {
    const prefix = `vlearn_lesson_progress_${userId}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    const modules = keys.map(k => {
      try {
        const data = JSON.parse(localStorage.getItem(k));
        const lessonId = k.replace(prefix, '').replace('_preview', '');
        return { ...data, lessonId, storageKey: k };
      } catch {
        return null;
      }
    }).filter(m => m && m.lessonTitle && m.topicId);

    return modules.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
  },

  getRecentlyStudied(userId = 'anonymous') {
    return this.getRecentLearningModules(userId);
  },

  getRecentLessons(userId = 'anonymous') {
    return this.getRecentLearningModules(userId);
  },

  getTopicProgress(topicId, userId = 'anonymous') {
    // Note: getTopicProgress might be checking by lessonId if topic progress is stored per lesson
    const key = `vlearn_lesson_progress_${userId}_${topicId}`;
    try {
      const item = localStorage.getItem(key);
      if (!item) return { isCompleted: false, pct: 0 };
      const data = JSON.parse(item);
      const pct = data.totalPages > 0 
        ? Math.round(((data.completedConcepts?.length || 0) / data.totalPages) * 100) 
        : (data.isCompleted ? 100 : 0);
      return {
        isCompleted: !!data.isCompleted,
        pct: Math.min(100, Math.max(0, pct))
      };
    } catch {
      return { isCompleted: false, pct: 0 };
    }
  }
};

export default studentCurriculumService;
