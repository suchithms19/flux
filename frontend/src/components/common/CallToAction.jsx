import React from 'react';

const CallToAction = ({ handleJoinWait }) => {
  return (
    <div className='text-poppins uppercase flex justify-center items-center mt-24 lg:mt-36 mb-10'>
      <div className="bg-white uppercase w-[calc(100%-3rem)] mx-6 lg:w-max lg:mx-0 shadow-2xl rounded-lg text-black my-10 py-8 p-4 sm:p-8 border-2 border-black inline-block mb-6 sm:mb-10 font-semibold">
          <h2 className="text-lg mb-3 sm:mb-5 text-center">Get early access to Flux 🔥</h2>
          <button 
            onClick={handleJoinWait} 
            className="w-full lg:w-auto bg-customYellow text-black py-2 lg:px-16 sm:py-4 lg:sm:px-28 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform duration-300"
          >
            Join the Waitlist
          </button>
        </div>
    </div>
  );
};

export default CallToAction;