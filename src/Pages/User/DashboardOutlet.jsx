import { Outlet } from "react-router";
import SideNav from "../../Components/User/SideNav";

function DashboardOutlet() {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <SideNav />
      {/* Main Content */}
      <main className="md:ml-64 w-full min-w-0 pt-14 md:pt-0 overflow-x-hidden">
        <Outlet /> {/* This will render the matched child route */}
      </main>
    </div>
  );
}

export default DashboardOutlet;