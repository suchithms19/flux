import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [pendingApplications, setPendingApplications] = useState([]);

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/mentors/applications', {
        withCredentials: true
      });
      setPendingApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApplication = async (userId, status) => {
    try {
      await axios.put(
        `http://localhost:3000/api/mentors/application/${userId}`,
        { status },
        { withCredentials: true }
      );
      toast.success(`Application ${status}`);
      fetchPendingApplications();
    } catch (error) {
      toast.error('Error updating application');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Pending Mentor Applications</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {pendingApplications.map((application) => (
            <li key={application._id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{application.name}</h3>
                  <p className="text-sm text-gray-500">{application.email}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApplication(application._id, 'approved')}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApplication(application._id, 'rejected')}
                    className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard; 