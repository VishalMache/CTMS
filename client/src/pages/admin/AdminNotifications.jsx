// ============================================================
// CPMS – Admin Notifications (src/pages/admin/AdminNotifications.jsx)
// Send Broadcasts to Students
// ============================================================

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Input, Label, Button, Spinner, Badge } from '@/components/ui'
import { useNotifications, useBroadcastNotification } from '@/hooks/useNotification'
import { Send, Megaphone, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const broadcastSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']),
  targetBranch: z.string().optional()
})

const AdminNotifications = () => {
  const { data: notifData, isLoading } = useNotifications()
  const { mutate: broadcast, isPending } = useBroadcastNotification()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { type: 'INFO', targetBranch: 'ALL' }
  })

  const onSubmit = (data) => {
    broadcast(data, {
      onSuccess: () => reset()
    })
  }

  const notifications = notifData?.notifications || []

  return (
    <DashboardLayout title="Broadcasts" subtitle="Send campus-wide alerts and updates">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Col: Broadcast Form ───────────────────────── */}
        <div className="lg:col-span-1 border-r border-slate-100 pr-0 lg:pr-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                <Megaphone size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">New Broadcast</h2>
                <p className="text-sm text-slate-500">Send alert to students</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Subject / Title</Label>
                <Input placeholder="e.g. Mandatory Placement Talk" {...register('title')} />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div>
                <Label>Message Body</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  placeholder="Enter the alert text here..."
                  {...register('message')}
                />
                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Severity</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                    {...register('type')}
                  >
                    <option value="INFO">Info (Blue)</option>
                    <option value="SUCCESS">Success (Green)</option>
                    <option value="WARNING">Warning (Amber)</option>
                    <option value="ERROR">Action Required (Red)</option>
                  </select>
                </div>
                <div>
                  <Label>Target Branch</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                    {...register('targetBranch')}
                  >
                    <option value="ALL">All Students</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>
              </div>

              <Button disabled={isPending} type="submit" className="w-full mt-6 bg-teal-600 hover:bg-teal-700">
                {isPending ? <Spinner size={16} className="text-white mr-2" /> : <Send size={16} className="mr-2" />}
                Send Broadcast
              </Button>
            </form>
          </Card>
        </div>

        {/* ── Right Col: History ──────────────────────────── */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Broadcast History</h2>

          {isLoading ? (
            <div className="flex items-center justify-center p-12"><Spinner /></div>
          ) : notifications.length === 0 ? (
            <Card className="p-12 text-center text-slate-500">
              No broadcasts sent yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => (
                <Card key={notif.id} className="p-4 flex gap-4 transition-all hover:bg-slate-50">
                  <div className={cn(
                    "mt-1 shrink-0",
                    notif.type === 'INFO' && "text-blue-500",
                    notif.type === 'SUCCESS' && "text-emerald-500",
                    notif.type === 'WARNING' && "text-amber-500",
                    notif.type === 'ERROR' && "text-red-500"
                  )}>
                    {notif.type === 'SUCCESS' ? <CheckCircle2 size={24} /> :
                      notif.type === 'WARNING' || notif.type === 'ERROR' ? <AlertTriangle size={24} /> :
                        <Info size={24} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800">{notif.title}</h3>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{notif.message}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminNotifications
