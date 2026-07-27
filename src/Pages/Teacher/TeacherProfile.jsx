import { useEffect, useState, useContext } from 'react';
import { User as UserIcon, BookOpen, Settings, Building2, Layers } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import { useNavigate } from "react-router";
import teacherCurriculumService from '../../services/teacherCurriculumService';
import apiClient from '../../config/apiClient';

export function TeacherProfile() {
  const { user: contextUser, token } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);
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
        const [profileRes, fetchedSubjects, fetchedStreams] = await Promise.all([
          apiClient.get('/profile/'),
          teacherCurriculumService.getAssignedSubjects(),
          teacherCurriculumService.getMyStreams()
        ]);
        setProfile(profileRes.data);
        setSubjects(fetchedSubjects);
        setStreams(fetchedStreams);
      } catch (err) {
        console.error('Failed to load teacher profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [token, navigate]);

  const schoolName = streams[0]?.school_name || 'School Workspace';

  return (
    <div className="space-y-8 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-custom-blue text-white flex items-center justify-center font-black text-2xl">
            {contextUser?.username?.[0]?.toUpperCase() || 'T'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900">{contextUser?.username || 'Teacher Profile'}</h1>
              <span className="bg-blue-50 text-custom-blue text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                Teacher
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">{contextUser?.email}</p>
          </div>
        </div>

        {/* Tabs Navigation (Account, Teaching Assignment, Settings) */}
        <div className="flex border-b border-gray-200 mt-8 gap-6 overflow-x-auto">
          {[
            { id: 'account', label: 'Account', icon: UserIcon },
            { id: 'assignment', label: 'Teaching Assignment', icon: BookOpen },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-extrabold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
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
                <div className="bg-gray-50 p-4 rounded-2xl md:col-span-2 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-custom-blue" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Institution</span>
                    <p className="text-gray-900 font-bold">{schoolName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEACHING ASSIGNMENT */}
          {activeTab === 'assignment' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Teaching Assignment</h2>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-custom-blue" />
                  <div>
                    <span className="text-xs font-bold text-custom-blue uppercase">School</span>
                    <p className="text-gray-900 font-bold">{schoolName}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-custom-blue" />
                    Assigned Subjects
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subjects.map((s) => (
                      <div key={s.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">{s.name}</span>
                        <span className="text-xs font-semibold text-gray-500">{s.grade_name || 'Curriculum'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-custom-blue" />
                    Assigned Streams
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {streams.map((st) => (
                      <div key={st.stream_id || st.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">
                          {st.school_class_name ? `${st.school_class_name} ${st.stream_name}` : st.stream_name}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">
                          {st.students?.length || 0} Students
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Settings</h2>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
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

export default TeacherProfile;
