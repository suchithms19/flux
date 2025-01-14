import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = () => {
  const { user, getCurrentUser, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!user && !isLoading) {
        await getCurrentUser();
      }
      setIsChecking(false);
    };
    checkUser();
  }, []);

  if (isLoading || isChecking) {
    return <div className="flex items-center justify-center h-screen bg-gray-100">
    <p className="text-xl font-semibold text-gray-600">Loading...</p>
          </div>
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 