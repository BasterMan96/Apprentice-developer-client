import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MainPage from './pages/MainPage'
import CoursesPage from './pages/CoursesPage'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import MyLearningPage from './pages/MyLearningPage'
import ProfilePage from './pages/ProfilePage'
import PortfolioPage from './pages/PortfolioPage'
import CertificatesPage from './pages/CertificatesPage'
import ParentDashboardPage from './pages/ParentDashboardPage'
import { useAuthStore } from './store/authStore'

function LessonPageWrapper() {
  const { lessonId } = useParams()
  return <LessonPage key={lessonId} />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes inside Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<MainPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPageWrapper />} />
          <Route path="/learning" element={<MyLearningPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/parent" element={<ParentDashboardPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
