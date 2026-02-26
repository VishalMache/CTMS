// ============================================================
// CPMS – Company Hooks (src/hooks/useCompany.js)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as companyApi from '@/lib/api/company'
import { useAuth } from '@/context/AuthContext'

export const useAdminDashboardStats = () => {
    const { token } = useAuth()
    return useQuery({
        queryKey: ['adminDashboardStats'],
        queryFn: companyApi.fetchAdminDashboardStats,
        enabled: !!token,
        staleTime: 1000 * 60, // 1 min
    })
}

export const useCompanies = () => {
    const { token } = useAuth()
    return useQuery({
        queryKey: ['companies'],
        queryFn: companyApi.fetchCompanies,
        enabled: !!token,
    })
}

export const useCompanyById = (id) => {
    const { token } = useAuth()
    return useQuery({
        queryKey: ['company', id],
        queryFn: () => companyApi.fetchCompanyById(id),
        enabled: !!token && !!id,
    })
}

export const useCreateCompany = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: companyApi.createCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
        }
    })
}

export const useUpdateCompany = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: companyApi.updateCompany,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            queryClient.invalidateQueries({ queryKey: ['company', variables.id] })
        }
    })
}

export const useDeleteCompany = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: companyApi.deleteCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
        }
    })
}
