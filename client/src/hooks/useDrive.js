// ============================================================
// CPMS – Drive Hooks (src/hooks/useDrive.js)
// ============================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as driveApi from '@/lib/api/drive'

export const useRegisterForDrive = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: driveApi.registerForDrive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentStats'] })
            queryClient.invalidateQueries({ queryKey: ['studentApplications'] })
            queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
        }
    })
}

export const useRegisteredStudents = (companyId) => {
    return useQuery({
        queryKey: ['registeredStudents', companyId],
        queryFn: () => driveApi.fetchRegisteredStudents(companyId),
        enabled: !!companyId,
    })
}
