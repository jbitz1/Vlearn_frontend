import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Check } from 'lucide-react';
import apiClient from '../../config/apiClient';

// Import Steps
import SchoolProfileStep from './steps/SchoolProfileStep';
import SubjectsStep from './steps/SubjectsStep';
import TeachersStep from './steps/TeachersStep';
import FormsStreamsStep from './steps/FormsStreamsStep';
import StudentsStep from './steps/StudentsStep';
import TeacherAssignmentsStep from './steps/TeacherAssignmentsStep';
import ExamSetupStep from './steps/ExamSetupStep';
import ReviewStep from './steps/ReviewStep';

const LOCAL_STORAGE_KEY = 'vlearn_school_setup_wizard';

const SUBJECT_MAP = {
  'mat': 'Mathematics',
  'eng': 'English',
  'kis': 'Kiswahili',
  'bio': 'Biology',
  'chem': 'Chemistry',
  'phy': 'Physics',
  'geo': 'Geography',
  'his': 'History & Government',
  'cre': 'Christian Religious Education',
  'agr': 'Agriculture',
  'bst': 'Business Studies',
  'comp': 'Computer Studies',
};

const STEPS = [
  { num: 1, label: 'Profile' },
  { num: 2, label: 'Subjects' },
  { num: 3, label: 'Teachers' },
  { num: 4, label: 'Structure' },
  { num: 5, label: 'Students' },
  { num: 6, label: 'Teaching Setup' },
  { num: 7, label: 'Exams' },
  { num: 8, label: 'Review' },
];

function formatSchoolType(val) {
  if (!val) return '';
  const map = {
    'NATIONAL': 'National School',
    'EXTRA_COUNTY': 'Extra County School',
    'COUNTY': 'County School',
    'SUB_COUNTY': 'Sub-County School',
    'PRIVATE': 'Private School',
    'INTERNATIONAL': 'International School'
  };
  return map[String(val).toUpperCase()] || val;
}

function formatCurriculum(val) {
  if (!val) return '';
  const map = {
    '8-4-4': '8-4-4',
    'CBC': 'CBC',
    'BOTH': 'Both'
  };
  return map[String(val).toUpperCase()] || val;
}

