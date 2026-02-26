// ============================================================
// CPMS – Dashboard Layout (src/components/shared/DashboardLayout.jsx)
// Wraps all protected pages with Sidebar + TopHeader
// ============================================================

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import { Spinner } from '@/components/ui'

const DashboardLayout = ({ children, title, subtitle }) => {
    const { isLoadingUser } = useAuth()

    if (isLoadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-3">
                    <Spinner size={36} />
                    <p className="text-sm text-slate-400 font-medium">Loading your workspace…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main content area — offset by sidebar width */}
            <div className="flex-1 flex flex-col min-h-screen ml-[240px] transition-[margin] duration-300">
                <TopHeader title={title} subtitle={subtitle} />

                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
