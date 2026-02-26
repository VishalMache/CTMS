// ============================================================
// CPMS – Admin Reports & Analytics (src/pages/admin/AdminReports.jsx)
// ============================================================

import React from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Spinner } from '@/components/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Download, TrendingUp, Users, DollarSign, Award, Briefcase } from 'lucide-react'
import { useDashboardStats, useBranchPlacements, useCompanySelections, fetchExportData } from '@/hooks/useReports'

// Recharts color palettes
const COLORS = ['#0f766e', '#0369a1', '#6d28d9', '#b45309', '#be185d', '#15803d', '#1d4ed8']

const StatCard = ({ title, value, subtext, icon: Icon, isLoading }) => (
  <Card className="p-6 flex items-start gap-4 shadow-sm border-slate-200">
    <div className="p-3 bg-slate-50 rounded-xl text-teal-600 border border-slate-100 shrink-0">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      {isLoading ? <Spinner size={20} className="text-slate-300" /> : (
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
      )}
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  </Card>
)

const AdminReports = () => {
  const { data: statsData, isLoading: loadingStats } = useDashboardStats()
  const { data: branchData, isLoading: loadingBranch } = useBranchPlacements()
  const { data: companyData, isLoading: loadingCompany } = useCompanySelections()

  const stats = statsData?.stats || {}
  const branches = branchData?.data || []
  const companies = companyData?.data || []

  const handleExportCSV = async () => {
    try {
      const res = await fetchExportData()
      if (!res.success || !res.data) return alert('Failed to export data')

      // Convert JSON array to CSV string
      const data = res.data
      if (data.length === 0) return alert('No students to export.')

      const headers = Object.keys(data[0])
      const csvRows = []

      // Header row
      csvRows.push(headers.join(','))

      // Data rows - escaping commas inside values
      data.forEach(row => {
        const values = headers.map(header => {
          const val = row[header] === null || row[header] === undefined ? '' : String(row[header])
          return `"${val.replace(/"/g, '""')}"`
        })
        csvRows.push(values.join(','))
      })

      const csvString = csvRows.join('\n')

      // Trigger browser download
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `CPMS_Placement_Report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error('Export error', error)
      alert('An error occurred during CSV generation.')
    }
  }

  return (
    <DashboardLayout
      title="System Analytics"
      subtitle="Macro-level view of campus placement performance"
      action={
        <Button onClick={handleExportCSV} className="bg-slate-800 hover:bg-slate-900 shadow-sm border border-slate-700">
          <Download size={16} className="mr-2" />
          Export CSV Matrix
        </Button>
      }
    >

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Participants"
          value={stats.totalStudents || 0}
          icon={Users}
          isLoading={loadingStats}
          subtext="Registered accounts"
        />
        <StatCard
          title="Total Placed"
          value={stats.totalPlaced || 0}
          icon={Award}
          isLoading={loadingStats}
          subtext={`${stats.placementRate || 0}% Placement Rate`}
        />
        <StatCard
          title="Highest CTC"
          value={stats.highestCTC ? `₹${stats.highestCTC}L` : 'N/A'}
          icon={TrendingUp}
          isLoading={loadingStats}
          subtext="Peak offer secured"
        />
        <StatCard
          title="Average CTC"
          value={stats.avgCTC ? `₹${stats.avgCTC}L` : 'N/A'}
          icon={DollarSign}
          isLoading={loadingStats}
          subtext="Mean offer across all drives"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Branch Wise Distribution */}
        <Card className="p-6 border-slate-200 shadow-sm flex flex-col h-[420px]">
          <div className="mb-6 shrink-0">
            <h3 className="text-lg font-bold text-slate-800">Selections by Branch</h3>
            <p className="text-sm text-slate-500">Volume of students holding offers per department.</p>
          </div>

          <div className="flex-1 w-full min-h-0">
            {loadingBranch ? (
              <div className="h-full flex items-center justify-center"><Spinner size={32} /></div>
            ) : branches.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No data to display</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branches} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Company Volume */}
        <Card className="p-6 border-slate-200 shadow-sm flex flex-col h-[420px]">
          <div className="mb-2 shrink-0">
            <h3 className="text-lg font-bold text-slate-800">Recruiter Volume Share</h3>
            <p className="text-sm text-slate-500">Which companies hired the most candidates.</p>
          </div>

          <div className="flex-1 w-full min-h-0 relative">
            {loadingCompany ? (
              <div className="h-full flex items-center justify-center"><Spinner size={32} /></div>
            ) : companies.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No data to display</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companies}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {companies.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Inner Donut Icon Layer */}
            {!loadingCompany && companies.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-10">
                <div className="p-3 bg-slate-50 rounded-full text-slate-400 opacity-50">
                  <Briefcase size={32} strokeWidth={1.5} />
                </div>
              </div>
            )}

          </div>
        </Card>

      </div>

    </DashboardLayout>
  )
}

export default AdminReports
