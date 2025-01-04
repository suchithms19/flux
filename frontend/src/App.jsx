import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MentorOnboard from './pages/MentorOnboard';
import LandingPage from './pages/LandingPage';
import useAuthStore from './store/authStore';

function App() {
  const { getCurrentUser, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!user && !isLoading) {  // Only call if no user and not already loading
      getCurrentUser();
    }
  }, []); // Remove getCurrentUser from dependencies

  return (
    <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mentor/onboard" element={<MentorOnboard />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
    </Router>
  );
}

export default App;
