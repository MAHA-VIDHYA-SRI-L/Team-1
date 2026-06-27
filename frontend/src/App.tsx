import { useState } from 'react';
import Login from './pages/login';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

interface UserSessionData {
  fullName: string;
  email: string;
  idNumber?: string;
  contactNo?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'staff' | 'admin' | null>(null);
  const [activeUser, setActiveUser] = useState<UserSessionData | null>(null);

  const handleLoginSuccess = (role: 'student' | 'staff' | 'admin', user: UserSessionData) => {
    setUserRole(role);
    setActiveUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveUser(null);
  };

  if (isAuthenticated && activeUser) {
    if (userRole === 'student') return <StudentDashboard user={activeUser} onLogout={handleLogout} />;
    if (userRole === 'staff') return <StaffDashboard user={activeUser} onLogout={handleLogout} />;
    if (userRole === 'admin') return <AdminDashboard user={activeUser} onLogout={handleLogout} />;
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
