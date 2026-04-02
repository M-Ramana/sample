import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Audit1 from './pages/Audit1';
import Audit2 from './pages/Audit2';
import Audit3 from './pages/Audit3';
import ResearchPapers from './pages/ResearchPapers';
import Reports from './pages/Reports';
import MarksView from './pages/MarksView';
import TestMarks from './pages/TestMarks';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="audit1" element={<Audit1 />} />
            <Route path="audit2" element={<Audit2 />} />
            <Route path="audit3" element={<Audit3 />} />
            <Route path="marks-view" element={<MarksView />} />
            <Route path="test-marks" element={<TestMarks />} />
            <Route path="research" element={<ResearchPapers />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