export default function SchoolOnboarding() {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  
  // Wizard State - starts with clean empty fields waiting for database hydration
  const [wizardData, setWizardData] = useState({
    schoolProfile: {
      id: null,
      name: '',
      code: '',
      type: '',
      curriculum: '',
      county: '',
      subCounty: '',
      phone: '',
      email: '',
      adminName: '',
      adminPhone: '',
      adminEmail: '',
      academicYear: '2026',
      currentTerm: 'Term 1'
    },
    subjects: [],
    teachers: [],
    formsStreams: {
      forms: [],
      streams: {}
    },
    students: {},
    teacherAssignments: {},
    examConfig: { count: '', names: [] }
  });

  // Load authoritative school record from backend on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch the authenticated user's actual school from the backend API
        const res = await apiClient.get('/api/organizations/schools/');
        const fetchedSchools = res.data?.results || res.data || [];
        const school = fetchedSchools.length > 0 ? fetchedSchools[0] : null;

        if (school) {
          setActiveSchoolId(school.id);
        }

        const authoritativeProfile = {
          id: school?.id || null,
          name: school?.name || '',
          code: school?.code || '',
          type: formatSchoolType(school?.school_type),
          curriculum: formatCurriculum(school?.curricula_offered),
          county: school?.location_county || '',
          subCounty: school?.location_subcounty || '',
          phone: school?.phone_number || '',
          email: school?.contact_email || '',
          adminName: school?.owner_detail?.first_name || '',
          adminPhone: school?.owner_detail?.phone_number || school?.owner_detail?.username || '',
          adminEmail: school?.owner_detail?.email || '',
          academicYear: '2026',
          currentTerm: 'Term 1'
        };

        // Check for local draft progress for non-registration steps
        const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
        let draftData = null;
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            draftData = parsed.wizardData;
            if (parsed.step) setCurrentStep(parsed.step);
          } catch (e) {
            console.error("Failed to parse local draft", e);
          }
        }

        setWizardData({
          // School profile is strictly populated from the backend database record
          schoolProfile: authoritativeProfile,
          // Wizard steps start empty unless the user entered draft data during this session
          subjects: draftData?.subjects || [],
          teachers: draftData?.teachers || [],
          formsStreams: draftData?.formsStreams || { forms: [], streams: {} },
          students: draftData?.students || {},
          teacherAssignments: draftData?.teacherAssignments || {},
          examConfig: draftData?.examConfig || { count: '3', names: ['Opening Exam', 'Mid-Term Exam', 'Closing Exam'] }
        });
      } catch (err) {
        console.error("Failed to load authoritative school profile from backend:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  // Save wizard draft on change
  useEffect(() => {
    if (isInitializing) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      step: currentStep,
      wizardData
    }));
  }, [currentStep, wizardData, isInitializing]);

  const updateSectionData = (section, data) => {
    setWizardData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleNext = () => {
    if (activeSchoolId && wizardData) {
      apiClient.post(`/api/organizations/schools/${activeSchoolId}/save-draft/`, {
        draft_data: wizardData
      }).catch(err => console.warn("Background draft sync error:", err));
    }
    if (currentStep < 8) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      if (activeSchoolId) {
        await apiClient.post(`/api/organizations/schools/${activeSchoolId}/save-draft/`, {
          draft_data: wizardData
        });
      }
    } catch (err) {
      console.warn("Saving draft to server failed, draft is preserved in local storage.");
    } finally {
      setIsSaving(false);
      navigate('/school/dashboard');
    }
  };

  const handleActivate = async () => {
    setIsSaving(true);
    try {
      if (activeSchoolId) {
        await apiClient.post(`/api/organizations/schools/${activeSchoolId}/save-draft/`, {
          draft_data: wizardData
        });
        await apiClient.patch(`/api/organizations/schools/${activeSchoolId}/`, {
          setup_status: 'PROFILE_COMPLETE'
        });
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      navigate('/school/dashboard');
    } catch (err) {
      console.warn("Error updating school setup:", err);
      navigate('/school/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading school setup details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Banner Header */}
      <header className="bg-navy text-white px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
              <GraduationCap size={18} />
            </div>
            <span className="font-bold font-heading text-sm sm:text-base tracking-tight truncate">
              VizLearn — School Setup
              {wizardData.schoolProfile.name ? ` · ${wizardData.schoolProfile.name}` : ''}
            </span>
          </div>
          <button
            onClick={handleSaveAndContinue}
            className="text-xs text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            {isSaving ? 'Saving...' : 'Save & continue later'}
          </button>
        </div>
      </header>

      {/* Horizontal Stepper Progress */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 overflow-x-auto shadow-sm">
        <div className="flex items-center justify-between min-w-max mx-auto max-w-5xl xl:max-w-6xl px-2">
          {STEPS.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => setCurrentStep(s.num)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-heading transition-colors ${
                  currentStep > s.num
                    ? 'bg-success text-white'
                    : currentStep === s.num
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {currentStep > s.num ? <Check size={12} /> : s.num}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${currentStep === s.num ? 'text-primary font-semibold' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 min-w-[12px] max-w-[48px] h-0.5 mb-4 mx-1 sm:mx-2 transition-colors ${currentStep > s.num ? 'bg-success' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Content */}
      <main className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 lg:p-10 transition-all">
          {currentStep === 1 && (
            <SchoolProfileStep 
              data={wizardData.schoolProfile} 
              updateData={(data) => updateSectionData('schoolProfile', data)} 
            />
          )}
          {currentStep === 2 && (
            <SubjectsStep 
              selectedSubjects={wizardData.subjects} 
              updateData={(data) => updateSectionData('subjects', data)} 
            />
          )}
          {currentStep === 3 && (
            <TeachersStep 
              teachers={wizardData.teachers} 
              schoolId={wizardData.schoolProfile.id}
              subjects={(wizardData.subjects && wizardData.subjects.length > 0)
                ? wizardData.subjects.map(sId => SUBJECT_MAP[sId] || sId)
                : Object.values(SUBJECT_MAP)}
              updateData={(data) => updateSectionData('teachers', data)} 
            />
          )}
          {currentStep === 4 && (
            <FormsStreamsStep 
              data={wizardData.formsStreams} 
              curriculum={wizardData.schoolProfile.curriculum}
              updateData={(data) => updateSectionData('formsStreams', data)} 
            />
          )}
          {currentStep === 5 && (
            <StudentsStep 
              formsAndStreams={wizardData.formsStreams}
              data={wizardData.students} 
              updateData={(data) => updateSectionData('students', data)} 
            />
          )}
          {currentStep === 6 && (
            <TeacherAssignmentsStep 
              data={wizardData.teacherAssignments}
              schoolId={wizardData.schoolProfile.id}
              subjects={(wizardData.subjects && wizardData.subjects.length > 0)
                ? wizardData.subjects.map(sId => SUBJECT_MAP[sId] || sId)
                : Object.values(SUBJECT_MAP)}
              teachers={wizardData.teachers}
              formsAndStreams={wizardData.formsStreams}
              updateData={(data) => updateSectionData('teacherAssignments', data)} 
            />
          )}
          {currentStep === 7 && (
            <ExamSetupStep 
              data={wizardData.examConfig} 
              updateData={(data) => updateSectionData('examConfig', data)} 
            />
          )}
          {currentStep === 8 && (
            <ReviewStep 
              wizardData={wizardData}
              setStep={setCurrentStep}
              onActivate={handleActivate}
            />
          )}

          {/* Embedded Card Footer Navigation */}
          <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : <div />}

            <div className="flex gap-3">
              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold font-heading hover:bg-navy-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold font-heading hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Activating...' : 'Activate School & Go to Dashboard →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
