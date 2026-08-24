import React from 'react';
import { 
  Building2, 
  Users, 
  Layers, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  UserCheck, 
  AlertCircle,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Award
} from 'lucide-react';

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

const ReviewStep = ({ wizardData, setStep }) => {
  const { 
    schoolProfile = {}, 
    subjects = [], 
    teachers = [], 
    formsStreams = {}, 
    students = {}, 
    teacherAssignments = {}, 
    examConfig = {} 
  } = wizardData || {};

  const formsList = formsStreams?.forms || Object.keys(formsStreams?.streams || {});
  const streamsMap = formsStreams?.streams || formsStreams || {};
  const totalStreamsCount = Object.values(streamsMap).reduce(
    (acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0
  );

  const resolvedSubjects = subjects.map(s => SUBJECT_MAP[s] || s);
  const byTeacherMap = teacherAssignments?.byTeacher || {};
  const classTeachersMap = teacherAssignments?.classTeachers || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black font-heading text-navy">Review & Activate School</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review all configured school information, staff roster, academic structure, and teaching responsibilities before going live.
        </p>
      </div>

      {/* 1. School Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-navy text-base">School Profile</h3>
              <p className="text-xs text-slate-400 font-semibold">Authoritative institutional registration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">School Name</span>
            <span className="font-black text-navy text-sm">{schoolProfile.name || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">School Code / Reg</span>
            <span className="font-mono font-bold text-slate-700">{schoolProfile.code || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Type & Curriculum</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 bg-slate-100 text-navy font-bold rounded">
                {schoolProfile.type || 'Standard'}
              </span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary font-black rounded">
                {schoolProfile.curriculum || '8-4-4'}
              </span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Location</span>
            <span className="font-bold text-slate-700">
              {[schoolProfile.subCounty, schoolProfile.county].filter(Boolean).join(', ') || '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">School Contact</span>
            <span className="font-bold text-slate-700">
              {[schoolProfile.phone, schoolProfile.email].filter(Boolean).join(' • ') || '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Administrator</span>
            <span className="font-bold text-slate-700">
              {schoolProfile.adminName || 'Admin'} {schoolProfile.adminPhone ? `(${schoolProfile.adminPhone})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Teachers Roster Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-navy text-base">
                Teaching Staff Roster ({teachers.length})
              </h3>
              <p className="text-xs text-slate-400 font-semibold">Registered staff members</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Teachers
          </button>
        </div>

        {teachers.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No teachers added yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {teachers.map((t, idx) => (
              <div key={t.id || idx} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-navy text-sm">{t.name}</span>
                    {t.tsc_number && (
                      <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {t.tsc_number}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {t.phone} {t.email ? `• ${t.email}` : ''}
                  </p>
                </div>

                {t.specialties && (
                  <div className="flex flex-wrap gap-1">
                    {(typeof t.specialties === 'string' ? t.specialties.split(',') : t.specialties).map((sp, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary font-bold text-[10px] rounded-md">
                        {sp.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Academic Structure Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-navy text-base">
                Academic Structure ({formsList.length} Levels, {totalStreamsCount} Streams)
              </h3>
              <p className="text-xs text-slate-400 font-semibold">Configured forms, grades, and streams</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Structure
          </button>
        </div>

        {formsList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No academic structure configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formsList.map(formName => {
              const streamList = streamsMap[formName] || [];
              return (
                <div key={formName} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-navy text-xs uppercase tracking-wider font-heading">
                      {formName}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {streamList.length} {streamList.length === 1 ? 'stream' : 'streams'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {streamList.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No streams</span>
                    ) : (
                      streamList.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-navy shadow-2xs">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Teaching Setup (Responsibilities) Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-custom-blue/10 text-custom-blue flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-navy text-base">Teaching Setup</h3>
              <p className="text-xs text-slate-400 font-semibold">Teacher responsibilities and class teacher assignments</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep(6)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Teaching Setup
          </button>
        </div>

        {/* Teacher Assignments Summary */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
            Subject & Stream Responsibilities
          </label>

          {teachers.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No teachers configured.</p>
          ) : Object.keys(byTeacherMap).length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
              Teaching responsibilities can be configured in Step 6 or updated anytime in Settings after setup.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(byTeacherMap).map(([tId, tData]) => {
                const subjs = tData.subjects || {};
                const subjEntries = Object.entries(subjs).filter(([_, streams]) => streams && streams.length > 0);

                if (subjEntries.length === 0) return null;

                return (
                  <div key={tId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <h4 className="font-black text-navy text-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {tData.teacherName}
                    </h4>

                    <div className="space-y-1.5 pl-4 border-l-2 border-slate-200">
                      {subjEntries.map(([subjName, streamNames]) => (
                        <div key={subjName} className="text-xs space-y-0.5">
                          <span className="font-bold text-slate-700">{subjName}:</span>
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {streamNames.map((st, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-navy">
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Supervised Streams (Class Teachers) Summary */}
        {Object.keys(classTeachersMap).length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              Designated Class Teachers
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(classTeachersMap).map((ct, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-navy flex items-center gap-1.5">
                  <span className="text-slate-500 font-semibold">{ct.formName} {ct.streamName}:</span>
                  <span className="text-primary">{ct.teacherName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Exam Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-navy text-base">
                Examination Setup ({examConfig.count || '3'} per term)
              </h3>
              <p className="text-xs text-slate-400 font-semibold">Configured term examinations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep(7)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Exams
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(examConfig.names || ['Opening Exam', 'Mid-Term Exam', 'Closing Exam']).map((name, i) => (
            <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-navy">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;

