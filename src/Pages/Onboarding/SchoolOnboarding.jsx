import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import SchoolInfoStep from './SchoolInfoStep';
import FirstStreamStep from './FirstStreamStep';
import SchoolReviewStep from './SchoolReviewStep';
import schoolAdminService from '../../services/schoolAdminService';
import { LogOut } from 'lucide-react';
import UserContext from '../../Context/UserContext';

const LOCAL_STORAGE_KEY = 'vlearn_school_onboarding_draft';

export default function SchoolOnboarding() {
  const navigate = useNavigate();
  const { logout } = useContext(UserContext);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Form Data
  const [schoolData, setSchoolData] = useState({
    name: '',
    code: '',
    location_county: '',
    location_subcounty: '',
    school_type: '',
    ownership_type: '',
    curricula_offered: ''
  });

  const [streamData, setStreamData] = useState({
    curriculumId: '',
    gradeId: '',
    name: '',
    numberOfStudents: ''
  });

  // Reference Data
  const [curricula, setCurricula] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loadingStates, setLoadingStates] = useState({ curricula: false, grades: false });

  // 1. Centralized Gating & Initialization
  useEffect(() => {
    const initializeOnboarding = async () => {
      try {
        // Check if school already exists on backend
        const schools = await schoolAdminService.fetchSchools();
        if (schools && schools.length > 0) {
          // School exists, skip onboarding and send to dashboard (dashboard handles subscription gate if needed)
          navigate('/school/dashboard', { replace: true });
          return;
        }

        // Restore from localStorage if backend has nothing
        const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.schoolData) setSchoolData(parsed.schoolData);
            if (parsed.streamData) setStreamData(parsed.streamData);
            if (parsed.step) setCurrentStep(parsed.step);
          } catch (e) {
            console.error("Failed to parse local draft", e);
          }
        }

        // Fetch Curricula
        setLoadingStates(prev => ({ ...prev, curricula: true }));
        const fetchedCurricula = await schoolAdminService.fetchCurricula();
        setCurricula(fetchedCurricula);
      } catch (err) {
        console.error("Initialization error:", err);
        setGlobalError("Failed to initialize setup. Please refresh the page.");
      } finally {
        setLoadingStates(prev => ({ ...prev, curricula: false }));
        setIsInitializing(false);
      }
    };

    initializeOnboarding();
  }, [navigate]);

  // Fetch grades whenever curriculum changes
  useEffect(() => {
    const fetchGradesForCurriculum = async () => {
      if (!streamData.curriculumId) {
        setGrades([]);
        return;
      }
      try {
        setLoadingStates(prev => ({ ...prev, grades: true }));
        const fetchedGrades = await schoolAdminService.fetchGrades(streamData.curriculumId);
        setGrades(fetchedGrades);
        
        // Clear grade if it's no longer in the list
        if (streamData.gradeId && !fetchedGrades.find(g => g.id.toString() === streamData.gradeId.toString())) {
           setStreamData(prev => ({ ...prev, gradeId: '' }));
        }
      } catch (err) {
        console.error("Failed to fetch grades", err);
      } finally {
        setLoadingStates(prev => ({ ...prev, grades: false }));
      }
    };

    fetchGradesForCurriculum();
  }, [streamData.curriculumId]);

  // Persist draft on every step change or data change
  useEffect(() => {
    if (isInitializing) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      step: currentStep,
      schoolData,
      streamData
    }));
  }, [currentStep, schoolData, streamData, isInitializing]);

  const handleSchoolDataChange = (field, value) => {
    setSchoolData(prev => ({ ...prev, [field]: value }));
  };

  const handleStreamDataChange = (field, value) => {
    setStreamData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const payload = {
        ...schoolData,
        first_stream: {
          curriculum_id: streamData.curriculumId,
          grade_id: streamData.gradeId,
          name: streamData.name,
          number_of_students: streamData.numberOfStudents ? parseInt(streamData.numberOfStudents, 10) : 0
        }
      };

      await schoolAdminService.submitSchoolOnboarding(payload);
      
      // Clear localStorage on success
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      // Navigate to subscription
      navigate('/school/subscription', { replace: true });
    } catch (err) {
      console.error("Submission failed:", err);
      const msg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.[0] || "Failed to create school profile.";
      setGlobalError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-custom-blue/30 border-t-custom-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-custom-blue rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl leading-none">V</span>
            </div>
            <span className="font-bold text-2xl text-gray-800 tracking-tight">VLearn</span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="h-2 flex">
            <div className={`h-full transition-all duration-500 ease-out ${currentStep >= 1 ? 'bg-custom-orange w-1/3' : 'bg-gray-100'}`} />
            <div className={`h-full transition-all duration-500 ease-out ${currentStep >= 2 ? 'bg-custom-orange w-1/3' : 'bg-gray-100'}`} />
            <div className={`h-full transition-all duration-500 ease-out ${currentStep >= 3 ? 'bg-custom-orange w-1/3' : 'bg-gray-100'}`} />
          </div>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1">{globalError}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          {currentStep === 1 && (
            <SchoolInfoStep 
              formData={schoolData}
              onChange={handleSchoolDataChange}
              onNext={() => setCurrentStep(2)}
            />
          )}
          
          {currentStep === 2 && (
            <FirstStreamStep 
              curricula={curricula}
              grades={grades}
              selectedCurriculumId={streamData.curriculumId}
              selectedGradeId={streamData.gradeId}
              streamName={streamData.name}
              numberOfStudents={streamData.numberOfStudents}
              onCurriculumChange={(val) => handleStreamDataChange('curriculumId', val)}
              onGradeChange={(val) => handleStreamDataChange('gradeId', val)}
              onStreamNameChange={(val) => handleStreamDataChange('name', val)}
              onStudentCountChange={(val) => handleStreamDataChange('numberOfStudents', val)}
              loadingStates={loadingStates}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <SchoolReviewStep 
              formData={schoolData}
              firstStreamData={streamData}
              curricula={curricula}
              grades={grades}
              onEditSchool={() => setCurrentStep(1)}
              onEditStream={() => setCurrentStep(2)}
              onConfirm={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

      </div>
    </div>
  );
}
