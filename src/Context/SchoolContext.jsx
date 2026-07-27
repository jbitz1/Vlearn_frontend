import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import schoolAdminService from '../services/schoolAdminService';

const SchoolContext = createContext(null);

export const SchoolProvider = ({ children }) => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [activeAcademicYear, setActiveAcademicYear] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial school list and curriculum reference data
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedSchools, fetchedGrades, fetchedSubjects] = await Promise.all([
        schoolAdminService.fetchSchools(),
        schoolAdminService.fetchGrades().catch(() => []),
        schoolAdminService.fetchSubjects().catch(() => []),
      ]);

      setSchools(fetchedSchools);
      setGrades(fetchedGrades);
      setSubjects(fetchedSubjects);

      if (fetchedSchools.length > 0) {
        setSelectedSchool((prev) => {
          if (prev && fetchedSchools.some((s) => s.id === prev.id)) {
            return fetchedSchools.find((s) => s.id === prev.id);
          }
          return fetchedSchools[0];
        });
      } else {
        setSelectedSchool(null);
      }
    } catch (err) {
      console.error('Error loading school organization data:', err);
      setError('Failed to load school organization details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load selected school details whenever selectedSchool changes
  const refreshSchoolDetails = useCallback(async () => {
    if (!selectedSchool?.id) {
      setSubscription(null);
      setAcademicYears([]);
      setActiveAcademicYear(null);
      setTeachers([]);
      setPendingInvitations([]);
      setEnrollments([]);
      setClasses([]);
      setStreams([]);
      setTeacherAssignments([]);
      return;
    }

    try {
      const schoolId = selectedSchool.id;
      const [
        subData,
        yearsData,
        teachersData,
        invitesData,
        enrollmentsData,
        classesData,
        streamsData,
        assignmentsData,
      ] = await Promise.all([
        schoolAdminService.fetchSubscription(schoolId).catch(() => null),
        schoolAdminService.fetchAcademicYears(schoolId).catch(() => []),
        schoolAdminService.fetchTeachers(schoolId).catch(() => []),
        schoolAdminService.fetchPendingInvitations(schoolId).catch(() => []),
        schoolAdminService.fetchEnrollments(schoolId).catch(() => []),
        schoolAdminService.fetchClasses(schoolId).catch(() => []),
        schoolAdminService.fetchStreams(schoolId).catch(() => []),
        schoolAdminService.fetchTeacherAssignments(schoolId).catch(() => []),
      ]);

      setSubscription(subData);
      setAcademicYears(yearsData);
      const activeYr = yearsData.find((y) => y.is_current) || yearsData[0] || null;
      setActiveAcademicYear(activeYr);

      setTeachers(teachersData);
      setPendingInvitations(invitesData);
      setEnrollments(enrollmentsData);
      setClasses(classesData);
      setStreams(streamsData);
      setTeacherAssignments(assignmentsData);
    } catch (err) {
      console.error('Error refreshing school details:', err);
    }
  }, [selectedSchool?.id]);

  useEffect(() => {
    refreshSchoolDetails();
  }, [refreshSchoolDetails]);

  const selectSchool = (schoolId) => {
    const found = schools.find((s) => s.id === parseInt(schoolId));
    if (found) setSelectedSchool(found);
  };

  const refreshAll = async () => {
    await loadInitialData();
    await refreshSchoolDetails();
  };

  return (
    <SchoolContext.Provider
      value={{
        school: selectedSchool,
        schools,
        selectSchool,
        subscription,
        academicYears,
        activeAcademicYear,
        teachers,
        pendingInvitations,
        enrollments,
        classes,
        streams,
        teacherAssignments,
        grades,
        subjects,
        isLoading,
        error,
        refreshData: refreshSchoolDetails,
        refreshAll,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchoolContext = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchoolContext must be used within a SchoolProvider');
  }
  return context;
};

export default SchoolContext;
