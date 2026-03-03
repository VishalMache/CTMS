import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight, ArrowLeft, AlertCircle, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button, Input, Label, Spinner } from '@/components/ui'

const schema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

const StudentLogin = () => {
    const [showPass, setShowPass] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const { login, isLoggingIn, isAuthenticated, user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    })

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'STUDENT') {
                navigate('/student/dashboard')
            } else {
                setErrorMsg('You are currently logged in as an Administrator. Please log out first.')
                logout()
            }
        }
    }, [isAuthenticated, user, navigate, logout])

    const onSubmit = async (data) => {
        setErrorMsg('')
        try {
            await login({ ...data, role: 'STUDENT' })
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Invalid credentials or unauthorized role.')
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ background: 'var(--surface-bg)' }}>

            {/* Theme toggle */}
            <div className="absolute top-5 right-5">
                <button onClick={toggleTheme} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--text-muted)', background: 'var(--surface-card)' }}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/login" className="inline-flex items-center text-sm font-medium mb-8 transition-colors group" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </Link>

                <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-2xl gradient-primary text-white flex items-center justify-center shadow-lg">
                        <GraduationCap size={28} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-2xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
                    Student Login
                </h2>
                <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Access your placement portal
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>

                    {errorMsg && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex gap-3 text-red-700 dark:text-red-300">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm leading-relaxed">{errorMsg}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div>
                            <Label htmlFor="email" style={{ color: 'var(--text-secondary)' }}>Email address</Label>
                            <div className="mt-1.5 relative">
                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@college.edu"
                                    className="pl-11 h-12 rounded-xl"
                                    style={{ background: 'var(--surface-bg)', color: 'var(--text-primary)', borderColor: 'var(--surface-border)' }}
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="password" style={{ color: 'var(--text-secondary)' }}>Password</Label>
                            <div className="mt-1.5 relative">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <Input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className="pl-11 pr-11 h-12 rounded-xl"
                                    style={{ background: 'var(--surface-bg)', color: 'var(--text-primary)', borderColor: 'var(--surface-border)' }}
                                    {...register('password')}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 gradient-primary text-white font-semibold text-base rounded-xl shadow-md mt-2"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? <Spinner size={18} className="text-white mr-2" /> : null}
                            {isLoggingIn ? 'Signing in...' : 'Sign In'}
                            {!isLoggingIn && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-px" style={{ background: 'var(--surface-border)' }} />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3" style={{ background: 'var(--surface-card)', color: 'var(--text-muted)' }}>New student?</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/register/student"
                            className="text-sm font-semibold text-teal-600 hover:text-teal-500 flex items-center justify-center gap-1.5 transition-colors"
                        >
                            Create your account
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentLogin
