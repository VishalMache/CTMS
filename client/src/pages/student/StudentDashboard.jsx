// ============================================================
// CPMS – Student Dashboard (src/pages/student/StudentDashboard.jsx)
// ============================================================

import React from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Calendar, CheckCircle2, ChevronRight, GraduationCap,
  Clock, Trophy, LineChart, FileText, UploadCloud
} from 'lucide-react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Badge, Spinner, Avatar, AvatarImage, AvatarFallback, Progress } from '@/components/ui'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { useStudentStats, useStudentApplications } from '@/hooks/useStudentStats'

// ── Hero Card ───────────────────────────────────────────────
const HeroCard = ({ profile }) => {
  // Quick heuristic: profile is "complete" if there is a resume
  const profileComplete = !!profile.resumeUrl
  const ctcMsg = profile.cgpa >= 7.5 ? "eligible for dream companies" : "keep pushing for higher grades"

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 p-8 mb-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar className="w-20 h-20 shadow-md ring-4 ring-white">
          <AvatarImage src={profile.profilePhotoUrl || ''} />
          <AvatarFallback className="text-2xl bg-teal-100 text-teal-700">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800">
            Welcome back, {profile.firstName}! 👋
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
            <Badge variant="secondary" className="font-medium text-xs rounded-md">
              {profile.enrollmentNumber}
            </Badge>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <GraduationCap size={16} className="text-teal-500" />
              {profile.branch}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <LineChart size={16} className="text-emerald-500" />
              {profile.cgpa} CGPA <span className="text-xs text-slate-400 font-normal">({ctcMsg})</span>
            </span>
          </div>
        </div>

        {!profileComplete && (
          <div className="mt-4 sm:mt-0">
            <Link to="/student/resume">
              <Button variant="default" className="gap-2 shadow-teal-500/20">
                <UploadCloud size={16} />
                Upload Resume
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Stat Card Component ─────────────────────────────────────
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

// ── Active Drive Stepper (Latest Application) ───────────────
const ActiveDriveStepper = ({ applications }) => {
  if (!applications || applications.length === 0) return null

  // Pick the most recent application
  const latest = applications[0]
  const company = latest.company
  const rounds = company.selectionRounds || []

  return (
    <Card className="mb-8 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Active Pipeline</h3>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
            <Briefcase size={14} />
            {company.name} — {company.jobRole}
          </p>
        </div>
        <Badge variant={latest.isEligible ? "default" : "rejected"}>
          {latest.isEligible ? 'Eligible' : 'Not Eligible'}
        </Badge>
      </div>

      <div className="p-6 sm:p-8">
        {rounds.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-4">
            Selection rounds have not been scheduled yet.
          </div>
        ) : (
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 inset-x-0 h-0.5 bg-slate-100 rounded-full" />

            <div className="relative flex justify-between">
              {rounds.map((round, idx) => {
                const result = round.roundResults?.[0]?.status || 'PENDING'

                let dotColor = 'bg-slate-200 ring-white'
                let textColor = 'text-slate-400'
                let icon = <Clock size={12} className="text-slate-400" />

                if (result === 'SELECTED') {
                  dotColor = 'bg-emerald-500 ring-emerald-50'
                  textColor = 'text-emerald-700 font-semibold'
                  icon = <CheckCircle2 size={12} className="text-white" />
                } else if (result === 'REJECTED') {
                  dotColor = 'bg-red-500 ring-red-50'
                  textColor = 'text-red-600 font-semibold'
                  icon = <X size={12} className="text-white" />
                } else if (result === 'PENDING') {
                  dotColor = 'bg-amber-400 ring-amber-50'
                  textColor = 'text-amber-700 font-semibold'
                  icon = <Clock size={12} className="text-white" />
                }

                return (
                  <div key={round.id} className="flex flex-col items-center flex-1 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 transition-all shadow-sm ${dotColor}`}>
                      {icon}
                    </div>
                    <p className={`mt-3 text-xs text-center ${textColor}`}>
                      {round.roundName}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Upcoming Drives Banner ──────────────────────────────────
const UpcomingDrives = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-slate-800">Upcoming Campus Drives</h3>
      <Link to="/student/companies" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors">
        View all <ChevronRight size={16} />
      </Link>
    </div>

    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
      <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
      <p className="text-sm font-medium text-slate-500">No upcoming drives posted yet.</p>
      <p className="text-xs text-slate-400 mt-1">Keep your profile updated to receive invites.</p>
    </div>
  </Card>
)

// ── Main Page ───────────────────────────────────────────────
const StudentDashboard = () => {
  const { data: profile, isLoading: loadingProfile } = useStudentProfile()
  const { data: stats, isLoading: loadingStats } = useStudentStats()
  const { data: apps, isLoading: loadingApps } = useStudentApplications()

  if (loadingProfile || loadingStats || loadingApps) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Your placement overview">
        <div className="flex items-center justify-center h-64">
          <Spinner size={32} />
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) return null

  return (
    <DashboardLayout title="Dashboard" subtitle="Your placement overview">
      {/* Hero Section */}
      <HeroCard profile={profile} />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Applications"
          value={stats.applicationsCount}
          icon={FileText}
          colorClass="bg-blue-100 text-blue-600"
          subtitle="Drives registered"
        />
        <StatCard
          title="Active Invites"
          value={stats.pendingRoundsCount}
          icon={Briefcase}
          colorClass="bg-amber-100 text-amber-600"
          subtitle="Upcoming rounds"
        />
        <StatCard
          title="Avg Mock Score"
          value={`${stats.avgMockScore}%`}
          icon={Trophy}
          colorClass="bg-teal-100 text-teal-600"
          subtitle={`${stats.mockTestsAttempted} tests taken`}
        />
        <StatCard
          title="Attendance"
          value={`${stats.attendancePct}%`}
          icon={CheckCircle2}
          colorClass="bg-emerald-100 text-emerald-600"
          subtitle="Training sessions"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Pipeline / Stepper */}
          {apps?.length > 0 && <ActiveDriveStepper applications={apps} />}

          {apps?.length === 0 && (
            <Card className="p-8 text-center bg-white border-dashed border-2">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No applications yet</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                You haven't registered for any placement drives. Head over to the companies page to browse active opportunities.
              </p>
              <Link to="/student/companies">
                <Button className="mt-6 shadow-sm">Browse Companies</Button>
              </Link>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          {/* Upcoming Drives list */}
          <UpcomingDrives />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentDashboard
