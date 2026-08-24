import { useContext } from "react";
import TeacherLayout from "../../Components/Teacher/TeacherLayout";
import { TeacherProvider } from "../../Context/TeacherContext";
import TeacherContext from "../../Context/TeacherContext";
import TeacherWelcome from "./TeacherWelcome";
import { Loader2 } from "lucide-react";
import SubscriptionRestricted from "../../component-library/billing-and-payments/subscriptions/SubscriptionRestricted";

function TeacherGate() {
  const { activeSchool, isLoading } = useContext(TeacherContext);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-slate-500 font-medium text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // If no school membership, show Welcome screen instead of the dashboard layout
  if (!activeSchool) {
    return <TeacherWelcome />;
  }

  return (
    <TeacherLayout />
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
