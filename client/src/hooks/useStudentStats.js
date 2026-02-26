// ============================================================
// CPMS – Student Stats Hooks (src/hooks/useStudentStats.js)
// Wrappers for dashboard stats, applications, and certificates
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as studentApi from '@/lib/api/student'
import { useAuth } from '@/context/AuthContext'

export const useStudentStats = () => {
    const { token } = useAuth()

    return useQuery({
        queryKey: ['studentStats'],
        queryFn: studentApi.fetchStats,
        enabled: !!token,
    })
}

export const useStudentApplications = () => {
    const { token } = useAuth()

    return useQuery({
        queryKey: ['studentApplications'],
        queryFn: studentApi.fetchApplications,
        enabled: !!token,
    })
}

export const useCertificates = () => {
    const { token } = useAuth()

    return useQuery({
        queryKey: ['studentCertificates'],
        queryFn: studentApi.fetchCertificates,
        enabled: !!token,
    })
}

export const useAddCertificate = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: studentApi.addCertificate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentCertificates'] })
        },
    })
}

export const useDeleteCertificate = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: studentApi.deleteCertificate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentCertificates'] })
        },
    })
}
