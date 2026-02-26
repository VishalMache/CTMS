// ============================================================
// CPMS – Student Training View (src/pages/student/StudentTraining.jsx)
// ============================================================

import React from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { useSessions, useJoinSession } from '@/hooks/useTraining'
import { BookOpen, Calendar, MapPin, CheckCircle2, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

const StudentTraining = () => {
  const { data, isLoading } = useSessions()
  const { mutate: join, isPending: isJoining } = useJoinSession()

  const sessions = data?.sessions || []

  return (
    <DashboardLayout title="Training & Preparation" subtitle="Register for upcoming workshops to enhance your skills">

      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size={32} /></div>
      ) : sessions.length === 0 ? (
        <Card className="p-16 text-center border-dashed bg-slate-50/50">
          <BookOpen size={32} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No training sessions available</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Check back later for new workshops, technical talks, and mock interviews scheduled by the TPO.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map(session => (
            <Card key={session.id} className="flex flex-col relative overflow-hidden transition-all hover:shadow-md border-slate-200">

              {/* Status logic */}
              {session.myAttendance?.status === 'PRESENT' && (
                <div className="absolute top-0 right-0 p-1.5 px-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-bl-lg flex items-center gap-1 border-b border-l border-emerald-100 z-10">
                  <CheckCircle2 size={14} /> Attended
                </div>
              )}

              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-white">
                <Badge variant="outline" className={cn(
                  "mb-2 bg-slate-50 inline-block",
                  session.type === 'TECHNICAL' ? "text-blue-700 border-blue-200 bg-blue-50" :
                    session.type === 'SOFT_SKILLS' ? "text-fuchsia-700 border-fuchsia-200 bg-fuchsia-50" :
                      "text-teal-700 border-teal-200 bg-teal-50"
                )}>
                  {session.type}
                </Badge>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-2">{session.title}</h3>
                <p className="text-sm font-medium text-slate-600 mt-1">Conducted by: <span className="text-slate-800">{session.conductedBy}</span></p>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-teal-600 shrink-0" />
                  <span>
                    {new Date(session.sessionDate).toLocaleDateString()} at {new Date(session.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-600 bg-white p-3 rounded-md border border-slate-100 shadow-sm mt-3">
                  {session.description?.toLowerCase().includes('http') || session.description?.toLowerCase().includes('meet.google') ? (
                    <Video size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  ) : (
                    <MapPin size={16} className="text-fuchsia-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 text-xs mb-1">LOCATION / LINK</p>

                    {/* Auto-link URLs if found in description */}
                    <p className="line-clamp-3 whitespace-pre-wrap whitespace-break-spaces break-words">
                      {session.description?.split(' ').map((word, i) =>
                        word.startsWith('http') ? (
                          <a key={i} href={word} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">{word} </a>
                        ) : (
                          word + ' '
                        )
                      ) || 'TBA'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer (Registration) */}
              <div className="p-4 border-t border-slate-100 bg-white mt-auto">
                {!session.myAttendance ? (
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 shadow-sm"
                    onClick={() => join(session.id)}
                    disabled={isJoining}
                  >
                    Register for Session
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full text-slate-500 border-slate-200 bg-slate-50 cursor-default"
                    disabled
                  >
                    <CheckCircle2 size={16} className="text-teal-500 mr-2" /> Registered
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

    </DashboardLayout>
  )
}

export default StudentTraining
