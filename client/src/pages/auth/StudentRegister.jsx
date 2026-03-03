import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Mail, Lock, Eye, EyeOff, User, BookOpen, GraduationCap,
    ArrowLeft, AlertCircle, CheckCircle2, Sun, Moon
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    gender: z.enum(['Male', 'Female', 'Other'], { errorMap: () => ({ message: 'Select gender' }) }),
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

const inputStyle = { background: 'var(--surface-bg)', color: 'var(--text-primary)', borderColor: 'var(--surface-border)' }
const selectStyle = { background: 'var(--surface-bg)', color: 'var(--text-primary)', borderColor: 'var(--surface-border)' }
const labelStyle = { color: 'var(--text-secondary)' }

const SectionHeader = ({ icon: Icon, label }) => (
    <div className="pb-2 mb-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <Icon size={16} className="text-teal-600" />
            {label}
        </h3>
    </div>
)

const StudentRegister = () => {
    const [showPass, setShowPass] = useState(false)
    const [showConfPass, setShowConfPass] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const { register: registerAction, isRegistering } = useAuth()
    const { theme, toggleTheme } = useTheme()
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
            const { confirmPassword, ...submitData } = data
            await registerAction({ ...submitData, role: 'STUDENT' })
            navigate('/student/dashboard')
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Registration failed. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex flex-col py-10 sm:px-6 lg:px-8" style={{ background: 'var(--surface-bg)' }}>

            {/* Theme toggle */}
            <div className="absolute top-5 right-5">
                <button onClick={toggleTheme} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--text-muted)', background: 'var(--surface-card)' }}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4">
                <Link to="/login/student" className="inline-flex items-center text-sm font-medium mb-6 transition-colors group" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Login
                </Link>

                <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-heading)' }}>Create Student Account</h2>
                <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Fill out your details to get started</p>

                {errorMsg && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex gap-3 text-red-700 dark:text-red-300">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm leading-relaxed">{errorMsg}</p>
                    </div>
                )}

                <div className="p-6 sm:p-8 rounded-2xl shadow-sm mb-12" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>

                        {/* SECTION A */}
                        <div className="space-y-4">
                            <SectionHeader icon={Lock} label="Account Credentials" />
                            <div>
                                <Label htmlFor="email" style={labelStyle}>Email Address</Label>
                                <div className="mt-1.5 relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                    <Input id="email" type="email" placeholder="you@college.edu" className="pl-10 h-12 rounded-xl" style={inputStyle} {...register('email')} />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="password" style={labelStyle}>Password</Label>
                                    <div className="mt-1.5 relative">
                                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Min 8 chars" className="pl-10 pr-10 h-12 rounded-xl" style={inputStyle} {...register('password')} />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</Label>
                                    <div className="mt-1.5 relative">
                                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <Input id="confirmPassword" type={showConfPass ? 'text' : 'password'} placeholder="Match password" className="pl-10 pr-10 h-12 rounded-xl" style={inputStyle} {...register('confirmPassword')} />
                                        <button type="button" onClick={() => setShowConfPass(!showConfPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                            {showConfPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* SECTION B */}
                        <div className="space-y-4">
                            <SectionHeader icon={User} label="Personal Details" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName" style={labelStyle}>First Name</Label>
                                    <Input id="firstName" className="mt-1.5 h-12 rounded-xl" style={inputStyle} {...register('firstName')} />
                                    {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="lastName" style={labelStyle}>Last Name</Label>
                                    <Input id="lastName" className="mt-1.5 h-12 rounded-xl" style={inputStyle} {...register('lastName')} />
                                    {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone" style={labelStyle}>Phone Number</Label>
                                    <Input id="phone" placeholder="10 digits" className="mt-1.5 h-12 rounded-xl" style={inputStyle} {...register('phone')} />
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="gender" style={labelStyle}>Gender</Label>
                                    <select id="gender" className="mt-1.5 flex h-12 w-full rounded-xl px-3 py-2 text-sm outline-none" style={selectStyle} {...register('gender')}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* SECTION C */}
                        <div className="space-y-4">
                            <SectionHeader icon={BookOpen} label="Academic Details" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="enrollmentNumber" style={labelStyle}>Enrollment Number</Label>
                                    <Input id="enrollmentNumber" placeholder="e.g. 2021CS001" className="mt-1.5 h-12 rounded-xl uppercase" style={inputStyle} {...register('enrollmentNumber')} />
                                    {errors.enrollmentNumber && <p className="mt-1 text-xs text-red-500">{errors.enrollmentNumber.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="branch" style={labelStyle}>Branch</Label>
                                    <select id="branch" className="mt-1.5 flex h-12 w-full rounded-xl px-3 py-2 text-sm outline-none" style={selectStyle} {...register('branch')}>
                                        <option value="">Select Branch</option>
                                        {['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EE'].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    {errors.branch && <p className="mt-1 text-xs text-red-500">{errors.branch.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="tenth_percent" style={labelStyle}>10th %</Label>
                                    <Input id="tenth_percent" type="number" step="0.01" className="mt-1.5 h-12 rounded-xl" style={inputStyle} {...register('tenth_percent')} />
                                    {errors.tenth_percent && <p className="mt-1 text-xs text-red-500">{errors.tenth_percent.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="twelfth_percent" style={labelStyle}>12th %</Label>
                                    <Input id="twelfth_percent" type="number" step="0.01" className="mt-1.5 h-12 rounded-xl" style={inputStyle} {...register('twelfth_percent')} />
                                    {errors.twelfth_percent && <p className="mt-1 text-xs text-red-500">{errors.twelfth_percent.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="cgpa" style={labelStyle}>CGPA</Label>
                                    <Input id="cgpa" type="number" step="0.01" className="mt-1.5 h-12 rounded-xl" style={inputStyle} {...register('cgpa')} />
                                    {errors.cgpa && <p className="mt-1 text-xs text-red-500">{errors.cgpa.message}</p>}
                                </div>
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" {...register('activeBacklogs')} />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>I have active backlogs</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
                            <Button type="submit" size="lg" className="w-full h-12 gradient-primary text-white font-semibold text-base rounded-xl shadow-md" disabled={isRegistering}>
                                {isRegistering ? <Spinner size={18} className="text-white mr-2" /> : <CheckCircle2 size={18} className="mr-2 text-white/60" />}
                                {isRegistering ? 'Creating Account...' : 'Complete Registration'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default StudentRegister
