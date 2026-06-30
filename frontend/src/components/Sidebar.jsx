import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, LayoutDashboard, LogOut, ShieldAlert, AlignLeft, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [];

    // Only allow citizens to see the public feed and report issues
    if (user?.role === 'citizen' || !user?.role) {
        navItems.push({ name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> });
        navItems.push({ name: 'Report Issue', path: '/report', icon: <PlusCircle size={20} /> });
    }

    if (user?.role === 'admin') {
        navItems.push({ name: 'Admin Panel', path: '/admin', icon: <ShieldAlert size={20} /> });
    } else if (user?.role === 'department') {
        navItems.push({ name: 'Department Panel', path: '/department', icon: <ShieldAlert size={20} /> });
    } else if (user?.role === 'senior_authority') {
        navItems.push({ name: 'Authority Dashboard', path: '/senior-authority', icon: <ShieldAlert size={20} /> });
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-20 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 left-0 z-30 w-64 h-screen glass-panel transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200/50 h-16">
                    <NavLink to="/dashboard" className="flex flex-col text-blue-600 hover:scale-105 transition-transform">
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <Home size={24} />
                            <span>PublicEye</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-medium tracking-tight ml-8">Public Grievance Tracker</span>
                    </NavLink>
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 shadow-sm border border-blue-100'
                                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm'
                                }`
                            }
                            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                        >
                            {item.icon}
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200/50">
                    <div className="px-3 py-2 text-sm text-gray-500 mb-2 truncate bg-white/40 rounded-lg shadow-inner">
                        Signed in as <br />
                        <strong className="text-gray-900 font-medium">{user?.name || user?.email || 'User'}</strong>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
