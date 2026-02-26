// ============================================================
// CPMS – Student Profile (src/pages/student/StudentProfile.jsx)
// ============================================================

import React, { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, User, BookOpen, Save, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Input, Label, Spinner, Avatar, AvatarImage, AvatarFallback, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useStudentProfile, useUpdateProfile, useUploadPhoto } from '@/hooks/useStudentProfile'

// ── Zod Schema (Personal Info ONLY) ──────────────────────────
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  gender: z.enum(['Male', 'Female', 'Other'], { errorMap: () => ({ message: 'Select your gender' }) }),
  hasInternship: z.boolean().default(false),
  internshipDetails: z.string().max(500, 'Keep it concise').optional().or(z.literal('')),
})

// ── Shared input styles ─────────────────────────────────────
const selectCls = 'flex h-10 w-full rounded-lg bg-white px-3 py-2 text-sm text-slate-800 input-ring appearance-none focus-visible:outline-none'

// ── Photo Upload Widget ─────────────────────────────────────
const ProfilePhotoWidget = ({ profile }) => {
  const fileInputRef = useRef(null)
  const { mutate: uploadPhoto, isPending: isUploading } = useUploadPhoto()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadPhoto(file)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 pb-10 border-b border-slate-100">
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />

        <Avatar className="w-32 h-32 shadow-xl ring-4 ring-slate-50">
          <AvatarImage src={profile.profilePhotoUrl || ''} />
          <AvatarFallback className="text-4xl bg-teal-100 text-teal-700 font-bold">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </AvatarFallback>
        </Avatar>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? <Spinner size={24} className="text-white" /> : <Camera size={24} className="text-white" />}
          <span className="text-white text-xs font-medium mt-1">Change</span>
        </div>
      </div>

      <div className="text-center sm:text-left pt-2">
        <h2 className="text-2xl font-bold text-slate-800">
          {profile.firstName} {profile.lastName}
        </h2>
        <p className="text-slate-500 font-medium">{profile.user?.email}</p>
        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
            {profile.branch} Student
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {profile.enrollmentNumber}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────
const StudentProfile = () => {
  const { data: profile, isLoading } = useStudentProfile()
  const { mutate: updateProfile, isPending: isUpdating, isSuccess } = useUpdateProfile()

  // Form setup strictly for EDITABLE fields
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      hasInternship: profile.hasInternship || false,
      internshipDetails: profile.internshipDetails || '',
    } : undefined,
  })

  const hasInternship = watch('hasInternship')

  const onSubmit = (data) => {
    // If they toggled off internship, clear the details textarea
    const submitData = { ...data }
    if (!submitData.hasInternship) submitData.internshipDetails = ''
    updateProfile(submitData)
  }

  if (isLoading) {
    return (
      <DashboardLayout title="My Profile" subtitle="Manage your personal and academic details">
        <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
      </DashboardLayout>
    )
  }

  if (!profile) return null

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal and academic details">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 sm:p-10 bg-white">

          {/* Top Row: Photo Widget */}
          <ProfilePhotoWidget profile={profile} />

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-8 w-full justify-start border-b border-slate-200 bg-transparent p-0 rounded-none h-auto">
              <TabsTrigger
                value="personal"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 data-[state=active]:shadow-none px-6 py-3"
              >
                <User size={16} />
                Personal Info
              </TabsTrigger>
              <TabsTrigger
                value="academic"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 data-[state=active]:shadow-none px-6 py-3"
              >
                <BookOpen size={16} />
                Academic Details
              </TabsTrigger>
            </TabsList>

            {/* ── TAB 1: Personal (Editable) ── */}
            <TabsContent value="personal" className="focus:outline-none focus:ring-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" className="mt-1" {...register('firstName')} />
                    {errors.firstName && <p className="mt-1.5 text-xs text-red-500">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" className="mt-1" {...register('lastName')} />
                    {errors.lastName && <p className="mt-1.5 text-xs text-red-500">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="10 digits" className="mt-1" {...register('phone')} />
                    {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <div className="mt-1">
                      <select id="gender" className={selectCls} {...register('gender')}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {errors.gender && <p className="mt-1.5 text-xs text-red-500">{errors.gender.message}</p>}
                  </div>
                </div>

                {/* Internship Toggle */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      {...register('hasInternship')}
                    />
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                      I have completed an internship
                    </span>
                  </label>
                </div>

                {hasInternship && (
                  <div className="animate-in fade-in zoom-in-95 duration-200">
                    <Label htmlFor="internshipDetails">Internship Details (Company, Role, Duration)</Label>
                    <textarea
                      id="internshipDetails"
                      rows={3}
                      className={cn('mt-1 flex w-full rounded-lg bg-white px-3 py-2 text-sm text-slate-800 input-ring focus-visible:outline-none')}
                      placeholder="e.g. Software Engineering Intern at Google (3 months)..."
                      {...register('internshipDetails')}
                    />
                    {errors.internshipDetails && <p className="mt-1.5 text-xs text-red-500">{errors.internshipDetails.message}</p>}
                  </div>
                )}

                <div className="pt-6 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Note: Academic details (CGPA, Branch, etc.) are managed by the TPO.
                  </p>
                  <div className="flex items-center gap-3">
                    {isSuccess && (
                      <span className="text-sm font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 size={16} /> Saved
                      </span>
                    )}
                    <Button type="submit" disabled={isUpdating} className="w-32 shadow-teal-500/20">
                      {isUpdating ? <Spinner size={16} className="text-white" /> : <Save size={16} />}
                      {isUpdating ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>

            {/* ── TAB 2: Academic (Read-Only) ── */}
            <TabsContent value="academic" className="focus:outline-none focus:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BookOpen className="text-teal-500" size={20} />
                  Academic Record
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Enrollment Number</p>
                    <p className="text-base font-bold text-slate-800 uppercase">{profile.enrollmentNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Branch</p>
                    <p className="text-base font-bold text-slate-800 uppercase">{profile.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Current CGPA</p>
                    <p className="text-base font-bold text-emerald-600 font-mono text-lg">{profile.cgpa.toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">10th Percentage</p>
                    <p className="text-base font-semibold text-slate-700">{profile.tenth_percent}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">12th Percentage</p>
                    <p className="text-base font-semibold text-slate-700">{profile.twelfth_percent}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Active Backlogs</p>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1",
                      profile.activeBacklogs ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {profile.activeBacklogs ? 'Yes' : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default StudentProfile
