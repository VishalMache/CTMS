// ============================================================
// CPMS – Reports Hooks (src/hooks/useReports.js)
// ============================================================

import { useQuery } from '@tanstack/react-query'
import * as reportsApi from '@/lib/api/reports'

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['report-stats'],
        queryFn: reportsApi.fetchDashboardStats
    })
}

export const useBranchPlacements = () => {
    return useQuery({
        queryKey: ['report-branch'],
        queryFn: reportsApi.fetchBranchPlacements
    })
}

export const useCompanySelections = () => {
    return useQuery({
        queryKey: ['report-company'],
        queryFn: reportsApi.fetchCompanySelections
    })
}

// Kept as a raw fetch call because downloading a CSV is generally not cached
// and triggered imperatively rather than reactively rendered.
export const fetchExportData = reportsApi.fetchStudentExportData
