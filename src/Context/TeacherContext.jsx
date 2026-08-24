import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import teacherCurriculumService from '../services/teacherCurriculumService';
import UserContext from './UserContext';

const TeacherContext = createContext(null);

export const TeacherProvider = ({ children }) => {
  const { user, token } = useContext(UserContext);

  const [memberships, setMemberships] = useState([]);
  const [activeSchool, setActiveSchool] = useState(null);
  const [assignedStreams, setAssignedStreams] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    const isPlatformAdmin = user?.role === 'platform_admin' || user?.is_superuser;
    const isSchoolAdmin = user?.role === 'school_admin';
    const isTeacher = user?.role === 'teacher';

    if (!token?.access || (!isTeacher && !isSchoolAdmin && !isPlatformAdmin)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch memberships first
      const mems = await teacherCurriculumService.getMyMemberships().catch(() => []);
      const memsList = Array.isArray(mems) ? mems : (mems?.results || []);
      setMemberships(memsList);

      // Find an accepted or active membership
      const activeMem = memsList.find(m => m.state === 'ACCEPTED' || m.state === 'ACTIVE');
      
      if (activeMem) {
        setActiveSchool({
          id: activeMem.school,
          name: activeMem.school_name || `School #${activeMem.school}`
        });

        // 2. Fetch assignments only if attached to a school
        const [streams, subjects, recent] = await Promise.all([
          teacherCurriculumService.getMyStreams().catch(() => []),
          teacherCurriculumService.getTeacherSubjects().catch(() => []),
          teacherCurriculumService.getRecentlyTaught().catch(() => [])
        ]);
        
        const validStreams = Array.isArray(streams) ? streams : (streams?.results || []);
        const validSubjects = Array.isArray(subjects) ? subjects : (subjects?.results || []);
        const validRecent = Array.isArray(recent) ? recent : (recent?.results || []);

        setAssignedStreams(validStreams);
        setAssignedSubjects(validSubjects);
        setRecentActivity(validRecent);
        
        if (!activeMem.school_name && validStreams.length > 0 && validStreams[0].school_name) {
          setActiveSchool({
            id: activeMem.school,
            name: validStreams[0].school_name
          });
        }
      } else {
        setActiveSchool(null);
        setAssignedStreams([]);
        setAssignedSubjects([]);
        setRecentActivity([]);
      }
    } catch (err) {
      console.error('Failed to load teacher context data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const value = {
    teacher: user,
    memberships,
    activeSchool,
    assignedStreams,
    assignedSubjects,
    recentActivity,
    isLoading,
    error,
    refresh: loadData
  };

  return (
    <TeacherContext.Provider value={value}>
      {children}
    </TeacherContext.Provider>
  );
};

export default TeacherContext;
