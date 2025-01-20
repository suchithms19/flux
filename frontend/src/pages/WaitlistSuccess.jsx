import React from 'react';
import { useNavigate } from 'react-router-dom';

const WaitlistSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full text-center">
        <div>
         
          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Thank you! 
            <br />We will reach out to you when we are ready.
          </h1>
    

          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="mt-8 bg-customYellow text-black px-8 py-3 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistSuccess; 