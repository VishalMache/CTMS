// ============================================================
// CPMS – Protected Route (src/components/shared/ProtectedRoute.jsx)
// Guards routes based on auth status and user role
// ============================================================

import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui'

/**
 * @param {string} [requiredRole] - 'STUDENT' | 'TPO_ADMIN' | undefined (any authenticated user)
 */
const ProtectedRoute = ({ requiredRole }) => {
    const { isAuthenticated, isLoadingUser, user } = useAuth()

    // Show spinner while fetching user session
    if (isLoadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Spinner size={32} />
            </div>
        )
    }

    // Not authenticated → redirect to specific login based on last known role
    if (!isAuthenticated) {
        const lastRole = localStorage.getItem('cpms_last_role')
        if (lastRole === 'TPO_ADMIN') return <Navigate to="/login/admin" replace />
        if (lastRole === 'STUDENT') return <Navigate to="/login/student" replace />
        return <Navigate to="/login" replace />
    }

    // Wrong role → redirect to their own dashboard
    if (requiredRole && user?.role !== requiredRole) {
        const fallback = user?.role === 'TPO_ADMIN' ? '/admin/dashboard' : '/student/dashboard'
        return <Navigate to={fallback} replace />
    }

    return <Outlet />
}

export default ProtectedRoute
