// ============================================================
// CPMS – Student Resume & Certificates (src/pages/student/StudentResume.jsx)
// ============================================================

import React, { useRef, useState } from 'react'
import { FileText, UploadCloud, FileBadge, Trash2, Plus, File, ExternalLink, Download } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Input, Label, Select, Badge, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { useStudentProfile, useUploadResume } from '@/hooks/useStudentProfile'
import { useCertificates, useAddCertificate, useDeleteCertificate } from '@/hooks/useStudentStats'

// ── Zod Schema ──────────────────────────────────────────────
const certSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  type: z.enum(['INTERNSHIP', 'TRAINING', 'OTHER']),
})

// ── Shared formatting ───────────────────────────────────────
const formatDate = (isoString) => {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

// ── Add Certificate Modal ────────────────────────────────────
const AddCertificateModal = ({ open, setOpen }) => {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')

  const { mutate: addCert, isPending } = useAddCertificate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(certSchema),
  })

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected && selected.size > 5 * 1024 * 1024) {
      setFileError('File size must be less than 5MB')
      setFile(null)
    } else {
      setFileError('')
      setFile(selected)
    }
  }

  const onSubmit = (data) => {
    if (!file) {
      setFileError('Please select a file to upload')
      return
    }

    addCert({ ...data, file }, {
      onSuccess: () => {
        setOpen(false)
        reset()
        setFile(null)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileBadge className="text-teal-500" />
            Add New Certificate
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label>Certificate Title</Label>
            <Input placeholder="e.g. AWS Solutions Architect" mt={1} {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <Label>Type</Label>
            <Select className="mt-1" {...register('type')}>
              <option value="">Select Type</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="TRAINING">Training / Course</option>
              <option value="OTHER">Other Achievement</option>
            </Select>
            {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
          </div>

          <div>
            <Label>Upload File (PDF/Image)</Label>
            <div className="mt-1 flex items-center gap-3">
              <Label htmlFor="certFile" className="cursor-pointer">
                <span className="inline-flex h-10 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-4 text-sm font-medium hover:border-teal-500 hover:text-teal-600 transition-colors">
                  Browse File
                </span>
              </Label>
              <input id="certFile" type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
              <span className="text-xs text-slate-500 flex-1 truncate">
                {file ? file.name : 'No file selected'}
              </span>
            </div>
            {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size={16} className="text-white mr-2" />}
              {isPending ? 'Uploading...' : 'Save Certificate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page Component ─────────────────────────────────────
const StudentResume = () => {
  // Queries
  const { data: profile, isLoading: loadingProfile } = useStudentProfile()
  const { data: certs, isLoading: loadingCerts } = useCertificates()

  // Mutations
  const { mutate: uploadResume, isPending: isUploadingResume } = useUploadResume()
  const { mutate: deleteCert, isPending: isDeletingCert } = useDeleteCertificate()

  // State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const resumeInputRef = useRef(null)

  if (loadingProfile || loadingCerts) {
    return (
      <DashboardLayout title="Documents" subtitle="Manage your resume and certificates">
        <div className="flex h-64 items-center justify-center"><Spinner size={32} /></div>
      </DashboardLayout>
    )
  }

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadResume(file)
  }

  return (
    <DashboardLayout title="Documents" subtitle="Manage your resume and certificates">

      <AddCertificateModal open={isAddModalOpen} setOpen={setIsAddModalOpen} />

      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Resume Section ── */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="text-indigo-500" size={20} />
            Your Resume
          </h2>
          <Card className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-indigo-100 bg-indigo-50/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Primary Resume</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  {profile.resumeUrl
                    ? "Your latest resume is uploaded. Ensure it's tailored for your target roles."
                    : "No resume found. Upload a PDF version of your resume to apply for drives."}
                </p>
                {profile.resumeUrl && (
                  <Badge variant="outline" className="mt-3 border-emerald-200 text-emerald-700 bg-emerald-50 text-xs">
                    Active • Ready for applications
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex w-full md:w-auto items-center gap-3 shrink-0">
              {profile.resumeUrl && (
                <Button variant="outline" asChild className="w-full md:w-auto">
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink size={16} /> View
                  </a>
                </Button>
              )}

              <input
                type="file"
                ref={resumeInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
              />
              <Button
                onClick={() => resumeInputRef.current?.click()}
                disabled={isUploadingResume}
                className="w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
              >
                {isUploadingResume ? (
                  <Spinner size={16} className="text-white" />
                ) : (
                  <UploadCloud size={16} />
                )}
                {profile.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
              </Button>
            </div>
          </Card>
        </section>

        {/* ── Certificates Section ── */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileBadge className="text-amber-500" size={20} />
              Certificates ({certs?.length || 0})
            </h2>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-teal-500/20 w-full sm:w-auto">
              <Plus size={16} /> Add Certificate
            </Button>
          </div>

          {certs?.length === 0 ? (
            <Card className="py-12 px-6 text-center border-dashed border-2">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FileBadge size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-700">No Certificates Added</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                Upload your internship letters, course certificates, and achievement documents to strengthen your profile.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certs.map(cert => (
                <Card key={cert.id} className="relative group overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <File size={24} />
                      </div>
                      <Badge variant="outline" className="text-xs uppercase bg-white">
                        {cert.type}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-slate-800 line-clamp-2" title={cert.title}>
                      {cert.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                      Added {formatDate(cert.uploadedAt)}
                    </p>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={16} /> Download
                    </a>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this certificate?')) {
                          deleteCert(cert.id)
                        }
                      }}
                      disabled={isDeletingCert}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Delete certificate"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

export default StudentResume
