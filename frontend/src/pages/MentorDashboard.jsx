import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, Settings, Clock, LogOut } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import MentorAvailability from './MentorAvailability';
import MentorSessions from './MentorSessions';
import MentorChats from './MentorChats';
import MentorSettings from './MentorSettings';

const MentorDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Flux</h1>
          <p className="text-sm text-gray-500 mt-1">Mentor Dashboard</p>
        </div>

        <div className="px-3">
          <div className="space-y-1">
            <NavLink
              to="/mentor-dashboard/sessions"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-customYellow text-black' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Calendar className="w-5 h-5" />
              <span>Sessions</span>
            </NavLink>

            <NavLink
              to="/mentor-dashboard/chats"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-customYellow text-black' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chats</span>
            </NavLink>

            <NavLink
              to="/mentor-dashboard/availability"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-customYellow text-black' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Clock className="w-5 h-5" />
              <span>Availability</span>
            </NavLink>

            <NavLink
              to="/mentor-dashboard/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-customYellow text-black' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>
          </div>

          <div className="absolute bottom-8 left-0 right-0 px-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<MentorSessions />} />
          <Route path="/sessions" element={<MentorSessions />} />
          <Route path="/chats" element={<MentorChats />} />
          <Route path="/availability" element={<MentorAvailability />} />
          <Route path="/settings" element={<MentorSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default MentorDashboard; 