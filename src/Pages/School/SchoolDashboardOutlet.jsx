import { Outlet } from "react-router";
import SchoolAdminSideNav from "../../Components/School/SchoolAdminSideNav";
import { SchoolProvider } from "../../Context/SchoolContext";

function SchoolDashboardOutlet() {
  return (
    <SchoolProvider>
      <div className="flex bg-gray-50 min-h-screen">
        <SchoolAdminSideNav />
        <main className="w-full md:ml-64 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </SchoolProvider>
  );
}

export default SchoolDashboardOutlet;
