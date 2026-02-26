// ============================================================
// CPMS – Training API Calls (src/lib/api/training.js)
// ============================================================

import api from '../axiosInstance'

export const fetchSessions = async () => {
    const res = await api.get('/training')
    return res.data
}

export const createSession = async (data) => {
    const res = await api.post('/training', data)
    return res.data
}

export const deleteSession = async (id) => {
    const res = await api.delete(`/training/${id}`)
    return res.data
}

export const fetchAttendance = async (sessionId) => {
    const res = await api.get(`/training/${sessionId}/attendance`)
    return res.data
}

export const markAttendance = async ({ sessionId, studentIds }) => {
    const res = await api.post(`/training/${sessionId}/attendance`, { studentIds })
    return res.data
}

export const joinSession = async (sessionId) => {
    const res = await api.post(`/training/${sessionId}/join`)
    return res.data
}
