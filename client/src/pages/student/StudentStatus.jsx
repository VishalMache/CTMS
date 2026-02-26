import React from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, CardContent } from '@/components/ui'
import { Construction } from 'lucide-react'

const StudentStatus = () => (
  <DashboardLayout title="Selection Status" subtitle="Round-by-round tracking">
    <Card className="max-w-lg mx-auto mt-8">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <Construction size={40} className="text-teal-400" />
        <div>
          <h2 className="text-lg font-bold text-slate-700">Selection Status</h2>
          <p className="text-sm text-slate-400 mt-1">
            This page is coming in the next phase. Stay tuned!
          </p>
        </div>
      </CardContent>
    </Card>
  </DashboardLayout>
)

export default StudentStatus
