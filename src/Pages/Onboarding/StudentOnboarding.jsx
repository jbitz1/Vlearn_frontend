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
  const [unverifiedSchoolName, setUnverifiedSchoolName] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [isHomeschooled, setIsHomeschooled] = useState(false);
  
  // Restored names for Review step bug fix
  const [restoredCurriculumName, setRestoredCurriculumName] = useState("");
  const [restoredGradeName, setRestoredGradeName] = useState("");

  // Auto-save Step 1 draft for school section
  useEffect(() => {
    if (step === 1) {
      const step1Draft = {
        isHomeschooled,
        unverifiedSchoolName,
        schoolOption
      };
      localStorage.setItem('vlearn_onboarding_step1_draft', JSON.stringify(step1Draft));
    }
  }, [isHomeschooled, unverifiedSchoolName, schoolOption, step]);

  // 1. Initial Load: Fetch static lists & restore state
  useEffect(() => {
    const initOnboarding = async () => {
      setFetchingData(true);
      try {
        const currRes = await apiClient.get('/api/curriculum/curricula/');
        const loadedCurricula = currRes.data?.results || currRes.data || [];
        setCurricula(loadedCurricula);

        // Restore state from backend
        const state = await studentOnboardingService.getOnboardingState();
        let restoredCurriculumId = null;
        let restoredGradeId = null;

        if (state.profile?.curriculum_id) {
          restoredCurriculumId = state.profile.curriculum_id;
          setSelectedCurriculumId(restoredCurriculumId);
          setRestoredCurriculumName(state.profile.curriculum_name || "");
        }
        if (state.profile?.grade_id) {
          restoredGradeId = state.profile.grade_id;
          setSelectedGradeId(restoredGradeId);
          setRestoredGradeName(state.profile.grade_name || "");
        }
        if (state.profile?.unverified_school_name) {
          setUnverifiedSchoolName(state.profile.unverified_school_name);
          setSchoolOption("UNVERIFIED");
        }

        // Restore subjects and step from localStorage (draft)
        const draftStr = localStorage.getItem('vlearn_onboarding_draft');
        if (draftStr) {
          try {
            const draft = JSON.parse(draftStr);
            // Only restore draft subjects if curriculum and grade haven't changed server-side
            if (String(draft.curriculumId) === String(restoredCurriculumId) && String(draft.gradeId) === String(restoredGradeId)) {
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
        
        // Restore Step 1 draft
        const step1DraftStr = localStorage.getItem('vlearn_onboarding_step1_draft');
        if (step1DraftStr) {
          try {
            const step1Draft = JSON.parse(step1DraftStr);
            setIsHomeschooled(step1Draft.isHomeschooled || false);
            setUnverifiedSchoolName(step1Draft.unverifiedSchoolName || "");
            setSchoolOption(step1Draft.schoolOption || "NONE");
          } catch (e) {
            console.error("Failed to parse step 1 draft", e);
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
    if (String(id) !== String(selectedCurriculumId)) {
      setSelectedCurriculumId(id);
      setSelectedGradeId(null);
      setSelectedSubjectIds([]);
      setRestoredCurriculumName("");
      setRestoredGradeName("");
      localStorage.removeItem('vlearn_onboarding_draft');
    }
  };

  const handleGradeChange = (id) => {
    if (String(id) !== String(selectedGradeId)) {
      setSelectedGradeId(id);
      setSelectedSubjectIds([]);
      setRestoredGradeName("");
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
        school_id: null,
        unverified_school_name: isHomeschooled ? null : (unverifiedSchoolName.trim() || null)
      });

      // Clear draft on success
      localStorage.removeItem('vlearn_onboarding_draft');
      localStorage.removeItem('vlearn_onboarding_step1_draft');

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
  const schoolName = isHomeschooled 
    ? 'Homeschooled / Home Learner'
    : unverifiedSchoolName.trim() 
      ? unverifiedSchoolName 
      : 'Studying Independently / Not Listed';
  
  const curriculumName = restoredCurriculumName || 
    (fetchingData ? 'Loading...' : (curricula.find(c => String(c.id) === String(selectedCurriculumId))?.name || 'Unknown'));
    
  const gradeName = restoredGradeName || 
    (gradesLoading ? 'Loading...' : (grades.find(g => String(g.id) === String(selectedGradeId))?.name || 'Unknown'));
    
  const selectedSubjectsList = selectedSubjectIds.map(id => subjects.find(s => String(s.id) === String(id))).filter(Boolean);

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
            selectedCurriculumId={selectedCurriculumId}
            setSelectedCurriculumId={handleCurriculumChange}
            selectedGradeId={selectedGradeId}
            setSelectedGradeId={handleGradeChange}
            schoolOption={schoolOption}
            setSchoolOption={setSchoolOption}
            unverifiedSchoolName={unverifiedSchoolName}
            setUnverifiedSchoolName={setUnverifiedSchoolName}
            isHomeschooled={isHomeschooled}
            setIsHomeschooled={setIsHomeschooled}
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
