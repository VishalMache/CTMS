import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Label, Spinner } from '@/components/ui'

const schema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

const AdminLogin = () => {
    const [showPass, setShowPass] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const { login, isLoggingIn, isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    })

    // Strict role guard: if logged in but not an admin, log them out
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'TPO_ADMIN') {
                navigate('/admin/dashboard')
            } else {
                // They are a student trying to access the admin login page while logged in
                setErrorMsg('You are currently logged in as a Student. This portal is for Administrators only. Logging you out...')
                logout() // Auto-clear the conflicting session
            }
        }
    }, [isAuthenticated, user, navigate, logout])

    const onSubmit = async (data) => {
        setErrorMsg('')
        try {
            await login({ ...data, role: 'TPO_ADMIN' })
            // Navigation handled by AuthContext
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Invalid credentials or unauthorized role.')
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Dark theme background glow */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-slate-800 rounded-full blur-[120px] pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Role Selection
                </Link>

                <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shadow-lg">
                        <ShieldCheck size={28} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Administration
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Secure access for TPO and Placement Officers
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-slate-800/80 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-700">

                    {errorMsg && (
                        <div className="mb-6 bg-red-900/50 border border-red-800 rounded-lg p-4 flex gap-3 text-red-200">
                            <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-400" />
                            <p className="text-sm leading-relaxed">{errorMsg}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div>
                            <Label htmlFor="email" className="text-slate-300">Official Email address</Label>
                            <div className="mt-1 relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@college.edu"
                                    className="pl-10 h-11 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-slate-500 outline-none"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <div className="mt-1 relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Enter your secure password"
                                    className="pl-10 pr-10 h-11 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-slate-500 outline-none"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-white hover:bg-slate-200 text-slate-900 font-semibold text-base mt-2"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? <Spinner size={18} className="text-slate-500 mr-2" /> : null}
                            {isLoggingIn ? 'Authenticating...' : 'Login to Admin Portal'}
                            {!isLoggingIn && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </form>

                    <div className="mt-8 text-center bg-slate-900/50 -mx-10 -mb-8 px-10 py-5 rounded-b-2xl border-t border-slate-700/50 flex flex-col items-center justify-center gap-2">
                        <span className="text-sm text-slate-400">Need TPO access?</span>
                        <Link
                            to="/register/admin"
                            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            Provision New Admin Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
