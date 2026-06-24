import { useState } from 'react';
import Login from './pages/Login';
import Registration from './pages/Registration';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';

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
  
  // Storing fallback context mock metrics extracted straight from active text field submission values
  const [activeUser, setActiveUser] = useState<UserSessionData | null>(null);

  // --- ACCOUNT MATCH INTERCEPTOR ---
  const handleLoginSuccess = (role: 'student' | 'staff', emailInput: string) => {
    setUserRole(role);
    
    // Generating local dynamic fallback info based on what they filled into the input bar
    setActiveUser({
      fullName: role === 'staff' ? 'Faculty Member' : 'Student Pro Account',
      email: emailInput,
      idNumber: role === 'staff' ? 'KSR-FAC-883' : '22CSE104',
      contactNo: '9876543210'
    });
    
    setIsAuthenticated(true);
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
      return <StudentDashboard user={activeUser} onLogout={handleLogout} />;
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
          // Custom wrapper to pass down both role type and input string value
          onLoginSuccess={(role, emailStr) => handleLoginSuccess(role, emailStr || '')}
        />
      ) : (
        <Registration 
          onNavigateToLogin={() => setCurrentPage('login')} 
        />
      )}
    </>
  );
}