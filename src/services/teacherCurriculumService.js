import apiClient from '../config/apiClient';

const ALL_RECORDED_EXPERIMENTS = [
  {
    id: 1,
    title: "Charles' Law Experiment",
    subtitle: "Gas volume vs temperature relationship at constant pressure",
    description: "The Charles's Law experiment demonstrates that the volume of a gas is directly proportional to its absolute temperature at constant pressure. A capillary tube trapped with gas column is heated in a water bath to measure V vs T.",
    category: "Gas Laws",
    duration: "6 min 30 secs",
    instructor: "Mr. John Mwangi",
    rating: 4.9,
    image: "https://www.thoughtco.com/thmb/6MsMmUK27akFhb8i89kj95J5iko=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-545286316-433dd345105e4c6ebe4cdd8d2317fdaa.jpg",
    playback_url: "https://www.youtube.com/watch?v=6hC2SHUWc0M",
    video_url: "https://www.youtube.com/watch?v=6hC2SHUWc0M"
  },
  {
    id: 2,
    title: "Diffusion in Liquids Experiment",
    subtitle: "Particle movement in aqueous solutions",
    description: "Learn how particles move in liquids through diffusion by observing color spreading of potassium permanganate crystals in warm vs cold water.",
    category: "Kinetic Theory",
    duration: "1.5 hours",
    instructor: "Ms. Grace Wanjiru",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=800&q=80",
    playback_url: "https://www.youtube.com/watch?v=Y-9_a_K_c20",
    video_url: "https://www.youtube.com/watch?v=Y-9_a_K_c20"
  },
  {
    id: 3,
    title: "Preparation and Properties of Oxygen Gas",
    subtitle: "Catalytic decomposition of H2O2",
    description: "Recorded laboratory demonstration showing catalytic decomposition of hydrogen peroxide using manganese (IV) oxide catalyst and test for oxygen.",
    category: "Chemistry",
    duration: "12 min 15 secs",
    instructor: "Dr. Peter Otieno",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    playback_url: "https://www.youtube.com/watch?v=5a22V5TjHBA",
    video_url: "https://www.youtube.com/watch?v=5a22V5TjHBA"
  },
  {
    id: 4,
    title: "Acid-Base Titration Procedure",
    subtitle: "Volumetric concentration analysis",
    description: "Step-by-step recorded practical demonstration of volumetric acid-base titration using phenolphthalein indicator to determine unknown concentration.",
    category: "Acids & Bases",
    duration: "15 min 45 secs",
    instructor: "Prof. Alice Mutiso",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80",
    playback_url: "https://www.youtube.com/watch?v=8UHBsvxVp68",
    video_url: "https://www.youtube.com/watch?v=8UHBsvxVp68"
  }
];

const COMPREHENSIVE_SIMULATIONS = [
  {
    id: "charles_law",
    key: "charles_law",
    title: "Charles's Law Virtual Lab",
    subject: "CHEMISTRY",
    topic: "Gas Laws",
    description: "Interactively heat and cool gas inside a frictionless cylinder to observe V vs T relationship in real time.",
    status: "ACTIVE"
  },
  {
    id: "acid_base_dissociation",
    key: "acid_base_dissociation",
    title: "Acid-Base Dissociation & pH Scale",
    subject: "CHEMISTRY",
    topic: "Acids, Bases & Salts",
    description: "Simulate hydronium ion concentration, pH changes, and acid-base neutralization reactions.",
    status: "ACTIVE"
  },
  {
    id: "electrolysis",
    key: "electrolysis",
    title: "Electrolysis & Faraday's Law",
    subject: "CHEMISTRY",
    topic: "Electrochemistry",
    description: "Investigate ion migration, electrode mass changes, and gas evolution during aqueous electrolysis.",
    status: "ACTIVE"
  },
  {
    id: "chem_soap_micelle_action",
    key: "chem_soap_micelle_action",
    title: "Soap Micelle Formation",
    subject: "CHEMISTRY",
    topic: "Organic Chemistry II",
    description: "Help soap remove grease by forming micelles. Observe molecular reorganization in soft water vs scum precipitation in hard water.",
    status: "ACTIVE"
  },
  {
    id: "chem_functional_group_tests",
    key: "chem_functional_group_tests",
    title: "Functional Groups & Chemical Tests",
    subject: "CHEMISTRY",
    topic: "Organic Chemistry II",
    description: "Identify unknown organic compounds using chemical tests (Sodium, Bicarbonate, and Ceric Ammonium Nitrate).",
    status: "ACTIVE"
  },
  {
    id: "chem_radioactive_decay_half_life",
    key: "chem_radioactive_decay_half_life",
    title: "Radioactive Decay & Half-Life",
    subject: "CHEMISTRY",
    topic: "Radioactivity",
    description: "Observe radioactive sample decay kinetics over time and explore population half-life predictability vs. individual atom randomness.",
    status: "ACTIVE"
  },
  {
    id: "chem_nuclear_fission_chain_reaction",
    key: "chem_nuclear_fission_chain_reaction",
    title: "Nuclear Fission & Chain Reactions",
    subject: "CHEMISTRY",
    topic: "Radioactivity",
    description: "Trigger nuclear fission in U-235 nuclei and adjust control rod positions to regulate neutron absorption and prevent thermal runaway.",
    status: "ACTIVE"
  }
];

