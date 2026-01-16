import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OpeningPage from './pages/OpeningPage';
import DashboardPage from './pages/DashboardPage';
import CorePage from './pages/CorePage';
import CommunicationsPage from './pages/CommunicationsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import hzeLogo from './assets/hze-icon.png';
import { LogOut } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-espresso-100 text-espresso-900">Loading...</div>;

  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or unauthorized page
  }

  return children;
};

const AppContent = () => {
  const { user, activeShift, loading, logout } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-espresso-100 text-espresso-900">Loading App...</div>;

  // If not logged in, show Login Page
  if (!user) {
    return <LoginPage />;
  }

  // If logged in, route based on Role and State
  return (
    <div className="min-h-screen bg-enzi-black text-enzi-text font-sans">
      {/* Simple Navbar for logged in users */}
      <nav className="bg-enzi-card/50 backdrop-blur-md border-b border-enzi-muted/10 sticky top-0 z-50">
        <div className="container mx-auto p-4 max-w-3xl flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wider text-enzi-text flex items-center gap-2">
            <img src={hzeLogo} alt="HZE Logo" className="w-6 h-6" /> Shiftflow
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-enzi-muted font-medium uppercase tracking-wide">{user.name} <span className="text-enzi-gold">({user.role})</span></span>
            <button
              onClick={logout}
              className="p-2 text-enzi-muted hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 max-w-3xl">
        <Routes>
          {/* Barista Routes */}
          {user.role === 'barista' && (
            <>
              <Route path="/" element={
                activeShift ? <Navigate to="/dashboard" replace /> : <OpeningPage />
              } />
              <Route path="/dashboard" element={
                activeShift ? <DashboardPage /> : <Navigate to="/" replace />
              } />
            </>
          )}

          {/* Manager/Core Routes */}
          {(user.role === 'manager' || user.role === 'core') && (
            <>
              <Route path="/" element={<Navigate to="/core" replace />} />
              <Route path="/core" element={<CorePage />} />
              <Route path="/core/communications" element={<CommunicationsPage />} />
            </>
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
