import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function AuthSuccess() {
  const navigate = useNavigate();
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const userData = await getCurrentUser();
        // All users now come with a redirect path
        navigate(userData.redirect);
      } catch (error) {
        console.error('Error in auth success:', error);
        navigate('/login');
      }
    };

    handleAuthSuccess();
  }, [getCurrentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Completing login...</p>
      </div>
    </div>
  );
}

export default AuthSuccess; 