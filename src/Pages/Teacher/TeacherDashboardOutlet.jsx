import { Outlet } from "react-router";
import TeacherSideNav from "../../Components/Teacher/TeacherSideNav";

function TeacherDashboardOutlet() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <TeacherSideNav />
      <main className="md:ml-64 w-full p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default TeacherDashboardOutlet;
