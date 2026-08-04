import { useContext } from 'react';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import TeacherContext from '../../Context/TeacherContext';

export default function TeacherWelcome() {
  const { user, logout } = useContext(UserContext);
  const { refresh, isLoading } = useContext(TeacherContext);

  const teacherDisplayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'Teacher';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-custom-blue rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8" />
        </div>
        
        <div>
          <h1 className="text-2xl font-black text-gray-900">Welcome to VLearn, {teacherDisplayName}</h1>
          <p className="text-gray-600 mt-2">You're almost ready to start teaching.</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl text-sm text-gray-700 space-y-4">
          <p>
            You are not yet attached to a school. To access your dashboard, your school administrator needs to invite you.
          </p>
          <div className="space-y-2 text-left bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Check your email for an invitation.</li>
              <li>Click the invitation link to join.</li>
              <li>Return here to view your dashboard.</li>
            </ol>
          </div>
          <p className="text-gray-500 text-xs pt-2">
            Didn't receive an invitation? Please contact your administrator.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-custom-blue text-white rounded-full font-bold hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-full font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
