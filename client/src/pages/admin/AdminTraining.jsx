// ============================================================
// CPMS – Admin Training Management (src/pages/admin/AdminTraining.jsx)
// ============================================================

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Input, Label, Badge, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { useSessions, useCreateSession, useDeleteSession, useSessionAttendance, useMarkAttendance } from '@/hooks/useTraining'
import { Plus, Trash2, Users, Calendar, Video, MapPin, Users2, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Validation Schema matching Backend ──────────────────────
const sessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['WORKSHOP', 'SEMINAR', 'TECHNICAL', 'SOFT_SKILLS']),
  conductedBy: z.string().min(1, 'Conductor name is required'),
  sessionDate: z.string().min(1, 'Date is required'),
  description: z.string().optional()
})

// ── Create Session Modal ────────────────────────────────────
const SessionModal = ({ open, setOpen }) => {
  const { mutate: create, isPending } = useCreateSession()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: { type: 'WORKSHOP' }
  })

  const onSubmit = (data) => {
    // Need to convert local datetime-local string to ISO for Prisma
    create({
      ...data,
      sessionDate: new Date(data.sessionDate).toISOString()
    }, {
      onSuccess: () => {
        setOpen(false)
        reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Training Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label>Session Title</Label>
            <Input placeholder="e.g. Advanced React Patterns" {...register('title')} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                {...register('type')}
              >
                <option value="WORKSHOP">Workshop</option>
                <option value="SEMINAR">Seminar</option>
                <option value="TECHNICAL">Technical</option>
                <option value="SOFT_SKILLS">Soft Skills</option>
              </select>
            </div>
            <div>
              <Label>Date & Time</Label>
              <Input type="datetime-local" {...register('sessionDate')} />
              {errors.sessionDate && <p className="text-xs text-red-500 mt-1">{errors.sessionDate.message}</p>}
            </div>
          </div>

          <div>
            <Label>Conducted By / Speaker</Label>
            <Input placeholder="e.g. John Doe (Google)" {...register('conductedBy')} />
            {errors.conductedBy && <p className="text-xs text-red-500 mt-1">{errors.conductedBy.message}</p>}
          </div>

          <div>
            <Label>Location / Meeting Link</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
              placeholder="Auditorium B, or Google Meet link..."
              {...register('description')}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-700">
              {isPending && <Spinner size={16} className="mr-2 text-white" />} Save Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Attendance Modal ────────────────────────────────────────
const AttendanceModal = ({ session, open, setOpen }) => {
  if (!session) return null;

  const { data, isLoading } = useSessionAttendance(session.id)
  const { mutate: markObj, isPending: isMarking } = useMarkAttendance()

  // Local state to track selected students for bulk marking
  const [selectedIds, setSelectedIds] = useState(new Set())

  const attendances = data?.attendances || []

  const handleToggle = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === attendances.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(attendances.map(a => a.studentId)))
    }
  }

  const handleMarkPresent = () => {
    if (selectedIds.size === 0) return;
    markObj({ sessionId: session.id, studentIds: Array.from(selectedIds) }, {
      onSuccess: () => {
        setSelectedIds(new Set()) // clear selection after success
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Manage Attendance: {session.title}</DialogTitle>
          <p className="text-sm text-slate-500">
            Total Registered: {attendances.length} |
            Present: {attendances.filter(a => a.status === 'PRESENT').length}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size={32} /></div>
          ) : attendances.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No students have registered for this session yet.
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        checked={selectedIds.size === attendances.length && attendances.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-3 font-semibold text-slate-600">Student</th>
                    <th className="p-3 font-semibold text-slate-600">Branch</th>
                    <th className="p-3 font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendances.map((a) => (
                    <tr key={a.id} className={cn("hover:bg-slate-50 transition-colors", selectedIds.has(a.studentId) && "bg-teal-50/30")}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          checked={selectedIds.has(a.studentId)}
                          onChange={() => handleToggle(a.studentId)}
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-800">{a.student.firstName} {a.student.lastName}</p>
                        <p className="text-xs text-slate-500">{a.student.enrollmentNumber}</p>
                      </td>
                      <td className="p-3">{a.student.branch}</td>
                      <td className="p-3">
                        <Badge variant={a.status === 'PRESENT' ? 'success' : 'secondary'}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-slate-100 shrink-0">
          <span className="text-sm text-slate-500">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
            <Button
              onClick={handleMarkPresent}
              disabled={selectedIds.size === 0 || isMarking}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isMarking ? <Spinner size={16} className="mr-2 text-white" /> : <CheckSquare size={16} className="mr-2" />}
              Mark as Present
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ───────────────────────────────────────────────
const AdminTraining = () => {
  const { data, isLoading } = useSessions()
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState(null)

  const sessions = data?.sessions || []

  return (
    <DashboardLayout title="Training & Workshops" subtitle="Schedule and manage skill development sessions">

      <SessionModal open={isCreateOpen} setOpen={setIsCreateOpen} />
      <AttendanceModal
        session={selectedSessionForAttendance}
        open={!!selectedSessionForAttendance}
        setOpen={(open) => !open && setSelectedSessionForAttendance(null)}
      />

      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus size={16} className="mr-2" /> Schedule Session
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size={32} /></div>
      ) : sessions.length === 0 ? (
        <Card className="p-16 text-center border-dashed bg-slate-50/50">
          <Users size={32} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No training sessions scheduled.</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Create workshops, mock interviews, or technical talks to help students prepare.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map(session => (
            <Card key={session.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow border-slate-200">
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={cn(
                    "bg-slate-50",
                    session.type === 'TECHNICAL' ? "text-blue-700 border-blue-200 bg-blue-50" :
                      session.type === 'SOFT_SKILLS' ? "text-fuchsia-700 border-fuchsia-200 bg-fuchsia-50" :
                        "text-teal-700 border-teal-200 bg-teal-50"
                  )}>
                    {session.type}
                  </Badge>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this session permanently?')) {
                        deleteSession(session.id)
                      }
                    }}
                    disabled={isDeleting}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{session.title}</h3>
                <p className="text-sm font-medium text-slate-600 mt-1">by {session.conductedBy}</p>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span>
                    {new Date(session.sessionDate).toLocaleDateString()} at {new Date(session.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{session.description || 'No location provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium pt-2">
                  <Users2 size={16} className="text-teal-500 shrink-0" />
                  <span>{session._count?.attendances || 0} Students Registered</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-slate-100 bg-white mt-auto">
                <Button
                  variant="outline"
                  className="w-full text-slate-700 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200"
                  onClick={() => setSelectedSessionForAttendance(session)}
                >
                  Manage Attendance
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default AdminTraining
