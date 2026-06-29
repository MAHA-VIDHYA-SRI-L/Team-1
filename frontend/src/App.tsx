import { useState, useEffect } from 'react';
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

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'staff' | 'admin' | null>(null);
  const [studentSubPage, setStudentSubPage] = useState<'home' | 'badges'>('home');
  const [activeUser, setActiveUser] = useState<UserSessionData | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setSessionLoading(false); return; }

    const restoreSession = async (accessToken: string) => {
      const r = await fetch(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (r.ok) {
        const data = await r.json();
        setUserRole(data.role); setActiveUser(data.user); setIsAuthenticated(true);
        return;
      }
      if (r.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const rr = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (rr.ok) {
            const rd = await rr.json();
            localStorage.setItem('token', rd.token);
            localStorage.setItem('refreshToken', rd.refreshToken);
            const r2 = await fetch(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${rd.token}` } });
            if (r2.ok) {
              const data2 = await r2.json();
              setUserRole(data2.role); setActiveUser(data2.user); setIsAuthenticated(true);
              return;
            }
          }
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    };

    restoreSession(token).catch(() => {}).finally(() => setSessionLoading(false));
  }, []);

  const handleLoginSuccess = (role: 'student' | 'staff' | 'admin', user: UserSessionData) => {
    setUserRole(role); setActiveUser(user); setIsAuthenticated(true); setStudentSubPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveUser(null);
  };

  if (sessionLoading) return null;

  if (isAuthenticated && activeUser) {
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
      return <StudentDashboard user={activeUser} onLogout={handleLogout} onNavigateToBadges={() => setStudentSubPage('badges')} />;
    }
    if (userRole === 'staff') return <StaffDashboard user={activeUser} onLogout={handleLogout} />;
    if (userRole === 'admin') return <AdminDashboard user={activeUser} onLogout={handleLogout} />;
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
