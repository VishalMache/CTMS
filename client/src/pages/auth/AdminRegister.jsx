import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Mail, Lock, Eye, EyeOff, User, Building2, Phone,
    ArrowRight, ArrowLeft, AlertCircle, ShieldCheck
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'

// ── Zod Schema ─────────────────────────────────────────────
const schema = z.object({
    // Section A – Credentials
    email: z.string().email('Enter a valid official email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),

    // Section B – Personal Identity
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),

    // Section C – Institution
    designation: z.string().min(2, 'Select a designation'),
    department: z.string().min(2, 'Select a department'),
    employeeId: z.string().min(2, 'Employee / Staff ID is required'),
    secretKey: z.string().min(1, 'Institution auth key is required'),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

// ── Dark input class helper ─────────────────────────────────
const inputCls = 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-emerald-500 outline-none'

// ── Dark select class helper ────────────────────────────────
const selectCls = 'mt-1 flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0'

// ── Section Header ──────────────────────────────────────────
const SectionHeader = ({ icon: Icon, label }) => (
    <div className="border-b border-slate-700 pb-2 mb-5">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wide">
            <Icon size={15} className="text-emerald-400" />
            {label}
        </h3>
    </div>
)

// ── Component ───────────────────────────────────────────────
const AdminRegister = () => {
    const [showPass, setShowPass] = useState(false)
    const [showConfPass, setShowConfPass] = useState(false)
    const [showSecret, setShowSecret] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const { register: registerAction, isRegistering } = useAuth()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: '', password: '', confirmPassword: '',
            firstName: '', lastName: '', phone: '',
            designation: '', department: '', employeeId: '', secretKey: '',
        },
    })

    const onSubmit = async (data) => {
        setErrorMsg('')
        // Client-side secret check (backend should validate too)
        if (data.secretKey !== 'CPMS-ADMIN-2026') {
            setErrorMsg('Invalid institution auth key. Cannot provision admin account.')
            return
        }
        try {
            const { confirmPassword, secretKey, ...rest } = data
            await registerAction({ ...rest, role: 'TPO_ADMIN' })
            navigate('/admin/dashboard')
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Registration failed. Please try again.')
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col py-10 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Background glow */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-slate-800 rounded-full blur-[120px] pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4 relative z-10">

                {/* Back link */}
                <Link
                    to="/login/admin"
                    className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Admin Login
                </Link>

                {/* Heading */}
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 border border-emerald-800 text-emerald-400 flex items-center justify-center shadow-lg shrink-0">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">Register Administrator</h2>
                        <p className="text-sm text-slate-400 mt-0.5">
                            Provision a new TPO or Placement Officer account
                        </p>
                    </div>
                </div>

                {/* Error banner */}
                {errorMsg && (
                    <div className="mt-5 bg-red-900/50 border border-red-800 rounded-lg p-4 flex gap-3 text-red-200">
                        <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-400" />
                        <p className="text-sm leading-relaxed">{errorMsg}</p>
                    </div>
                )}

                {/* Form card */}
                <div className="mt-8 bg-slate-800/80 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700 mb-12">
                    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>

                        {/* ── SECTION A: Credentials ── */}
                        <div className="space-y-5">
                            <SectionHeader icon={Lock} label="Account Credentials" />

                            <div>
                                <Label htmlFor="email" className="text-slate-300">Official Email Address</Label>
                                <div className="mt-1 relative">
                                    <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tpo@college.edu"
                                        className={cn('pl-10 h-11', inputCls)}
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                                    <div className="mt-1 relative">
                                        <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <Input
                                            id="password"
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Min 8 chars"
                                            className={cn('pl-10 pr-10 h-11', inputCls)}
                                            {...register('password')}
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                                    <div className="mt-1 relative">
                                        <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfPass ? 'text' : 'password'}
                                            placeholder="Match password"
                                            className={cn('pl-10 pr-10 h-11', inputCls)}
                                            {...register('confirmPassword')}
                                        />
                                        <button type="button" onClick={() => setShowConfPass(!showConfPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                            {showConfPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION B: Personal Identity ── */}
                        <div className="space-y-5">
                            <SectionHeader icon={User} label="Personal Identity" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                                    <Input id="firstName" className={cn('mt-1 h-11', inputCls)} {...register('firstName')} />
                                    {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                                    <Input id="lastName" className={cn('mt-1 h-11', inputCls)} {...register('lastName')} />
                                    {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                                <div className="mt-1 relative">
                                    <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <Input
                                        id="phone"
                                        placeholder="10-digit mobile number"
                                        className={cn('pl-10 h-11', inputCls)}
                                        {...register('phone')}
                                    />
                                </div>
                                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* ── SECTION C: Institution ── */}
                        <div className="space-y-5">
                            <SectionHeader icon={Building2} label="Institution Details" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="designation" className="text-slate-300">Designation</Label>
                                    <select id="designation" className={selectCls} {...register('designation')}>
                                        <option value="">Select Designation</option>
                                        <option value="TPO">Training & Placement Officer</option>
                                        <option value="Placement Coordinator">Placement Coordinator</option>
                                        <option value="Assistant TPO">Assistant TPO</option>
                                        <option value="Faculty Coordinator">Faculty Placement Coordinator</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.designation && <p className="mt-1 text-xs text-red-400">{errors.designation.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="department" className="text-slate-300">Department</Label>
                                    <select id="department" className={selectCls} {...register('department')}>
                                        <option value="">Select Department</option>
                                        <option value="TPO Cell">TPO Cell</option>
                                        <option value="CSE">Computer Science</option>
                                        <option value="IT">Information Technology</option>
                                        <option value="ECE">Electronics & Comm.</option>
                                        <option value="MECH">Mechanical</option>
                                        <option value="CIVIL">Civil</option>
                                        <option value="EE">Electrical</option>
                                        <option value="Admin">Administration</option>
                                    </select>
                                    {errors.department && <p className="mt-1 text-xs text-red-400">{errors.department.message}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="employeeId" className="text-slate-300">Employee / Staff ID</Label>
                                <Input
                                    id="employeeId"
                                    placeholder="e.g. EMP-2024-001"
                                    className={cn('mt-1 h-11 uppercase', inputCls)}
                                    {...register('employeeId')}
                                />
                                {errors.employeeId && <p className="mt-1 text-xs text-red-400">{errors.employeeId.message}</p>}
                            </div>

                            {/* Admin Secret Key */}
                            <div>
                                <Label htmlFor="secretKey" className="text-slate-300 flex items-center justify-between">
                                    Institution Auth Key
                                    <span className="text-[10px] text-slate-500 font-normal">Use: CPMS-ADMIN-2026</span>
                                </Label>
                                <div className="mt-1 relative">
                                    <ShieldCheck size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/60" />
                                    <Input
                                        id="secretKey"
                                        type={showSecret ? 'text' : 'password'}
                                        placeholder="Required for TPO account creation"
                                        className={cn('pl-10 pr-10 h-11 border-emerald-900/30 text-emerald-100 placeholder-slate-600 focus-visible:ring-emerald-500 outline-none bg-slate-900/50')}
                                        {...register('secretKey')}
                                    />
                                    <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                        {showSecret ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {errors.secretKey && <p className="mt-1 text-xs text-red-400">{errors.secretKey.message}</p>}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base"
                                disabled={isRegistering}
                            >
                                {isRegistering ? <Spinner size={18} className="text-white mr-2" /> : null}
                                {isRegistering ? 'Provisioning...' : 'Provision Admin Account'}
                                {!isRegistering && <ArrowRight size={18} className="ml-2" />}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AdminRegister
