// ============================================================
// CPMS – Notification Hooks (src/hooks/useNotification.js)
// Real-time polling via refetchInterval
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as notifApi from '@/lib/api/notification'
import { useAuth } from '@/context/AuthContext'

export const useNotifications = () => {
    const { token } = useAuth()

    return useQuery({
        queryKey: ['notifications'],
        queryFn: notifApi.fetchNotifications,
        enabled: !!token,
        refetchInterval: 30000, // Background polling every 30 seconds for real-time alerts
        staleTime: 10000,
    })
}

export const useMarkAsRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: notifApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })
}

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: notifApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })
}

export const useBroadcastNotification = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: notifApi.broadcastNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })
}
