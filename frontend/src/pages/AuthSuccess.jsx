import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

function AuthSuccess() {
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-customYellow rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-8 h-8 text-black" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Authentication Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Please wait while we redirect you...
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-customYellow"></div>
        </div>
      </div>
    </div>
  );
}

export default AuthSuccess; 