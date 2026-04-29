import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import CoursesPage from './pages/admin/CoursesPage';
import SchedulesPage from './pages/admin/SchedulesPage';
import AttendancePage from './pages/admin/AttendancePage';
import AnnouncementsPage from './pages/shared/AnnouncementsPage';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyAttendancePage from './pages/faculty/FacultyAttendancePage';
import FacultyCoursesPage from './pages/faculty/FacultyCoursesPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSchedulePage from './pages/student/StudentSchedulePage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import PrintStudyLoad from './pages/print/PrintStudyLoad';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
  return <Navigate to="/student" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Print route - no layout */}
      <Route path="/print/study-load" element={
        <ProtectedRoute roles={['student']}>
          <PrintStudyLoad />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>

      {/* Faculty routes */}
      <Route path="/faculty" element={<ProtectedRoute roles={['faculty']}><Layout /></ProtectedRoute>}>
        <Route index element={<FacultyDashboard />} />
        <Route path="courses" element={<FacultyCoursesPage />} />
        <Route path="attendance" element={<FacultyAttendancePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="schedule" element={<StudentSchedulePage />} />
        <Route path="attendance" element={<StudentAttendancePage />} />
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
