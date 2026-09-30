import { Link, useNavigate, useLocation } from "react-router";
import {
    Menu, GraduationCap, ChartNoAxesCombined, Library, LayoutDashboard, UserCog, X, FolderTree, Flag, Layers
} from 'lucide-react';
import { useState, useContext, useRef, useEffect } from 'react';

import UserContext from '../../Context/UserContext';
import apiClient from '../../config/apiClient';
import Swal from 'sweetalert2';

const SideNav = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openIssuesCount, setOpenIssuesCount] = useState(0);
    const sidebarRef = useRef(null); //Ref for sidebar
    const { logout } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch open issues count on mount
    useEffect(() => {
        const fetchOpenIssues = async () => {
            try {
                const res = await apiClient.get('/api/curriculum/visualization-issues/');
                const list = res.data?.results || res.data || [];
                const count = list.filter(i => i.status !== 'resolved').length;
                setOpenIssuesCount(count);
            } catch (err) {
                // Silently fallback
            }
        };
        fetchOpenIssues();
    }, [location.pathname]);

    // 👇 useEffect to handle outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                window.innerWidth < 768 // Only on small screens
            ) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#02a0bf",
            cancelButtonColor: "#ff4900",
            confirmButtonText: "Yes, log me out!"
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                Swal.fire({
                    title: "Logged Out!",
                    text: "You have been successfully logged out.",
                    icon: "success"
                }).then(() => {
                    navigate("/login");
                });
            }
        });
    };

    const navItems = [
        { icon: LayoutDashboard, text: "Dashboard", path: '/admin-dashboard/' },
        { icon: Library, text: 'Course management', path: '/admin-dashboard/course-management' },
        { icon: FolderTree, text: "Curriculum Builder", path: '/admin-dashboard/curriculum-builder' },
        { icon: Layers, text: "Content Studio", path: '/admin-dashboard/content-studio' },
        { icon: Flag, text: "Reported Issues", path: '/admin-dashboard/reported-issues', badge: openIssuesCount },
        { icon: ChartNoAxesCombined, text: "Analytics and reports", path: '/admin-dashboard/analytics' },
        { icon: UserCog, text: "User management", path: '/admin-dashboard/user-management' },
    ];

    const isLinkActive = (itemPath) => {
        if (itemPath === '/admin-dashboard/' || itemPath === '/admin-dashboard') {
            return location.pathname === '/admin-dashboard' || location.pathname === '/admin-dashboard/';
        }
        return location.pathname.startsWith(itemPath);
    };

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className="fixed top-4 left-4 z-30 md:hidden bg-custom-blue text-white p-2 rounded-full"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Sidebar */}
            <aside
                ref={sidebarRef} // Attach ref
                className={`fixed left-0 top-0 z-20 h-screen w-64 bg-white border-r border-gray-300 p-4 transition-transform duration-300 flex flex-col justify-between
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                <div>
                    <div className="flex items-center gap-2 mb-8">
                        <GraduationCap className="h-10 w-10 text-custom-blue" />
                        <Link to="/">
                            <h1 className="text-3xl font-bold text-gray-800">VizLearn</h1>
                        </Link>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.map((item, index) => {
                            const active = isLinkActive(item.path);
                            return (
                                <Link
                                    to={item.path}
                                    key={index}
                                    className={`flex items-center gap-3 w-full p-2.5 rounded-2xl transition-colors font-medium text-xs ${
                                        active 
                                            ? 'bg-blue-50/80 text-custom-blue font-bold shadow-xs' 
                                            : 'text-gray-700 hover:bg-indigo-50/60 hover:text-custom-blue'
                                    }`}
                                >
                                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                                    <span className="truncate">{item.text}</span>
                                    {item.badge > 0 && (
                                        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-xs animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-300 space-y-3">
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 space-y-1.5">
                        <p className="text-[10px] font-extrabold uppercase text-custom-blue tracking-wider">Switch Workspace</p>
                        <div className="flex flex-col gap-1 text-xs font-semibold">
                            <Link to="/school/dashboard" className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-gray-800 rounded-xl transition-colors border border-blue-100 flex items-center justify-between">
                                <span>School Admin</span>
                            </Link>
                            <Link to="/teacher/dashboard" className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-gray-800 rounded-xl transition-colors border border-blue-100 flex items-center justify-between">
                                <span>Teacher Portal</span>
                            </Link>
                            <Link to="/student" className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-gray-800 rounded-xl transition-colors border border-blue-100 flex items-center justify-between">
                                <span>Student Workspace</span>
                            </Link>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-2 bg-red-600 w-full text-white rounded-3xl text-sm hover:bg-red-800 transition-colors duration-200"
                    >
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default SideNav;
