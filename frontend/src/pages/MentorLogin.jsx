import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function MentorLogin() {
  const { login, user } = useAuthStore();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  // useEffect(() => {
  //   if (user) {
  //     if (isSignUp) {
  //       // For sign up, always go to onboarding
  //       navigate('/mentor/onboard');
  //     } else {
  //       // For sign in, check status
  //       if (user.role === 'mentor' && user.mentorStatus === 'approved') {
  //         navigate('/mentor/dashboard');
  //       } else if (user.mentorStatus === 'pending') {
  //         navigate('/mentor/inreview');
  //       } else if (user.mentorStatus === 'not_applied') {
  //         navigate('/mentor/onboard');
  //       } else {
  //         navigate('/mentor/onboard');
  //       }
  //     }
  //   }
  // }, [user, navigate, isSignUp]);

  const handleAuth = () => {
    // Store sign up state in localStorage to persist through OAuth redirect
    localStorage.setItem('mentorSignUpFlow', isSignUp ? 'true' : 'false');
    login('mentor');
  };

  return (
    <div className="font-poppins min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Flux</h1>
          <p className="text-gray-600 text-lg">
            {isSignUp ? 'Start Your Mentoring Journey' : 'Welcome Back to Flux'}
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8 transform ">
          {/* Toggle Buttons */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setIsSignUp(false)}
              className={
                !isSignUp 
                  ? 'flex-1 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm'
                  : 'flex-1 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900'
              }
            >
              Sign In as Mentor
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={
                isSignUp 
                  ? 'flex-1 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm'
                  : 'flex-1 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900'
              }
            >
              Become a Mentor
            </button>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              {isSignUp ? 'Join Our Mentor Community' : 'Welcome Back, Mentor'}
            </h2>
            <p className="text-gray-600 text-lg">
              {isSignUp 
                ? 'Share Your Expertise, Change a Life'
                : 'Continue making an impact'
              }
            </p>
           
          </div>

          <button
            onClick={handleAuth}
            className="w-full flex items-center justify-center px-6 py-4 rounded-xl text-black bg-customYellow hover:scale-[1.02] font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <img
              className="h-6 w-6 mr-3"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
            />
            {isSignUp ? 'Sign Up with Google' : 'Sign In with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MentorLogin; 