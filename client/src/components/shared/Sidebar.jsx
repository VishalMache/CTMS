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
import { useTheme } from '@/context/ThemeContext'
import {
    LayoutDashboard, User, FileText, Building2, ClipboardList,
    BookOpen, FlaskConical, Bell, BarChart3,
    Users, GraduationCap, LogOut, ChevronLeft, ChevronRight,
    Briefcase, Award, Home, Sun, Moon
} from 'lucide-react'

// ── Navigation definitions ────────────────────────────────
const studentNav = [
    { icon: Home, label: 'Dashboard', path: '/student/dashboard' },
    { icon: User, label: 'My Profile', path: '/student/profile' },
    { icon: FileText, label: 'Documents', path: '/student/resume' },
    { icon: Briefcase, label: 'Campus Drives', path: '/student/companies' },
    { icon: BookOpen, label: 'Training', path: '/student/training' },
    { icon: FlaskConical, label: 'Mock Tests', path: '/student/mock-tests' },
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
    const { theme, toggleTheme } = useTheme()
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
                'fixed left-0 top-0 h-screen z-30',
                'flex flex-col transition-[width] duration-300 ease-in-out'
            )}
            style={{
                width: collapsed ? '70px' : '240px',
                background: 'var(--surface-sidebar)',
                borderRight: '1px solid var(--surface-border)',
            }}
        >
            {/* ── Logo ──────────────────────────────────────── */}
            <div className={cn(
                'flex items-center h-16 px-4 shrink-0',
                collapsed ? 'justify-center' : 'gap-3'
            )} style={{ borderBottom: '1px solid var(--surface-border-light)' }}>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <GraduationCap size={18} className="text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>CTMS</p>
                        <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>Placement Portal</p>
                    </div>
                )}
            </div>

            {/* ── Collapse toggle ────────────────────────────── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                    'absolute -right-3 top-20 z-40 w-6 h-6 rounded-full',
                    'flex items-center justify-center shadow-sm transition-colors'
                )}
                style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    color: 'var(--text-secondary)',
                }}
                aria-label="Toggle sidebar"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {/* ── User info ─────────────────────────────────── */}
            {!collapsed && (
                <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--surface-border-light)' }}>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={user?.student?.profilePhotoUrl} />
                            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
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

            {/* ── Bottom: Theme toggle + Logout ────────────── */}
            <div className="p-2 shrink-0 space-y-0.5" style={{ borderTop: '1px solid var(--surface-border-light)' }}>
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className={cn(
                        'sidebar-link w-full transition-colors'
                    )}
                    title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
                >
                    {theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
                    {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* Logout */}
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
