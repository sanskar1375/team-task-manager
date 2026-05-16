import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { useToast } from './lib/toast';
import { setUnauthorizedHandler } from './lib/api';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { NotFound } from './pages/NotFound';

export function App() {
  const { logout, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (user) {
        logout();
        toast.error('Your session expired. Please log in again.');
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, toast, user]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
