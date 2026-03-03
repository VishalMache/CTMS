import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

const AuthLanding = () => {
    const { isAuthenticated, user } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'TPO_ADMIN' ? '/admin/dashboard' : '/student/dashboard')
        }
    }, [isAuthenticated, user, navigate])

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-bg)' }}>

            {/* ── Top Bar ── */}
            <nav className="flex items-center justify-between px-6 sm:px-12 py-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                        <GraduationCap size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>CTMS</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: 'var(--text-muted)', background: 'var(--surface-card)' }}
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main className="flex-1 flex items-center justify-center px-6 sm:px-12 pb-16">
                <div className="w-full max-w-md text-center">

                    {/* Heading */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--text-heading)' }}>
                        Campus Placement Portal
                    </h1>
                    <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
                        Sign in to manage your placements
                    </p>

                    {/* Student Actions */}
                    <div className="space-y-3 mb-8">
                        <Link
                            to="/login/student"
                            className="group flex items-center justify-center w-full gap-2 gradient-primary text-white font-semibold py-3.5 px-6 rounded-xl transition-all hover:opacity-90 active:opacity-80 shadow-md"
                        >
                            <GraduationCap size={20} />
                            Student Login
                            <ArrowRight size={16} className="ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <Link
                            to="/register/student"
                            className="flex items-center justify-center w-full gap-2 font-medium py-3.5 px-6 rounded-xl transition-all"
                            style={{
                                background: 'var(--surface-card)',
                                border: '1.5px solid var(--surface-border)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            Create Student Account
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px" style={{ background: 'var(--surface-border)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>OR</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--surface-border)' }} />
                    </div>

                    {/* Admin Link — subtle */}
                    <Link
                        to="/login/admin"
                        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <ShieldCheck size={15} />
                        TPO / Admin Login
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="text-center py-5">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    © 2026 CTMS — Campus Training & Management System
                </p>
            </footer>
        </div>
    )
}

export default AuthLanding
