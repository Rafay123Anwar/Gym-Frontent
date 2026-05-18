import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import MemberDetailPage from './pages/MemberDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import MembershipRenewalPage from './pages/MembershipRenewalPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import PlansPage from './pages/PlansPage';
import ProtectedRoute from './components/ProtectedRoute';
import ModalContainer from './components/ui/ModalContainer';
import { useThemeStore } from './store/themeStore';

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Admin Routes */}
        <Route path="/" element={<ProtectedRoute><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute><AdminLayout><MembersPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/members/:id" element={<ProtectedRoute><AdminLayout><MemberDetailPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/payments/*" element={<ProtectedRoute><AdminLayout><PaymentsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/renewals" element={<ProtectedRoute><AdminLayout><MembershipRenewalPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/reports/*" element={<ProtectedRoute><AdminLayout><ReportsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/settings/*" element={<ProtectedRoute><AdminLayout><SettingsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><AdminLayout><PlansPage /></AdminLayout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ModalContainer />
    </Router>
  );
}

export default App;
