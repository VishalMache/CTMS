// ============================================================
// CPMS – Admin Dashboard (src/pages/admin/AdminDashboard.jsx)
// ============================================================

import React from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Users, CalendarDays, TrendingUp, ChevronRight, CheckCircle2
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Spinner } from '@/components/ui'
import { useAdminDashboardStats } from '@/hooks/useCompany'
import { useAuth } from '@/context/AuthContext'

// ── Colors for Pie Chart ────────────────────────────────────
const PIE_COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981']

// ── Top Stat Card ───────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <Card className="p-6 flex items-start gap-4">
    <div className={`p-3 rounded-xl shrink-0 ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
      {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
    </div>
  </Card>
)

// ── Chart Views ─────────────────────────────────────────────
const DriveActivityChart = ({ data }) => (
  <Card className="p-6 col-span-1 lg:col-span-2">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Drive Activity</h3>
        <p className="text-sm text-slate-500">Student applications over last 6 months</p>
      </div>
    </div>
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="applications" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
)

const BranchPlacementChart = ({ data }) => {
  // If no data yet
  if (!data || data.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center text-center">
        <PieChart size={48} className="text-slate-300 mb-4" />
        <h3 className="text-base font-bold text-slate-700">No Placement Data</h3>
        <p className="text-sm text-slate-500">Wait for selection rounds to complete.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-2">Branch-wise Placements</h3>
      <p className="text-sm text-slate-500 mb-6">Distribution of selected students</p>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// ── Page Component ──────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth()
  const { data: dashboardData, isLoading } = useAdminDashboardStats()

  if (isLoading) {
    return (
      <DashboardLayout title="TPO Dashboard" subtitle="Overview of placement activities">
        <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
      </DashboardLayout>
    )
  }

  if (!dashboardData) return null

  const { stats, charts } = dashboardData

  return (
    <DashboardLayout title="TPO Dashboard" subtitle="Overview of placement activities">

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome, Training & Placement Officer</h2>
          <p className="text-slate-500 font-medium">{user?.email}</p>
        </div>
        <Link to="/admin/companies">
          <Button className="shadow-teal-500/20 gap-2">
            <Building2 size={16} /> Manage Companies
          </Button>
        </Link>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Placement %"
          value={`${stats.placementPercentage}%`}
          icon={TrendingUp}
          colorClass="bg-emerald-100 text-emerald-600"
          subtitle="Of total eligible students"
        />
        <StatCard
          title="Partner Companies"
          value={stats.totalCompanies}
          icon={Building2}
          colorClass="bg-blue-100 text-blue-600"
          subtitle="Total registered"
        />
        <StatCard
          title="Active Students"
          value={stats.activeStudents}
          icon={Users}
          colorClass="bg-indigo-100 text-indigo-600"
          subtitle="Accounts created"
        />
        <StatCard
          title="Upcoming Drives"
          value={stats.upcomingDrives}
          icon={CalendarDays}
          colorClass="bg-amber-100 text-amber-600"
          subtitle="Drives in UPCOMING status"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DriveActivityChart data={charts.areaChartData} />
        <BranchPlacementChart data={charts.pieChartData} />
      </div>

    </DashboardLayout>
  )
}

export default AdminDashboard
