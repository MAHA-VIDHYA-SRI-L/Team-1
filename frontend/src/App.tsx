import { useState } from 'react';
import Login from './pages/login';
import Registration from './pages/Registration';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Badges from './pages/Badges'; // 1. Imported your new Badges page view

// Unified User Definition Interface
interface UserSessionData {
  fullName: string;
  email: string;
  idNumber?: string;
  contactNo?: string;
}

export default function App() {
  // --- CORE ROUTING & AUTHSYSTEM STATE ---
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'staff' | null>(null);
  
  // Sub-view state management for logged-in student routing (e.g., 'home' or 'badges')
  const [studentSubPage, setStudentSubPage] = useState<'home' | 'badges'>('home');
  
  // Storing fallback context mock metrics extracted straight from active text field submission values
  const [activeUser, setActiveUser] = useState<UserSessionData | null>(null);

  // --- ACCOUNT MATCH INTERCEPTOR ---
  const handleLoginSuccess = (role: 'student' | 'staff', user: UserSessionData) => {
    setUserRole(role);
    setActiveUser(user);
    setIsAuthenticated(true);
    setStudentSubPage('home'); // Reset back to main sub-page view on fresh logging instance
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveUser(null);
    setCurrentPage('login');
  };

  // 1. View Dispatcher Module: Handle Authenticated States
  if (isAuthenticated && activeUser) {
    if (userRole === 'student') {
      // If the student has chosen the badges page from the sidebar layout, intercept and mount it
      if (studentSubPage === 'badges') {
        return (
          <div className="flex flex-col min-h-screen">
            {/* Topbar/back-action layout navigation tray */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
              <button 
                onClick={() => setStudentSubPage('home')}
                className="text-xs font-bold text-[#002D62] hover:underline flex items-center gap-1"
              >
                ← Back to main dashboard workspace
              </button>
              <span className="text-xs text-slate-400 font-medium">Logged in as {activeUser.fullName}</span>
            </div>
            <div className="flex-1">
              <Badges />
            </div>
          </div>
        );
      }

      // Default Student Home Dashboard Route layout pipeline
      return (
        <StudentDashboard 
          user={activeUser} 
          onLogout={handleLogout} 
          onNavigateToBadges={() => setStudentSubPage('badges')} // Pass this down to connect to your sidebar trigger
        />
      );
    }
    
    if (userRole === 'staff') {
      return <StaffDashboard user={activeUser} onLogout={handleLogout} />;
    }
  }

  // 2. View Dispatcher Module: Render Basic Auth Screens
  return (
    <>
      {currentPage === 'login' ? (
        <Login 
          onNavigateToRegister={() => setCurrentPage('register')} 
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <Registration 
          onNavigateToLogin={() => setCurrentPage('login')} 
        />
      )}
    </>
  );
}