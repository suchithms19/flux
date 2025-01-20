import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ isVisible }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const handleJoinMentor = () => {
    navigate('/mentor');
  };

  return (
    <div className={`font-poppins fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-customYellow text-black z-10 ${
      isLandingPage 
        ? `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`
        : ''
    }`}>
      <div 
        className="text-2xl sm:text-3xl font-bold cursor-pointer"
        onClick={() => navigate('/')}
      >
        Flux
      </div>
      
      <button 
        onClick={handleJoinMentor}
        className="bg-black text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 text-sm sm:text-base"
      >
        Become a Mentor
      </button>
    </div>
  );
};

export default Header;