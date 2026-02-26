// ============================================================
// CPMS – Auth Context (src/context/AuthContext.jsx)
// Wraps React Query useQuery for current user + auth actions
// ============================================================

import React, { createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axiosInstance'
import useAuthStore from '@/store/authStore'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { token, user, setAuth, logout: storeLogout } = useAuthStore()

    // ── Fetch current user from /api/auth/me ─────────────────
    const { data: currentUser, isLoading: isLoadingUser } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('/auth/me')
            return res.data.user
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 5, // 5 min
        retry: false,
    })

    // ── Login mutation ────────────────────────────────────────
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const res = await api.post('/auth/login', credentials)
            return res.data
        },
        onSuccess: (data) => {
            setAuth(data.token, data.user)
            queryClient.invalidateQueries({ queryKey: ['me'] })
            // Redirect based on role
            if (data.user.role === 'TPO_ADMIN') {
                navigate('/admin/dashboard')
            } else {
                navigate('/student/dashboard')
            }
        },
    })

    // ── Register mutation ─────────────────────────────────────
    const registerMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await api.post('/auth/register', formData)
            return res.data
        },
        onSuccess: (data) => {
            setAuth(data.token, data.user)
            queryClient.invalidateQueries({ queryKey: ['me'] })
            // Redirect based on role — admin goes to admin dashboard
            if (data.user.role === 'TPO_ADMIN') {
                navigate('/admin/dashboard')
            } else {
                navigate('/student/dashboard')
            }
        },
    })

    // ── Logout ────────────────────────────────────────────────
    const logout = () => {
        storeLogout()
        queryClient.clear()
        navigate('/login')
    }

    const isStudent = () => {
        const current = currentUser || user
        return current?.role === 'STUDENT'
    }

    const isAdmin = () => {
        const current = currentUser || user
        return current?.role === 'TPO_ADMIN'
    }

    const value = {
        user: currentUser || user,
        token,
        isAuthenticated: !!token,
        isLoadingUser,
        login: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,
        register: registerMutation.mutateAsync,
        isRegistering: registerMutation.isPending,
        registerError: registerMutation.error,
        logout,
        isStudent,
        isAdmin,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook to consume AuthContext */
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}
