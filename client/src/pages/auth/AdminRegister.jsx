import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Mail, Lock, Eye, EyeOff, User, Building2, Phone,
    ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Sun, Moon
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'

const schema = z.object({
    email: z.string().email('Enter a valid official email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
    designation: z.string().min(2, 'Select a designation'),
    department: z.string().min(2, 'Select a department'),
    employeeId: z.string().min(2, 'Employee / Staff ID is required'),
    secretKey: z.string().min(1, 'Institution auth key is required'),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
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

const AdminRegister = () => {
    const [showPass, setShowPass] = useState(false)
    const [showConfPass, setShowConfPass] = useState(false)
    const [showSecret, setShowSecret] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const { register: registerAction, isRegistering } = useAuth()
    const { theme, toggleTheme } = useTheme()
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
        <div className="min-h-screen flex flex-col py-10 sm:px-6 lg:px-8" style={{ background: 'var(--surface-bg)' }}>

            {/* Theme toggle */}
            <div className="absolute top-5 right-5">
                <button onClick={toggleTheme} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--text-muted)', background: 'var(--surface-card)' }}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
                <Link to="/login/admin" className="inline-flex items-center text-sm font-medium mb-6 transition-colors group" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Admin Login
                </Link>

                <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-heading)' }}>Register Administrator</h2>
                <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Provision a new TPO or Placement Officer account</p>

                {errorMsg && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex gap-3 text-red-700 dark:text-red-300">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm leading-relaxed">{errorMsg}</p>
                    </div>
                )}

                <div className="py-8 px-6 sm:px-10 shadow-sm rounded-2xl mb-12" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
                    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>

                        {/* SECTION A: Credentials */}
                        <div className="space-y-4">
                            <SectionHeader icon={Lock} label="Account Credentials" />
                            <div>
                                <Label htmlFor="email" style={labelStyle}>Official Email Address</Label>
                                <div className="mt-1.5 relative">
                                    <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                    <Input id="email" type="email" placeholder="tpo@college.edu" className="pl-11 h-12 rounded-xl" style={inputStyle} {...register('email')} />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="password" style={labelStyle}>Password</Label>
                                    <div className="mt-1.5 relative">
                                        <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Min 8 chars" className="pl-11 pr-10 h-12 rounded-xl" style={inputStyle} {...register('password')} />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</Label>
                                    <div className="mt-1.5 relative">
                                        <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <Input id="confirmPassword" type={showConfPass ? 'text' : 'password'} placeholder="Match password" className="pl-11 pr-10 h-12 rounded-xl" style={inputStyle} {...register('confirmPassword')} />
                                        <button type="button" onClick={() => setShowConfPass(!showConfPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                            {showConfPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* SECTION B: Personal Identity */}
                        <div className="space-y-4">
                            <SectionHeader icon={User} label="Personal Identity" />
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
                            <div>
                                <Label htmlFor="phone" style={labelStyle}>Phone Number</Label>
                                <div className="mt-1.5 relative">
                                    <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                    <Input id="phone" placeholder="10-digit mobile number" className="pl-11 h-12 rounded-xl" style={inputStyle} {...register('phone')} />
                                </div>
                                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* SECTION C: Institution */}
                        <div className="space-y-4">
                            <SectionHeader icon={Building2} label="Institution Details" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="designation" style={labelStyle}>Designation</Label>
                                    <select id="designation" className="mt-1.5 flex h-12 w-full rounded-xl px-3 py-2 text-sm outline-none" style={selectStyle} {...register('designation')}>
                                        <option value="">Select Designation</option>
                                        <option value="TPO">Training & Placement Officer</option>
                                        <option value="Placement Coordinator">Placement Coordinator</option>
                                        <option value="Assistant TPO">Assistant TPO</option>
                                        <option value="Faculty Coordinator">Faculty Placement Coordinator</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.designation && <p className="mt-1 text-xs text-red-500">{errors.designation.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="department" style={labelStyle}>Department</Label>
                                    <select id="department" className="mt-1.5 flex h-12 w-full rounded-xl px-3 py-2 text-sm outline-none" style={selectStyle} {...register('department')}>
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
                                    {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="employeeId" style={labelStyle}>Employee / Staff ID</Label>
                                <Input id="employeeId" placeholder="e.g. EMP-2024-001" className="mt-1.5 h-12 rounded-xl uppercase" style={inputStyle} {...register('employeeId')} />
                                {errors.employeeId && <p className="mt-1 text-xs text-red-500">{errors.employeeId.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="secretKey" style={labelStyle}>
                                    <span className="flex items-center justify-between w-full">
                                        Institution Auth Key
                                        <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>Use: CPMS-ADMIN-2026</span>
                                    </span>
                                </Label>
                                <div className="mt-1.5 relative">
                                    <ShieldCheck size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-500/60" />
                                    <Input id="secretKey" type={showSecret ? 'text' : 'password'} placeholder="Required for TPO account creation" className="pl-11 pr-10 h-12 rounded-xl" style={inputStyle} {...register('secretKey')} />
                                    <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                        {showSecret ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {errors.secretKey && <p className="mt-1 text-xs text-red-500">{errors.secretKey.message}</p>}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <Button type="submit" className="w-full h-12 bg-slate-800 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-semibold text-base rounded-xl shadow-md" disabled={isRegistering}>
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
