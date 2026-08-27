import React, { useState, useContext } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router';
import {
  Home, Layers, BookOpen, ClipboardList, TrendingUp,
  Users, User, LogOut, GraduationCap, Menu, X
} from 'lucide-react';
import UserContext from '../../Context/UserContext';
import TeacherContext from '../../Context/TeacherContext';
import Swal from 'sweetalert2';

export default function TeacherLayout() {
  const { logout, user } = useContext(UserContext);
  const { activeSchool, classStream } = useContext(TeacherContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isClassTeacher = !!classStream || user?.role === 'platform_admin' || user?.is_superuser;
  const schoolName = activeSchool?.name || 'School';
  const userName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'Teacher');
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TC';

  const nav = [
    { to: '/teacher/dashboard', label: 'Home', Icon: Home },
    ...(isClassTeacher ? [{ to: '/teacher/my-class', label: 'My Class', Icon: Layers }] : []),
    { to: '/teacher/my-teaching', label: 'My Teaching', Icon: BookOpen },
    { to: '/teacher/assessments', label: 'Assessments', Icon: ClipboardList },
    { to: '/teacher/performance', label: 'Performance', Icon: TrendingUp },
    { to: '/teacher/students', label: 'Students', Icon: Users },
    { to: '/teacher/profile', label: 'Profile', Icon: User },
  ];

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

  return (
    <div className="flex h-full min-h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-60 bg-navy text-white transition-transform duration-200 shadow-xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-navy-700">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white shadow-md shadow-primary/20">
            <GraduationCap size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest font-heading">VizLearn</p>
            <p className="text-xs text-white/60 truncate">Teacher Portal</p>
          </div>
        </div>

        {/* Academic badge */}
        <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-navy-700 text-xs text-white/70">
          <span className="text-accent font-semibold">2026</span> · Term 2
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'text-white/70 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-navy-700 p-4 space-y-3">
          {user && (user.role === 'school_admin' || user.role === 'platform_admin' || user.is_superuser) && (
            <div className="p-2.5 bg-navy-700/80 rounded-xl border border-navy-700 space-y-1">
              <p className="text-[10px] font-extrabold uppercase text-accent tracking-wider">Switch Workspace</p>
              <div className="flex flex-col gap-1 text-xs font-semibold">
                <Link to="/school/dashboard" className="px-2 py-1 bg-navy text-white hover:bg-primary rounded-lg transition-colors flex items-center justify-between border border-navy-700">
                  <span>School Admin</span>
                </Link>
                <Link to="/student" className="px-2 py-1 bg-navy text-white hover:bg-primary rounded-lg transition-colors flex items-center justify-between border border-navy-700">
                  <span>Student Workspace</span>
                </Link>
                {(user.role === 'platform_admin' || user.is_superuser) && (
                  <Link to="/admin-dashboard" className="px-2 py-1 bg-navy text-white hover:bg-primary rounded-lg transition-colors flex items-center justify-between border border-navy-700">
                    <span>Admin Hub</span>
                  </Link>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold font-heading shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-white/50">
                {isClassTeacher ? 'Class & Subject Teacher' : 'Subject Teacher'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-white/60 hover:bg-navy-700 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Main content pane */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-60">
        {/* Top bar header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-navy font-heading">{schoolName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-700">{userName}</p>
              <p className="text-xs text-slate-400">{isClassTeacher ? 'Class & Subject Teacher' : 'Subject Teacher'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold font-heading shadow-xs">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
