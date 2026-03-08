import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NavBar, Footer, LoadingSkeleton } from './components/common';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CVEDetailsPage } from './pages/CVEDetailsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { CVSSCalculatorPage } from './pages/CVSSCalculatorPage';
import { AssetInventoryPage } from './pages/AssetInventoryPage';
import { RiskDashboardPage } from './pages/RiskDashboardPage';
import { DeveloperPage } from './pages/DeveloperPage';
import { ThreatLandscapePage } from './pages/ThreatLandscapePage';
import { LiveFeedPage } from './pages/LiveFeedPage';
import { CVEComparePage } from './pages/CVEComparePage';
import { LearnCenterPage } from './pages/LearnCenterPage';
import { MFASettingsPage } from './pages/MFASettingsPage';
import { UserSettingsPage } from './pages/UserSettingsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { DataSyncPage } from './pages/admin/DataSyncPage';
import { LearnCenterManagePage } from './pages/admin/LearnCenterManagePage';
import './index.css';

const FullPageLoader = () => (
  <div className="min-h-screen bg-page flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main"></div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  return (
    <div className="min-h-screen bg-page transition-theme">
      <NavBar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage onExplore={() => {}} />} />
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        {/* Public tools */}
        <Route path="/cvss-calculator" element={<CVSSCalculatorPage />} />
        <Route path="/threats" element={<ThreatLandscapePage />} />
        <Route path="/live" element={<LiveFeedPage />} />
        <Route path="/compare" element={<CVEComparePage />} />
        <Route path="/learn" element={<LearnCenterPage />} />
        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/cve/:cveId" element={<ProtectedRoute><CVEDetailsPage /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
        <Route path="/assets" element={<ProtectedRoute><AssetInventoryPage /></ProtectedRoute>} />
        <Route path="/risk" element={<ProtectedRoute><RiskDashboardPage /></ProtectedRoute>} />
        <Route path="/developer" element={<ProtectedRoute><DeveloperPage /></ProtectedRoute>} />
        <Route path="/mfa" element={<ProtectedRoute><MFASettingsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><UserSettingsPage /></ProtectedRoute>} />
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagementPage /></ProtectedRoute>} />
        <Route path="/admin/activity" element={<ProtectedRoute adminOnly><ActivityLogsPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute adminOnly><ReportsPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettingsPage /></ProtectedRoute>} />
        <Route path="/admin/sync" element={<ProtectedRoute adminOnly><DataSyncPage /></ProtectedRoute>} />
        <Route path="/admin/learn" element={<ProtectedRoute adminOnly><LearnCenterManagePage /></ProtectedRoute>} />
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
};

// Main App with Router
function App() {
  return (
    <ThemeProvider>
      <Router>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
