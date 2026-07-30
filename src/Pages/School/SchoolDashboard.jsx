import React from 'react';
import { useNavigate } from 'react-router';
import { Layers, Users, UserCheck, CreditCard, ChevronRight, Clock, Building2, Calendar } from 'lucide-react';
import { useSchoolContext } from '../../Context/SchoolContext';
import PageHeader from '../../Components/School/PageHeader';

export function SchoolDashboard() {
  const navigate = useNavigate();
  const {
    school,
    activeAcademicYear,
    classes,
    streams,
    teachers,
    enrollments,
    isLoading,
  } = useSchoolContext();

  const activeStudentCount = enrollments.filter((e) => e.status === 'active').length;

  const quickActions = [
    {
      title: 'Manage Academic Structure',
      description: 'Configure academic years, classes, and streams',
      icon: Layers,
      path: '/school/academic-structure',
    },
    {
      title: 'Manage Teachers',
      description: 'Onboard faculty and assign subjects & streams',
      icon: Users,
      path: '/school/teachers',
    },
    {
      title: 'Manage Students',
      description: 'Manage student enrollments and stream placements',
      icon: UserCheck,
      path: '/school/students',
    },
    {
      title: 'Subscription',
      description: 'View current plan details and capacity limits',
      icon: CreditCard,
      path: '/school/subscription',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader title="Dashboard" />

      {/* School Header Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-black text-gray-900">
              {school?.name || 'School Institution'}
            </h2>
            {school?.code && (
              <span className="text-xs bg-blue-50 text-custom-blue font-extrabold px-3 py-1 rounded-full border border-blue-100 uppercase">
                {school.code}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span>{school?.contact_email || 'No contact email'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl text-custom-blue text-xs font-bold shrink-0">
          <Calendar className="w-4 h-4 text-custom-blue" />
          <span>Active Year: {activeAcademicYear?.name || activeAcademicYear?.year || 'Current Academic Term'}</span>
        </div>
      </div>

      {/* School Setup Checklist Card */}
      <div className="bg-gradient-to-r from-blue-900 to-custom-blue text-white rounded-3xl p-6 shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">School Setup & Onboarding Hub</h2>
            <p className="text-xs text-blue-200">Complete institutional setup tasks to unlock full classroom delivery & subscriptions.</p>
          </div>
          <span className="text-xs bg-orange-500 font-extrabold px-3 py-1 rounded-full uppercase">
            {school?.setup_status || 'PROFILE_COMPLETE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3 bg-white/10 rounded-2xl text-center border border-white/20">
            <span className="text-xs font-semibold block text-blue-200">1. Details</span>
            <span className="text-sm font-bold text-green-300">✓ Done</span>
          </div>
          <div onClick={() => navigate('/school/academic-structure')} className="p-3 bg-white/10 rounded-2xl text-center border border-white/20 cursor-pointer hover:bg-white/20 transition">
            <span className="text-xs font-semibold block text-blue-200">2. Streams</span>
            <span className={`text-sm font-bold ${streams.length > 0 ? 'text-green-300' : 'text-yellow-300'}`}>{streams.length > 0 ? '✓ Done' : '+ Add'}</span>
          </div>
          <div onClick={() => navigate('/school/teachers')} className="p-3 bg-white/10 rounded-2xl text-center border border-white/20 cursor-pointer hover:bg-white/20 transition">
            <span className="text-xs font-semibold block text-blue-200">3. Teachers</span>
            <span className={`text-sm font-bold ${teachers.length > 0 ? 'text-green-300' : 'text-yellow-300'}`}>{teachers.length > 0 ? '✓ Done' : '+ Invite'}</span>
          </div>
          <div onClick={() => navigate('/school/teachers')} className="p-3 bg-white/10 rounded-2xl text-center border border-white/20 cursor-pointer hover:bg-white/20 transition">
            <span className="text-xs font-semibold block text-blue-200">4. Assign</span>
            <span className="text-sm font-bold text-yellow-300">+ Assign</span>
          </div>
          <div onClick={() => navigate('/school/students')} className="p-3 bg-white/10 rounded-2xl text-center border border-white/20 cursor-pointer hover:bg-white/20 transition">
            <span className="text-xs font-semibold block text-blue-200">5. Students</span>
            <span className={`text-sm font-bold ${activeStudentCount > 0 ? 'text-green-300' : 'text-yellow-300'}`}>{activeStudentCount > 0 ? '✓ Done' : '+ Import'}</span>
          </div>
          <div onClick={() => navigate('/school/subscription')} className="p-3 bg-white/10 rounded-2xl text-center border border-white/20 cursor-pointer hover:bg-white/20 transition">
            <span className="text-xs font-semibold block text-blue-200">6. Subscriptions</span>
            <span className="text-sm font-bold text-yellow-300">View Plans</span>
          </div>
        </div>
      </div>

      {/* Organizational Facts */}
      <section>
        <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
          Organizational Overview
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase block">Classes</span>
              <span className="text-3xl font-black text-gray-900 mt-1 block">{classes.length}</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase block">Streams</span>
              <span className="text-3xl font-black text-gray-900 mt-1 block">{streams.length}</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase block">Teachers</span>
              <span className="text-3xl font-black text-gray-900 mt-1 block">{teachers.length}</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase block">Students</span>
              <span className="text-3xl font-black text-gray-900 mt-1 block">{activeStudentCount}</span>
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions (Navigational Cards) */}
      <section>
        <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
          Quick Navigation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <div
              key={i}
              onClick={() => navigate(action.path)}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{action.description}</p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-custom-blue group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-custom-blue" />
            Recent Activity
          </h2>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
            <div className="font-semibold text-gray-800">Academic structure configured</div>
            <div className="text-gray-400">Current Term</div>
          </div>
          <div className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
            <div className="font-semibold text-gray-800">Faculty roster updated</div>
            <div className="text-gray-400">Active</div>
          </div>
          <div className="flex items-center justify-between text-xs py-2">
            <div className="font-semibold text-gray-800">Student enrollment active</div>
            <div className="text-gray-400">Active</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SchoolDashboard;
