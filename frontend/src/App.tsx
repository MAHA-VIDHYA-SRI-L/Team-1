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
  department?: string;
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
      // Swapped out the old top header bar completely.
      // We now mount the Badges component directly and pass down the back-navigation callback straight to its sidebar footer!
      if (studentSubPage === 'badges') {
        return (
          <Badges 
            user={{ 
              fullName: activeUser.fullName,
              department: activeUser.department || 'CSE'
            }} 
            onBackToDashboard={() => setStudentSubPage('home')}
          />
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