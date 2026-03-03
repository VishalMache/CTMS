import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    GraduationCap, ShieldCheck, ArrowRight, Sun, Moon,
    Mail, Lock, Eye, EyeOff, AlertCircle, Briefcase, Users, BarChart3
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button, Input, Label, Spinner } from '@/components/ui'

const studentSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

const adminSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

const AuthLanding = () => {
    const { isAuthenticated, user, login, isLoggingIn, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState('student')
    const [showPass, setShowPass] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // Student form
    const studentForm = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues: { email: '', password: '' },
    })

    // Admin form
    const adminForm = useForm({
        resolver: zodResolver(adminSchema),
        defaultValues: { email: '', password: '' },
    })

    const currentForm = activeTab === 'student' ? studentForm : adminForm
    const { register, handleSubmit, formState: { errors } } = currentForm

    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'TPO_ADMIN' ? '/admin/dashboard' : '/student/dashboard')
        }
    }, [isAuthenticated, user, navigate])

    // Clear error when switching tabs
    useEffect(() => {
        setErrorMsg('')
        setShowPass(false)
    }, [activeTab])

    const onSubmit = async (data) => {
        setErrorMsg('')
        const role = activeTab === 'student' ? 'STUDENT' : 'TPO_ADMIN'
        try {
            await login({ ...data, role })
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Invalid credentials. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--surface-bg)' }}>

            {/* ═══════════════════════════════════════════════
                LEFT PANEL — Login Form
            ═══════════════════════════════════════════════ */}
            <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-between px-6 sm:px-12 lg:px-16 py-8">

                {/* Top: Logo + Theme toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                            <GraduationCap size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>CTMS</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}
                        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>

                {/* Middle: Form */}
                <div className="w-full max-w-md mx-auto">

                    {/* Tabs */}
                    <div className="flex mb-8" style={{ borderBottom: '2px solid var(--surface-border)' }}>
                        <button
                            onClick={() => setActiveTab('student')}
                            className="flex-1 pb-3 text-sm font-semibold transition-colors relative"
                            style={{ color: activeTab === 'student' ? '#0d9488' : 'var(--text-muted)' }}
                        >
                            Student Login
                            {activeTab === 'student' && (
                                <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-teal-600 rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className="flex-1 pb-3 text-sm font-semibold transition-colors relative"
                            style={{ color: activeTab === 'admin' ? '#0d9488' : 'var(--text-muted)' }}
                        >
                            Admin Login
                            {activeTab === 'admin' && (
                                <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-teal-600 rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* Error */}
                    {errorMsg && (
                        <div className="mb-5 rounded-xl p-3.5 flex gap-3 text-sm"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="leading-relaxed">{errorMsg}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div>
                            <Label style={{ color: 'var(--text-secondary)' }}>
                                {activeTab === 'student' ? 'Student Email' : 'Official Email'}
                            </Label>
                            <div className="mt-1.5 relative">
                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <Input
                                    type="email"
                                    placeholder={activeTab === 'student' ? 'you@college.edu' : 'admin@college.edu'}
                                    className="pl-11 h-12 rounded-xl"
                                    style={{ background: 'var(--surface-bg)', color: 'var(--text-primary)', borderColor: 'var(--surface-border)' }}
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <Label style={{ color: 'var(--text-secondary)' }}>Password</Label>
                            <div className="mt-1.5 relative">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <Input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className="pl-11 pr-11 h-12 rounded-xl"
                                    style={{ background: 'var(--surface-bg)', color: 'var(--text-primary)', borderColor: 'var(--surface-border)' }}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 gradient-primary text-white font-semibold text-base rounded-xl shadow-md"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? <Spinner size={18} className="text-white mr-2" /> : null}
                            {isLoggingIn ? 'Signing in...' : 'Login'}
                            {!isLoggingIn && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </form>

                    {/* Register link */}
                    {activeTab === 'student' && (
                        <div className="mt-6 text-center">
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
                            <Link to="/register/student" className="text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors">
                                Sign Up
                            </Link>
                        </div>
                    )}
                    {activeTab === 'admin' && (
                        <div className="mt-6 text-center">
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Need admin access? </span>
                            <Link to="/register/admin" className="text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors">
                                Provision Account
                            </Link>
                        </div>
                    )}
                </div>

                {/* Bottom: Footer */}
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                    © 2026 Campus Training & Management System. All rights reserved.
                </p>
            </div>

            {/* ═══════════════════════════════════════════════
                RIGHT PANEL — Branding
            ═══════════════════════════════════════════════ */}
            <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden">

                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900" />

                {/* Subtle pattern */}
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }}
                />

                {/* Decorative shapes */}
                <div className="absolute top-[15%] right-[10%] w-72 h-72 bg-white/5 rounded-3xl rotate-12 backdrop-blur-sm border border-white/10" />
                <div className="absolute bottom-[20%] left-[5%] w-56 h-56 bg-white/5 rounded-3xl -rotate-6 backdrop-blur-sm border border-white/10" />
                <div className="absolute top-[50%] right-[40%] w-40 h-40 bg-teal-400/10 rounded-full blur-2xl" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-16">

                    {/* Main heading */}
                    <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
                        Empowering
                        <br />
                        Campus
                        <br />
                        <span className="text-teal-300">Placements</span>
                    </h2>

                    <p className="text-base text-white/70 leading-relaxed mb-12 max-w-md">
                        Streamline recruitment, track student progress, and bridge the gap between academia and industry with our placement dashboard.
                    </p>

                    {/* Feature highlights */}
                    <div className="space-y-4 max-w-md">
                        {[
                            { icon: Briefcase, label: 'Manage campus drives & company visits' },
                            { icon: Users, label: 'Track student applications & placements' },
                            { icon: BarChart3, label: 'Generate reports & placement analytics' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                                    <item.icon size={18} className="text-teal-300" />
                                </div>
                                <span className="text-sm text-white/80 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom indicator dots */}
                    <div className="flex items-center gap-2 mt-16">
                        <div className="w-8 h-1 bg-white rounded-full" />
                        <div className="w-3 h-1 bg-white/30 rounded-full" />
                        <div className="w-3 h-1 bg-white/30 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLanding
