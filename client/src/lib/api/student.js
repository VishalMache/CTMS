// ============================================================
// CPMS – Student API Calls (src/lib/api/student.js)
// Pure Axios functions for the Student module
// ============================================================

import api from '../axiosInstance'

export const fetchProfile = async () => {
    const res = await api.get('/students/profile')
    return res.data.student
}

export const updateProfile = async (data) => {
    const res = await api.patch('/students/profile', data)
    return res.data.student
}

export const fetchStats = async () => {
    const res = await api.get('/students/stats')
    return res.data.stats
}

export const fetchApplications = async () => {
    const res = await api.get('/students/applications')
    return res.data.applications
}

// ── Uploads (multipart/form-data) ───────────────────────────

export const uploadResume = async (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    const res = await api.post('/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.resumeUrl
}

export const uploadPhoto = async (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    const res = await api.post('/students/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.profilePhotoUrl
}

// ── Certificates ────────────────────────────────────────────

export const fetchCertificates = async () => {
    const res = await api.get('/students/certificates')
    return res.data.certificates
}

export const addCertificate = async ({ file, title, type }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('type', type)

    const res = await api.post('/students/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.certificate
}

export const deleteCertificate = async (id) => {
    const res = await api.delete(`/students/certificates/${id}`)
    return res.data
}
