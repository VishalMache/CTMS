// ============================================================
// CPMS – Company API Calls (src/lib/api/company.js)
// ============================================================

import api from '../axiosInstance'

export const fetchAdminDashboardStats = async () => {
    const res = await api.get('/companies/stats/dashboard')
    return res.data
}

export const fetchCompanies = async () => {
    const res = await api.get('/companies')
    return res.data.companies
}

export const fetchCompanyById = async (id) => {
    const res = await api.get(`/companies/${id}`)
    return res.data.company
}

export const createCompany = async (data) => {
    const res = await api.post('/companies', data)
    return res.data.company
}

export const updateCompany = async ({ id, data }) => {
    const res = await api.patch(`/companies/${id}`, data)
    return res.data.company
}

export const deleteCompany = async (id) => {
    const res = await api.delete(`/companies/${id}`)
    return res.data
}
