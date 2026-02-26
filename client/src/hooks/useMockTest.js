// ============================================================
// CPMS – Mock Test Hooks (src/hooks/useMockTest.js)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as mockTestApi from '@/lib/api/mockTest'

export const useTests = () => {
    return useQuery({
        queryKey: ['mock-tests'],
        queryFn: mockTestApi.fetchTests
    })
}

export const useCreateTest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mockTestApi.createTest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mock-tests'] })
    })
}

export const useToggleTest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mockTestApi.toggleTest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mock-tests'] })
    })
}

export const useDeleteTest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mockTestApi.deleteTest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mock-tests'] })
    })
}

export const useAddQuestion = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mockTestApi.addQuestion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mock-tests'] })
    })
}

export const useDeleteQuestion = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mockTestApi.deleteQuestion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mock-tests'] })
    })
}

// ── Student specific ────────────────────────────────────────
export const useTakeTest = (testId) => {
    return useQuery({
        queryKey: ['take-test', testId],
        queryFn: () => mockTestApi.takeTest(testId),
        enabled: !!testId,
        refetchOnWindowFocus: false // Don't refetch while they are taking the test
    })
}

export const useSubmitTest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mockTestApi.submitTest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mock-tests'] })
    })
}

// ── Admin Results ───────────────────────────────────────────
export const useTestResults = (testId) => {
    return useQuery({
        queryKey: ['mock-test-results', testId],
        queryFn: () => mockTestApi.fetchTestResults(testId),
        enabled: !!testId
    })
}
