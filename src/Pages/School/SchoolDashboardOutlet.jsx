import { Outlet, Navigate } from "react-router";
import SchoolAdminSideNav from "../../Components/School/SchoolAdminSideNav";
import { SchoolProvider, useSchoolContext } from "../../Context/SchoolContext";

function SchoolGate({ children }) {
  const { school, isLoading } = useSchoolContext();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-custom-blue/30 border-t-custom-blue rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!school) {
    return <Navigate to="/school-onboarding" replace />;
  }
  
  return children;
}

function SchoolDashboardOutlet() {
  return (
    <SchoolProvider>
      <SchoolGate>
        <div className="flex bg-gray-50 min-h-screen">
          <SchoolAdminSideNav />
          <main className="w-full md:ml-64 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <Outlet />
          </main>
        </div>
      </SchoolGate>
    </SchoolProvider>
  );
}

export default SchoolDashboardOutlet;
