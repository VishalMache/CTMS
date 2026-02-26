import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Mail, Lock, Eye, EyeOff, User, BookOpen,
    ArrowRight, ArrowLeft, AlertCircle, CheckCircle2
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Label, Spinner, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

// Zod Schema matching Sections A, B, C exactly
const registerSchema = z.object({
    // Section A - Credentials
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),

    // Section B - Personal Deets
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    gender: z.enum(['Male', 'Female', 'Other'], { errorMap: () => ({ message: 'Select gender' }) }),

    // Section C - Academics
    enrollmentNumber: z.string().min(4, 'Enrollment number is required'),
    branch: z.enum(['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EE'], { errorMap: () => ({ message: 'Select a branch' }) }),
    tenth_percent: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(1).max(100),
    twelfth_percent: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(1).max(100),
    cgpa: z.coerce.number({ invalid_type_error: 'Enter CGPA' }).min(0).max(10),
    activeBacklogs: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const StudentRegister = () => {
    const [showPass, setShowPass] = useState(false)
    const [showConfPass, setShowConfPass] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const { register: registerAction, isRegistering } = useAuth()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '', password: '', confirmPassword: '',
            firstName: '', lastName: '', phone: '', gender: '',
            enrollmentNumber: '', branch: '',
            tenth_percent: '', twelfth_percent: '', cgpa: '', activeBacklogs: false
        },
    })

    const onSubmit = async (data) => {
        setErrorMsg('')
        try {
            // Remove confirmPassword before sending to backend
            const { confirmPassword, ...submitData } = data
            // Let AuthContext handle API call and success routing
            await registerAction({ ...submitData, role: 'STUDENT' })
            navigate('/student/dashboard')
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Registration failed. Please try again.')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col py-10 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4">
                <Link to="/login/student" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Student Login
                </Link>

                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                    Create Student Account
                </h2>
                <p className="text-sm text-slate-500 mb-8">
                    Let's get your placement profile set up. Fill out all sections below accurately.
                </p>

                {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-700 shadow-sm">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm leading-relaxed">{errorMsg}</p>
                    </div>
                )}

                <Card className="p-6 sm:p-8 bg-white shadow-xl shadow-slate-200/50 border-slate-100 mb-12">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>

                        {/* ── SECTION A: Credentials ── */}
                        <div className="space-y-5">
                            <div className="border-b border-slate-100 pb-2 mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <Lock size={18} className="text-indigo-500" />
                                    Account Credentials
                                </h3>
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <div className="mt-1 relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input id="email" type="email" placeholder="you@college.edu" className="pl-9" {...register('email')} />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <div className="mt-1 relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Min 8 chars" className="pl-9 pr-9" {...register('password')} />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="mt-1 relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input id="confirmPassword" type={showConfPass ? 'text' : 'password'} placeholder="Match password" className="pl-9 pr-9" {...register('confirmPassword')} />
                                        <button type="button" onClick={() => setShowConfPass(!showConfPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showConfPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION B: Personal Details ── */}
                        <div className="space-y-5">
                            <div className="border-b border-slate-100 pb-2 mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <User size={18} className="text-indigo-500" />
                                    Personal Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" className="mt-1" {...register('firstName')} />
                                    {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" className="mt-1" {...register('lastName')} />
                                    {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" placeholder="10 digits" className="mt-1" {...register('phone')} />
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="gender">Gender</Label>
                                    <select id="gender" className={cn('mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:border-indigo-500')} {...register('gender')}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION C: Academic Details ── */}
                        <div className="space-y-5">
                            <div className="border-b border-slate-100 pb-2 mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <BookOpen size={18} className="text-indigo-500" />
                                    Academic Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
                                    <Input id="enrollmentNumber" placeholder="e.g. 2021CS001" className="mt-1 uppercase" {...register('enrollmentNumber')} />
                                    {errors.enrollmentNumber && <p className="mt-1 text-xs text-red-500">{errors.enrollmentNumber.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="branch">Branch</Label>
                                    <select id="branch" className={cn('mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:border-indigo-500')} {...register('branch')}>
                                        <option value="">Select Branch</option>
                                        {['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EE'].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    {errors.branch && <p className="mt-1 text-xs text-red-500">{errors.branch.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-5">
                                <div>
                                    <Label htmlFor="tenth_percent">10th %</Label>
                                    <Input id="tenth_percent" type="number" step="0.01" className="mt-1" {...register('tenth_percent')} />
                                    {errors.tenth_percent && <p className="mt-1 text-xs text-red-500">{errors.tenth_percent.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="twelfth_percent">12th %</Label>
                                    <Input id="twelfth_percent" type="number" step="0.01" className="mt-1" {...register('twelfth_percent')} />
                                    {errors.twelfth_percent && <p className="mt-1 text-xs text-red-500">{errors.twelfth_percent.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="cgpa">Current CGPA</Label>
                                    <Input id="cgpa" type="number" step="0.01" className="mt-1" {...register('cgpa')} />
                                    {errors.cgpa && <p className="mt-1 text-xs text-red-500">{errors.cgpa.message}</p>}
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        {...register('activeBacklogs')}
                                    />
                                    <span className="text-sm font-medium text-slate-700">I have active (uncleared) backlogs</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-base shadow-md shadow-indigo-200"
                                disabled={isRegistering}
                            >
                                {isRegistering ? <Spinner size={18} className="text-white mr-2" /> : <CheckCircle2 size={18} className="mr-2 text-indigo-200" />}
                                {isRegistering ? 'Creating Account...' : 'Finish Registration'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default StudentRegister
