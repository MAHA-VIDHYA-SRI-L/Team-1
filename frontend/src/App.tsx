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
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false); setUserRole(null); setActiveUser(null);
  };

  if (sessionLoading) return null;

  if (isAuthenticated && activeUser) {
    if (userRole === 'student') {
      if (studentSubPage === 'badges') {
        return (
          <div className="flex flex-col min-h-screen">
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
              <button onClick={() => setStudentSubPage('home')} className="text-xs font-bold text-[#002D62] hover:underline flex items-center gap-1">
                ← Back to main dashboard workspace
              </button>
              <span className="text-xs text-slate-400 font-medium">Logged in as {activeUser.fullName}</span>
            </div>
            <div className="flex-1">
              <Badges user={{ fullName: activeUser.fullName }} onBackToDashboard={() => setStudentSubPage('home')} />
            </div>
          </div>
        );
      }
      return <StudentDashboard user={activeUser} onLogout={handleLogout} onNavigateToBadges={() => setStudentSubPage('badges')} />;
    }
    if (userRole === 'staff') return <StaffDashboard user={activeUser} onLogout={handleLogout} />;
    if (userRole === 'admin') return <AdminDashboard user={activeUser} onLogout={handleLogout} />;
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
