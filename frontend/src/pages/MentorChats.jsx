import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const MentorChats = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      setSessions(data.filter(session => session.status === 'active'));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load chat sessions');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Active Chats</h2>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Chats</h3>
          <p className="text-gray-500">
            When students start chatting with you, their sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
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
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Started {formatTime(session.startTime)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/chat/${session._id}`)}
                  className="bg-customYellow hover:bg-customYellow/90 text-black"
                >
                  Continue Chat
                </Button>
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

export default MentorChats; 