// ============================================================
// CPMS – Company Drive Manager (src/pages/admin/CompanyDriveManager.jsx)
// ============================================================

import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Users, GitMerge, Check, X, Calendar, Edit2, Award, ChevronRight } from 'lucide-react'
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

            {/* ── Drive Stats Summary ── */}
            {(() => {
                const totalRounds = rounds?.length || 0;
                const totalRegistered = students?.length || 0;
                const lastRound = rounds?.length > 0 ? rounds.reduce((a, b) => a.roundNumber > b.roundNumber ? a : b) : null;
                const placedCount = lastRound?.candidates?.filter(c => c.status === 'SELECTED')?.length || 0;

                return (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card className="p-4 border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Total Rounds</p>
                            <p className="text-2xl font-black text-blue-800 mt-1">{totalRounds}</p>
                            <p className="text-xs text-blue-500 mt-0.5">Selection stages created</p>
                        </Card>
                        <Card className="p-4 border-slate-200 bg-gradient-to-br from-amber-50 to-amber-100/50">
                            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Registered Students</p>
                            <p className="text-2xl font-black text-amber-800 mt-1">{totalRegistered}</p>
                            <p className="text-xs text-amber-500 mt-0.5">Applied for this drive</p>
                        </Card>
                        <Card className="p-4 border-slate-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Placed Students</p>
                            <p className="text-2xl font-black text-emerald-800 mt-1">{placedCount}</p>
                            <p className="text-xs text-emerald-500 mt-0.5">Cleared all rounds</p>
                        </Card>
                    </div>
                );
            })()}

            <Tabs defaultValue="pipeline" className="w-full">
                <TabsList className="mb-6 bg-white border border-slate-200">
                    <TabsTrigger value="pipeline" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                        Selection Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="students" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                        Registered Students ({students?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="placements" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                        <Award size={14} className="mr-1.5" /> Placements
                    </TabsTrigger>
                </TabsList>

                {/* ── PIPELINE TAB ── */}
                <TabsContent value="pipeline" className="space-y-6">
                    <div className="flex justify-between items-center bg-teal-50/50 p-4 border border-teal-100 rounded-xl">
                        <div>
                            <h3 className="font-bold text-slate-800">Selection Pipeline</h3>
                            <p className="text-sm text-slate-500">Track each student's progress through selection rounds individually.</p>
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
                    ) : (() => {
                        // Build a per-student view across all rounds
                        const studentMap = {};
                        // First, collect all registered students
                        students?.forEach(s => {
                            studentMap[s.id] = {
                                id: s.id,
                                name: `${s.firstName} ${s.lastName}`,
                                email: s.email,
                                branch: s.branch,
                                enrollmentNumber: s.enrollmentNumber,
                                roundStatuses: {} // roundId -> { status, resultId, feedback }
                            };
                        });
                        // Then, overlay round result data
                        rounds.forEach(round => {
                            round.candidates?.forEach(c => {
                                if (studentMap[c.studentId]) {
                                    studentMap[c.studentId].roundStatuses[round.id] = {
                                        status: c.status,
                                        resultId: c.resultId,
                                        feedback: c.feedback
                                    };
                                }
                            });
                        });
                        const allStudents = Object.values(studentMap);

                        return (
                            <div className="space-y-4">
                                {/* Round headers legend */}
                                <Card className="p-4 border-slate-200 bg-white">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rounds Overview</p>
                                    <div className="flex flex-wrap gap-2">
                                        {rounds.map(r => (
                                            <Badge key={r.id} variant="outline" className="bg-slate-50 text-xs px-3 py-1.5">
                                                <span className="font-bold text-teal-700 mr-1.5">R{r.roundNumber}</span> {r.name}
                                                {r.date && <span className="text-slate-400 ml-1.5">• {new Date(r.date).toLocaleDateString()}</span>}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>

                                {allStudents.length === 0 ? (
                                    <Card className="py-8 text-center border-dashed">
                                        <p className="text-slate-500">No students registered for this drive yet.</p>
                                    </Card>
                                ) : (
                                    allStudents.map(student => {
                                        // Determine overall status
                                        const isRejected = rounds.some(r => student.roundStatuses[r.id]?.status === 'REJECTED');
                                        const allPassed = rounds.length > 0 && rounds.every(r => student.roundStatuses[r.id]?.status === 'SELECTED');

                                        return (
                                            <Card key={student.id} className={`border-slate-200 overflow-hidden transition-all ${isRejected ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
                                                {/* Student Header */}
                                                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                                                            {student.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{student.name}</p>
                                                            <p className="text-xs text-slate-500">{student.enrollmentNumber} • {student.branch} • {student.email}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {isRejected ? (
                                                            <Badge variant="destructive" className="bg-red-500 text-[10px] uppercase">Eliminated</Badge>
                                                        ) : allPassed ? (
                                                            <Badge variant="success" className="bg-emerald-500 text-[10px] uppercase">Placed</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] uppercase">In Progress</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Round Progress Row */}
                                                <div className="p-4 flex flex-wrap items-center gap-3">
                                                    {rounds.map((round, idx) => {
                                                        const rs = student.roundStatuses[round.id];
                                                        const status = rs?.status || null; // null = not in this round yet
                                                        const prevRound = idx > 0 ? rounds[idx - 1] : null;
                                                        const prevStatus = prevRound ? student.roundStatuses[prevRound.id]?.status : 'SELECTED'; // First round always eligible
                                                        const isEligible = prevStatus === 'SELECTED' || idx === 0;

                                                        return (
                                                            <React.Fragment key={round.id}>
                                                                {idx > 0 && (
                                                                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                                                                )}
                                                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${status === 'SELECTED' ? 'border-emerald-200 bg-emerald-50' :
                                                                    status === 'REJECTED' ? 'border-red-200 bg-red-50' :
                                                                        status === 'PENDING' ? 'border-amber-200 bg-amber-50' :
                                                                            'border-slate-200 bg-slate-50'
                                                                    }`}>
                                                                    <span className="font-bold text-slate-600 text-xs">R{round.roundNumber}</span>

                                                                    {status === 'SELECTED' && (
                                                                        <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                                                                            <Check size={12} /> Passed
                                                                        </span>
                                                                    )}
                                                                    {status === 'REJECTED' && (
                                                                        <span className="flex items-center gap-1 text-red-600 font-semibold text-xs">
                                                                            <X size={12} /> Rejected
                                                                        </span>
                                                                    )}
                                                                    {(status === 'PENDING' || (!status && isEligible)) && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="h-6 w-6 p-0 border-red-200 text-red-600 hover:bg-red-100"
                                                                                onClick={() => updateStatus({ roundId: round.id, studentId: student.id, status: 'REJECTED' })}
                                                                                disabled={updatingStatus}
                                                                                title="Reject"
                                                                            >
                                                                                <X size={12} />
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                className="h-6 px-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none text-xs"
                                                                                onClick={() => updateStatus({ roundId: round.id, studentId: student.id, status: 'SELECTED' })}
                                                                                disabled={updatingStatus}
                                                                                title="Pass"
                                                                            >
                                                                                <Check size={12} /> Pass
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                    {!status && !isEligible && (
                                                                        <span className="text-slate-400 text-xs italic">—</span>
                                                                    )}
                                                                </div>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>
                        );
                    })()}
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
                                                    <p className="font-bold text-sm text-slate-800">{student.firstName} {student.lastName}</p>
                                                    <p className="text-xs text-slate-500 drop-shadow-sm">{student.enrollmentNumber}</p>
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

                {/* ── PLACEMENTS TAB ── */}
                <TabsContent value="placements">
                    <Card className="overflow-hidden border-slate-200">
                        {(() => {
                            const lastRound = rounds?.length > 0 ? rounds.reduce((a, b) => a.roundNumber > b.roundNumber ? a : b) : null;
                            const placedStudents = lastRound?.candidates?.filter(c => c.status === 'SELECTED') || [];

                            if (placedStudents.length === 0) {
                                return (
                                    <div className="py-12 text-center">
                                        <Award size={40} className="mx-auto text-slate-300 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-700">No Placements Yet</h3>
                                        <p className="text-sm text-slate-500 mt-2">Students selected in the final round will appear here as placed.</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="overflow-x-auto">
                                    <div className="p-4 border-b border-slate-100 bg-emerald-50/50">
                                        <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                                            <Award size={18} className="text-emerald-600" /> Placed Students ({placedStudents.length})
                                        </h3>
                                        <p className="text-xs text-emerald-600 mt-1">Students who cleared all selection rounds for {company.name}</p>
                                    </div>
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                                                <th className="py-3 px-6 font-semibold">#</th>
                                                <th className="py-3 px-6 font-semibold">Student Name</th>
                                                <th className="py-3 px-6 font-semibold">Branch</th>
                                                <th className="py-3 px-6 font-semibold">Email</th>
                                                <th className="py-3 px-6 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {placedStudents.map((student, idx) => (
                                                <tr key={student.resultId} className="hover:bg-emerald-50/30 transition-colors">
                                                    <td className="py-3 px-6 text-sm text-slate-500 font-mono">{idx + 1}</td>
                                                    <td className="py-3 px-6">
                                                        <p className="font-bold text-sm text-slate-800">{student.name}</p>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <Badge variant="outline" className="text-xs">{student.branch}</Badge>
                                                    </td>
                                                    <td className="py-3 px-6 text-sm text-slate-600">{student.email}</td>
                                                    <td className="py-3 px-6">
                                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">PLACED</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })()}
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}

export default CompanyDriveManager
