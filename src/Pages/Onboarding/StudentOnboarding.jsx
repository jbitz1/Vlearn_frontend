import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import UserContext from "../../Context/UserContext";
import apiClient from "../../config/apiClient";
import studentOnboardingService from "../../services/studentOnboardingService";
import { Check, Loader, ChevronRight, BookOpen, GraduationCap, School, Award, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function StudentOnboarding() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [curricula, setCurricula] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [verifiedSchools, setVerifiedSchools] = useState([]);

  // Form State
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(null);
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [schoolOption, setSchoolOption] = useState("NONE"); // VERIFIED, UNVERIFIED, NONE
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [unverifiedSchoolName, setUnverifiedSchoolName] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [prioritySubjectIds, setPrioritySubjectIds] = useState([]);
  const [baselines, setBaselines] = useState({}); // { subject_id: { raw_grade, target_grade, scheme } }

  // Loading & State Telemetry
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [maxSubjects, setMaxSubjects] = useState(8);
  const [maxPriorities, setMaxPriorities] = useState(3);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const initOnboarding = async () => {
      setFetchingData(true);
      try {
        const [currRes, schoolRes] = await Promise.all([
          apiClient.get('/api/curriculum/curricula/'),
          apiClient.get('/api/organizations/schools/')
        ]);
        setCurricula(currRes.data?.results || currRes.data || []);
        setVerifiedSchools(schoolRes.data?.results || schoolRes.data || []);

        const state = await studentOnboardingService.getOnboardingState();
        if (state.profile?.first_name) setFirstName(state.profile.first_name);
        if (state.profile?.last_name) setLastName(state.profile.last_name);
        if (state.profile?.curriculum_id) setSelectedCurriculumId(state.profile.curriculum_id);
        if (state.profile?.grade_id) setSelectedGradeId(state.profile.grade_id);
        if (state.selected_subject_ids?.length > 0) setSelectedSubjectIds(state.selected_subject_ids);
        if (state.priority_subject_ids?.length > 0) setPrioritySubjectIds(state.priority_subject_ids);
      } catch (err) {
        console.error("Failed to load initial onboarding data", err);
      } finally {
        setFetchingData(false);
      }
    };
    initOnboarding();
  }, []);

  // Fetch Grades when Curriculum changes
  useEffect(() => {
    if (selectedCurriculumId) {
      const fetchGrades = async () => {
        try {
          const selectedCurr = curricula.find(c => c.id === selectedCurriculumId);
          if (selectedCurr) {
            setMaxSubjects(selectedCurr.max_selectable_subjects || 8);
            setMaxPriorities(selectedCurr.max_priority_subjects || 3);
          }
          const res = await apiClient.get(`/api/curriculum/grades/?curriculum_id=${selectedCurriculumId}`);
          const gradeList = res.data?.results || res.data || [];
          setGrades(gradeList);
        } catch (err) {
          console.error("Failed to fetch grades", err);
        }
      };
      fetchGrades();
    } else {
      setGrades([]);
    }
  }, [selectedCurriculumId, curricula]);

  // Fetch Subjects when Grade changes
  useEffect(() => {
    if (selectedGradeId) {
      const fetchSubjects = async () => {
        try {
          const res = await apiClient.get(`/api/curriculum/subjects/?grade_id=${selectedGradeId}`);
          const subjectList = res.data?.results || res.data || [];
          setSubjects(subjectList);
        } catch (err) {
          console.error("Failed to fetch subjects", err);
        }
      };
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedGradeId]);

  const handleSubjectToggle = (subjectId) => {
    if (selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds(prev => prev.filter(id => id !== subjectId));
      setPrioritySubjectIds(prev => prev.filter(id => id !== subjectId));
    } else {
      if (selectedSubjectIds.length >= maxSubjects) {
        Swal.fire("Subject Limit Reached", `You can select a maximum of ${maxSubjects} subjects.`, "info");
        return;
      }
      setSelectedSubjectIds(prev => [...prev, subjectId]);
    }
  };

  const handlePriorityToggle = (subjectId) => {
    if (prioritySubjectIds.includes(subjectId)) {
      setPrioritySubjectIds(prev => prev.filter(id => id !== subjectId));
    } else {
      if (prioritySubjectIds.length >= maxPriorities) {
        Swal.fire("Priority Limit", `You can select a maximum of ${maxPriorities} help priority subjects.`, "info");
        return;
      }
      setPrioritySubjectIds(prev => [...prev, subjectId]);
    }
  };

  const handleNextStep = async () => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      if (step === 1) {
        await studentOnboardingService.saveStep(1, { first_name: firstName, last_name: lastName });
        setStep(2);
      } else if (step === 2) {
        if (!selectedCurriculumId || !selectedGradeId) {
          setErrorMsg("Please select both a curriculum and grade/form.");
          setIsLoading(false);
          return;
        }
        await studentOnboardingService.saveStep(2, { curriculum_id: selectedCurriculumId, grade_id: selectedGradeId });
        setStep(3);
      } else if (step === 3) {
        if (selectedSubjectIds.length === 0) {
          setErrorMsg("Please select at least one subject to study.");
          setIsLoading(false);
          return;
        }
        setStep(4);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to save step.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishMinimum = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await studentOnboardingService.completeMinimumOnboarding({
        curriculum_id: selectedCurriculumId,
        grade_id: selectedGradeId,
        selected_subject_ids: selectedSubjectIds,
        priority_subject_ids: prioritySubjectIds,
        school_id: schoolOption === "VERIFIED" ? selectedSchoolId : null,
        unverified_school_name: schoolOption === "UNVERIFIED" ? unverifiedSchoolName : null
      });

      // Optionally save initial baselines if filled
      const baselineArray = Object.entries(baselines).map(([subId, val]) => ({
        subject_id: parseInt(subId),
        raw_previous_grade: val.raw_grade || "B",
        target_grade: val.target_grade || "A",
        grading_scheme: val.scheme || "LETTER_GRADE"
      }));

      if (baselineArray.length > 0) {
        await studentOnboardingService.completeProgressiveOnboarding({ baselines: baselineArray });
      }

      Swal.fire({
        title: "Learning Profile Ready! 🎉",
        text: "Your curriculum, grade, and subjects are set. Select a subscription plan to start learning!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
      navigate("/subscription");
    } catch (err) {
      console.error(err);
      const msg = typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response.data.error) : (err.response?.data?.error || "Failed to complete onboarding.");
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex justify-between items-center mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <span>Step {step} of 4</span>
        <span>{step === 1 ? 'About You' : step === 2 ? 'Academic Level' : step === 3 ? 'Subjects' : 'Baseline'}</span>
      </div>
      <div className="flex space-x-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-custom-blue' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );

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

        {/* STEP 1: ABOUT THE STUDENT */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6 text-center">
            <div className="inline-flex p-4 bg-blue-100 text-custom-blue rounded-full mb-2">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Let&apos;s Build Your Learning Profile</h1>
            <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
              Welcome to VizLearn! Please verify your name so we can personalize your workspace.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-custom-blue focus:border-transparent transition"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-custom-blue focus:border-transparent transition"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className="px-8 py-3 bg-custom-blue text-white font-semibold rounded-full hover:bg-custom-orange transition-all shadow-md flex items-center justify-center mx-auto"
              >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <>Continue <ChevronRight className="ml-2 w-5 h-5" /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CURRICULUM & GRADE & SCHOOL CONTEXT */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Select Curriculum & Grade</h2>
              <p className="text-gray-600 text-sm">Choose your curriculum to view available grades and form levels.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">1. Select Curriculum</label>
              <div className="grid grid-cols-2 gap-4">
                {curricula.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedCurriculumId(c.id); setSelectedGradeId(null); }}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all text-center ${selectedCurriculumId === c.id ? 'border-custom-orange bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-custom-blue'}`}
                  >
                    <BookOpen className="w-6 h-6 mx-auto mb-2 text-custom-blue" />
                    <h3 className="font-bold text-gray-800">{c.name}</h3>
                    <p className="text-xs text-gray-500">{c.description || 'Standard Kenya Curriculum'}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedCurriculumId && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">2. Select Grade / Form</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {grades.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGradeId(g.id)}
                      className={`cursor-pointer p-3 rounded-xl border-2 transition-all text-center ${selectedGradeId === g.id ? 'border-custom-blue bg-blue-50 shadow-sm font-bold' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <span className="text-sm text-gray-800">{g.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">3. School Context (Optional)</label>
              <select
                value={schoolOption}
                onChange={(e) => setSchoolOption(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-custom-blue mb-3"
              >
                <option value="NONE">Studying Independently / Not Listed</option>
                <option value="VERIFIED">Select Registered School</option>
                <option value="UNVERIFIED">Propose My School Name</option>
              </select>

              {schoolOption === "VERIFIED" && (
                <select
                  value={selectedSchoolId || ""}
                  onChange={(e) => setSelectedSchoolId(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-custom-blue"
                >
                  <option value="">-- Choose School --</option>
                  {verifiedSchools.map(sch => (
                    <option key={sch.id} value={sch.id}>{sch.name} ({sch.code})</option>
                  ))}
                </select>
              )}

              {schoolOption === "UNVERIFIED" && (
                <input
                  type="text"
                  value={unverifiedSchoolName}
                  onChange={(e) => setUnverifiedSchoolName(e.target.value)}
                  placeholder="Enter School Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-custom-blue"
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50">Back</button>
              <button
                onClick={handleNextStep}
                disabled={!selectedGradeId || isLoading}
                className={`px-8 py-3 rounded-full text-white font-semibold flex items-center ${!selectedGradeId ? 'bg-gray-300 cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-orange shadow-md'}`}
              >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <>Next <ChevronRight className="ml-2 w-5 h-5" /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUBJECT SELECTION & HELP PRIORITIES */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Select Your Subjects & Help Priorities</h2>
              <p className="text-gray-600 text-sm">Select up to {maxSubjects} subjects studied, and star up to {maxPriorities} subjects for extra support.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
              {subjects.map((sub) => {
                const isSelected = selectedSubjectIds.includes(sub.id);
                const isPriority = prioritySubjectIds.includes(sub.id);
                return (
                  <div
                    key={sub.id}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all ${isSelected ? 'border-custom-blue bg-blue-50/50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => handleSubjectToggle(sub.id)}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-custom-blue border-custom-blue text-white' : 'border-gray-300'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{sub.name}</span>
                    </div>

                    {isSelected && (
                      <button
                        onClick={() => handlePriorityToggle(sub.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition ${isPriority ? 'bg-orange-500 text-white border-orange-500 font-bold' : 'text-gray-500 border-gray-300 hover:border-orange-400'}`}
                      >
                        {isPriority ? '★ Priority' : '+ Need Help'}
                      </button>
                    )}
                  </div>
                );
              })}
              {subjects.length === 0 && <p className="text-center col-span-2 text-gray-500 py-6">No subjects found for this grade.</p>}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button onClick={() => setStep(2)} className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50">Back</button>
              <button
                onClick={handleNextStep}
                disabled={selectedSubjectIds.length === 0 || isLoading}
                className={`px-8 py-3 rounded-full text-white font-semibold flex items-center ${selectedSubjectIds.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-orange shadow-md'}`}
              >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <>Next <ChevronRight className="ml-2 w-5 h-5" /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: BASELINE & FINISH */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-full mb-2">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Academic Baseline (Optional)</h2>
              <p className="text-gray-600 text-sm">Enter your last-term grade and current term target to track growth.</p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto p-1">
              {selectedSubjectIds.map((subId) => {
                const subObj = subjects.find(s => s.id === subId);
                const subName = subObj ? subObj.name : `Subject #${subId}`;
                const entry = baselines[subId] || { raw_grade: "B", target_grade: "A", scheme: "LETTER_GRADE" };

                return (
                  <div key={subId} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="font-semibold text-sm text-gray-800 w-full sm:w-1/3">{subName}</span>
                    <div className="flex items-center space-x-2 w-full sm:w-2/3 justify-end">
                      <input
                        type="text"
                        placeholder="Last Grade (e.g. B+)"
                        value={entry.raw_grade}
                        onChange={(e) => setBaselines(prev => ({ ...prev, [subId]: { ...entry, raw_grade: e.target.value } }))}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 w-1/2"
                      />
                      <input
                        type="text"
                        placeholder="Target (e.g. A)"
                        value={entry.target_grade}
                        onChange={(e) => setBaselines(prev => ({ ...prev, [subId]: { ...entry, target_grade: e.target.value } }))}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 w-1/2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button onClick={() => setStep(3)} className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50">Back</button>
              <button
                onClick={handleFinishMinimum}
                disabled={isLoading}
                className="px-10 py-3.5 bg-custom-orange text-white font-bold rounded-full hover:bg-custom-blue shadow-lg transition-all flex items-center justify-center"
              >
                {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : "Complete Profile & Start"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
