import { useState } from 'react';
import Login from './pages/login';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Badges from './pages/Badges'; 
import PlacementReadiness from './pages/PlacementReadiness';
import ReportPage from './pages/Report';

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
  
  // Sub-view state management for logged-in student routing
  const [studentSubPage, setStudentSubPage] = useState<'home' | 'badges' | 'placement' | 'report'>('home');
  const [activeUser, setActiveUser] = useState<UserSessionData | null>(null);

  const handleLoginSuccess = (role: 'student' | 'staff' | 'admin', user: UserSessionData) => {
    setUserRole(role);
    setActiveUser(user);
    setIsAuthenticated(true);
    setStudentSubPage('home'); 
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
      
      // Route 1: Badges Page
      if (studentSubPage === 'badges') {
        return (
          <Badges 
            user={{ 
              fullName: activeUser.fullName,
              email: activeUser.email,
              department: activeUser.department || 'CSE'
            }} 
            onBackToDashboard={() => setStudentSubPage('home')}
          />
        );
      }

      // Route 2: Placement Readiness (AI analysis page)
      if (studentSubPage === 'placement') {
        return (
          <PlacementReadiness
            user={{
              fullName: activeUser.fullName,
              email: activeUser.email,
              department: activeUser.department || 'CSE'
            }}
            onBackToDashboard={() => setStudentSubPage('home')}
          />
        );
      }

      // Route 3: Formal Placement Report Page
      if (studentSubPage === 'report') {
        return (
          <ReportPage
            user={{
              fullName: activeUser.fullName,
              email: activeUser.email,
              department: activeUser.department || 'CSE'
            }}
            onBackToDashboard={() => setStudentSubPage('home')}
          />
        );
      }

      // Route 3: Default Student Home Dashboard
      return (
        <StudentDashboard
          user={activeUser}
          onLogout={handleLogout}
          onNavigateToBadges={() => setStudentSubPage('badges')}
          onNavigateToPlacement={() => setStudentSubPage('placement')}
          onNavigateToReport={() => setStudentSubPage('report')}
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