const teacherCurriculumService = {
  // Fetch assigned streams & rosters for teacher
  async getMyStreams() {
    try {
      const response = await apiClient.get('/api/organizations/teacher/my-streams/');
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch teacher streams from backend:', error.message);
      return [];
    }
  },

  // Fetch full Curriculum Builder catalog (Curriculum -> Grade -> Subject) from backend API
  async getCurriculumCatalog() {
    try {
      const [curriculaRes, gradesRes, subjectsRes] = await Promise.all([
        apiClient.get('/api/curriculum/curricula/'),
        apiClient.get('/api/curriculum/grades/'),
        apiClient.get('/api/curriculum/subjects/')
      ]);

      const curriculaList = curriculaRes.data?.results || curriculaRes.data || [];
      const gradesList = gradesRes.data?.results || gradesRes.data || [];
      const subjectsList = subjectsRes.data?.results || subjectsRes.data || [];

      const gradesByCurriculum = {};
      gradesList.forEach(g => {
        const currId = g.curriculum;
        if (!gradesByCurriculum[currId]) gradesByCurriculum[currId] = [];
        gradesByCurriculum[currId].push({
          id: g.id,
          name: g.name,
          level: g.level,
          subjects: []
        });
      });

      const gradesMap = {};
      Object.values(gradesByCurriculum).flat().forEach(g => {
        gradesMap[g.id] = g;
      });

      subjectsList.forEach(s => {
        const gId = s.grade;
        if (gradesMap[gId]) {
          gradesMap[gId].subjects.push({
            id: s.id,
            name: s.name,
            grade_id: gId,
            grade_name: s.grade_name || gradesMap[gId].name,
            description: s.description || ''
          });
        }
      });

      return curriculaList.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        grades: (gradesByCurriculum[c.id] || []).filter(g => g.subjects.length > 0)
      })).filter(c => c.grades.length > 0);
    } catch (e) {
      console.warn('Failed to fetch curriculum catalog:', e.message);
      return [];
    }
  },

  // Read saved teacher subjects stored locally
  getSavedTeacherSubjects() {
    try {
      const saved = localStorage.getItem('vlearn_teacher_subjects') || localStorage.getItem('vlearn_teacher_personal_subjects');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out any legacy mock items with fake IDs (101, 102)
        const cleaned = parsed.filter(s => s.id !== 101 && s.id !== 102);
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('vlearn_teacher_subjects', JSON.stringify(cleaned));
        }
        return cleaned;
      }
    } catch (e) {
      console.warn('Failed to load teacher subjects:', e);
    }
    return [];
  },

  // Save teacher subjects
  saveTeacherSubjects(subjects) {
    try {
      localStorage.setItem('vlearn_teacher_subjects', JSON.stringify(subjects));
    } catch (e) {
      console.warn('Failed to save teacher subjects:', e);
    }
  },

  // Add a subject to the teacher's active subjects list from the Curriculum Builder catalog
  addTeacherSubject(subjectObj) {
    const current = this.getSavedTeacherSubjects();
    if (!subjectObj || !subjectObj.id) return current;

    const exists = current.some(s => String(s.id) === String(subjectObj.id));
    if (exists) return current;

    const newSubj = {
      id: subjectObj.id,
      name: subjectObj.name,
      grade_name: subjectObj.grade_name || 'Curriculum Subject',
      topicCount: 0,
      publishedLessonCount: 0
    };
    const updated = [...current, newSubj];
    this.saveTeacherSubjects(updated);
    return updated;
  },

  // Remove a subject from teacher's active list
  removeTeacherSubject(subjectId) {
    const current = this.getSavedTeacherSubjects();
    const updated = current.filter(s => String(s.id) !== String(subjectId));
    this.saveTeacherSubjects(updated);
    return updated;
  },

  // Alias for backward compatibility
  addPersonalSubject(subjectObj) {
    return this.addTeacherSubject(subjectObj);
  },

  // Get unified list of overall subjects (merging institutional streams and teacher added subjects)
  async getTeacherSubjects() {
    try {
      const streams = await this.getMyStreams();
      const subjectMap = new Map();

      // Add school stream subjects
      streams.forEach((stream) => {
        if (stream.subjects && Array.isArray(stream.subjects)) {
          stream.subjects.forEach((subj) => {
            if (subj && subj.id) {
              if (!subjectMap.has(subj.id)) {
                subjectMap.set(subj.id, {
                  id: subj.id,
                  name: subj.name,
                  grade_name: stream.school_class_name || subj.grade_name || 'Standard Grade',
                  streams: [stream.stream_name]
                });
              } else {
                const existing = subjectMap.get(subj.id);
                if (stream.stream_name && !existing.streams.includes(stream.stream_name)) {
                  existing.streams.push(stream.stream_name);
                }
              }
            }
          });
        }
      });

      // Add teacher selected subjects from localStorage
      const savedSubjects = this.getSavedTeacherSubjects();
      savedSubjects.forEach(subj => {
        if (subj && subj.id && !subjectMap.has(subj.id)) {
          subjectMap.set(subj.id, {
            id: subj.id,
            name: subj.name,
            grade_name: subj.grade_name || 'Curriculum Subject',
            streams: []
          });
        }
      });

      let overallSubjects = Array.from(subjectMap.values());

      // Enrich subjects with topic and published lesson counts
      overallSubjects = await Promise.all(
        overallSubjects.map(async (subj) => {
          try {
            const topicsRes = await apiClient.get(`/api/curriculum/topics/?subject=${subj.id}`);
            const topicList = topicsRes.data?.results || topicsRes.data || [];
            return {
              ...subj,
              topicCount: topicList.length,
              publishedLessonCount: topicList.filter(t => t.has_published_lesson).length
            };
          } catch {
            return { ...subj, topicCount: 0, publishedLessonCount: 0 };
          }
        })
      );

      return overallSubjects;
    } catch (error) {
      console.warn('Error fetching teacher subjects:', error.message);
      return [];
    }
  },

  // Backward compatibility methods
  async getCategorizedSubjects() {
    const subjects = await this.getTeacherSubjects();
    return {
      schoolSubjects: subjects,
      personalSubjects: []
    };
  },

  async getAssignedSubjects() {
    return this.getTeacherSubjects();
  },

  // Get single subject detail
  async getSubjectById(subjectId) {
    try {
      const res = await apiClient.get(`/api/curriculum/subjects/${subjectId}/`);
      return res.data;
    } catch {
      const subjects = await this.getAssignedSubjects();
      return subjects.find(s => String(s.id) === String(subjectId)) || { id: subjectId, name: 'Subject' };
    }
  },

  // Get topics for subject
  async getTopicsForSubject(subjectId) {
    try {
      const res = await apiClient.get(`/api/curriculum/topics/?subject=${subjectId}`);
      const fetched = res.data?.results || res.data || [];
      return fetched;
    } catch (e) {
      console.warn('Failed to fetch topics from API:', e.message);
      return [];
    }
  },

  // Get single topic detail
  async getTopicById(topicId) {
    try {
      const res = await apiClient.get(`/api/curriculum/topics/${topicId}/`);
      return res.data;
    } catch {
      return { id: topicId, name: 'Topic', description: 'Curriculum learning topic.' };
    }
  },

  // Get lessons for topic
  async getLessonsForTopic(topicId) {
    try {
      const res = await apiClient.get(`/api/curriculum/lessons/?topic=${topicId}`);
      const fetched = res.data?.results || res.data || [];
      if (fetched.length > 0) return fetched;
    } catch (e) {
      console.warn('Failed to fetch lessons from API:', e.message);
    }

    try {
      const activeRes = await apiClient.get(`/api/curriculum/topics/${topicId}/lesson/`);
      if (activeRes.data) {
        return [activeRes.data];
      }
    } catch {
      // Fall through
    }

    return [];
  },

  // Get streams assigned for a specific subject
  async getStreamsForSubject(subjectId) {
    try {
      const streams = await this.getMyStreams();
      if (!streams || streams.length === 0) return [];
      
      const filtered = streams.filter(stream => {
        if (!stream.subjects) return false;
        return stream.subjects.some(s => String(s.id) === String(subjectId) || String(s.name).toLowerCase() === String(subjectId).toLowerCase());
      });

      return filtered;
    } catch {
      return [];
    }
  },

  // Get experiments
  async getExperiments(subjectName = '') {
    try {
      const res = await apiClient.get('/experiment_videos/');
      const fetched = res.data?.results || res.data || [];
      if (fetched.length > 0) {
        if (subjectName) {
          const lower = subjectName.toLowerCase();
          return fetched.filter(e => !e.category || e.category.toLowerCase().includes(lower) || lower.includes(e.category.toLowerCase()));
        }
        return fetched;
      }
      return [];
    } catch (e) {
      console.warn('Failed to fetch experiments:', e.message);
      return [];
    }
  },

  // Get simulations
  async getSimulations(subjectName = '') {
    try {
      const res = await apiClient.get('/api/curriculum/simulations/');
      const fetched = res.data?.results || res.data || [];
      return fetched;
    } catch (e) {
      console.warn('Failed to fetch simulations:', e.message);
      return [];
    }
  },

  // Get resources organized by topic
  async getResources(subjectName = '') {
    let files = [];
    try {
      const res = await apiClient.get('/files/');
      files = res.data?.results || res.data || [];
    } catch (e) {
      console.warn('Failed to fetch files:', e.message);
    }

    const topicResources = {};

    if (files.length > 0) {
      files.forEach((file) => {
        const topic = file.topic_name || file.category || 'General Curriculum Resources';
        if (!topicResources[topic]) {
          topicResources[topic] = [];
        }
        topicResources[topic].push({
          id: file.id,
          title: file.name || file.title || 'Curriculum Document.pdf',
          type: file.extension?.toUpperCase() || 'PDF',
          size: file.size_display || '1.0 MB',
          url: file.file || file.url || '#'
        });
      });
    }

    return topicResources;
  },

  // Read recently taught lessons with Class, Stream, and Badge context
  async getRecentlyTaught() {
    const streams = await this.getMyStreams();
    const defaultStream = streams[0] || { school_class_name: '', stream_name: '' };
    const defaultClassName = defaultStream.school_class_name || '';
    const defaultStreamName = defaultStream.stream_name || '';

    const recent = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vlearn_lesson_progress_')) {
          const topicId = key.replace('vlearn_lesson_progress_', '');
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.lessonTitle) {
            recent.push({
              topicId,
              lessonId: data.lessonId || topicId,
              lessonTitle: data.lessonTitle,
              topicName: data.topicName || '',
              subjectName: data.subjectName || '',
              className: data.className || defaultClassName,
              streamName: data.streamName || defaultStreamName,
              isSchoolLesson: data.isSchoolLesson !== undefined ? data.isSchoolLesson : true,
              updatedAt: data.lastUpdated || new Date().toISOString(),
              timeAgo: 'Recently'
            });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse recent modules:', e);
    }

    return recent.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  // Backward compatibility alias
  async getRecentTeachingModules() {
    return this.getRecentlyTaught();
  },

  // Teaching Notes (Private lesson-level notes)
  getTeachingNotes(lessonId) {
    try {
      const raw = localStorage.getItem(`vlearn_teacher_notes_${lessonId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read teaching notes:', e);
    }
    return [];
  },

  saveTeachingNote(lessonId, noteText, category = 'reminders') {
    try {
      const current = this.getTeachingNotes(lessonId);
      const newNote = {
        id: Date.now(),
        text: noteText,
        category: category,
        date: 'Just now'
      };
      const updated = [newNote, ...current];
      localStorage.setItem(`vlearn_teacher_notes_${lessonId}`, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to save note:', e);
      return [];
    }
  },

  deleteTeachingNote(lessonId, noteId) {
    try {
      const current = this.getTeachingNotes(lessonId);
      const updated = current.filter(n => n.id !== noteId);
      localStorage.setItem(`vlearn_teacher_notes_${lessonId}`, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to delete note:', e);
      return [];
    }
  }
};

export default teacherCurriculumService;
