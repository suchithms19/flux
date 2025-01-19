import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

export default function Chat() {
  const { mentorId } = useParams();
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [mentor, setMentor] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Fetch mentor details
    const fetchMentor = async () => {
      try {
        const response = await axios.get(`${API_URL}/mentors/profile/${mentorId}`);
        if (response.data.success) {
          setMentor(response.data.mentor);
        }
      } catch (error) {
        console.error('Error fetching mentor:', error);
      }
    };

    fetchMentor();
  }, [mentorId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add message to UI immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: newMessage,
      sender: user._id,
      timestamp: new Date()
    }]);

    // Clear input
    setNewMessage('');

    // TODO: Implement actual message sending
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isVisible={isVisible} />
      
      <main className="pt-20 pb-16 h-screen">
        <div className="max-w-4xl mx-auto px-4 h-full flex flex-col">
          {/* Chat Header */}
          {mentor && (
            <div className="bg-white p-4 rounded-t-lg shadow-sm flex items-center gap-4">
              <img
                src={mentor.profilePhoto}
                alt={mentor.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold text-gray-900">{mentor.fullName}</h2>
                <p className="text-sm text-gray-500">{mentor.headline}</p>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === user._id
                      ? 'bg-customYellow text-black'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="text-xs opacity-50">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="bg-white p-4 rounded-b-lg shadow-sm">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button 
                type="submit"
                className="bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 