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
  // Fetch teacher's organization memberships
  async getMyMemberships() {
    try {
      const response = await apiClient.get('/api/organizations/memberships/?user=me');
      const data = response.data?.results || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Failed to fetch teacher memberships:', error.message);
      return [];
    }
  },

  // Fetch assigned streams & rosters for teacher
  async getMyStreams() {
    try {
      const response = await apiClient.get('/api/organizations/teacher/my-streams/');
      const data = response.data?.results || response.data || [];
      return Array.isArray(data) ? data : [];
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
      const res = await apiClient.get(`/api/curriculum/lessons/?topic=${topicId}&page_size=100`);
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

  // Get experiments (Only applicable to Chemistry)
  async getExperiments(subjectName = '', topicName = '') {
    if (subjectName && !subjectName.toLowerCase().includes('chem')) {
      return [];
    }
    try {
      const params = {};
      if (subjectName) params.subject = subjectName;
      if (topicName) params.topic = topicName;
      const res = await apiClient.get('/experiment_videos/', { params });
      let fetched = res.data?.results || res.data || [];
      
      if (topicName && fetched.length > 0) {
        const tLower = topicName.toLowerCase();
        fetched = fetched.filter(v => {
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
      return fetched;
    } catch (e) {
      console.warn('Failed to fetch experiments:', e.message);
      return [];
    }
  },

  // Get simulations (Only applicable to Chemistry and Physics)
  async getSimulations(subjectName = '', topicName = '') {
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
      const res = await apiClient.get('/api/curriculum/simulations/', { params });
      let fetched = res.data?.results || res.data || [];
      
      if (topicName && fetched.length > 0) {
        const tLower = topicName.toLowerCase();
        fetched = fetched.filter(s => {
          const simTopic = (s.topic || '').toLowerCase();
          const simTitle = (s.title || '').toLowerCase();
          if (tLower.includes('acid') || tLower.includes('base') || tLower.includes('salt')) return simTopic.includes('acid') || simTitle.includes('acid') || simTitle.includes('solubility');
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

  // ==========================================
  // Production Teacher Workspace Endpoints
  // ==========================================

  // 1. Teacher Home / Dashboard
  async getTeacherDashboard() {
    try {
      const res = await apiClient.get('/api/organizations/teacher/dashboard/');
      return res.data;
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
      throw err;
    }
  },

  // 2. My Teaching Workspace (Curriculum grouped by Subject & Class)
  async getTeachingWorkspace() {
    try {
      const res = await apiClient.get('/api/organizations/teacher/workspace/');
      return res.data;
    } catch (err) {
      console.error('Failed to load teaching workspace:', err);
      throw err;
    }
  },

  // 3. Topic Teaching Facilitation Command Center
  async getTopicWorkspace(streamId, subjectId, topicId) {
    try {
      const res = await apiClient.get(`/api/organizations/teacher/topic-workspace/${streamId}/${subjectId}/${topicId}/`);
      return res.data;
    } catch (err) {
      console.error('Failed to load topic workspace:', err);
      throw err;
    }
  },

  // 4. Save Facilitation Progress & Persistent Notes
  async saveTeachingLog(logData) {
    try {
      const res = await apiClient.post('/api/organizations/teacher/teaching-logs/', logData);
      return res.data;
    } catch (err) {
      console.error('Failed to save teaching log:', err);
      throw err;
    }
  },

  // 5. My Class (Supervised Stream & Students)
  async getMyClassDetails(streamId = null) {
    try {
      const url = streamId
        ? `/api/organizations/teacher/my-class/?stream_id=${streamId}`
        : '/api/organizations/teacher/my-class/';
      const res = await apiClient.get(url);
      return res.data;
    } catch (err) {
      console.error('Failed to load class details:', err);
      throw err;
    }
  },

  // 6. Teacher Performance (Subject and Supervised Stream)
  async getTeacherPerformance() {
    try {
      const res = await apiClient.get('/api/organizations/teacher/performance/');
      return res.data;
    } catch (err) {
      console.error('Failed to load teacher performance:', err);
      throw err;
    }
  },

  // Backward compatibility alias for recently taught
  async getRecentlyTaught(userId = 'anonymous') {
    try {
      const dash = await this.getTeacherDashboard();
      if (dash?.recently_taught && dash.recently_taught.length > 0) {
        return dash.recently_taught.map(r => ({
          ...r,
          topicId: r.topic_id,
          lessonId: r.lesson_id || r.topic_id,
          lessonTitle: r.lesson_title || r.topic_name,
          topicName: r.topic_name,
          subjectName: r.subject_name,
          className: r.form_name,
          streamName: r.stream_name,
          isSchoolLesson: true,
          updatedAt: r.last_taught_at,
          timeAgo: r.time_ago
        }));
      }
    } catch {
      // Fall through to local fallback
    }
    return [];
  },

  async getRecentTeachingModules() {
    return this.getRecentlyTaught();
  }
};

export default teacherCurriculumService;
