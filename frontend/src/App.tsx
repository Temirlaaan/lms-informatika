import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import PublicLayout from './components/layout/PublicLayout';
import StudentLayout from './components/layout/StudentLayout';
import TeacherLayout from './components/layout/TeacherLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import GuestRoute from './components/common/GuestRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
// Student pages
import StudentDashboard from './pages/student/DashboardPage';
import SectionsPage from './pages/student/SectionsPage';
import SectionDetailPage from './pages/student/SectionDetailPage';
import TopicDetailPage from './pages/student/TopicDetailPage';
import GradesPage from './pages/student/GradesPage';
import QuizPage from './pages/student/QuizPage';
import QuizResultPage from './pages/student/QuizResultPage';
// Teacher pages
import TeacherDashboard from './pages/teacher/DashboardPage';
import ContentManagerPage from './pages/teacher/ContentManagerPage';
import QuizManagerPage from './pages/teacher/QuizManagerPage';
import GradebookPage from './pages/teacher/GradebookPage';
import StudentsListPage from './pages/teacher/StudentsListPage';
import StudentDetailPage from './pages/teacher/StudentDetailPage';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public routes — redirect logged-in users to dashboard */}
              <Route element={<GuestRoute />}>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>
              </Route>

              {/* Student routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route element={<StudentLayout />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/sections" element={<SectionsPage />} />
                  <Route path="/student/sections/:id" element={<SectionDetailPage />} />
                  <Route path="/student/topics/:id" element={<TopicDetailPage />} />
                  <Route path="/student/grades" element={<GradesPage />} />
                  <Route path="/student/quiz/:id" element={<QuizPage />} />
                  <Route path="/student/quiz/:id/result" element={<QuizResultPage />} />
                  <Route path="/student/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Teacher routes */}
              <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                <Route element={<TeacherLayout />}>
                  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="/teacher/content" element={<ContentManagerPage />} />
                  <Route path="/teacher/quizzes" element={<QuizManagerPage />} />
                  <Route path="/teacher/gradebook" element={<GradebookPage />} />
                  <Route path="/teacher/students" element={<StudentsListPage />} />
                  <Route path="/teacher/students/:id" element={<StudentDetailPage />} />
                  <Route path="/teacher/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
