// ============================================================
// CPMS – App Router (src/App.jsx)
// React Router v6 route tree with role-based protection
// ============================================================

import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Spinner } from '@/components/ui'

// ── Lazy-loaded pages ────────────────────────────────────────
const AuthLanding = lazy(() => import('@/pages/auth/AuthLanding'))
const RootRedirect = lazy(() => import('@/components/shared/RootRedirect'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const StudentLogin = lazy(() => import('@/pages/auth/StudentLogin'))
const AdminLogin = lazy(() => import('@/pages/auth/AdminLogin'))
const StudentRegister = lazy(() => import('@/pages/auth/StudentRegister'))
const AdminRegister = lazy(() => import('@/pages/auth/AdminRegister'))
// Student pages (Phase 2+ will fill these in)
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'))
const StudentProfile = lazy(() => import('@/pages/student/StudentProfile'))
const StudentResume = lazy(() => import('@/pages/student/StudentResume'))
const CompaniesList = lazy(() => import('@/pages/student/CompaniesList'))
const StudentApplications = lazy(() => import('@/pages/student/StudentApplications'))
const StudentTraining = lazy(() => import('@/pages/student/StudentTraining'))
const StudentMockTests = lazy(() => import('@/pages/student/StudentMockTests'))
const StudentNotifs = lazy(() => import('@/pages/student/StudentNotifications'))

// Admin pages (Phase 3+ will fill these in)
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminStudents = lazy(() => import('@/pages/admin/AdminStudents'))
const CompanyManagement = lazy(() => import('@/pages/admin/CompanyManagement'))
const CompanyDriveManager = lazy(() => import('@/pages/admin/CompanyDriveManager'))
const AdminTraining = lazy(() => import('@/pages/admin/AdminTraining'))
const AdminMockTests = lazy(() => import('@/pages/admin/AdminMockTests'))
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'))
const AdminNotifs = lazy(() => import('@/pages/admin/AdminNotifications'))

// ── Page-level loading fallback ──────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Spinner size={32} />
  </div>
)

// ─────────────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<AuthLanding />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/admin" element={<AdminRegister />} />
        <Route path="/" element={<RootRedirect />} />

        {/* ── Student Routes ────────────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="STUDENT" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/resume" element={<StudentResume />} />
          <Route path="/student/companies" element={<CompaniesList />} />
          <Route path="/student/applications" element={<StudentApplications />} />
          <Route path="/student/training" element={<StudentTraining />} />
          <Route path="/student/mock-tests" element={<StudentMockTests />} />
          <Route path="/student/notifications" element={<StudentNotifs />} />
        </Route>

        {/* ── Admin Routes ─────────────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="TPO_ADMIN" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/students/:id" element={<AdminStudents />} />
          <Route path="/admin/companies" element={<CompanyManagement />} />
          <Route path="/admin/companies/:id/manage" element={<CompanyDriveManager />} />
          <Route path="/admin/training" element={<AdminTraining />} />
          <Route path="/admin/mock-tests" element={<AdminMockTests />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/notifications" element={<AdminNotifs />} />
        </Route>

        {/* 404 – catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </AuthProvider>
)

export default App
