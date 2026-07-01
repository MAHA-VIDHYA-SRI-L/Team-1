import { useState, useEffect } from 'react';
import { clearTokens, setUnauthorizedHandler, setTokens } from './services/api';
import Login from './pages/login';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StaffReport from './pages/StaffReport';
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
  // Restore full session from sessionStorage so page reload keeps user logged in
  const savedSession = (() => {
    try { return JSON.parse(sessionStorage.getItem('_pm_session') || 'null'); } catch { return null; }
  })();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!savedSession);
  const [userRole, setUserRole] = useState<'student' | 'staff' | 'admin' | null>(savedSession?.role ?? null);
  const [studentSubPage, setStudentSubPage] = useState<'home' | 'badges' | 'placement' | 'report'>('home');
  const [staffSubPage, setStaffSubPage] = useState<'home' | 'report'>('home');
  const [activeUser, setActiveUser] = useState<UserSessionData | null>(savedSession?.user ?? null);

  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
    // Re-hydrate in-memory token from sessionStorage (covers hot reload)
    const savedToken = sessionStorage.getItem('_pm_token');
    const savedRefresh = sessionStorage.getItem('_pm_refresh');
    if (savedToken) setTokens(savedToken, savedRefresh || undefined);
  }, []);

  const handleLoginSuccess = (role: 'student' | 'staff' | 'admin', user: UserSessionData) => {
    setUserRole(role);
    setActiveUser(user);
    setIsAuthenticated(true);
    setStudentSubPage('home');
    sessionStorage.setItem('_pm_session', JSON.stringify({ role, user }));
  };

  const handleDepartmentLoaded = (dept: string) => {
    setActiveUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, department: dept };
      // Keep session in sync with updated department
      const role = userRole;
      if (role) sessionStorage.setItem('_pm_session', JSON.stringify({ role, user: updated }));
      return updated;
    });
  };

  const handleLogout = () => {
    clearTokens();
    sessionStorage.removeItem('_pm_session');
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
          onDepartmentLoaded={handleDepartmentLoaded}
        />
      );
    }
    
    // --- 2. STAFF DOMAIN ---
    if (userRole === 'staff') {
      if (staffSubPage === 'report') {
        return (
          <StaffReport
            user={activeUser}
            onBack={() => setStaffSubPage('home')}
          />
        );
      }
      return (
        <StaffDashboard
          user={activeUser}
          onLogout={handleLogout}
          onNavigateToReport={() => setStaffSubPage('report')}
        />
      );
    }

    // --- 3. ADMIN DOMAIN ---
    if (userRole === 'admin') {
      return <AdminDashboard user={activeUser} onLogout={handleLogout} />;
    }
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
}