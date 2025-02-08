import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const MentorSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, active

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/sessions/my-sessions`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateEarnings = (session) => {
    if (!session.endTime) return 0;
    const duration = new Date(session.endTime) - new Date(session.startTime);
    const minutes = Math.ceil(duration / (1000 * 60));
    return minutes * session.ratePerMinute;
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'completed') return session.status === 'completed';
    if (filter === 'active') return session.status === 'active';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sessions</h2>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-customYellow text-black hover:bg-customYellow/90' : ''}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'bg-customYellow text-black hover:bg-customYellow/90' : ''}
          >
            Active
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'bg-customYellow text-black hover:bg-customYellow/90' : ''}
          >
            Completed
          </Button>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'You havent had any sessions yet.'
              : filter === 'active'
                ? 'You have no active sessions.'
                : 'You have no completed sessions.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session._id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={session.student.picture}
                    alt={session.student.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{session.student.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(session.startTime)}
                      </p>
                      {session.status === 'completed' && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ₹{calculateEarnings(session)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.status === 'active' && (
                    <Button
                      onClick={() => navigate(`/chat/${session._id}`)}
                      className="bg-customYellow hover:bg-customYellow/90 text-black"
                    >
                      Continue Session
                    </Button>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    session.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>
              </div>
              {session.metadata && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{session.metadata.topic}</p>
                  <p className="text-sm text-gray-600 mt-1">{session.metadata.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorSessions; 