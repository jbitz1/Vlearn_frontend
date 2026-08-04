import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import apiClient from "../../config/apiClient";
import studentOnboardingService from "../../services/studentOnboardingService";
import { AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

// Import sub-components
import AcademicContextStep from "./AcademicContextStep";
import SubjectsStep from "./SubjectsStep";
import ReviewStep from "./ReviewStep";

export default function StudentOnboarding() {
  const navigate = useNavigate();

  // Data fetching state
  const [curricula, setCurricula] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [verifiedSchools, setVerifiedSchools] = useState([]);
  
  const [fetchingData, setFetchingData] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Flow State
  const [step, setStep] = useState(1);
  const [maxSubjects, setMaxSubjects] = useState(8);

  // Form State
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(null);
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [schoolOption, setSchoolOption] = useState("NONE");
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [unverifiedSchoolName, setUnverifiedSchoolName] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);

  // 1. Initial Load: Fetch static lists & restore state
  useEffect(() => {
    const initOnboarding = async () => {
      setFetchingData(true);
      try {
        const [currRes, schoolRes] = await Promise.all([
          apiClient.get('/api/curriculum/curricula/'),
          apiClient.get('/api/organizations/schools/')
        ]);
        const loadedCurricula = currRes.data?.results || currRes.data || [];
        setCurricula(loadedCurricula);
        setVerifiedSchools(schoolRes.data?.results || schoolRes.data || []);

        // Restore state from backend
        const state = await studentOnboardingService.getOnboardingState();
        let restoredCurriculumId = null;
        let restoredGradeId = null;

        if (state.profile?.curriculum_id) {
          restoredCurriculumId = state.profile.curriculum_id;
          setSelectedCurriculumId(restoredCurriculumId);
        }
        if (state.profile?.grade_id) {
          restoredGradeId = state.profile.grade_id;
          setSelectedGradeId(restoredGradeId);
        }

        // Restore subjects and step from localStorage (draft)
        const draftStr = localStorage.getItem('vlearn_onboarding_draft');
        if (draftStr) {
          try {
            const draft = JSON.parse(draftStr);
            // Only restore draft subjects if curriculum and grade haven't changed server-side
            if (draft.curriculumId === restoredCurriculumId && draft.gradeId === restoredGradeId) {
              if (draft.subjects && draft.subjects.length > 0) {
                setSelectedSubjectIds(draft.subjects);
              }
              if (draft.step) {
                setStep(draft.step);
              }
            }
          } catch (e) {
            console.error("Failed to parse onboarding draft", e);
          }
        }

      } catch (err) {
        console.error("Failed to load initial onboarding data", err);
      } finally {
        setFetchingData(false);
      }
    };
    initOnboarding();
  }, []);

  // 2. Fetch Grades when Curriculum changes
  useEffect(() => {
    if (selectedCurriculumId) {
      const fetchGrades = async () => {
        setGradesLoading(true);
        try {
          const selectedCurr = curricula.find(c => c.id === selectedCurriculumId);
          if (selectedCurr) {
            setMaxSubjects(selectedCurr.max_selectable_subjects || 8);
          }
          const res = await apiClient.get(`/api/curriculum/grades/?curriculum=${selectedCurriculumId}`);
          setGrades(res.data?.results || res.data || []);
        } catch (err) {
          console.error("Failed to fetch grades", err);
        } finally {
          setGradesLoading(false);
        }
      };
      fetchGrades();
    } else {
      setGrades([]);
    }
  }, [selectedCurriculumId, curricula]);

  // 3. Fetch Subjects when Grade changes
  useEffect(() => {
    if (selectedGradeId) {
      const fetchSubjects = async () => {
        setSubjectsLoading(true);
        try {
          const res = await apiClient.get(`/api/curriculum/subjects/?grade=${selectedGradeId}`);
          setSubjects(res.data?.results || res.data || []);
        } catch (err) {
          console.error("Failed to fetch subjects", err);
        } finally {
          setSubjectsLoading(false);
        }
      };
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedGradeId]);

  // Handle Dependent State Clearing
  const handleCurriculumChange = (id) => {
    if (id !== selectedCurriculumId) {
      setSelectedCurriculumId(id);
      setSelectedGradeId(null);
      setSelectedSubjectIds([]);
      localStorage.removeItem('vlearn_onboarding_draft');
    }
  };

  const handleGradeChange = (id) => {
    if (id !== selectedGradeId) {
      setSelectedGradeId(id);
      setSelectedSubjectIds([]);
      localStorage.removeItem('vlearn_onboarding_draft');
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjectIds(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      }
      return [...prev, subjectId];
    });
  };

  const handleNextStep1 = async () => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      // Save progress to backend (step 2 maps to saving curriculum and grade in existing backend)
      await studentOnboardingService.saveStep(2, { 
        curriculum_id: selectedCurriculumId, 
        grade_id: selectedGradeId 
      });
      
      // Save draft to localStorage
      localStorage.setItem('vlearn_onboarding_draft', JSON.stringify({
        step: 2,
        curriculumId: selectedCurriculumId,
        gradeId: selectedGradeId,
        subjects: selectedSubjectIds
      }));
      
      setStep(2);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to save academic context.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep2 = () => {
    // Save subject progress to local storage
    localStorage.setItem('vlearn_onboarding_draft', JSON.stringify({
      step: 3,
      curriculumId: selectedCurriculumId,
      gradeId: selectedGradeId,
      subjects: selectedSubjectIds
    }));
    setStep(3);
  };

  const handleFinishMinimum = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await studentOnboardingService.completeMinimumOnboarding({
        curriculum_id: selectedCurriculumId,
        grade_id: selectedGradeId,
        selected_subject_ids: selectedSubjectIds,
        priority_subject_ids: [], // explicitly empty per new design
        school_id: schoolOption === "VERIFIED" ? selectedSchoolId : null,
        unverified_school_name: schoolOption === "UNVERIFIED" ? unverifiedSchoolName : null
      });

      // Clear draft on success
      localStorage.removeItem('vlearn_onboarding_draft');

      Swal.fire({
        title: "Learning Profile Ready!",
        text: "Your academic context has been set.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
      navigate("/subscription");
    } catch (err) {
      console.error(err);
      const msg = typeof err.response?.data?.error === 'object' 
        ? JSON.stringify(err.response.data.error) 
        : (err.response?.data?.error || "Failed to complete onboarding.");
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex justify-between items-center mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <span>Step {step} of 3</span>
        <span>{step === 1 ? 'Academic Context' : step === 2 ? 'Subjects' : 'Review'}</span>
      </div>
      <div className="flex space-x-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-custom-blue' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );

  // Computed data for review step
  const schoolName = schoolOption === 'VERIFIED' 
    ? verifiedSchools.find(s => s.id === selectedSchoolId)?.name 
    : schoolOption === 'UNVERIFIED' 
      ? unverifiedSchoolName 
      : 'Studying Independently / Not Listed';
  
  const curriculumName = curricula.find(c => c.id === selectedCurriculumId)?.name || '';
  const gradeName = grades.find(g => g.id === selectedGradeId)?.name || '';
  const selectedSubjectsList = selectedSubjectIds.map(id => subjects.find(s => s.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100 relative overflow-hidden">
        
        <div className="flex justify-center mb-4">
          <img src="/images/vlearn_logo.png" alt="VLearn Logo" className="h-16 w-auto object-contain" />
        </div>

        {renderProgressBar()}

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl flex items-center space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 1 && (
          <AcademicContextStep 
            curricula={curricula}
            grades={grades}
            verifiedSchools={verifiedSchools}
            selectedCurriculumId={selectedCurriculumId}
            setSelectedCurriculumId={handleCurriculumChange}
            selectedGradeId={selectedGradeId}
            setSelectedGradeId={handleGradeChange}
            schoolOption={schoolOption}
            setSchoolOption={setSchoolOption}
            selectedSchoolId={selectedSchoolId}
            setSelectedSchoolId={setSelectedSchoolId}
            unverifiedSchoolName={unverifiedSchoolName}
            setUnverifiedSchoolName={setUnverifiedSchoolName}
            fetchingData={fetchingData}
            gradesLoading={gradesLoading}
            handleNextStep={handleNextStep1}
            isLoading={isLoading}
          />
        )}

        {step === 2 && (
          <SubjectsStep 
            subjects={subjects}
            selectedSubjectIds={selectedSubjectIds}
            handleSubjectToggle={handleSubjectToggle}
            maxSubjects={maxSubjects}
            setStep={setStep}
            handleNextStep={handleNextStep2}
            isLoading={isLoading}
            subjectsLoading={subjectsLoading}
          />
        )}

        {step === 3 && (
          <ReviewStep 
            schoolName={schoolName}
            curriculumName={curriculumName}
            gradeName={gradeName}
            selectedSubjects={selectedSubjectsList}
            setStep={setStep}
            handleFinish={handleFinishMinimum}
            isLoading={isLoading}
          />
        )}

      </div>
    </div>
  );
}
