import { useContext } from "react";
import { Navigate } from "react-router";
import SchoolLayout from "../../Components/School/SchoolLayout";
import { SchoolProvider, useSchoolContext } from "../../Context/SchoolContext";
import UserContext from "../../Context/UserContext";

function SchoolGate({ children }) {
  const { school, isLoading } = useSchoolContext();
  const { user } = useContext(UserContext) || {};
  const isPlatformAdmin = user?.role === 'platform_admin' || user?.is_superuser;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!school && !isPlatformAdmin) {
    return <Navigate to="/school-onboarding" replace />;
  }
  
  return children;
}

function SchoolDashboardOutlet() {
  return (
    <SchoolProvider>
      <SchoolGate>
        <SchoolLayout />
      </SchoolGate>
    </SchoolProvider>
  );
}

export default SchoolDashboardOutlet;
