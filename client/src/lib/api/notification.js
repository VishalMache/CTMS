// ============================================================
// CPMS – Notifications API Calls (src/lib/api/notification.js)
// ============================================================

import api from '../axiosInstance'

export const fetchNotifications = async () => {
    const res = await api.get('/notifications')
    return res.data
}

export const markAsRead = async (id) => {
    const res = await api.patch(`/notifications/${id}/read`)
    return res.data
}

export const markAllAsRead = async () => {
    const res = await api.patch('/notifications/read-all')
    return res.data
}

export const broadcastNotification = async (data) => {
    const res = await api.post('/notifications/broadcast', data)
    return res.data
}
