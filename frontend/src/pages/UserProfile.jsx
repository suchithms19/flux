import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Wallet, Calendar, MessageCircle, Clock, User } from "lucide-react";
import useAuthStore from '@/store/authStore';

export default function UserProfile() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role === 'mentor') {
    navigate('/mentor/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isVisible={isVisible} />
      <main className="pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img
                src={user.picture}
                alt={user.fullName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover "
              />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.fullName}</h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <Wallet className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-xl font-bold text-gray-900">₹{user.balance || 0}</div>
              <div className="text-sm text-gray-600">Balance</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold text-gray-900">{user.sessionsAttended || 0}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
           
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {user.recentSessions?.length > 0 ? (
              <div className="space-y-6">
                {user.recentSessions.map((session, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/mentor/${session.mentor._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={session.mentor.profilePhoto} 
                      alt={session.mentor.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">
                            Session with {session.mentor.fullName}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{session.topic}</p>
                        </div>
                        <span className="text-sm text-gray-400 whitespace-nowrap">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{session.duration} minutes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No sessions yet</p>
                <Button
                  onClick={() => navigate('/browse')}
                  className="mt-4 bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
                >
                  Find a Mentor
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 