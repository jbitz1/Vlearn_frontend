import { Outlet, useLocation } from "react-router";
import { useContext } from "react";
import TeacherSideNav from "../../Components/Teacher/TeacherSideNav";
import { TeacherProvider } from "../../Context/TeacherContext";
import TeacherContext from "../../Context/TeacherContext";
import TeacherWelcome from "./TeacherWelcome";
import { Loader2 } from "lucide-react";
import SubscriptionRestricted from "../../component-library/billing-and-payments/subscriptions/SubscriptionRestricted";

function TeacherGate() {
  const { activeSchool, isLoading } = useContext(TeacherContext);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-custom-blue" />
          <p className="text-gray-500 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // If no school membership, show Welcome screen instead of the dashboard layout
  if (!activeSchool) {
    return <TeacherWelcome />;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <TeacherSideNav />
      <main className="md:ml-64 w-full p-4 md:p-8">
        <SubscriptionRestricted>
          <Outlet />
        </SubscriptionRestricted>
      </main>
    </div>
  );
}

function TeacherDashboardOutlet() {
  return (
    <TeacherProvider>
      <TeacherGate />
    </TeacherProvider>
  );
}

export default TeacherDashboardOutlet;
