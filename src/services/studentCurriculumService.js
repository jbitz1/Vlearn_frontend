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
      const listRes = await apiClient.get(`/api/curriculum/lessons/?topic=${topicId}&status=published`);
      const list = listRes.data?.results || listRes.data || [];
      if (list.length > 0) return list[0];
    } catch (err) {
      console.error(`Failed to fetch lessons list fallback for topic ${topicId}:`, err.message);
    }
    return null;
  },

  async getLessonsForTopic(topicId) {
    try {
      const response = await apiClient.get(`/api/curriculum/lessons/?topic=${topicId}&status=published&page_size=100`);
      const list = response.data?.results || response.data || [];
      return list;
    } catch (err) {
      console.error(`Failed to fetch lessons for topic ${topicId}:`, err);
      return [];
    }
  },

  /**
   * Fetch recorded laboratory experiments backlog.
   * Experiments are only meant for Chemistry.
   */
  async getExperiments(subjectName = null, topicName = null) {
    if (subjectName && !subjectName.toLowerCase().includes('chem')) {
      return [];
    }
    try {
      const params = {};
      if (subjectName) params.subject = subjectName;
      if (topicName) params.topic = topicName;
      const response = await apiClient.get('/experiment_videos/', { params });
      let videos = response.data.results || response.data || [];
      
      if (topicName && videos.length > 0) {
        const tLower = topicName.toLowerCase();
        videos = videos.filter(v => {
          const cat = (v.category || '').toLowerCase();
          const title = (v.title || '').toLowerCase();
          if (tLower.includes('gas law')) return cat.includes('gas') || title.includes('gas') || title.includes('charles') || title.includes('diffusion');
          if (tLower.includes('mole') || tLower.includes('formula') || tLower.includes('equation')) return cat.includes('mole') || title.includes('titration') || title.includes('molar') || title.includes('empirical');
          if (tLower.includes('organic')) return cat.includes('organic') || title.includes('organic') || title.includes('ethene') || title.includes('hydrocarbon');
          if (tLower.includes('nitrogen')) return cat.includes('nitrogen') || title.includes('nitrogen') || title.includes('ammonia') || title.includes('nitrate');
          if (tLower.includes('sulphur') || tLower.includes('sulfur')) return cat.includes('sulphur') || cat.includes('sulfur') || title.includes('sulphur') || title.includes('sulfur');
          if (tLower.includes('chlorine')) return cat.includes('chlorine') || title.includes('chlorine') || title.includes('chloride');
          return cat.includes(tLower) || tLower.includes(cat) || title.includes(tLower);
        });
      }
      return videos;
    } catch (err) {
      console.error('Failed to fetch recorded experiments from backend:', err);
      return [];
    }
  },

  /**
   * Fetch interactive virtual lab simulations.
   * Simulations are currently only meant for Chemistry and Physics.
   */
  async getSimulations(subjectName = null, topicName = null) {
    if (subjectName) {
      const sLower = subjectName.toLowerCase();
      const isChem = sLower.includes('chem');
      const isPhys = sLower.includes('phys');
      if (!isChem && !isPhys) {
        return [];
      }
    }
    try {
      const params = {};
      if (subjectName) params.subject = subjectName;
      if (topicName) params.topic = topicName;
      const response = await apiClient.get('/api/curriculum/simulations/', { params });
      let sims = response.data.results || response.data || [];
      
      if (topicName && sims.length > 0) {
        const tLower = topicName.toLowerCase();
        sims = sims.filter(s => {
          const simTopic = (s.topic || '').toLowerCase();
          const simTitle = (s.title || '').toLowerCase();
          if (tLower.includes('acid') || tLower.includes('base') || tLower.includes('salt')) return simTopic.includes('acid') || simTitle.includes('acid') || simTitle.includes('solubility');
          if (tLower.includes('mole') || tLower.includes('formula') || tLower.includes('titrat') || tLower.includes('volumetric')) return simTopic.includes('mole') || simTitle.includes('titrat') || simTitle.includes('mole') || simTopic.includes('titrat');
          if (tLower.includes('gas law')) return simTopic.includes('gas') || simTitle.includes('gas') || simTitle.includes('charles') || simTitle.includes('boyle') || simTitle.includes('graham') || simTitle.includes('diffusion');
          if (tLower.includes('energy') || tLower.includes('heat') || tLower.includes('therm')) return simTopic.includes('energy') || simTitle.includes('hess') || simTitle.includes('heat');
          if (tLower.includes('rate') || tLower.includes('reversible') || tLower.includes('equilibrium')) return simTopic.includes('rate') || simTitle.includes('rate') || simTitle.includes('collision') || simTitle.includes('haber') || simTitle.includes('equilibrium');
          if (tLower.includes('electro') || tLower.includes('redox')) return simTopic.includes('electro') || simTitle.includes('electrolysis') || simTitle.includes('plating') || simTitle.includes('discharge') || simTitle.includes('voltaic') || simTitle.includes('electrode');
          if (tLower.includes('metal')) return simTopic.includes('metal') || simTitle.includes('reactivity');
          if (tLower.includes('circuit') || tLower.includes('electric')) return simTopic.includes('circuit') || simTitle.includes('circuit');
          if (tLower.includes('kinematic') || tLower.includes('motion') || tLower.includes('gravity')) return simTopic.includes('kinematic') || simTitle.includes('freefall');
          if (tLower.includes('lens') || tLower.includes('optics') || tLower.includes('light')) return simTopic.includes('optic') || simTitle.includes('optic') || simTitle.includes('lens');
          return simTopic.includes(tLower) || tLower.includes(simTopic) || simTitle.includes(tLower);
        });
      }
      return sims;
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

  getLessonProgress(lessonId, userId = 'anonymous') {
    const key = `vlearn_lesson_progress_${userId}_${lessonId}`;
    try {
      const item = localStorage.getItem(key);
      if (!item) return { isCompleted: false, isStarted: false, pct: 0, completedConceptsCount: 0, totalPages: 0 };
      const data = JSON.parse(item);
      const completedCount = data.completedConcepts?.length || 0;
      const total = data.totalPages || 0;
      const pct = total > 0 
        ? Math.round((completedCount / total) * 100) 
        : (data.isCompleted ? 100 : 0);
      const isCompleted = !!data.isCompleted || (total > 0 && completedCount >= total);
      return {
        isCompleted,
        isStarted: completedCount > 0 || pct > 0,
        pct: Math.min(100, Math.max(0, pct)),
        completedConceptsCount: completedCount,
        totalPages: total
      };
    } catch {
      return { isCompleted: false, isStarted: false, pct: 0, completedConceptsCount: 0, totalPages: 0 };
    }
  },

  // totalLessonsInTopic: pass the real count of lessons from the API so progress
  // is calculated against ALL lessons, not just the ones already opened.
  getTopicProgress(topicId, userId = 'anonymous', totalLessonsInTopic = 0) {
    if (!topicId) return { isCompleted: false, isStarted: false, pct: 0 };
    const prefix = `vlearn_lesson_progress_${userId}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    
    let matchingEntries = [];
    keys.forEach(k => {
      try {
        const data = JSON.parse(localStorage.getItem(k));
        if (data && String(data.topicId) === String(topicId)) {
          matchingEntries.push(data);
        }
      } catch {}
    });

    // Fallback: Check if stored directly under topic ID
    if (matchingEntries.length === 0) {
      const directKey = `vlearn_lesson_progress_${userId}_${topicId}`;
      try {
        const directItem = localStorage.getItem(directKey);
        if (directItem) {
          matchingEntries.push(JSON.parse(directItem));
        }
      } catch {}
    }

    if (matchingEntries.length === 0 && totalLessonsInTopic === 0) {
      return { isCompleted: false, isStarted: false, pct: 0, completedLessonsCount: 0, totalLessonsCount: 0 };
    }

    let completedLessonsCount = 0;

    matchingEntries.forEach(entry => {
      const total = entry.totalPages || 1;
      const completed = entry.completedConcepts?.length || (entry.isCompleted ? total : 0);
      if (entry.isCompleted || (total > 0 && completed >= total)) {
        completedLessonsCount += 1;
      }
    });

    // Use the real total from the API; fall back to stored entries count only if not provided
    const effectiveTotalLessons = totalLessonsInTopic > 0 ? totalLessonsInTopic : matchingEntries.length;

    const pct = effectiveTotalLessons > 0
      ? Math.round((completedLessonsCount / effectiveTotalLessons) * 100)
      : 0;

    const isCompleted = effectiveTotalLessons > 0 && completedLessonsCount >= effectiveTotalLessons;
    const isStarted = completedLessonsCount > 0 || matchingEntries.length > 0;

    return {
      isCompleted,
      isStarted,
      pct: Math.min(100, Math.max(0, pct)),
      completedLessonsCount,
      totalLessonsCount: effectiveTotalLessons
    };
  },

  getAllTopicsProgress(userId = 'anonymous') {
    const prefix = `vlearn_lesson_progress_${userId}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    const topicMap = {};

    keys.forEach(k => {
      try {
        const data = JSON.parse(localStorage.getItem(k));
        if (data && data.topicId) {
          const tId = data.topicId;
          if (!topicMap[tId]) {
            topicMap[tId] = [];
          }
          topicMap[tId].push(data);
        }
      } catch {}
    });

    const result = {};
    Object.keys(topicMap).forEach(topicId => {
      const entries = topicMap[topicId];
      let totalConcepts = 0;
      let completedConcepts = 0;
      let completedCount = 0;

      entries.forEach(e => {
        const total = e.totalPages || 1;
        const comp = e.completedConcepts?.length || (e.isCompleted ? total : 0);
        totalConcepts += total;
        completedConcepts += comp;
        if (e.isCompleted || comp >= total) completedCount++;
      });

      const pct = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;
      result[topicId] = {
        isCompleted: completedCount === entries.length && pct === 100,
        isStarted: completedConcepts > 0,
        pct: Math.min(100, Math.max(0, pct))
      };
    });

    return result;
  },

  getSubjectProgress(subjectId, topics = [], userId = 'anonymous') {
    if (!topics || topics.length === 0) {
      return { isCompleted: false, isStarted: false, pct: 0, completedTopics: 0, totalTopics: 0 };
    }

    let totalPct = 0;
    let completedTopics = 0;
    let startedTopics = 0;

    topics.forEach(topic => {
      const lessonCount = topic.lesson_count || (topic.lessons ? topic.lessons.length : 0) || 0;
      const topicProg = this.getTopicProgress(topic.id, userId, lessonCount);
      totalPct += topicProg.pct;
      if (topicProg.isCompleted) completedTopics++;
      if (topicProg.isStarted) startedTopics++;
    });

    const avgPct = Math.round(totalPct / topics.length);
    const isCompleted = completedTopics === topics.length && topics.length > 0;
    const isStarted = startedTopics > 0 || avgPct > 0;

    return {
      isCompleted,
      isStarted,
      pct: Math.min(100, Math.max(0, avgPct)),
      completedTopics,
      totalTopics: topics.length
    };
  },

  recordSubjectAccess(subjectId, userId = 'anonymous') {
    if (!subjectId) return;
    const key = `vlearn_subject_access_${userId}`;
    try {
      const stored = localStorage.getItem(key);
      const accessMap = stored ? JSON.parse(stored) : {};
      accessMap[String(subjectId)] = Date.now();
      localStorage.setItem(key, JSON.stringify(accessMap));
    } catch (e) {
      console.error("Failed to record subject access", e);
    }
  },

  getSubjectLastAccessedMap(userId = 'anonymous') {
    const key = `vlearn_subject_access_${userId}`;
    let accessMap = {};
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        accessMap = JSON.parse(stored) || {};
      }
    } catch {}

    // Also inspect recent modules to ensure any recently accessed module's subject has a fresh timestamp
    const recentModules = this.getRecentLearningModules(userId);
    recentModules.forEach(mod => {
      if (mod.subjectId && mod.lastAccessed) {
        const sId = String(mod.subjectId);
        if (!accessMap[sId] || mod.lastAccessed > accessMap[sId]) {
          accessMap[sId] = mod.lastAccessed;
        }
      }
    });

    return accessMap;
  },

  orderSubjectsByLastOpened(subjects = [], userId = 'anonymous') {
    if (!Array.isArray(subjects) || subjects.length === 0) return [];
    const accessMap = this.getSubjectLastAccessedMap(userId);

    return [...subjects].sort((a, b) => {
      const timeA = accessMap[String(a.id)] || 0;
      const timeB = accessMap[String(b.id)] || 0;

      if (timeA > 0 || timeB > 0) {
        if (timeA !== timeB) {
          return timeB - timeA; // Most recently opened first
        }
      }

      return 0;
    });
  },

  clearAllProgress() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith('vlearn_lesson_progress_') ||
             key.startsWith('vlearn_subject_access_') ||
             key.startsWith('vlearn_topic_access_') ||
             key.startsWith('vlearn_recent_') ||
             key.includes('lesson_progress') ||
             key.includes('subject_access') ||
             key.includes('topic_access') ||
             key.includes('_progress_'))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
    } catch (err) {
      console.error('Failed to clear progress from localStorage:', err);
    }
  }
};

const PROGRESS_RESET_EPOCH = '2026_08_18_01';

try {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (localStorage.getItem('vlearn_progress_reset_epoch') !== PROGRESS_RESET_EPOCH) {
      studentCurriculumService.clearAllProgress();
      localStorage.setItem('vlearn_progress_reset_epoch', PROGRESS_RESET_EPOCH);
    }
  }
} catch (err) {
  console.error('Failed to run progress reset check:', err);
}

export default studentCurriculumService;
