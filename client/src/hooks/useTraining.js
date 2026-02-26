// ============================================================
// CPMS – Training Hooks (src/hooks/useTraining.js)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as trainingApi from '@/lib/api/training'

// ── All Sessions ────────────────────────────────────────────
export const useSessions = () => {
    return useQuery({
        queryKey: ['training-sessions'],
        queryFn: trainingApi.fetchSessions
    })
}

// ── Create Session (Admin) ──────────────────────────────────
export const useCreateSession = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: trainingApi.createSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-sessions'] })
        }
    })
}

// ── Delete Session (Admin) ──────────────────────────────────
export const useDeleteSession = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: trainingApi.deleteSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-sessions'] })
        }
    })
}

// ── Session Attendance Query (Admin) ────────────────────────
export const useSessionAttendance = (sessionId) => {
    return useQuery({
        queryKey: ['training-attendance', sessionId],
        queryFn: () => trainingApi.fetchAttendance(sessionId),
        enabled: !!sessionId
    })
}

// ── Mark Attendance Mutation (Admin) ────────────────────────
export const useMarkAttendance = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: trainingApi.markAttendance,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['training-attendance', variables.sessionId] })
            queryClient.invalidateQueries({ queryKey: ['training-sessions'] }) // Update overall totals
        }
    })
}

// ── Join Session (Student) ──────────────────────────────────
export const useJoinSession = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: trainingApi.joinSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-sessions'] }) // Refetch to show myStatus
        }
    })
}
