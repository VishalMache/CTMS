// ============================================================
// CPMS – Axios Instance (src/lib/axiosInstance.js)
// ============================================================

import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
})

// ── Request interceptor: attach JWT from localStorage ─────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('cpms_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 (token expired) ─────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('cpms_token')
            localStorage.removeItem('cpms_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
