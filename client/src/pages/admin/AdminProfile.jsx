// ============================================================
// CPMS – Admin Profile (src/pages/admin/AdminProfile.jsx)
// ============================================================

import React from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Spinner } from '@/components/ui'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const AdminProfile = () => {
    const { user } = useAuth()

    if (!user) {
        return (
            <DashboardLayout title="My Profile" subtitle="TPO Admin Profile">
                <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="My Profile" subtitle="TPO Admin Profile">
            <div className="max-w-2xl mx-auto">
                <Card className="p-8 sm:p-10 bg-white">

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-10 pb-10 border-b border-slate-100">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-xl ring-4 ring-slate-50 mb-6">
                            <User size={48} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">TPO Administrator</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 mt-3">
                            <Shield size={12} className="mr-1" /> TPO_ADMIN
                        </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Email Address</p>
                                <p className="text-base font-bold text-slate-800">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Role</p>
                                <p className="text-base font-bold text-slate-800">Training & Placement Officer</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Account Created</p>
                                <p className="text-base font-bold text-slate-800">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                </Card>
            </div>
        </DashboardLayout>
    )
}

export default AdminProfile
