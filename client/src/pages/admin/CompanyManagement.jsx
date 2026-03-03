// ============================================================
// CPMS – Company Management (src/pages/admin/CompanyManagement.jsx)
// ============================================================

import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Calendar, Briefcase, GraduationCap, Building2, ListChecks, Users, FileText, UploadCloud, ExternalLink, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Download, X, Check, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Input, Label, Badge, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany, useStudentApplications, useUploadNoticePdf } from '@/hooks/useCompany'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

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
    const { mutate: uploadNotice, isPending: isUploadingNotice } = useUploadNoticePdf()
    const isPending = isCreating || isUpdating

    const [noticeFile, setNoticeFile] = useState(null)
    const [noticeFileError, setNoticeFileError] = useState('')

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(companySchema),
        defaultValues: initialData ? {
            ...initialData,
            driveDate: new Date(initialData.driveDate).toISOString().split('T')[0],
            allowedBranches: Array.isArray(initialData.allowedBranches)
                ? initialData.allowedBranches.join(',')
                : initialData.allowedBranches
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
            setNoticeFile(null)
            setNoticeFileError('')
            reset(initialData ? {
                ...initialData,
                driveDate: new Date(initialData.driveDate).toISOString().split('T')[0],
                allowedBranches: Array.isArray(initialData.allowedBranches)
                    ? initialData.allowedBranches.join(',')
                    : initialData.allowedBranches
            } : {
                status: 'UPCOMING',
                eligibilityCGPA: 6.0,
                eligibilityPercent: 60,
                allowedBranches: 'CSE,IT,ECE'
            })
        }
    }, [open, initialData, reset])

    const handleNoticeFileChange = (e) => {
        const selected = e.target.files?.[0]
        if (selected && selected.type !== 'application/pdf') {
            setNoticeFileError('Only PDF files are allowed')
            setNoticeFile(null)
        } else if (selected && selected.size > 10 * 1024 * 1024) {
            setNoticeFileError('File size must be less than 10MB')
            setNoticeFile(null)
        } else {
            setNoticeFileError('')
            setNoticeFile(selected)
        }
    }

    const onSubmit = (data) => {
        if (isEdit) {
            updateCompany({ id: initialData.id, data }, {
                onSuccess: (updatedCompany) => {
                    // Upload notice PDF if a file was selected
                    if (noticeFile) {
                        uploadNotice({ companyId: initialData.id, file: noticeFile })
                    }
                    setOpen(false)
                    reset()
                    setNoticeFile(null)
                }
            })
        } else {
            createCompany(data, {
                onSuccess: (createdCompany) => {
                    // Upload notice PDF if a file was selected
                    if (noticeFile && createdCompany?.id) {
                        uploadNotice({ companyId: createdCompany.id, file: noticeFile })
                    }
                    setOpen(false)
                    reset()
                    setNoticeFile(null)
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

                    <hr className="border-slate-100" />

                    {/* Company Requirements PDF */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
                            <FileText size={16} className="text-indigo-500" />
                            Company Requirements PDF
                        </h4>
                        <p className="text-xs text-slate-500">
                            Upload a PDF containing detailed company requirements, JD, or other information that students can download.
                        </p>

                        {/* Show existing PDF if editing */}
                        {isEdit && initialData?.noticePdfUrl && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <FileText size={18} className="text-indigo-600 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-indigo-800">Current PDF Uploaded</p>
                                    <a
                                        href={initialData.noticePdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-0.5"
                                    >
                                        <ExternalLink size={12} /> View current PDF
                                    </a>
                                </div>
                                <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50">Active</Badge>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center gap-3">
                                <Label htmlFor="noticePdfFile" className="cursor-pointer mb-0">
                                    <span className="inline-flex h-10 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-4 text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors gap-2">
                                        <UploadCloud size={16} />
                                        {isEdit && initialData?.noticePdfUrl ? 'Replace PDF' : 'Upload PDF'}
                                    </span>
                                </Label>
                                <input
                                    id="noticePdfFile"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleNoticeFileChange}
                                />
                                <span className="text-xs text-slate-500 flex-1 truncate">
                                    {noticeFile ? noticeFile.name : 'No file selected (PDF, max 10MB)'}
                                </span>
                            </div>
                            {noticeFileError && <p className="mt-1 text-xs text-red-500">{noticeFileError}</p>}
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

// ── Helpers: Derive selection status from round results ──────
const getSelectionStatus = (app) => {
    const roundResults = app.student.roundResults?.filter(
        rr => rr.round?.companyId === app.company.id
    ) || []
    if (roundResults.length === 0) return 'PENDING'
    if (roundResults.some(rr => rr.status === 'REJECTED')) return 'REJECTED'
    if (roundResults.some(rr => rr.status === 'SELECTED')) return 'SELECTED'
    return 'PENDING'
}

const STATUS_COLORS = {
    SELECTED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
}

const STATUS_ICONS = {
    SELECTED: Check,
    REJECTED: X,
    PENDING: Clock,
}

// ── Excel Export (xlsx) ──────────────────────────────────────
const exportToExcel = (data, filename = 'student_applications') => {
    if (!data.length) return

    const rows = data.map(app => ({
        'Student Name': `${app.student.firstName} ${app.student.lastName}`,
        'Enrollment No.': app.student.enrollmentNumber,
        'Email': app.student.user?.email || '',
        'Phone': app.student.phone || '',
        'Branch': app.student.branch,
        'CGPA': app.student.cgpa,
        '10th %': app.student.tenth_percent || '',
        '12th %': app.student.twelfth_percent || '',
        'Company': app.company.name,
        'Job Role': app.company.jobRole,
        'CTC (LPA)': app.company.ctc,
        'Drive Status': app.company.status,
        'Selection Status': getSelectionStatus(app),
        'Applied On': new Date(app.registeredAt).toLocaleDateString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)

    // Auto-size columns based on content width
    const colWidths = Object.keys(rows[0]).map(key => ({
        wch: Math.max(
            key.length,
            ...rows.map(row => String(row[key] ?? '').length)
        ) + 2
    }))
    worksheet['!cols'] = colWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications')

    // Write to buffer and save with file-saver for reliable browser download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    })
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// ── Sortable Table Header ────────────────────────────────────
const SortableHeader = ({ label, sortKey, currentSort, onSort }) => {
    const isActive = currentSort.key === sortKey
    const Icon = isActive
        ? (currentSort.dir === 'asc' ? ArrowUp : ArrowDown)
        : ArrowUpDown

    return (
        <th
            className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-teal-600 select-none transition-colors group"
            onClick={() => onSort(sortKey)}
        >
            <span className="flex items-center gap-1.5">
                {label}
                <Icon size={13} className={isActive ? 'text-teal-600' : 'text-slate-300 group-hover:text-teal-400'} />
            </span>
        </th>
    )
}

// ── Filter Pill ──────────────────────────────────────────────
const FilterPill = ({ label, value, onClear }) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
        <span className="text-teal-500 font-normal">{label}:</span> {value}
        <button onClick={onClear} className="hover:text-red-500 transition-colors ml-0.5"><X size={12} /></button>
    </span>
)

// ── Student Applications Section Component ───────────────────
const StudentApplicationsSection = ({ applications, loadingApps, companies }) => {
    // Filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [branchFilter, setBranchFilter] = useState('')
    const [companyFilter, setCompanyFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [selectionFilter, setSelectionFilter] = useState('')
    const [cgpaMin, setCgpaMin] = useState('')
    const [cgpaMax, setCgpaMax] = useState('')
    const [ctcMin, setCtcMin] = useState('')
    const [ctcMax, setCtcMax] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Sort state
    const [sort, setSort] = useState({ key: 'date', dir: 'desc' })

    const handleSort = (key) => {
        setSort(prev =>
            prev.key === key
                ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                : { key, dir: 'asc' }
        )
    }

    // Derive unique values for filter dropdowns
    const branches = useMemo(() => {
        const set = new Set(applications.map(a => a.student.branch))
        return [...set].sort()
    }, [applications])

    const companyNames = useMemo(() => {
        const set = new Set(applications.map(a => a.company.name))
        return [...set].sort()
    }, [applications])

    // Filtered + sorted data
    const filteredData = useMemo(() => {
        let result = [...applications]

        // Text search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            result = result.filter(app =>
                `${app.student.firstName} ${app.student.lastName}`.toLowerCase().includes(q) ||
                app.student.enrollmentNumber.toLowerCase().includes(q) ||
                (app.student.user?.email || '').toLowerCase().includes(q) ||
                app.company.name.toLowerCase().includes(q) ||
                app.company.jobRole.toLowerCase().includes(q)
            )
        }

        // Branch
        if (branchFilter) {
            result = result.filter(app => app.student.branch === branchFilter)
        }

        // Company
        if (companyFilter) {
            result = result.filter(app => app.company.name === companyFilter)
        }

        // Drive status
        if (statusFilter) {
            result = result.filter(app => app.company.status === statusFilter)
        }

        // Selection status
        if (selectionFilter) {
            result = result.filter(app => getSelectionStatus(app) === selectionFilter)
        }

        // CGPA range
        if (cgpaMin) result = result.filter(app => app.student.cgpa >= parseFloat(cgpaMin))
        if (cgpaMax) result = result.filter(app => app.student.cgpa <= parseFloat(cgpaMax))

        // CTC range
        if (ctcMin) result = result.filter(app => app.company.ctc >= parseFloat(ctcMin))
        if (ctcMax) result = result.filter(app => app.company.ctc <= parseFloat(ctcMax))

        // Sort
        result.sort((a, b) => {
            let valA, valB
            switch (sort.key) {
                case 'name':
                    valA = `${a.student.firstName} ${a.student.lastName}`.toLowerCase()
                    valB = `${b.student.firstName} ${b.student.lastName}`.toLowerCase()
                    break
                case 'cgpa':
                    valA = a.student.cgpa
                    valB = b.student.cgpa
                    break
                case 'ctc':
                    valA = a.company.ctc
                    valB = b.company.ctc
                    break
                case 'company':
                    valA = a.company.name.toLowerCase()
                    valB = b.company.name.toLowerCase()
                    break
                case 'date':
                default:
                    valA = new Date(a.registeredAt).getTime()
                    valB = new Date(b.registeredAt).getTime()
                    break
            }
            if (valA < valB) return sort.dir === 'asc' ? -1 : 1
            if (valA > valB) return sort.dir === 'asc' ? 1 : -1
            return 0
        })

        return result
    }, [applications, searchQuery, branchFilter, companyFilter, statusFilter, selectionFilter, cgpaMin, cgpaMax, ctcMin, ctcMax, sort])

    // Stats
    const stats = useMemo(() => {
        const selected = filteredData.filter(a => getSelectionStatus(a) === 'SELECTED').length
        const rejected = filteredData.filter(a => getSelectionStatus(a) === 'REJECTED').length
        const pending = filteredData.filter(a => getSelectionStatus(a) === 'PENDING').length
        const avgCgpa = filteredData.length
            ? (filteredData.reduce((sum, a) => sum + a.student.cgpa, 0) / filteredData.length).toFixed(2)
            : '0'
        const maxCtc = filteredData.length
            ? Math.max(...filteredData.map(a => a.company.ctc))
            : 0
        const minCtc = filteredData.length
            ? Math.min(...filteredData.map(a => a.company.ctc))
            : 0
        return { selected, rejected, pending, avgCgpa, maxCtc, minCtc }
    }, [filteredData])

    const activeFilterCount = [branchFilter, companyFilter, statusFilter, selectionFilter, cgpaMin, cgpaMax, ctcMin, ctcMax].filter(Boolean).length

    const clearAllFilters = () => {
        setSearchQuery('')
        setBranchFilter('')
        setCompanyFilter('')
        setStatusFilter('')
        setSelectionFilter('')
        setCgpaMin('')
        setCgpaMax('')
        setCtcMin('')
        setCtcMax('')
    }

    if (loadingApps) {
        return (
            <div className="mt-10">
                <div className="flex justify-center p-8"><Spinner size={24} /></div>
            </div>
        )
    }

    return (
        <div className="mt-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Users size={20} className="text-teal-500" />
                    <h2 className="text-xl font-bold text-slate-800">Student Applications</h2>
                    <Badge variant="outline" className="ml-1">{applications.length} Total</Badge>
                    {filteredData.length !== applications.length && (
                        <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-xs">
                            {filteredData.length} Filtered
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`gap-2 text-sm ${showFilters ? 'border-teal-300 text-teal-700 bg-teal-50' : ''}`}
                    >
                        <Filter size={14} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-1 w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToExcel(filteredData)}
                        disabled={filteredData.length === 0}
                        className="gap-2 text-sm border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                        <Download size={14} />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by student name, enrollment no., email, company, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg text-sm input-ring"
                    style={{ background: 'var(--surface-card)', color: 'var(--text-primary)' }}
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <Card className="p-5 mb-5 border-teal-100 bg-gradient-to-br from-teal-50/40 to-white">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Filter size={14} className="text-teal-600" /> Filters
                        </h4>
                        {activeFilterCount > 0 && (
                            <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                                <X size={12} /> Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Branch */}
                        <div>
                            <Label className="text-xs">Branch</Label>
                            <select
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">All Branches</option>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        {/* Company */}
                        <div>
                            <Label className="text-xs">Company</Label>
                            <select
                                value={companyFilter}
                                onChange={(e) => setCompanyFilter(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">All Companies</option>
                                {companyNames.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Drive Status */}
                        <div>
                            <Label className="text-xs">Drive Status</Label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="UPCOMING">Upcoming</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>

                        {/* Selection Status */}
                        <div>
                            <Label className="text-xs">Selection Status</Label>
                            <select
                                value={selectionFilter}
                                onChange={(e) => setSelectionFilter(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">All</option>
                                <option value="SELECTED">Selected</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>

                        {/* CGPA Range */}
                        <div>
                            <Label className="text-xs">Min CGPA</Label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                placeholder="e.g. 6.0"
                                value={cgpaMin}
                                onChange={(e) => setCgpaMin(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Max CGPA</Label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                placeholder="e.g. 9.0"
                                value={cgpaMax}
                                onChange={(e) => setCgpaMax(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        {/* CTC Range */}
                        <div>
                            <Label className="text-xs">Min CTC (LPA)</Label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                placeholder="e.g. 5"
                                value={ctcMin}
                                onChange={(e) => setCtcMin(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Max CTC (LPA)</Label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                placeholder="e.g. 30"
                                value={ctcMax}
                                onChange={(e) => setCtcMax(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Active Filter Pills */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {branchFilter && <FilterPill label="Branch" value={branchFilter} onClear={() => setBranchFilter('')} />}
                    {companyFilter && <FilterPill label="Company" value={companyFilter} onClear={() => setCompanyFilter('')} />}
                    {statusFilter && <FilterPill label="Status" value={statusFilter} onClear={() => setStatusFilter('')} />}
                    {selectionFilter && <FilterPill label="Selection" value={selectionFilter} onClear={() => setSelectionFilter('')} />}
                    {cgpaMin && <FilterPill label="Min CGPA" value={cgpaMin} onClear={() => setCgpaMin('')} />}
                    {cgpaMax && <FilterPill label="Max CGPA" value={cgpaMax} onClear={() => setCgpaMax('')} />}
                    {ctcMin && <FilterPill label="Min CTC" value={`${ctcMin} LPA`} onClear={() => setCtcMin('')} />}
                    {ctcMax && <FilterPill label="Max CTC" value={`${ctcMax} LPA`} onClear={() => setCtcMax('')} />}
                </div>
            )}

            {/* Summary Stats */}
            {filteredData.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                    <Card className="p-3 border-slate-200 bg-white text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total</p>
                        <p className="text-xl font-black text-slate-800 mt-0.5">{filteredData.length}</p>
                    </Card>
                    <Card className="p-3 border-emerald-200 bg-emerald-50/50 text-center">
                        <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-semibold">Selected</p>
                        <p className="text-xl font-black text-emerald-700 mt-0.5">{stats.selected}</p>
                    </Card>
                    <Card className="p-3 border-red-200 bg-red-50/50 text-center">
                        <p className="text-[10px] text-red-600 uppercase tracking-wider font-semibold">Rejected</p>
                        <p className="text-xl font-black text-red-700 mt-0.5">{stats.rejected}</p>
                    </Card>
                    <Card className="p-3 border-amber-200 bg-amber-50/50 text-center">
                        <p className="text-[10px] text-amber-600 uppercase tracking-wider font-semibold">Pending</p>
                        <p className="text-xl font-black text-amber-700 mt-0.5">{stats.pending}</p>
                    </Card>
                    <Card className="p-3 border-blue-200 bg-blue-50/50 text-center">
                        <p className="text-[10px] text-blue-600 uppercase tracking-wider font-semibold">Avg CGPA</p>
                        <p className="text-xl font-black text-blue-700 mt-0.5">{stats.avgCgpa}</p>
                    </Card>
                    <Card className="p-3 border-indigo-200 bg-indigo-50/50 text-center">
                        <p className="text-[10px] text-indigo-600 uppercase tracking-wider font-semibold">CTC Range</p>
                        <p className="text-lg font-black text-indigo-700 mt-0.5">{stats.minCtc}–{stats.maxCtc}</p>
                        <p className="text-[10px] text-indigo-400">LPA</p>
                    </Card>
                </div>
            )}

            {/* Table */}
            {applications.length === 0 ? (
                <Card className="py-10 text-center border-dashed bg-slate-50/50">
                    <p className="text-slate-500">No students have applied to any companies yet.</p>
                </Card>
            ) : filteredData.length === 0 ? (
                <Card className="py-10 text-center border-dashed bg-slate-50/50">
                    <div className="flex flex-col items-center">
                        <Search size={32} className="text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No applications match your filters</p>
                        <button onClick={clearAllFilters} className="text-sm text-teal-600 hover:text-teal-700 mt-2 font-medium">
                            Clear all filters
                        </button>
                    </div>
                </Card>
            ) : (
                <Card className="overflow-hidden border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <SortableHeader label="Student" sortKey="name" currentSort={sort} onSort={handleSort} />
                                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                                    <SortableHeader label="CGPA" sortKey="cgpa" currentSort={sort} onSort={handleSort} />
                                    <SortableHeader label="Company" sortKey="company" currentSort={sort} onSort={handleSort} />
                                    <SortableHeader label="CTC" sortKey="ctc" currentSort={sort} onSort={handleSort} />
                                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Selection</th>
                                    <SortableHeader label="Applied" sortKey="date" currentSort={sort} onSort={handleSort} />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredData.map((app) => {
                                    const selStatus = getSelectionStatus(app)
                                    const StatusIcon = STATUS_ICONS[selStatus]

                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <p className="font-bold text-sm text-slate-800">{app.student.firstName} {app.student.lastName}</p>
                                                <p className="text-xs text-slate-500">{app.student.enrollmentNumber}</p>
                                                {app.student.user?.email && (
                                                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]" title={app.student.user.email}>
                                                        {app.student.user.email}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <Badge variant="outline" className="text-xs">{app.student.branch}</Badge>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className={`text-sm font-bold ${app.student.cgpa >= 8 ? 'text-emerald-700' : app.student.cgpa >= 6 ? 'text-slate-700' : 'text-amber-600'}`}>
                                                    {app.student.cgpa}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <p className="font-semibold text-sm text-slate-700">{app.company.name}</p>
                                                <p className="text-xs text-slate-500">{app.company.jobRole}</p>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                                                    {app.company.ctc} LPA
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <Badge variant={
                                                    app.company.status === 'UPCOMING' ? 'default' :
                                                        app.company.status === 'ACTIVE' ? 'success' : 'secondary'
                                                } className="text-[10px]">{app.company.status}</Badge>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${STATUS_COLORS[selStatus]}`}>
                                                    <StatusIcon size={11} />
                                                    {selStatus}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-sm text-slate-500 whitespace-nowrap">
                                                {new Date(app.registeredAt).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                        <span>Showing {filteredData.length} of {applications.length} applications</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportToExcel(filteredData)}
                            className="gap-1.5 text-xs text-emerald-600 hover:text-emerald-700"
                        >
                            <Download size={12} /> Download filtered data
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}

// ── Main Listing Component ──────────────────────────────────
const CompanyManagement = () => {
    const { data: companies, isLoading } = useCompanies()
    const { data: applicationsData, isLoading: loadingApps } = useStudentApplications()
    const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany()

    const applications = applicationsData?.applications || []

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
                                                    <p className="text-xs text-slate-500 truncate max-w-[150px]" title={Array.isArray(company.allowedBranches) ? company.allowedBranches.join(', ') : company.allowedBranches}>
                                                        {Array.isArray(company.allowedBranches) ? company.allowedBranches.join(', ') : company.allowedBranches}
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
                                            {company.noticePdfUrl && (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation()
                                                        try {
                                                            const response = await fetch(company.noticePdfUrl)
                                                            const blob = await response.blob()
                                                            saveAs(blob, `${company.name.replace(/\s+/g, '_')}_Requirements.pdf`)
                                                        } catch (err) {
                                                            window.open(company.noticePdfUrl, '_blank')
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1 mt-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer bg-transparent border-none p-0"
                                                >
                                                    <FileText size={12} /> Requirements PDF
                                                </button>
                                            )}
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

            {/* ── Student Applications Section ──────────────── */}
            <StudentApplicationsSection applications={applications} loadingApps={loadingApps} companies={companies} />

        </DashboardLayout >
    )
}

export default CompanyManagement
