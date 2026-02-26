// ============================================================
// CPMS – Mock Test API Calls (src/lib/api/mockTest.js)
// ============================================================

import api from '../axiosInstance'

export const fetchTests = async () => {
    const res = await api.get('/mock-tests')
    return res.data
}

export const createTest = async (data) => {
    const res = await api.post('/mock-tests', data)
    return res.data
}

export const toggleTest = async (id) => {
    const res = await api.patch(`/mock-tests/${id}/toggle`)
    return res.data
}

export const deleteTest = async (id) => {
    const res = await api.delete(`/mock-tests/${id}`)
    return res.data
}

export const addQuestion = async ({ testId, data }) => {
    const res = await api.post(`/mock-tests/${testId}/questions`, data)
    return res.data
}

export const deleteQuestion = async (questionId) => {
    const res = await api.delete(`/mock-tests/questions/${questionId}`)
    return res.data
}

export const takeTest = async (id) => {
    const res = await api.get(`/mock-tests/${id}/take`)
    return res.data
}

export const submitTest = async ({ testId, answers }) => {
    const res = await api.post(`/mock-tests/${testId}/submit`, { answers })
    return res.data
}

export const fetchTestResults = async (testId) => {
    const res = await api.get(`/mock-tests/${testId}/results`)
    return res.data
}
