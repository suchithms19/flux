import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut, Wallet} from 'lucide-react';

const Header = ({ isVisible }) => {
  const navigate = useNavigate();
  const { user, logout, updateBalance } = useAuthStore();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  // Update balance only when user first logs in
  useEffect(() => {
    if (user && user.role !== 'mentor') {
      updateBalance();
    }
  }, [user?.role]); // Only run when user role changes

  const handleLogin = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfile = () => {
    if (user?.role === 'mentor') {
      // Check mentor status and redirect accordingly
      if (user.mentorStatus === 'approved') {
        navigate('/mentor-dashboard'); // Change this to your actual mentor dashboard route
      } else if (user.mentorStatus === 'pending') {
        navigate('/mentor/inreview');
      } else {
        navigate('/mentor/onboard');
      }
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className={`font-poppins uppercase fixed top-0 left-0 right-0 flex flex-col sm:flex-row justify-between items-center lg:p-4 px-4 py-2 bg-customYellow text-black z-10 ${
      isLandingPage 
        ? `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`
        : ''
    }`}>
      <div 
        className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-0 cursor-pointer"
        onClick={() => navigate('/')}
      >
        Flux
      </div>
      
      <div className="flex items-center gap-4">
        {user && user.role !== 'mentor' && (
          <div className="flex items-center gap-2 mr-2 bg-white/20 px-3 py-1 rounded-full">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">₹{user.balance || 0}</span>
          </div>
        )}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-6 w-6" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>{user.role === 'mentor' ? 'Dashboard' : 'Profile'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={handleLogin}
            variant="ghost"
            className="font-semibold hover:bg-black/10"
          >
            Login
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;