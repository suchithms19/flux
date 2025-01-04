import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function Dashboard() {
  const { user, getCurrentUser } = useAuthStore();

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome, {user?.name}!
        </h1>
        
        {user?.role === 'student' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Find and connect with expert mentors to accelerate your learning journey.
            </p>
            <Link
              to="/mentors"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Browse Mentors
            </Link>
          </div>
        )}

        {user?.role === 'student' && user?.mentorStatus === 'not_applied' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-900">Become a Mentor</h2>
            <p className="text-gray-600 mt-2">
              Share your expertise and help others learn while earning.
            </p>
            <Link
              to="/mentor/apply"
              className="mt-3 inline-block bg-white text-indigo-600 px-4 py-2 border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Apply Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 