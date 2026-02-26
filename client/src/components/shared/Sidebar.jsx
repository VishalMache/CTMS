// ============================================================
// CPMS – Sidebar (src/components/shared/Sidebar.jsx)
// Fixed left sidebar with navigation for Student / TPO Admin
// ============================================================

import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { getInitials } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import {
    LayoutDashboard, User, FileText, Building2, ClipboardList,
    GitBranch, BookOpen, FlaskConical, Bell, BarChart3,
    Users, Trophy, GraduationCap, LogOut, ChevronLeft, ChevronRight,
    Briefcase, Award, Home, BellRing
} from 'lucide-react'

// ── Navigation definitions ────────────────────────────────
const studentNav = [
    { icon: Home, label: 'Dashboard', path: '/student/dashboard' },
    { icon: User, label: 'My Profile', path: '/student/profile' },
    { icon: Briefcase, label: 'Campus Drives', path: '/student/drives' },
    { icon: BookOpen, label: 'Training', path: '/student/training' },
    { icon: FileText, label: 'Mock Tests', path: '/student/mock-tests' },
    { icon: ClipboardList, label: 'Applications & Status', path: '/student/applications' },
    { icon: Bell, label: 'Notifications', path: '/student/notifications' },
]

const adminNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Students', path: '/admin/students' },
    { icon: Building2, label: 'Drive Management', path: '/admin/companies' },
    { icon: BookOpen, label: 'Training', path: '/admin/training' },
    { icon: FlaskConical, label: 'Mock Tests', path: '/admin/mock-tests' },
    { icon: BarChart3, label: 'Reports & Analytics', path: '/admin/reports' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
]

const Sidebar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false)

    const isAdmin = user?.role === 'TPO_ADMIN'
    const navItems = isAdmin ? adminNav : studentNav

    const displayName = isAdmin
        ? 'TPO Admin'
        : `${user?.student?.firstName || ''} ${user?.student?.lastName || ''} `.trim() || user?.email

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-30',
                'flex flex-col transition-[width] duration-300 ease-in-out shadow-sm',
                collapsed ? 'w-[70px]' : 'w-[240px]'
            )}
        >
            {/* ── Logo ──────────────────────────────────────── */}
            <div className={cn(
                'flex items-center h-16 px-4 border-b border-slate-100 shrink-0',
                collapsed ? 'justify-center' : 'gap-3'
            )}>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <GraduationCap size={18} className="text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">CPMS</p>
                        <p className="text-[10px] text-slate-400 leading-tight">Placement Portal</p>
                    </div>
                )}
            </div>

            {/* ── Collapse toggle ────────────────────────────── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                    'absolute -right-3 top-20 z-40 w-6 h-6 rounded-full bg-white border border-slate-200',
                    'flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors'
                )}
                aria-label="Toggle sidebar"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {/* ── User info ─────────────────────────────────── */}
            {!collapsed && (
                <div className="px-4 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={user?.student?.profilePhotoUrl} />
                            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                        )}>
                            {isAdmin ? <Award size={9} /> : <Briefcase size={9} />}
                            {isAdmin ? 'TPO Admin' : user?.student?.branch || 'Student'}
                        </span>
                    </div>
                </div>
            )}

            {/* ── Nav links ─────────────────────────────────── */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {navItems.map(({ icon: Icon, label, path }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            cn('sidebar-link', isActive && 'active')
                        }
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={18} className="shrink-0" />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* ── Logout ────────────────────────────────────── */}
            <div className="p-2 border-t border-slate-100 shrink-0">
                <button
                    onClick={handleLogout}
                    className={cn(
                        'sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600',
                        'transition-colors'
                    )}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut size={18} className="shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
