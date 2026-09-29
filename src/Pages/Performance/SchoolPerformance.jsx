import React, { useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import SchoolContext from '../../Context/SchoolContext';
import { 
  BarChart3, 
  Award, 
  BookOpen, 
  Layers, 
  FileText, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Download, 
  Plus, 
  GraduationCap
} from 'lucide-react';
import BackButton from '../../Components/Common/BackButton';

export default function SchoolPerformance() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics'; // 'analytics' | 'kcse' | 'reports'

  const schoolContext = useContext(SchoolContext);
  const school = schoolContext?.school;
  const classes = schoolContext?.classes || [];
  const streams = schoolContext?.streams || [];
  const enrollments = schoolContext?.enrollments || [];

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const hasExams = false; // Baseline fresh state

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      <BackButton fallbackUrl="/school/dashboard" label="Back to Dashboard" className="mb-2" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-2xl border border-slate-200 p-5 gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">
            {school?.name || 'School'} Performance Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized academic intelligence, stream analytics, and national examination reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
            Academic Year {school?.academicYear || '2026'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold">
            {school?.currentTerm || 'Term 1'}
          </span>
        </div>
      </div>

      {/* 3 Dedicated Hub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => handleTabChange('analytics')}
          className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Stream & Form Analytics
        </button>

        <button
          onClick={() => handleTabChange('kcse')}
          className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'kcse'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Final Exams / KCSE
        </button>

        <button
          onClick={() => handleTabChange('reports')}
          className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'reports'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <FileText className="w-4 h-4" />
          Academic Reports
        </button>
      </div>

      {/* Tab 1: Stream & Form Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">School Average</div>
                <div className="text-2xl font-heading font-bold text-navy">{hasExams ? '64%' : 'N/A'}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {hasExams ? 'Assessment performance' : 'No exam records yet'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success-light text-success flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Top Performing Class</div>
                <div className="text-2xl font-heading font-bold text-navy">
                  {hasExams ? 'Form 4' : (classes[0]?.name || 'N/A')}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {hasExams ? 'Average: 71% (B+)' : 'Awaiting baseline exams'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Active Classes</div>
                <div className="text-2xl font-heading font-bold text-navy">{classes.length}</div>
                <div className="text-xs text-slate-400 mt-0.5">{streams.length} total streams</div>
              </div>
            </div>
          </div>

          {/* Form Performance Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-base font-heading font-bold text-navy mb-4">Forms & Classes Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {classes.map((cls, idx) => {
                const classStreams = streams.filter(s => s.school_class === cls.id);
                const classStudentCount = enrollments.filter(e => 
                  classStreams.some(st => st.id === e.stream)
                ).length;

                return (
                  <div
                    key={cls.id}
                    onClick={() => navigate(`/school/performance/form/${cls.id}`)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-primary hover:shadow-xs transition-all cursor-pointer group bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-lg bg-navy/10 text-navy font-bold text-xs flex items-center justify-center">
                        F{idx + 1}
                      </span>
                      <span className="text-xs text-primary font-bold group-hover:underline flex items-center gap-1">
                        Analytics <ArrowRight size={12} />
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-navy text-sm">{cls.name}</h3>
                    <div className="text-xs text-slate-500 mt-1 flex justify-between">
                      <span>{classStreams.length} streams</span>
                      <span>{classStudentCount} students</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stream Performance Overview Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-heading font-bold text-navy">Stream Analytics Breakdown</h2>
                <p className="text-xs text-slate-400 mt-0.5">Click any stream to inspect subject-level distribution</p>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{streams.length} Streams Active</span>
            </div>
            {streams.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No streams configured yet for this school.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="p-4">Stream Name</th>
                      <th className="p-4">Form</th>
                      <th className="p-4">Class Teacher</th>
                      <th className="p-4">Enrolled Students</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {streams.map((stream) => {
                      const parentClass = classes.find(c => c.id === stream.school_class);
                      const streamStudents = enrollments.filter(e => e.stream === stream.id).length;
                      return (
                        <tr key={stream.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-semibold text-navy font-heading">{stream.name}</td>
                          <td className="p-4 text-slate-600 text-xs">{parentClass?.name || 'Class'}</td>
                          <td className="p-4 text-slate-600 text-xs">
                            {stream.class_teacher_detail?.first_name 
                              ? `${stream.class_teacher_detail.first_name} ${stream.class_teacher_detail.last_name || ''}`
                              : <span className="text-slate-400 italic">Not assigned</span>
                            }
                          </td>
                          <td className="p-4 text-slate-600 text-xs">{streamStudents} students</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => navigate(`/school/performance/stream/${stream.id}`)}
                              className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer"
                            >
                              Stream View →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Final Exams / KCSE */}
      {activeTab === 'kcse' && (
        <div className="space-y-6">
          {/* KCSE Mean Score Trend Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-heading font-bold text-navy text-lg">KCSE Mean Score Trend (Last 4 Years)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Historical national examination benchmark</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Target 2026: 8.5 (B)</span>
              </div>
            </div>

            <div className="h-64 flex items-end gap-6 sm:gap-12 pb-8 border-b border-slate-100">
              {[
                { year: 2020, score: 6.2 },
                { year: 2021, score: 6.5 },
                { year: 2022, score: 7.1 },
                { year: 2023, score: 7.8, active: true },
              ].map((item) => (
                <div key={item.year} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="font-bold text-sm text-slate-600 group-hover:text-navy transition-colors">{item.score}</span>
                  <div 
                    className={`w-full max-w-[60px] rounded-t-xl transition-all ${item.active ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}
                    style={{ height: `${(item.score / 12) * 100}%` }}
                  />
                  <span className={`font-bold text-xs mt-2 ${item.active ? 'text-primary' : 'text-slate-400'}`}>{item.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-navy">Candidate Grade Breakdown</h3>
                <p className="text-xs text-slate-400 mt-0.5">Full grade distribution per graduating cohort</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Year</th>
                    <th className="p-4">Candidates</th>
                    <th className="p-4">Mean Grade</th>
                    <th className="p-4">Mean Pts</th>
                    <th className="p-4 text-emerald-600">A</th>
                    <th className="p-4 text-emerald-600">A-</th>
                    <th className="p-4 text-blue-600">B+</th>
                    <th className="p-4 text-blue-600">B</th>
                    <th className="p-4 text-blue-600">B-</th>
                    <th className="p-4 text-amber-600">C+</th>
                    <th className="p-4 text-amber-600">C</th>
                    <th className="p-4 text-amber-600">C-</th>
                    <th className="p-4 text-slate-600">D+</th>
                    <th className="p-4 text-slate-600">D</th>
                    <th className="p-4 text-slate-600">D-</th>
                    <th className="p-4 text-rose-600">E</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="bg-primary/5 font-semibold">
                    <td className="p-4 font-bold text-primary">2023</td>
                    <td className="p-4">120</td>
                    <td className="p-4 font-black text-navy">C+</td>
                    <td className="p-4 font-bold text-navy">7.8</td>
                    <td className="p-4 font-bold text-emerald-700">2</td>
                    <td className="p-4 font-bold text-emerald-700">5</td>
                    <td className="p-4">12</td>
                    <td className="p-4">18</td>
                    <td className="p-4">20</td>
                    <td className="p-4">25</td>
                    <td className="p-4">15</td>
                    <td className="p-4">10</td>
                    <td className="p-4">8</td>
                    <td className="p-4">3</td>
                    <td className="p-4">2</td>
                    <td className="p-4 text-rose-600">0</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600">2022</td>
                    <td className="p-4">115</td>
                    <td className="p-4 font-bold">C</td>
                    <td className="p-4">7.1</td>
                    <td className="p-4">1</td>
                    <td className="p-4">3</td>
                    <td className="p-4">10</td>
                    <td className="p-4">15</td>
                    <td className="p-4">18</td>
                    <td className="p-4">22</td>
                    <td className="p-4">20</td>
                    <td className="p-4">12</td>
                    <td className="p-4">9</td>
                    <td className="p-4">4</td>
                    <td className="p-4">1</td>
                    <td className="p-4 text-rose-600">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Academic Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-navy text-base">Term Performance Summary</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Comprehensive terminal report aggregating student assessment outcomes across all forms.
                </p>
              </div>
              <button
                onClick={() => alert('Term report generation will compile once assessment grades are finalized.')}
                className="w-full py-2.5 px-4 bg-primary text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Term Summary (PDF)
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-navy text-base">Subject Mastery Breakdown</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Subject-by-subject grade distribution and curriculum milestone completion analytics.
                </p>
              </div>
              <button
                onClick={() => alert('Subject breakdown export generated.')}
                className="w-full py-2.5 px-4 bg-navy text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-navy/90 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Subject Report
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-navy text-base">Student Report Cards</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bulk download terminal report cards ready for distribution to parents and guardians.
                </p>
              </div>
              <button
                onClick={() => alert('Bulk report card generation initiated.')}
                className="w-full py-2.5 px-4 bg-success text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-success/90 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Generate Report Cards
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
