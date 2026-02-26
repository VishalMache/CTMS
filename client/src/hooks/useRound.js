// ============================================================
// CPMS – Round Hooks (src/hooks/useRound.js)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as roundApi from '@/lib/api/round'

export const useRounds = (companyId) => {
    return useQuery({
        queryKey: ['rounds', companyId],
        queryFn: () => roundApi.fetchCompanyRounds(companyId),
        enabled: !!companyId,
    })
}

export const useCreateRound = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: roundApi.createRound,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['rounds', variables.companyId] })
        }
    })
}

export const useUpdateStudentStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: roundApi.updateStudentStatus,
        onSuccess: () => {
            // Need to invalidate rounds for whichever company we're looking at.
            // Since we don't have companyId in the mutation result easily here,
            // we invalidate all round queries to be safe.
            queryClient.invalidateQueries({ queryKey: ['rounds'] })
        }
    })
}
