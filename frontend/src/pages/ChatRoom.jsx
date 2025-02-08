import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Clock, Send, Paperclip, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { Button } from "@/components/ui/button";
import RechargeModal from '@/components/common/RechargeModal';
import MentorSchedule from '@/components/chat/MentorSchedule';
import PreBuiltMessages from '@/components/chat/PreBuiltMessages';

const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

const ChatRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [mentorOnline, setMentorOnline] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [lastSeen, setLastSeen] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch session details and messages
    fetchSessionDetails();
    setupWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [sessionId, user]);

  const setupWebSocket = () => {
    const wsConnection = new WebSocket(`${WS_URL}?token=${user.token}`);

    wsConnection.onopen = () => {
      console.log('WebSocket Connected');
      wsConnection.send(JSON.stringify({
        type: 'JOIN_SESSION',
        sessionId
      }));
    };

    wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_MESSAGE') {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      } else if (data.type === 'MENTOR_STATUS') {
        setMentorOnline(data.isOnline);
        setLastSeen(data.lastSeen);
      }
    };

    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error');
    };

    setWs(wsConnection);
  };

  const fetchSessionDetails = async () => {
    try {
      console.log('Fetching session details for ID:', sessionId);
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        credentials: 'include'
      });

      console.log('Session response status:', response.status);
      const data = await response.json();
      console.log('Session data:', data);

      if (!response.ok) {
        if (response.status === 403) {
          console.error('Authorization error:', data);
          toast.error('You are not authorized to view this session. Please ensure you are logged in with the correct account.');
          navigate('/');
          return;
        }
        throw new Error(data.message || 'Failed to fetch session details');
      }

      if (!data.mentor) {
        throw new Error('Session data is missing mentor information');
      }

      setSession(data);
      setMessages(data.messages || []);
      setIsLoading(false);
      scrollToBottom();

      // Check mentor's online status and schedule
      try {
        const mentorRes = await fetch(`${API_URL}/mentors/status/${data.mentor._id}`, {
          credentials: 'include'
        });
        if (mentorRes.ok) {
          const mentorData = await mentorRes.json();
          setMentorOnline(mentorData.isOnline);
          setLastSeen(mentorData.lastSeen);
        } else {
          console.error('Failed to fetch mentor status:', await mentorRes.json());
        }
      } catch (error) {
        console.error('Error fetching mentor status:', error);
      }

      // Get user's balance
      try {
        const balanceRes = await fetch(`${API_URL}/payments/wallet-balance`, {
          credentials: 'include'
        });
        if (balanceRes.ok) {
          const { balance } = await balanceRes.json();
          setCurrentBalance(balance);
        } else {
          console.error('Failed to fetch balance:', await balanceRes.json());
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error(error.message || 'Failed to load chat session');
      navigate('/');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} has an unsupported file type`);
        continue;
      }

      try {
        setUploadingFiles(prev => [...prev, file]);
        
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload/${sessionId}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        
        // Add the uploaded file message to the messages list
        const fileMessage = {
          _id: Date.now(), // Temporary ID until WebSocket updates it
          sender: user._id,
          content: file.name,
          metadata: {
            type: file.type.startsWith('image/') ? 'image' : 'file',
            fileName: file.name,
            fileSize: file.size,
            fileUrl: data.file.url,
            mimeType: file.type
          },
          createdAt: new Date()
        };
        
        setMessages(prev => [...prev, fileMessage]);
        scrollToBottom();
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadingFiles(prev => prev.filter(f => f !== file));
      }
    }
    
    event.target.value = null;
  };

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !uploadingFiles.length) return;
    if (!mentorOnline && !session?.preBuiltMessage) return;
    
    try {
      setIsSending(true);
      
      // Check if balance is sufficient for next minute
      if (currentBalance < session.ratePerMinute) {
        setShowRecharge(true);
        return;
      }

      const response = await fetch(`${API_URL}/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content: inputMessage,
          metadata: {
            type: 'text'
          }
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const message = await response.json();
      setMessages(prev => [...prev, message]);
      setInputMessage('');
      
      // Update session cost
      setSessionCost(prev => prev + session.ratePerMinute);
      setCurrentBalance(prev => prev - session.ratePerMinute);

      // Send through WebSocket
      if (ws) {
        ws.send(JSON.stringify({
          type: 'NEW_MESSAGE',
          sessionId,
          message
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          {session?.mentor && (
            <>
              <img 
                src={session.mentor.picture} 
                alt={session.mentor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium">{session.mentor.name}</h3>
                <p className="text-sm text-gray-500">
                  {mentorOnline ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Online
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      Last seen {new Date(lastSeen).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Rate: ₹{session?.ratePerMinute}/min
          </div>
          <div className="text-sm text-gray-600">
            Balance: ₹{currentBalance}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecharge(true)}
          >
            Add Money
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!mentorOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Mentor is currently offline</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You can leave a message and we'll notify you when they respond.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.sender === user._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === user._id
                  ? 'bg-customYellow text-black'
                  : 'bg-white border'
              }`}
            >
              {message.metadata?.type === 'image' ? (
                <div className="space-y-2">
                  <img
                    src={message.metadata.fileUrl}
                    alt={message.metadata.fileName}
                    className="max-w-full rounded-lg"
                  />
                  <p className="text-sm opacity-75">{message.metadata.fileName}</p>
                </div>
              ) : message.metadata?.type === 'file' ? (
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  <a
                    href={message.metadata.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {message.metadata.fileName}
                  </a>
                  <span className="text-xs opacity-75">
                    ({Math.round(message.metadata.fileSize / 1024)}KB)
                  </span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}
              
              <div className="mt-1 flex justify-between items-center text-xs">
                <span className={message.sender === user._id ? 'text-black/60' : 'text-gray-500'}>
                  {formatTime(message.createdAt)}
                </span>
                {message.cost > 0 && (
                  <span className={message.sender === user._id ? 'text-black/60' : 'text-gray-500'}>
                    ₹{message.cost}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {uploadingFiles.map((file, index) => (
          <div key={index} className="flex justify-end">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
              <div className="flex items-center space-x-2">
                <Paperclip size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">Uploading {file.name}...</span>
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={mentorOnline ? "Type a message..." : "Leave a message for the mentor..."}
              className="w-full resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-customYellow"
              rows={1}
              style={{
                minHeight: '40px',
                maxHeight: '160px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx"
            />
            
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              disabled={isSending}
            >
              <Paperclip size={20} />
            </Button>
            
            <Button
              type="submit"
              disabled={isSending || (!inputMessage.trim() && !uploadingFiles.length)}
              className="bg-customYellow text-black rounded-full p-2 hover:bg-customYellow/90 disabled:opacity-50"
            >
              <Send size={20} />
            </Button>
          </div>
        </form>
      </div>

      {/* Recharge Modal */}
      <RechargeModal 
        isOpen={showRecharge}
        onClose={() => setShowRecharge(false)}
        onSuccess={(newBalance) => {
          setCurrentBalance(newBalance);
          setShowRecharge(false);
        }}
      />
    </div>
  );
};

export default ChatRoom; 