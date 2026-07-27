import { useEffect, useState, useContext } from 'react';
import { User as UserIcon, CreditCard, Clock, Settings, Building2 } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import { useNavigate } from "react-router";
import studentCurriculumService from '../../services/studentCurriculumService';
import apiClient from '../../config/apiClient';

export function User() {
  const { user: contextUser, token } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
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
        const [profileRes, school] = await Promise.all([
          apiClient.get('/profile/'),
          studentCurriculumService.getSchoolContext(),
        ]);
        setProfile(profileRes.data);
        setSchoolContext(school);
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Profile Header */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-custom-blue text-white flex items-center justify-center font-black text-2xl">
              {contextUser?.username?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900">{contextUser?.username || 'Student Profile'}</h1>
                <span className="bg-blue-50 text-custom-blue text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                  Student
                </span>
              </div>
              <p className="text-gray-500 text-sm font-medium">{contextUser?.email}</p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 mt-8 gap-6 overflow-x-auto">
            {[
              { id: 'account', label: 'Account', icon: UserIcon },
              { id: 'subscription', label: 'Subscription', icon: CreditCard },
              { id: 'history', label: 'Learning History', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-extrabold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-custom-blue text-custom-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="h-48 bg-gray-200 rounded-3xl animate-pulse"></div>
        ) : (
          <div>
            {/* TAB 1: ACCOUNT */}
            {activeTab === 'account' && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Account Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-gray-400 uppercase">Username</span>
                    <p className="text-gray-900 font-bold mt-1">{contextUser?.username}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                    <p className="text-gray-900 font-bold mt-1">{contextUser?.email}</p>
                  </div>
                  {schoolContext && (
                    <div className="bg-gray-50 p-4 rounded-2xl md:col-span-2 flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-custom-blue" />
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Enrolled Institution</span>
                        <p className="text-gray-900 font-bold">
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
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Current Plan</h2>
                    <p className="text-gray-500 text-sm">Manage your platform subscription.</p>
                  </div>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="px-5 py-2.5 bg-custom-blue text-white font-bold text-sm rounded-2xl hover:bg-blue-700 transition-colors"
                  >
                    View Plans
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: LEARNING HISTORY */}
            {activeTab === 'history' && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Learning History</h2>

                {recentModules.length > 0 ? (
                  <div className="space-y-3">
                    {recentModules.map((m) => (
                      <div key={m.lessonId} className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-900">{m.lessonTitle}</div>
                          <div className="text-xs text-gray-500 font-semibold">{m.topicName || 'Curriculum Lesson'}</div>
                        </div>
                        <button
                          onClick={() => navigate(`/lesson-viewer/${m.topicId}`)}
                          className="px-4 py-1.5 bg-blue-50 text-custom-blue font-extrabold text-xs rounded-xl hover:bg-custom-blue hover:text-white transition-colors"
                        >
                          Continue →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No learning history recorded yet.</div>
                )}
              </div>
            )}

            {/* TAB 4: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Settings</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="px-4 py-2 bg-gray-100 text-gray-800 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
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