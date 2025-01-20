import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Hero = ({ isVisible, handleJoinexplore, handleJoinMentor }) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleJoinWaitlist = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/waitlist/join`, {
        email
      });
      
      if (response.status === 200 || response.status === 201) {
        navigate('/waitlist-success');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      // You might want to show a toast message here
    }
  };

  return (
    <div className={`font-poppins flex flex-col items-center justify-center mt-24 lg:mt-5 lg:min-h-screen w-full lg:px-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {/* Beta banner - visible on all screens */}
      <div className="bg-customYellow uppercase px-4 py-1 rounded-lg text-center mb-4">
        <p className="text-sm font-bold drop-shadow-lg">Public Beta Coming Soon !</p>
      </div>
      
      <div className="max-w-4xl mx-auto text-center lg:mt-20">
        <h1 className="tracking-tight text-3xl py-6 lg:py-0.5 sm:text-4xl lg:text-6xl font-black mb-2 lg:mb-6 text-custom">
          Get <span className="bg-[#ffd72c]/20 px-2 inline-block mt-2 sm:mt-0 sm:inline">instant mentorship</span> from top industry experts
        </h1>
        <p className="text-xl px-4 lg:px-0.5 sm:text-lg lg:text-2xl mb-4 sm:mb-8 max-w-4xl mx-auto">
          <span>Connect with mentors</span> for actionable advice to land your dream job, start freelancing, or learn new skills.
        </p>

        {/* Waitlist Section */}
        <div className="relative max-w-xl mx-auto px-6 lg:px-0">
          <div className="flex flex-col pb-8 sm:flex-row gap-2 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-black focus:outline-none focus:border-customYellow sm:min-w-[400px]"
            />
            <button 
              onClick={handleJoinWaitlist}
              className="w-full sm:w-auto bg-customYellow text-black px-8 py-3 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform duration-300 whitespace-nowrap"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
      
      {/* Moving Strip with Topics */}
      <div className="strip-container w-full overflow-hidden py-8 lg:py-2 sm:py-4">
        <div className="moving-strip">
          {/* First set of items */}
          <div className="strip-content">
            <div className="flex items-center">
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">React</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Freelancing</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Blockchain</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Copywriting</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Marketing</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Machine Learning</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">UI/UX Design</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Job Interview</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">DSA</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Career Guidance</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Data Science</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Cloud Computing</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Mobile Development</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Web Development</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Digital Marketing</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Graphic Design</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Game Development</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">DevOps</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Cybersecurity</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Artificial Intelligence</span>
            </div>
          </div>
          {/* Duplicate set of items */}
          <div className="strip-content">
            <div className="flex items-center">
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">React</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Freelancing</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Blockchain</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Copywriting</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Marketing</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Machine Learning</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">UI/UX Design</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Job Interview</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">DSA</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Career Guidance</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Data Science</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Cloud Computing</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Mobile Development</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Web Development</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Digital Marketing</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Graphic Design</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Game Development</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">DevOps</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Cybersecurity</span>
              <span className="inline-block px-2 sm:px-3 py-1 mx-1 sm:mx-2 text-xl lg:text-xl sm:text-sm font-semibold">Artificial Intelligence</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .strip-container {
          width: 100%;
          overflow: hidden;
        }
        .moving-strip {
          display: flex;
          white-space: nowrap;
          animation: scroll 10s linear infinite;
        }
        .strip-content {
          display: flex;
          flex-shrink: 0;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .moving-strip:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Hero;