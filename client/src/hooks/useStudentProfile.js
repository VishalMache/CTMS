// ============================================================
// CPMS – Student Hooks (src/hooks/useStudentProfile.js)
// React Query wrappers for the Student profile + resume logic
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as studentApi from '@/lib/api/student'
import { useAuth } from '@/context/AuthContext'

export const useStudentProfile = () => {
    const { token } = useAuth()

    return useQuery({
        queryKey: ['studentProfile'],
        queryFn: studentApi.fetchProfile,
        enabled: !!token,
        staleTime: 1000 * 60 * 5, // 5 min
    })
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: studentApi.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] })
        },
    })
}

export const useUploadPhoto = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: studentApi.uploadPhoto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] })
            // Also invalidate global 'me' to immediately update TopHeader avatar
            queryClient.invalidateQueries({ queryKey: ['me'] })
        },
    })
}

export const useUploadResume = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: studentApi.uploadResume,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] })
        },
    })
}
