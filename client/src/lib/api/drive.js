// ============================================================
// CPMS – Drive API Calls (src/lib/api/drive.js)
// ============================================================

import api from '../axiosInstance'

export const registerForDrive = async (companyId) => {
    const res = await api.post(`/drives/${companyId}/register`)
    return res.data
}

export const fetchRegisteredStudents = async (companyId) => {
    const res = await api.get(`/drives/${companyId}/students`)
    return res.data.students
}
