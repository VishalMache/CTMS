import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Label, Spinner } from '@/components/ui'

const schema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

const StudentLogin = () => {
    const [showPass, setShowPass] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const { login, isLoggingIn, isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    })

    // Strict role guard: if logged in but not a student, log them out
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'STUDENT') {
                navigate('/student/dashboard')
            } else {
                // They are an admin trying to access the student login page while logged in
                setErrorMsg('You are currently logged in as an Administrator. Please log out first to sign in as a Student.')
                logout() // Auto-clear the conflicting session
            }
        }
    }, [isAuthenticated, user, navigate, logout])

    const onSubmit = async (data) => {
        setErrorMsg('')
        try {
            await login({ ...data, role: 'STUDENT' })
            // Navigation is handled directly by the AuthContext or trailing useEffect
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Invalid credentials or unauthorized role.')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Role Selection
                </Link>

                <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                        <GraduationCap size={28} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Student Login
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Access your campus placement portal
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">

                    {errorMsg && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-700">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm leading-relaxed">{errorMsg}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div>
                            <Label htmlFor="email">Email address</Label>
                            <div className="mt-1 relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your student email"
                                    className="pl-10 h-11 focus-visible:ring-indigo-500 outline-none"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="mt-1 relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10 h-11 focus-visible:ring-indigo-500 outline-none"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-base"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? <Spinner size={18} className="text-white mr-2" /> : null}
                            {isLoggingIn ? 'Verifying...' : 'Login to Student Portal'}
                            {!isLoggingIn && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">New around here?</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/register/student"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1"
                        >
                            Create a student account
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentLogin
