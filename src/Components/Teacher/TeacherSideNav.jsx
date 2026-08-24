import { Link, NavLink, useNavigate } from "react-router";
import { Menu, GraduationCap, User, Home, BookOpen, X, ClipboardList, TrendingUp } from 'lucide-react';
import { useState, useContext, useRef, useEffect } from 'react';
import UserContext from '../../Context/UserContext';
import Swal from 'sweetalert2';

const TeacherSideNav = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { logout, user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 1024
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#02A0BF',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, logout',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  }

  const navItems = [
    { icon: Home, text: 'Dashboard', path: '/teacher' },
    { icon: BookOpen, text: 'My Teaching', path: '/teacher/my-teaching' },
    { icon: User, text: 'My Classes', path: '/teacher/my-class' },
    { icon: ClipboardList, text: 'Assessments', path: '/teacher/assessments' },
    { icon: TrendingUp, text: 'Performance', path: '/teacher/performance' },
    { icon: User, text: 'Profile', path: '/teacher/profile' },
  ];

  return (
    <>
      <button
        className="fixed top-4 left-4 z-40 lg:hidden bg-navy text-white p-2.5 rounded-xl shadow-lg border border-navy-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-navy text-white p-4 transition-transform duration-300 flex flex-col justify-between shadow-xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div>
          <div className="flex items-center gap-3 mb-8 pl-2 pt-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 text-white shadow-md shadow-primary/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <Link to="/teacher">
                <h1 className="text-xl font-bold font-heading text-white tracking-tight">VizLearn</h1>
              </Link>
              <p className="text-[11px] font-semibold text-white/60 truncate">Teacher Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item, index) => (
              <NavLink
                to={item.path}
                end={item.path === '/teacher'}
                key={index}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full px-3.5 py-2.5 font-medium text-sm rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary text-white font-semibold shadow-sm'
                      : 'text-white/70 hover:bg-navy-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.text}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-navy-700 space-y-3">
          {user && (user.role === 'school_admin' || user.role === 'platform_admin' || user.is_superuser) && (
            <div className="p-3 bg-navy-700/80 rounded-xl border border-navy-700 space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase text-accent tracking-wider">Switch Workspace</p>
              <div className="flex flex-col gap-1 text-xs font-semibold">
                <Link to="/school/dashboard" className="px-2.5 py-1.5 bg-navy text-white hover:bg-primary rounded-lg transition-colors flex items-center justify-between border border-navy-700">
                  <span>School Master</span>
                </Link>
                <Link to="/student" className="px-2.5 py-1.5 bg-navy text-white hover:bg-primary rounded-lg transition-colors flex items-center justify-between border border-navy-700">
                  <span>Student Workspace</span>
                </Link>
                {(user.role === 'platform_admin' || user.is_superuser) && (
                  <Link to="/admin-dashboard" className="px-2.5 py-1.5 bg-navy text-white hover:bg-primary rounded-lg transition-colors flex items-center justify-between border border-navy-700">
                    <span>Admin Hub</span>
                  </Link>
                )}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-xl text-xs text-white/60 hover:bg-navy-700 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer font-medium"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default TeacherSideNav;
