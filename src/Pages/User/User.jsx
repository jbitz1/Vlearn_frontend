import { useEffect, useState, useContext } from 'react';
import { User as UserIcon, CreditCard, Clock, Settings, Building2 } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import { useNavigate } from "react-router";
import studentCurriculumService from '../../services/studentCurriculumService';
import studentOnboardingService from '../../services/studentOnboardingService';
import apiClient from '../../config/apiClient';
import SubscriptionList from '../../component-library/billing-and-payments/subscriptions/SubscriptionList';

export function User() {
  const { user: contextUser, token } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [schoolContext, setSchoolContext] = useState(null);
  const [recentModules, setRecentModules] = useState([]);
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token?.access) {
        navigate('/login');
        return;
      }
      setIsLoading(true);
      try {
        const [profileRes, school, onboardingState] = await Promise.all([
          apiClient.get('/profile/'),
          studentCurriculumService.getSchoolContext(),
          studentOnboardingService.getOnboardingState().catch(() => null),
        ]);
        setProfile(profileRes.data);
        setSchoolContext(school);
        setOnboardingData(onboardingState);
        setRecentModules(studentCurriculumService.getRecentLearningModules());
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [token, navigate]);

  return (
    <div className="pl-14 pr-4 py-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Profile Header */}
        <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs sm:shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-custom-blue text-white flex items-center justify-center font-black text-xl sm:text-2xl shrink-0">
                {contextUser?.username?.[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                    {profile?.first_name || profile?.last_name
                      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                      : contextUser?.username || 'Student Profile'}
                  </h1>
                  <span className="bg-blue-50 text-custom-blue text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    Student
                  </span>
                  {profile?.onboarding_complete !== undefined && (
                    <span
                      className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        profile.onboarding_complete
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      {profile.onboarding_complete ? 'Setup Complete' : 'Setup Incomplete'}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium mt-0.5">
                  @{contextUser?.username} • {contextUser?.email}
                </p>
              </div>
            </div>

            {profile?.date_joined && (
              <div className="text-[11px] sm:text-xs text-gray-400 font-semibold sm:text-right">
                Member since {new Date(profile.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 mt-6 sm:mt-8 gap-2 sm:gap-6 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { id: 'account', label: 'Account Overview', icon: UserIcon },
              { id: 'subscription', label: 'Subscription', icon: CreditCard },
              { id: 'history', label: 'Learning History', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all whitespace-nowrap min-h-[44px] cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-custom-blue text-custom-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="h-44 sm:h-48 bg-gray-200 rounded-2xl sm:rounded-3xl animate-pulse"></div>
        ) : (
          <div>
            {/* TAB 1: ACCOUNT */}
            {activeTab === 'account' && (
              <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs sm:shadow-sm space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Account & Academic Profile</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Preferred Username</span>
                    <p className="text-gray-900 font-bold text-sm sm:text-base mt-0.5">@{contextUser?.username}</p>
                  </div>

                  <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Email Address</span>
                    <p className="text-gray-900 font-bold text-sm sm:text-base mt-0.5 truncate">{contextUser?.email}</p>
                  </div>

                  {(profile?.first_name || profile?.last_name) && (
                    <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Full Name</span>
                      <p className="text-gray-900 font-bold text-sm sm:text-base mt-0.5">
                        {`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                      </p>
                    </div>
                  )}

                  {onboardingData?.profile?.curriculum_name && (
                    <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Curriculum</span>
                      <p className="text-gray-900 font-bold text-sm sm:text-base mt-0.5">{onboardingData.profile.curriculum_name}</p>
                    </div>
                  )}

                  {onboardingData?.profile?.grade_name && (
                    <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Grade / Level</span>
                      <p className="text-gray-900 font-bold text-sm sm:text-base mt-0.5">{onboardingData.profile.grade_name}</p>
                    </div>
                  )}

                  {(onboardingData?.profile?.verified_school_name || onboardingData?.profile?.unverified_school_name || schoolContext?.school_name) && (
                    <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">School / Institution</span>
                      <p className="text-gray-900 font-bold text-sm sm:text-base mt-0.5">
                        {onboardingData?.profile?.verified_school_name ||
                          onboardingData?.profile?.unverified_school_name ||
                          schoolContext?.school_name ||
                          'Independent Learner'}
                      </p>
                    </div>
                  )}

                  {onboardingData?.profile?.career_aspiration && (
                    <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Career Aspiration</span>
                      <p className="text-gray-900 font-bold text-sm sm:text-base mt-0.5">{onboardingData.profile.career_aspiration}</p>
                    </div>
                  )}

                  {schoolContext && (
                    <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl sm:col-span-2 lg:col-span-3 flex items-center gap-3">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-custom-blue shrink-0" />
                      <div>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Enrolled Class / Stream</span>
                        <p className="text-gray-900 font-bold text-xs sm:text-base">
                          {schoolContext.school_name} - {schoolContext.class_name} {schoolContext.stream_name || ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SUBSCRIPTION */}
            {activeTab === 'subscription' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs sm:shadow-sm">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">Current Plan</h2>
                      <p className="text-gray-500 text-xs sm:text-sm">Manage your platform subscription.</p>
                    </div>
                    <button
                      onClick={() => navigate('/subscription')}
                      className="px-4 py-2.5 bg-custom-blue text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-colors min-h-[44px]"
                    >
                      View Plans
                    </button>
                  </div>
                </div>
                
                <SubscriptionList />
              </div>
            )}

            {/* TAB 3: LEARNING HISTORY */}
            {activeTab === 'history' && (
              <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs sm:shadow-sm space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Learning History</h2>

                {recentModules.length > 0 ? (
                  <div className="space-y-3">
                    {recentModules.map((m) => (
                      <div key={m.lessonId} className="bg-gray-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs sm:text-sm text-gray-900 truncate">{m.lessonTitle}</div>
                          <div className="text-[11px] sm:text-xs text-gray-500 font-semibold truncate">{m.topicName || 'Curriculum Lesson'}</div>
                        </div>
                        <button
                          onClick={() => navigate(`/student/lesson-viewer/${m.topicId}?from=student`)}
                          className="px-3.5 py-2 bg-blue-50 text-custom-blue font-extrabold text-xs rounded-xl hover:bg-custom-blue hover:text-white transition-colors shrink-0 min-h-[36px] flex items-center"
                        >
                          Continue →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-gray-500">No learning history recorded yet.</div>
                )}
              </div>
            )}

            {/* TAB 4: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs sm:shadow-sm space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Settings</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="px-4 py-2.5 bg-gray-100 text-gray-800 font-bold text-xs sm:text-sm rounded-xl hover:bg-gray-200 transition-colors min-h-[44px]"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default User;