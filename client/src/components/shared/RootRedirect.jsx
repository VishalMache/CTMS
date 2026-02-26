import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui'

const RootRedirect = () => {
    const { isAuthenticated, user, isLoadingUser } = useAuth()

    if (isLoadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Spinner size={32} />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (user?.role === 'TPO_ADMIN') {
        return <Navigate to="/admin/dashboard" replace />
    }

    return <Navigate to="/student/dashboard" replace />
}

export default RootRedirect
