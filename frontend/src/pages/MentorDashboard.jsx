import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

function MentorDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalEarnings: 0,
    averageRating: 0
  });

  useEffect(() => {
    // Fetch mentor stats
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/mentors/stats', {
          withCredentials: true
        });
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user?.role === 'mentor') {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mentor Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Sessions</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">${stats.totalEarnings}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Average Rating</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.averageRating}/5</p>
        </div>
      </div>

      {/* Add more sections for upcoming sessions, availability management, etc. */}
    </div>
  );
}

export default MentorDashboard; 