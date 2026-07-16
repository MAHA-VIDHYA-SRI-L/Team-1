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

  // Restore impersonated student from sessionStorage if present
  const [impersonatedStudent, setImpersonatedStudent] = useState<UserSessionData | null>(() => {
    try {
      const saved = sessionStorage.getItem('_pm_impersonate_student');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleExitImpersonation = () => {
    sessionStorage.removeItem('_pm_impersonate_student');
    sessionStorage.removeItem('_pm_impersonate_student_id');
    setImpersonatedStudent(null);
    setStudentSubPage('home');
  };

  const handleLogout = () => {
    clearTokens();
    sessionStorage.removeItem('_pm_session');
    sessionStorage.removeItem('_pm_impersonate_student');
    sessionStorage.removeItem('_pm_impersonate_student_id');
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveUser(null);
    setImpersonatedStudent(null);
  };

  const effectiveRole = impersonatedStudent ? 'student' : userRole;
  const effectiveUser = impersonatedStudent ? impersonatedStudent : activeUser;

  if (isAuthenticated && effectiveUser) {
    // --- 1. STUDENT DOMAIN ---
    if (effectiveRole === 'student') {
      
      // Route 1: Badges Page
      if (studentSubPage === 'badges') {
        return (
          <div className="min-h-screen flex flex-col">
            {impersonatedStudent && (
              <ImpersonationBanner studentName={impersonatedStudent.fullName} onExit={handleExitImpersonation} />
            )}
            <div className="flex-1">
              <Badges 
                user={{ 
                  fullName: effectiveUser.fullName,
                  email: effectiveUser.email,
                  department: effectiveUser.department || 'CSE'
                }} 
                onBackToDashboard={() => setStudentSubPage('home')}
              />
            </div>
          </div>
        );
      }

      // Route 2: Placement Readiness (AI analysis page)
      if (studentSubPage === 'placement') {
        return (
          <div className="min-h-screen flex flex-col">
            {impersonatedStudent && (
              <ImpersonationBanner studentName={impersonatedStudent.fullName} onExit={handleExitImpersonation} />
            )}
            <div className="flex-1">
              <PlacementReadiness
                user={{
                  fullName: effectiveUser.fullName,
                  email: effectiveUser.email,
                  department: effectiveUser.department || 'CSE'
                }}
                onBackToDashboard={() => setStudentSubPage('home')}
              />
            </div>
          </div>
        );
      }

      // Route 3: Formal Placement Report Page
      if (studentSubPage === 'report') {
        return (
          <div className="min-h-screen flex flex-col">
            {impersonatedStudent && (
              <ImpersonationBanner studentName={impersonatedStudent.fullName} onExit={handleExitImpersonation} />
            )}
            <div className="flex-1">
              <ReportPage
                user={{
                  fullName: effectiveUser.fullName,
                  email: effectiveUser.email,
                  department: effectiveUser.department || 'CSE'
                }}
                onBackToDashboard={() => setStudentSubPage('home')}
              />
            </div>
          </div>
        );
      }

      // Route 4: Default Student Home Dashboard
      return (
        <div className="min-h-screen flex flex-col">
          {impersonatedStudent && (
            <ImpersonationBanner studentName={impersonatedStudent.fullName} onExit={handleExitImpersonation} />
          )}
          <div className="flex-1 flex flex-col">
            <StudentDashboard
              user={effectiveUser}
              onLogout={impersonatedStudent ? handleExitImpersonation : handleLogout}
              onNavigateToBadges={() => setStudentSubPage('badges')}
              onNavigateToPlacement={() => setStudentSubPage('placement')}
              onNavigateToReport={() => setStudentSubPage('report')}
              onDepartmentLoaded={handleDepartmentLoaded}
            />
          </div>
        </div>
      );
    }
    
    // --- 2. STAFF DOMAIN ---
    if (userRole === 'staff') {
      if (staffSubPage === 'report') {
        return (
          <StaffReport
            user={activeUser!}
            onBack={() => setStaffSubPage('home')}
          />
        );
      }
      return (
        <StaffDashboard
          user={activeUser!}
          onLogout={handleLogout}
          onNavigateToReport={() => setStaffSubPage('report')}
        />
      );
    }

    // --- 3. ADMIN DOMAIN ---
    if (userRole === 'admin') {
      return (
        <AdminDashboard 
          user={activeUser!} 
          onLogout={handleLogout} 
          onImpersonate={(student) => {
            sessionStorage.setItem('_pm_impersonate_student', JSON.stringify(student));
            sessionStorage.setItem('_pm_impersonate_student_id', student.id);
            setImpersonatedStudent(student);
            setStudentSubPage('home');
          }}
        />
      );
    }
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
}

const ImpersonationBanner = ({ studentName, onExit }: { studentName: string; onExit: () => void }) => (
  <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold sticky top-0 z-50 shadow-md">
    <div className="flex items-center gap-2">
      <span className="animate-pulse bg-white text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">ADMIN VIEW</span>
      <span>Impersonating student <span className="underline font-black">{studentName}</span> dashboard. You have full view and edit privileges.</span>
    </div>
    <button 
      onClick={onExit}
      className="bg-white/20 hover:bg-white text-white hover:text-orange-600 border border-white/30 hover:border-transparent px-3 py-1 rounded-lg transition-all font-black uppercase text-[10px] tracking-wider cursor-pointer"
    >
      Exit Portal
    </button>
  </div>
);