// ============================================================
// CPMS – Reports API Calls (src/lib/api/reports.js)
// ============================================================

import api from '../axiosInstance'

export const fetchDashboardStats = async () => {
    const res = await api.get('/reports/dashboard-stats')
    return res.data
}

export const fetchBranchPlacements = async () => {
    const res = await api.get('/reports/branch-placements')
    return res.data
}

export const fetchCompanySelections = async () => {
    const res = await api.get('/reports/company-selections')
    return res.data
}

export const fetchStudentExportData = async () => {
    const res = await api.get('/reports/export-students')
    return res.data
}
