// ============================================================
// CPMS – Student Notifications (src/pages/student/StudentNotifications.jsx)
// Full Log View
// ============================================================

import React from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Spinner } from '@/components/ui'
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from '@/hooks/useNotification'
import { Check, CheckCircle2, Info, AlertTriangle, BellRing } from 'lucide-react'
import { cn } from '@/lib/utils'

const StudentNotifications = () => {
  const { data: notifData, isLoading } = useNotifications()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllAsRead()
  const { mutate: markRead } = useMarkAsRead()

  const notifications = notifData?.notifications || []
  const unreadCount = notifData?.unreadCount || 0

  if (isLoading) {
    return (
      <DashboardLayout title="Notifications" subtitle="Stay updated with placement alerts">
        <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Notifications" subtitle="Stay updated with placement alerts">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
            <BellRing size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Your Inbox</h2>
            <p className="text-sm text-slate-500">You have {unreadCount} unread messages</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllRead()}
            disabled={isMarkingAll}
            className="text-teal-600 border-teal-200 hover:bg-teal-50"
          >
            <Check size={16} className="mr-2" /> Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-16 text-center border-dashed bg-slate-50/50">
          <BellRing size={32} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
          <p className="text-slate-500 mt-2">You don't have any notifications yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <Card
              key={notif.id}
              onClick={() => { if (!notif.isRead) markRead(notif.id) }}
              className={cn(
                "p-5 flex gap-4 transition-all cursor-pointer relative overflow-hidden",
                notif.isRead ? "bg-white border-slate-200 hover:border-slate-300" : "bg-teal-50/50 border-teal-200 shadow-sm"
              )}
            >
              {/* Unread indicator bar */}
              {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />}

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

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-2">
                  <h3 className={cn("font-bold text-base", notif.isRead ? "text-slate-800" : "text-teal-900")}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={cn("text-sm leading-relaxed", notif.isRead ? "text-slate-600" : "text-teal-800")}>
                  {notif.message}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

    </DashboardLayout>
  )
}

export default StudentNotifications
