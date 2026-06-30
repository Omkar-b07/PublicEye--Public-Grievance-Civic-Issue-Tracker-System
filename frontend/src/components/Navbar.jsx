import React, { useState, useRef, useEffect } from 'react';
import { AlignLeft, Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const profileRef = useRef(null);
    const notificationsRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsProfileOpen(false);
        logout();
        navigate('/login');
    };

    return (
        <header className="glass-panel h-16 flex items-center justify-between px-4 sticky top-0 z-10 mt-0 lg:mt-0 transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-gray-500 hover:text-gray-700 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <AlignLeft size={24} />
                </button>
                <h1 className="text-xl font-semibold text-gray-800 truncate md:hidden">PublicEye</h1>
                <div className="hidden md:block">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 bg-gray-100/50 border border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-64 transition-all duration-300"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                    <button 
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen);
                            setIsProfileOpen(false);
                        }}
                        className="text-gray-500 hover:text-blue-600 relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg shadow-blue-500/10 border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-800">Notifications</h3>
                            </div>
                            <div className="p-4 text-center text-sm text-gray-500">
                                No new notifications
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => {
                            setIsProfileOpen(!isProfileOpen);
                            setIsNotificationsOpen(false);
                        }}
                    >
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{user?.name || 'User'}</span>
                            <span className="text-xs text-gray-500 capitalize">{user?.role || 'Citizen'}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 ring-2 ring-white hover:scale-105 transition-transform">
                            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg shadow-blue-500/10 border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 capitalize truncate">{user?.email || user?.role || 'Citizen'}</p>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    setIsEditModalOpen(true);
                                    setIsProfileOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <User size={16} />
                                <span>Edit Profile</span>
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
        </header>
    );
};

export default Navbar;
