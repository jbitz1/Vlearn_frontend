import { Link, NavLink, useNavigate } from "react-router";
import { Menu, GraduationCap, User, Home, BookOpen, X } from 'lucide-react';
import { useState, useContext, useRef, useEffect } from 'react';
import UserContext from '../../Context/UserContext';
import Swal from 'sweetalert2';

const SideNav = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 768
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
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  }

  const navItems = [
    { icon: Home, text: 'Dashboard', path: '/student' },
    { icon: BookOpen, text: 'Subjects', path: '/student/subjects' },
    { icon: User, text: 'Profile', path: '/student/profile' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="fixed top-3 left-3 z-40 md:hidden bg-custom-blue text-white p-2.5 rounded-full shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle Navigation Menu"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-30 h-screen w-64 bg-white border-r border-gray-200 p-5 transition-transform duration-300 flex flex-col justify-between
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div>
          <div className="flex items-center gap-3 mb-8 pl-2">
            <GraduationCap className="h-9 w-9 text-custom-blue shrink-0" />
            <Link to="/student" onClick={() => setIsSidebarOpen(false)}>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">VizLearn</h1>
            </Link>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item, index) => (
              <NavLink
                to={item.path}
                end={item.path === '/student'}
                key={index}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full px-4 py-3 font-semibold text-sm rounded-2xl transition-all duration-200 min-h-[44px] ${
                    isActive
                      ? 'bg-blue-50 text-custom-blue shadow-xs font-bold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.text}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Switch Workspace & Logout */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          {user && (user.role === 'school_admin' || user.role === 'platform_admin' || user.is_superuser) && (
            <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase text-custom-blue tracking-wider">Switch Workspace</p>
              <div className="flex flex-col gap-1 text-xs font-semibold">
                <Link
                  to="/school/dashboard"
                  onClick={() => setIsSidebarOpen(false)}
                  className="px-2.5 py-1.5 bg-white text-gray-800 hover:bg-custom-blue hover:text-white rounded-xl transition-colors flex items-center justify-between border border-blue-100 shadow-xs"
                >
                  <span>School Admin</span>
                </Link>
                <Link
                  to="/teacher/dashboard"
                  onClick={() => setIsSidebarOpen(false)}
                  className="px-2.5 py-1.5 bg-white text-gray-800 hover:bg-custom-blue hover:text-white rounded-xl transition-colors flex items-center justify-between border border-blue-100 shadow-xs"
                >
                  <span>Teacher Portal</span>
                </Link>
                {(user.role === 'platform_admin' || user.is_superuser) && (
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setIsSidebarOpen(false)}
                    className="px-2.5 py-1.5 bg-white text-gray-800 hover:bg-custom-blue hover:text-white rounded-xl transition-colors flex items-center justify-between border border-blue-100 shadow-xs"
                  >
                    <span>Admin Hub</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setIsSidebarOpen(false);
              handleLogout();
            }}
            className="w-full px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-2xl text-sm transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideNav;
