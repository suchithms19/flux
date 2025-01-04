import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
  function handleExplore(){
    navigate('/fluxmentors')
  }

  return (
    <div className={`font-poppins flex flex-col items-center justify-center mt-24 lg:mt-5 lg:min-h-screen w-full lg:px-8 transition-all duration-1000 `}>
      <div className="max-w-4xl mx-auto text-center lg:mt-20">
        <h1 className="tracking-tight text-3xl py-6 lg:py-0.5 sm:text-4xl lg:text-6xl font-black mb-2 lg:mb-6 text-custom ">
          Get <span className="bg-[#ffd72c] px-2 inline-block mt-2 sm:mt-0 sm:inline">instant mentorship</span>  from top industry experts
        </h1>
        <p className="text-xl px-4 lg:px-0.5 sm:text-lg lg:text-2xl mb-4 sm:mb-8 max-w-4xl mx-auto">
          <span>Connect with mentors</span> for actionable advice to land your dream job, start freelancing, or learn new skills.
        </p>
        <div className="relative">
          <div className="bg-white uppercase w-[calc(100%-3rem)] mx-6 lg:w-max lg:mx-0 shadow-2xl rounded-lg text-black my-10 py-8 p-4 sm:p-8 border-2 border-black inline-block mb-6 sm:mb-10 font-semibold">
            <h2 className="text-lg mb-3 sm:mb-5 text-center">Curious ?</h2>
            <div className="flex flex-col lg:flex-row gap-4">

              <button 
                onClick={handleExplore}
                className="w-full lg:w-auto bg-black text-white py-2 lg:px-16 sm:py-4 lg:sm:px-28 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform duration-300"
              >
                Explore Mentors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;