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
    if (!token?.access || user?.role !== 'teacher') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch memberships first
      const mems = await teacherCurriculumService.getMyMemberships();
      setMemberships(mems);

      // Find an accepted or active membership
      const activeMem = mems.find(m => m.state === 'ACCEPTED' || m.state === 'ACTIVE');
      
      if (activeMem) {
        setActiveSchool({
          id: activeMem.school,
          name: activeMem.school_name || `School #${activeMem.school}`
        });

        // 2. Fetch assignments only if attached to a school
        const [streams, subjects, recent] = await Promise.all([
          teacherCurriculumService.getMyStreams(),
          teacherCurriculumService.getTeacherSubjects(),
          teacherCurriculumService.getRecentlyTaught()
        ]);
        
        setAssignedStreams(streams);
        setAssignedSubjects(subjects);
        setRecentActivity(recent);
        
        // If the membership didn't have school_name populated but the stream does, we can enrich it
        if (!activeMem.school_name && streams.length > 0 && streams[0].school_name) {
          setActiveSchool({
            id: activeMem.school,
            name: streams[0].school_name
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
