import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';

const MentorThankYou = () => {
  const {logout} = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-[#ffe05c] rounded-full flex items-center justify-center mx-auto mb-6">
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
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Application Submitted!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for applying to be a mentor on Flux. We'll review your application and get back to you soon.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={logout}
            className="w-full bg-[#ffe05c] text-black hover:scale-105 hover:bg-[#ffe05c]"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentorThankYou; 