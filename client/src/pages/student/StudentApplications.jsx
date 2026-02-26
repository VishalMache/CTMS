import React from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Badge, Spinner } from '@/components/ui'
import { useQuery } from '@tanstack/react-query'
import { fetchApplications } from '@/lib/api/student'
import { Briefcase, Building2, Calendar, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

const StatusTimeline = ({ rounds }) => {
  if (!rounds || rounds.length === 0) {
    return <p className="text-xs text-slate-400 italic">No rounds scheduled yet.</p>
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium">
      {rounds.map((round, idx) => {
        const result = round.roundResults?.[0];
        const status = result?.status || 'PENDING';

        let Icon = Clock;
        let colorClass = 'bg-slate-100 text-slate-500 border-slate-200';

        if (status === 'SELECTED') {
          Icon = CheckCircle2;
          colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (status === 'REJECTED') {
          Icon = XCircle;
          colorClass = 'bg-red-50 text-red-600 border-red-200';
        }

        return (
          <React.Fragment key={round.id}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${colorClass}`}>
              <Icon size={12} />
              <span>{round.title}</span>
            </div>
            {idx < rounds.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const StudentApplications = () => {
  const { data: apps, isLoading } = useQuery({
    queryKey: ['student-applications'],
    queryFn: fetchApplications
  })

  return (
    <DashboardLayout title="My Applications" subtitle="Track your drive registrations and selection progress">

      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size={32} /></div>
      ) : !apps || apps.length === 0 ? (
        <Card className="p-16 text-center border-dashed bg-slate-50/50">
          <Briefcase size={32} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No applications yet.</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Register for upcoming campus placement drives to start tracking your progress here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const company = app.company;

            // Check if student is completely rejected from the pipeline
            const isRejected = company.selectionRounds?.some(r => r.roundResults?.[0]?.status === 'REJECTED');
            // Check if student successfully cleared ALL scheduled rounds
            const allRoundsCleared = company.selectionRounds?.length > 0 && company.selectionRounds.every(r => r.roundResults?.[0]?.status === 'SELECTED');

            return (
              <Card key={app.id} className={`p-6 border-slate-200 shadow-sm transition-all ${isRejected ? 'opacity-75 bg-slate-50' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                      ) : (
                        <Building2 className="text-slate-400" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{company.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] text-slate-500 font-medium">Applied {format(new Date(app.registeredAt), 'MMM dd, yyyy')}</Badge>
                        <span className="text-xs font-semibold text-teal-600">CTC: ₹{company.ctc} LPA</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isRejected ? (
                      <Badge variant="destructive" className="bg-red-500">Eliminated</Badge>
                    ) : allRoundsCleared ? (
                      <Badge variant="success" className="bg-emerald-500">Hired!</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selection Pipeline Tracker</p>
                  <StatusTimeline rounds={company.selectionRounds} />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}

export default StudentApplications
