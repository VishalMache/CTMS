// ============================================================
// CPMS – Student Companies List (src/pages/student/CompaniesList.jsx)
// ============================================================

import React, { useState } from 'react'
import { Building2, MapPin, DollarSign, Calendar, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useCompanies } from '@/hooks/useCompany'
import { useRegisterForDrive } from '@/hooks/useDrive'
import { useStudentStats } from '@/hooks/useStudentStats'

const CompanyCard = ({ company, isApplying, onApply, appliedDrives }) => {
    // Check if student has already applied
    const hasApplied = appliedDrives?.some(app => app.company.id === company.id)

    return (
        <Card className="flex flex-col h-full overflow-hidden border-slate-200 hover:border-indigo-200 transition-colors group">
            <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-105 transition-transform">
                        {company.name.charAt(0)}
                    </div>
                    <Badge variant={company.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {company.status}
                    </Badge>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-1">{company.name}</h3>
                <p className="text-slate-500 font-medium text-sm mb-4">{company.jobRole}</p>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <DollarSign size={16} className="text-emerald-500" />
                        <span className="font-semibold">{company.ctc} LPA</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Calendar size={16} className="text-amber-500" />
                        <span>Date: {new Date(company.driveDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                        <GraduationCap size={16} className="text-blue-500 mt-0.5 shrink-0" />
                        <div>
                            <p>Min CGPA: <span className="font-semibold">{company.eligibilityCGPA}</span></p>
                            <p className="text-xs text-slate-400 mt-0.5" title={company.allowedBranches}>
                                Branches: {company.allowedBranches}
                            </p>
                        </div>
                    </div>
                </div>

                {company.description && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500 line-clamp-2">{company.description}</p>
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                {hasApplied ? (
                    <Button variant="outline" className="w-full gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-50 cursor-default">
                        <CheckCircle2 size={16} /> Applied
                    </Button>
                ) : (
                    <Button
                        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        onClick={() => onApply(company)}
                        disabled={isApplying || company.status !== 'ACTIVE'}
                        title={company.status !== 'ACTIVE' ? "Drive is not currently accepting applications" : ""}
                    >
                        {isApplying ? <Spinner size={16} className="text-white" /> : "Apply Now"}
                        {!isApplying && <ArrowRight size={16} />}
                    </Button>
                )}
            </div>
        </Card>
    )
}

const CompaniesList = () => {
    const { data: companies, isLoading: loadingCompanies } = useCompanies()
    const { mutate: register, isPending: isRegistering } = useRegisterForDrive()

    // We need to know which ones the student already applied to.
    // useStudentStats returns an `applications` array containing registered drives
    const { data: statsData, isLoading: loadingStats } = useStudentStats()
    const [applyingTo, setApplyingTo] = useState(null)
    const [errorMsg, setErrorMsg] = useState('')

    const isLoading = loadingCompanies || loadingStats

    const handleApply = (company) => {
        if (!window.confirm(`Apply for ${company.name}? The system will check your eligibility limits.`)) return

        setErrorMsg('')
        setApplyingTo(company.id)

        register(company.id, {
            onSuccess: () => {
                setApplyingTo(null)
                alert(`Successfully registered for ${company.name}!`)
            },
            onError: (error) => {
                setApplyingTo(null)
                // Extract backend validation specific reason array if provided
                const reasons = error.response?.data?.reasons
                if (reasons && reasons.length > 0) {
                    setErrorMsg(`${error.response.data.message}\n• ${reasons.join('\n• ')}`)
                } else {
                    setErrorMsg(error.response?.data?.message || 'Failed to apply.')
                }
            }
        })
    }

    if (isLoading) {
        return (
            <DashboardLayout title="Campus Drives" subtitle="Discover and apply to partner companies">
                <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
            </DashboardLayout>
        )
    }

    const appliedDrives = statsData?.applications || []

    return (
        <DashboardLayout title="Campus Drives" subtitle="Discover and apply to partner companies">

            {errorMsg && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-wrap">
                    <span className="font-bold">Eligibility Check Failed:</span>
                    {'\n'}{errorMsg}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Available Opportunities
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Ensure your profile is up to date before applying.
                    </p>
                </div>
            </div>

            {companies?.length === 0 ? (
                <Card className="py-16 px-6 text-center border-dashed border-2">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Building2 size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-700">No Active Drives</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                        There are currently no active company drives open for registration. Check back later!
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                        <CompanyCard
                            key={company.id}
                            company={company}
                            isApplying={applyingTo === company.id}
                            onApply={handleApply}
                            appliedDrives={appliedDrives}
                        />
                    ))}
                </div>
            )}

        </DashboardLayout>
    )
}

export default CompaniesList
