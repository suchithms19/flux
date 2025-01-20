import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {  MessageCircle, Video, Mail, Linkedin } from "lucide-react";
import useAuthStore from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

export default function MentorProfile() {
  const [isVisible, setIsVisible] = useState(false);
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    
    const fetchMentorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching mentor profile:', `${API_URL}/mentors/profile/${mentorId}`);
        const response = await axios.get(`${API_URL}/mentors/profile/${mentorId}`);
        if (response.data.success) {
          setMentor(response.data.mentor);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching mentor profile:', error);
        setError(error.response?.data?.message || 'Error fetching mentor profile');
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      fetchMentorProfile();
    }
  }, [mentorId]);

  const handleStartChat = () => {
    if (!user) {
      // Store the current path for redirection after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    // TODO: Implement chat functionality
    console.log('Start chat with mentor');
  };

  const handleStartCall = () => {
    if (!user) {
      // Store the current path for redirection after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    // TODO: Implement video call functionality
    console.log('Start video call with mentor');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600 bg-white p-8 rounded-xl shadow-sm">
          Loading profile...
        </div>
      </div>
    );
  }


    

  if (error || !mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
          <div className="text-xl text-gray-900 font-semibold mb-2">
            {error || 'Mentor not found'}
          </div>
          <p className="text-gray-600 mb-4">
            The mentor profile you're looking for could not be found.
          </p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isVisible={isVisible} />
      
      <main className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-yellow-100 to-yellow-200">
              <div className="absolute -bottom-16 left-8">
                <img
                  src={mentor.profilePhoto}
                  alt={`${mentor.fullName}'s profile`}
                  className="w-36 h-36 rounded-xl object-cover border-4 border-white shadow-md"
                />
              </div>
            </div>
            
            <div className="pt-20 pb-6 px-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{mentor.fullName}</h1>
                    {mentor.socialLinks?.linkedin && (
                      <a 
                        href={mentor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0A66C2] hover:opacity-80 transition-opacity"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          className="w-7 h-7"
                          fill="currentColor"
                        >
                          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 mt-1">
                    {mentor.role} at {mentor.organization}
                  </p>
                  <p className="text-sm bg-yellow-100 text-yellow-800 px-3 font-semibold py-1 rounded-full inline-block mt-2">
                    {mentor.headline}
                  </p>
                </div>
                <div className="hidden sm:flex gap-3">
                  <Button 
                    onClick={handleStartChat}
                    className="flex items-center gap-2 bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
                  >
                    <MessageCircle size={18} />
                    Chat Now
                  </Button>
                  <Button 
                    onClick={handleStartCall}
                    className="flex items-center gap-2 bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
                  >
                    <Video size={18} />
                    Video Call
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="sm:hidden grid grid-cols-2 gap-3 mt-4">
            <Button 
              onClick={handleStartChat}
              className="flex items-center justify-center gap-2 bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
            >
              <MessageCircle size={18} />
              Chat Now
            </Button>
            <Button 
              onClick={handleStartCall}
              className="flex items-center justify-center gap-2 bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
            >
              <Video size={18} />
              Video Call
            </Button>
          </div>

          
            <div className="col-span-12 lg:col-span-8 space-y-6 pt-6">
              {/* About */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-black text-md whitespace-pre-wrap">{mentor.bio}</p>
              </div>

              {/* Expertise */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Areas of Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.mentoringTopics?.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-sm text-gray-800">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              {mentor.ratings?.reviews?.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
                  <div className="space-y-4">
                    {mentor.ratings.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          <img 
                            src={review.user.profilePhoto || '/default-avatar.png'} 
                            alt={review.user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{review.user.fullName}</h3>
                            <p className="text-sm text-gray-500 mt-1">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

           
              
              </div>
            
          
      </main>
      
      <Footer />
    </div>
  );
}