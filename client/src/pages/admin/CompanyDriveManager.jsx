// ============================================================
// CPMS – Company Drive Manager (src/pages/admin/CompanyDriveManager.jsx)
// ============================================================

import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Users, GitMerge, Check, X, Calendar, Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Input, Label, Badge, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'

import { useCompanyById } from '@/hooks/useCompany' // We need to add this
import { useRegisteredStudents } from '@/hooks/useDrive' // We need to add this
import { useRounds, useCreateRound, useUpdateStudentStatus } from '@/hooks/useRound'

// ── Zod Schema ──────────────────────────────────────────────
const roundSchema = z.object({
    name: z.string().min(1, 'Round name is required'),
    roundNumber: z.coerce.number().min(1, 'Round number is required'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().optional(),
})

// ── Add Round Modal ─────────────────────────────────────────
const AddRoundModal = ({ open, setOpen, companyId, nextRoundNum }) => {
    const { mutate: createRound, isPending } = useCreateRound()
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(roundSchema)
    })

    React.useEffect(() => {
        if (open) {
            reset({ roundNumber: nextRoundNum })
        }
    }, [open, nextRoundNum, reset])

    const onSubmit = (data) => {
        createRound({ companyId, data }, {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
            onError: (err) => alert(err.response?.data?.message || 'Error creating round')
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GitMerge className="text-teal-500" />
                        Create Selection Round
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div>
                        <Label>Round Name</Label>
                        <Input placeholder="e.g. Technical Interview" {...register('name')} />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Round Number</Label>
                            <Input type="number" {...register('roundNumber')} readOnly className="bg-slate-50" />
                            <p className="text-[10px] text-slate-500 mt-1">Sequential order</p>
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input type="date" {...register('date')} />
                            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
                        </div>
                    </div>
                    <div>
                        <Label>Description (Optional)</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 mt-1"
                            placeholder="Details about the round..."
                            {...register('description')}
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-700">
                            {isPending && <Spinner size={16} className="text-white mr-2" />} Save Round
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ── Main Component ──────────────────────────────────────────
const CompanyDriveManager = () => {
    const { id: companyId } = useParams()

    const { data: company, isLoading: loadingCompany } = useCompanyById(companyId)
    const { data: students, isLoading: loadingStudents } = useRegisteredStudents(companyId)
    const { data: rounds, isLoading: loadingRounds } = useRounds(companyId)
    const { mutate: updateStatus, isPending: updatingStatus } = useUpdateStudentStatus()

    const [isRoundModalOpen, setIsRoundModalOpen] = useState(false)

    const isLoading = loadingCompany || loadingStudents || loadingRounds

    if (isLoading) {
        return (
            <DashboardLayout title="Drive Management">
                <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
            </DashboardLayout>
        )
    }

    if (!company) {
        return (
            <DashboardLayout title="Drive Management">
                <div className="p-8 text-center text-slate-500">Company not found.</div>
            </DashboardLayout>
        )
    }

    const nextRoundNum = rounds?.length ? Math.max(...rounds.map(r => r.roundNumber)) + 1 : 1

    return (
        <DashboardLayout
            title={company.name}
            subtitle={`Managing drive for ${company.jobRole} (${company.ctc} LPA)`}
        >
            <AddRoundModal
                open={isRoundModalOpen}
                setOpen={setIsRoundModalOpen}
                companyId={companyId}
                nextRoundNum={nextRoundNum}
            />

            <div className="mb-6 flex items-center justify-between">
                <Link to="/admin/companies" className="text-sm text-slate-500 hover:text-teal-600 flex items-center gap-1 font-medium transition-colors">
                    <ArrowLeft size={16} /> Back to Companies
                </Link>
                <Badge variant={company.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-sm px-3 py-1">
                    {company.status}
                </Badge>
            </div>

            <Tabs defaultValue="pipeline" className="w-full">
                <TabsList className="mb-6 bg-white border border-slate-200">
                    <TabsTrigger value="pipeline" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                        Selection Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="students" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                        Registered Students ({students?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* ── PIPELINE TAB ── */}
                <TabsContent value="pipeline" className="space-y-6">
                    <div className="flex justify-between items-center bg-teal-50/50 p-4 border border-teal-100 rounded-xl">
                        <div>
                            <h3 className="font-bold text-slate-800">Drive Timeline</h3>
                            <p className="text-sm text-slate-500">Create sequential rounds to automatically filter candidates.</p>
                        </div>
                        <Button onClick={() => setIsRoundModalOpen(true)} className="gap-2 bg-teal-600 hover:bg-teal-700">
                            <Plus size={16} /> Add Round {nextRoundNum}
                        </Button>
                    </div>

                    {rounds?.length === 0 ? (
                        <Card className="py-12 text-center border-dashed">
                            <GitMerge size={40} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">No Rounds Created</h3>
                            <p className="text-sm text-slate-500 mt-2">Start building the selection pipeline by adding the first round.</p>
                        </Card>
                    ) : (
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {rounds.map((round, idx) => (
                                <div key={round.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <span className="font-bold">{round.roundNumber}</span>
                                    </div>
                                    <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 shadow-sm border-slate-200 hover:border-teal-300 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-800">{round.name}</h4>
                                                <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                    <Calendar size={12} /> {new Date(round.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="bg-slate-50">
                                                {round.candidates?.length || 0} Candidates
                                            </Badge>
                                        </div>

                                        {round.candidates?.length > 0 ? (
                                            <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-2">
                                                {round.candidates.map(candidate => (
                                                    <div key={candidate.resultId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 gap-3">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{candidate.name}</p>
                                                            <p className="text-xs text-slate-500">{candidate.branch} • {candidate.email}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {candidate.status === 'PENDING' ? (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-8 px-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                                        onClick={() => updateStatus({ roundId: round.id, studentId: candidate.studentId, status: 'REJECTED' })}
                                                                        disabled={updatingStatus}
                                                                        title="Reject"
                                                                    >
                                                                        <X size={14} />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 px-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none"
                                                                        onClick={() => updateStatus({ roundId: round.id, studentId: candidate.studentId, status: 'SELECTED' })}
                                                                        disabled={updatingStatus}
                                                                        title="Select (Pass to next round)"
                                                                    >
                                                                        <Check size={14} /> Pass
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Badge variant={candidate.status === 'SELECTED' ? 'success' : 'destructive'} className="text-[10px] uppercase">
                                                                    {candidate.status}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-lg">No candidates in this round yet.</p>
                                        )}
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ── REGISTERED STUDENTS TAB ── */}
                <TabsContent value="students">
                    <Card className="overflow-hidden border-slate-200">
                        {students?.length === 0 ? (
                            <div className="py-12 text-center text-slate-500">No students have applied yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                                            <th className="py-3 px-6 font-semibold">Student Name</th>
                                            <th className="py-3 px-6 font-semibold">Branch & CGPA</th>
                                            <th className="py-3 px-6 font-semibold">Email</th>
                                            <th className="py-3 px-6 font-semibold">Applied On</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {students.map(student => (
                                            <tr key={student.registrationId} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-6">
                                                    <p className="font-bold text-sm text-slate-800">{student.user.firstName} {student.user.lastName}</p>
                                                    <p className="text-xs text-slate-500 drop-shadow-sm">{student.enrollmentNo}</p>
                                                </td>
                                                <td className="py-3 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">{student.branch}</Badge>
                                                        <span className="text-sm font-semibold text-slate-700">{student.cgpa}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-6 text-sm text-slate-600">{student.email}</td>
                                                <td className="py-3 px-6 text-sm text-slate-500">
                                                    {new Date(student.registeredAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}

export default CompanyDriveManager
