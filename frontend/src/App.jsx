import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import MentorLogin from './pages/MentorLogin';
import MentorOnboard from './pages/MentorOnboard';
import LandingPage from './pages/LandingPage';
import useAuthStore from './store/authStore';
import MentorOnboardInfo from './pages/MentorOnboardInfo';
import MentorBrowse from './pages/MentorBrowse';
import MentorThankYou from './pages/MentorThankYou';
import MentorInreview from './pages/MentorInreview';
import AuthSuccess from './pages/AuthSuccess';
import MentorProfile from './pages/MentorProfile';
import UserProfile from './pages/UserProfile';
import WaitlistSuccess from './pages/WaitlistSuccess';

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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/mentor/login" element={<MentorLogin />} />
        <Route path="/browse" element={<MentorBrowse />} />
        <Route path="/mentor" element={<MentorOnboardInfo />} />
        <Route path="/mentor/:mentorId" element={<MentorProfile />} />
        <Route path="/waitlist-success" element={<WaitlistSuccess />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/mentor/onboard" element={<MentorOnboard />} />
          <Route path="/mentor/thank-you" element={<MentorThankYou />} />
          <Route path="/mentor/inreview" element={<MentorInreview />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
