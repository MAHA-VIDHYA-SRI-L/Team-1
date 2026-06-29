import { useState } from 'react';
import Login from './pages/login';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Badges from './pages/Badges'; 

interface UserSessionData {
  fullName: string;
  email: string;
  idNumber?: string;
  contactNo?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'staff' | 'admin' | null>(null);
  
  // Sub-view state management for logged-in student routing (e.g., 'home' or 'badges')
  const [studentSubPage, setStudentSubPage] = useState<'home' | 'badges'>('home');
  const [activeUser, setActiveUser] = useState<UserSessionData | null>(null);

  const handleLoginSuccess = (role: 'student' | 'staff' | 'admin', user: UserSessionData) => {
    setUserRole(role);
    setActiveUser(user);
    setIsAuthenticated(true);
    setStudentSubPage('home'); // Reset back to main sub-page view on fresh logging instance
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveUser(null);
  };

  if (isAuthenticated && activeUser) {
    // --- 1. STUDENT DOMAIN ---
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
              <Badges user={{ fullName: activeUser.fullName }} />
            </div>
          </div>
        );
      }

      // Default Student Home Dashboard Route layout pipeline
      return (
        <StudentDashboard 
          user={activeUser} 
          onLogout={handleLogout} 
          onNavigateToBadges={() => setStudentSubPage('badges')} 
        />
      );
    }
    
    // --- 2. STAFF DOMAIN ---
    if (userRole === 'staff') {
      return <StaffDashboard user={activeUser} onLogout={handleLogout} />;
    }

    // --- 3. ADMIN DOMAIN ---
    if (userRole === 'admin') {
      return <AdminDashboard user={activeUser} onLogout={handleLogout} />;
    }
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
}