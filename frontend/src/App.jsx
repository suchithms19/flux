import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import MentorOnboard from './pages/MentorOnboard';
import LandingPage from './pages/LandingPage';
import useAuthStore from './store/authStore';
import MentorOnboardInfo from './pages/MentorOnboardInfo';
function App() {
  const { getCurrentUser, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!user && !isLoading) {  
      getCurrentUser();
    }
  }, []); 

  return (
    <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mentor" element={<MentorOnboardInfo />} />
            <Route path="/mentor/onboard" element={<MentorOnboard />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>

            </Route>
          </Routes>
    </Router>
  );
}

export default App;
