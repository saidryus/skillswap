import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import CoursesPage from './pages/admin/CoursesPage';
import TutorApplicationsPage from './pages/admin/TutorApplicationsPage';
import SessionsPage from './pages/admin/SessionsPage';
import StudentSchedulesPage from './pages/admin/StudentSchedulesPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import FindTutorPage from './pages/student/FindTutorPage';
import BookSessionPage from './pages/student/BookSessionPage';
import MySessionsPage from './pages/student/MySessionsPage';
import BecomeTutorPage from './pages/student/BecomeTutorPage';
import MySchedulePage from './pages/student/MySchedulePage';

import AnnouncementsPage from './pages/shared/AnnouncementsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-surface-50 dark:bg-surface-950 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-primary-100 dark:border-primary-900 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-t-primary-500 rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/student" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="tutor-applications" element={<TutorApplicationsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="student-schedules" element={<StudentSchedulesPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="find-tutor" element={<FindTutorPage />} />
        <Route path="book-session" element={<BookSessionPage />} />
        <Route path="my-sessions" element={<MySessionsPage />} />
        <Route path="become-tutor" element={<BecomeTutorPage />} />
        <Route path="my-schedule" element={<MySchedulePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
