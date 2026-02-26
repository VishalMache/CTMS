import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

const AuthLanding = () => {
    const { isAuthenticated, user } = useAuth()
    const navigate = useNavigate()

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'TPO_ADMIN' ? '/admin/dashboard' : '/student/dashboard')
        }
    }, [isAuthenticated, user, navigate])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Content */}
            <div className="text-center z-10 mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 mb-6">
                    <GraduationCap size={32} className="text-teal-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                    Welcome to CPMS
                </h1>
                <p className="text-slate-500 text-lg max-w-md mx-auto">
                    College Placement Management System. Please select your role to continue.
                </p>
            </div>

            {/* Role Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">

                {/* ── Student Card ── */}
                <Card className="group relative overflow-hidden border-2 border-transparent hover:border-teal-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative p-8 sm:p-10 flex flex-col h-full">
                        <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6">
                            <GraduationCap size={28} />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Student Login</h2>
                        <p className="text-slate-500 mb-8 flex-1">
                            Access your placement dashboard, apply for drives, and manage your profile.
                        </p>

                        <div className="flex flex-col gap-3 mt-auto">
                            <Link
                                to="/login/student"
                                className="inline-flex items-center justify-center w-full bg-teal-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors gap-2"
                            >
                                Login as Student
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                to="/register/student"
                                className="inline-flex items-center justify-center w-full bg-slate-50 text-teal-600 font-medium py-3 px-4 rounded-xl hover:bg-teal-50 transition-colors"
                            >
                                New Student? Create Account
                            </Link>
                        </div>
                    </div>
                </Card>

                {/* ── Admin Card ── */}
                <Card className="group relative overflow-hidden border-2 border-transparent hover:border-slate-800/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative p-8 sm:p-10 flex flex-col h-full">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6">
                            <ShieldCheck size={28} />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Administration Login</h2>
                        <p className="text-slate-500 mb-8 flex-1">
                            TPO and Placement Officer access. Manage students, companies, and campus drives.
                        </p>

                        <div className="flex flex-col gap-3 mt-auto">
                            <Link
                                to="/login/admin"
                                className="inline-flex items-center justify-center w-full bg-slate-800 text-white font-medium py-3 px-4 rounded-xl hover:bg-slate-900 transition-colors gap-2"
                            >
                                Login as Admin
                                <ArrowRight size={18} />
                            </Link>
                            <div className="py-3 px-4 text-center text-sm text-slate-400">
                                Admin accounts are provisioned by the institution.
                            </div>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    )
}

export default AuthLanding
