// ============================================================
// CPMS – Company Management (src/pages/admin/CompanyManagement.jsx)
// ============================================================

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Calendar, Briefcase, GraduationCap, Building2, ListChecks } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Input, Label, Badge, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompany'

// ── Strict UI Validation Schema matching Backend ────────────
const companySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    jobRole: z.string().min(1, 'Job role is required'),
    ctc: z.coerce.number().min(0, 'CTC must be positive'),
    eligibilityCGPA: z.coerce.number().min(0).max(10, 'CGPA must be between 0 and 10'),
    eligibilityPercent: z.coerce.number().min(0).max(100, 'Percentage must be between 0 and 100'),
    allowedBranches: z.string().min(1, 'At least one branch must be provided (e.g. CSE,IT)'),
    driveDate: z.string().min(1, 'Drive date is required'),
    description: z.string().optional(),
    status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']).default('UPCOMING'),
})

// ── Form Modal Component ────────────────────────────────────
const CompanyModal = ({ open, setOpen, initialData }) => {
    const isEdit = !!initialData

    const { mutate: createCompany, isPending: isCreating } = useCreateCompany()
    const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany()
    const isPending = isCreating || isUpdating

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(companySchema),
        defaultValues: initialData ? {
            ...initialData,
            driveDate: new Date(initialData.driveDate).toISOString().split('T')[0] // format for input type="date"
        } : {
            status: 'UPCOMING',
            eligibilityCGPA: 6.0,
            eligibilityPercent: 60,
            allowedBranches: 'CSE,IT,ECE'
        }
    })

    // Reset when modal opens/closes with different data
    React.useEffect(() => {
        if (open) {
            reset(initialData ? {
                ...initialData,
                driveDate: new Date(initialData.driveDate).toISOString().split('T')[0]
            } : {
                status: 'UPCOMING',
                eligibilityCGPA: 6.0,
                eligibilityPercent: 60,
                allowedBranches: 'CSE,IT,ECE'
            })
        }
    }, [open, initialData, reset])

    const onSubmit = (data) => {
        if (isEdit) {
            updateCompany({ id: initialData.id, data }, {
                onSuccess: () => {
                    setOpen(false)
                    reset()
                }
            })
        } else {
            createCompany(data, {
                onSuccess: () => {
                    setOpen(false)
                    reset()
                }
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="text-teal-500" />
                        {isEdit ? 'Edit Company Profile' : 'Register New Company'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* Basic Details */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Basic Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Company Name</Label>
                                <Input placeholder="e.g. Google" {...register('name')} />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                            </div>
                            <div>
                                <Label>Job Role</Label>
                                <Input placeholder="e.g. SDE-1" {...register('jobRole')} />
                                {errors.jobRole && <p className="mt-1 text-xs text-red-500">{errors.jobRole.message}</p>}
                            </div>
                            <div>
                                <Label>CTC (in LPA)</Label>
                                <Input type="number" step="0.1" placeholder="e.g. 12.5" {...register('ctc')} />
                                {errors.ctc && <p className="mt-1 text-xs text-red-500">{errors.ctc.message}</p>}
                            </div>
                            <div>
                                <Label>Drive Date</Label>
                                <Input type="date" {...register('driveDate')} />
                                {errors.driveDate && <p className="mt-1 text-xs text-red-500">{errors.driveDate.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <Label>Status</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                                    {...register('status')}
                                >
                                    <option value="UPCOMING">Upcoming</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Eligibility Criteria */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
                            <GraduationCap size={16} className="text-amber-500" />
                            Eligibility Criteria
                        </h4>
                        <p className="text-xs text-slate-500">
                            The system will automatically prevent students from registering if they do not meet these minimum requirements.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Minimum CGPA</Label>
                                <Input type="number" step="0.1" placeholder="e.g. 6.5" {...register('eligibilityCGPA')} />
                                {errors.eligibilityCGPA && <p className="mt-1 text-xs text-red-500">{errors.eligibilityCGPA.message}</p>}
                            </div>
                            <div>
                                <Label>Min. 10th & 12th Percentage</Label>
                                <Input type="number" placeholder="e.g. 60" {...register('eligibilityPercent')} />
                                {errors.eligibilityPercent && <p className="mt-1 text-xs text-red-500">{errors.eligibilityPercent.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <Label>Allowed Branches (Comma separated)</Label>
                                <Input placeholder="e.g. CSE,IT,ECE" {...register('allowedBranches')} />
                                {errors.allowedBranches && <p className="mt-1 text-xs text-red-500">{errors.allowedBranches.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <Label>Job Description / Notes (Optional)</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                                    placeholder="Add any specific skills or bonds required..."
                                    {...register('description')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-700">
                            {isPending && <Spinner size={16} className="text-white mr-2" />}
                            {isEdit ? 'Update Company' : 'Save Company'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ── Main Listing Component ──────────────────────────────────
const CompanyManagement = () => {
    const { data: companies, isLoading } = useCompanies()
    const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState(null)

    const handleAdd = () => {
        setSelectedCompany(null)
        setIsModalOpen(true)
    }

    const handleEdit = (company) => {
        setSelectedCompany(company)
        setIsModalOpen(true)
    }

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This will also delete all associated drive rounds and registrations.`)) {
            deleteCompany(id)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout title="Companies" subtitle="Manage campus hiring partners">
                <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Companies" subtitle="Manage campus hiring partners">

            <CompanyModal
                open={isModalOpen}
                setOpen={setIsModalOpen}
                initialData={selectedCompany}
            />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                    All Companies ({companies?.length || 0})
                </h2>
                <Button onClick={handleAdd} className="gap-2 shadow-teal-500/20 bg-teal-600 hover:bg-teal-700">
                    <Plus size={16} /> Add Company
                </Button>
            </div>

            {companies?.length === 0 ? (
                <Card className="py-16 px-6 text-center border-dashed border-2 bg-slate-50/50">
                    <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Building2 size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-700">No Companies Added Yet</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto mb-6">
                        Start registering companies to schedule drives and allow students to apply.
                    </p>
                    <Button onClick={handleAdd} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                        Register First Company
                    </Button>
                </Card>
            ) : (
                <Card className="overflow-hidden border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role & CTC</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Drive Date</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-teal-100/50 text-teal-600 flex items-center justify-center font-bold text-lg shrink-0">
                                                    {company.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{company.name}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-[150px]" title={company.allowedBranches}>
                                                        {company.allowedBranches}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-semibold text-slate-700">{company.jobRole}</p>
                                            <Badge variant="outline" className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                                                {company.ctc} LPA
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(company.driveDate).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant={
                                                company.status === 'UPCOMING' ? 'default' :
                                                    company.status === 'ACTIVE' ? 'success' : 'secondary'
                                            }>
                                                {company.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/admin/companies/${company.id}/manage`}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Manage Drive"
                                                >
                                                    <ListChecks size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleEdit(company)}
                                                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(company.id, company.name)}
                                                    disabled={isDeleting}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

        </DashboardLayout>
    )
}

export default CompanyManagement
