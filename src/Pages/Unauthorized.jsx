import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import UserContext from "../Context/UserContext";
import { Lock, Home, LayoutDashboard } from "lucide-react";

function Unauthorized() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "teacher": return "/teacher";
      case "school_admin": return "/school";
      case "platform_admin": return "/admin-dashboard";
      case "student":
      default: return "/student";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl shadow-xl">
        
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <Lock className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        <div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Access Denied</h2>
          <p className="mt-4 text-gray-600 text-sm">
            You don&apos;t have permission to access this page.
          </p>
          {user && (
            <p className="mt-2 text-gray-500 text-sm bg-gray-100 p-2 rounded-lg inline-block">
              Current Role: <span className="font-semibold text-custom-blue">{user.role}</span>
            </p>
          )}
        </div>

        <div className="pt-6 flex flex-col space-y-4">
          <button
            onClick={() => navigate(getDashboardRoute())}
            className="flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-3xl text-white bg-custom-blue hover:bg-custom-orange transition-colors"
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Go to My Dashboard
          </button>
          
          <Link
            to="/"
            className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-sm font-medium rounded-3xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Home className="mr-2 h-5 w-5 text-gray-400" />
            Go Home
          </Link>
        </div>
        
      </div>
    </div>
  );
}

export default Unauthorized;
