// ============================================================
// CPMS – Rounds API Calls (src/lib/api/round.js)
// ============================================================

import api from '../axiosInstance'

export const fetchCompanyRounds = async (companyId) => {
    const res = await api.get(`/rounds/company/${companyId}`)
    return res.data.rounds
}

export const createRound = async ({ companyId, data }) => {
    const res = await api.post(`/rounds/company/${companyId}`, data)
    return res.data.round
}

export const updateStudentStatus = async ({ roundId, studentId, status, feedback }) => {
    const res = await api.patch(`/rounds/${roundId}/results`, { studentId, status, feedback })
    return res.data.result
}
