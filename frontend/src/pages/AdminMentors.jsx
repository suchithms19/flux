import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

const AdminMentors = () => {
  const [pendingMentors, setPendingMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch pending mentor applications
  useEffect(() => {
    const fetchPendingMentors = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mentors/applications/pending`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch pending mentors');
        }

        const data = await response.json();
        setPendingMentors(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load pending applications');
      } finally {
        setLoading(false);
      }
    };

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchPendingMentors();
  }, [user, navigate]);

  const handleMentorAction = async (mentorId, action) => {
    setProcessingId(mentorId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentors/application/${mentorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          status: action,
          approved: action === 'approved',
          dashboardUrl: `${window.location.origin}/mentor-dashboard`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update mentor status');
      }

      // Remove the mentor from the list
      setPendingMentors(prev => prev.filter(mentor => mentor._id !== mentorId));
      toast.success(`Mentor ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to ${action} mentor`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold">Pending Applications</h1>
            </div>
            <div className="text-sm text-gray-500">
              Total: {pendingMentors.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {pendingMentors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">No pending applications</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingMentors.map((mentor) => (
              <div 
                key={mentor._id} 
                className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:border-customYellow transition-colors"
              >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={mentor.profilePhoto || mentor.user?.picture} 
                      alt={mentor.fullName} 
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg md:text-xl font-semibold truncate">{mentor.fullName}</h2>
                      <p className="text-gray-600 text-sm md:text-base">{mentor.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {mentor.organization} • {mentor.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                    <Button
                      onClick={() => handleMentorAction(mentor._id, 'approved')}
                      disabled={processingId === mentor._id}
                      className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white"
                    >
                      {processingId === mentor._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      <span>Approve</span>
                    </Button>
                    <Button
                      onClick={() => handleMentorAction(mentor._id, 'rejected')}
                      disabled={processingId === mentor._id}
                      variant="destructive"
                      className="flex-1 md:flex-none"
                    >
                      {processingId === mentor._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Expertise Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {mentor.mentoringAreas?.map((area, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs md:text-sm"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Experience</h3>
                      <p className="text-gray-700 text-sm md:text-base">{mentor.experience} years</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Bio</h3>
                    <p className="text-gray-700 text-sm md:text-base">{mentor.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMentors; 