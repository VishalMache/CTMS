// ============================================================
// CPMS – Admin Mock Tests Management (src/pages/admin/AdminMockTests.jsx)
// ============================================================

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Input, Label, Badge, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { useTests, useCreateTest, useToggleTest, useDeleteTest, useAddQuestion, useDeleteQuestion, useTestResults } from '@/hooks/useMockTest'
import { Plus, Trash2, FileText, ToggleLeft, ToggleRight, ListChecks, HelpCircle, Eye, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Schemas ─────────────────────────────────────────────────
const testSchema = z.object({
  title: z.string().min(1, 'Title needed'),
  type: z.enum(['TECHNICAL', 'APTITUDE', 'CODING', 'HR']),
  duration: z.coerce.number().int().min(1, 'Minutes required'),
  totalMarks: z.coerce.number().int().min(1)
})

const questionSchema = z.object({
  questionText: z.string().min(1, 'Required'),
  optionA: z.string().min(1, 'Required'),
  optionB: z.string().min(1, 'Required'),
  optionC: z.string().min(1, 'Required'),
  optionD: z.string().min(1, 'Required'),
  correctOption: z.enum(['A', 'B', 'C', 'D']),
  marks: z.coerce.number().int().default(1)
})

// ── Modals ──────────────────────────────────────────────────
const CreateTestModal = ({ open, setOpen }) => {
  const { mutate: create, isPending } = useCreateTest()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: { type: 'APTITUDE', duration: 30, totalMarks: 30 }
  })

  const onSubmit = (data) => {
    create(data, { onSuccess: () => { setOpen(false); reset() } })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Mock Test</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Test Title</Label>
            <Input placeholder="e.g. TCS Ninja Qualifier 1" {...register('title')} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1" {...register('type')}>
                <option value="APTITUDE">Aptitude</option>
                <option value="TECHNICAL">Technical Core</option>
                <option value="CODING">Coding Output</option>
                <option value="HR">HR Situational</option>
              </select>
            </div>
            <div>
              <Label>Duration (Minutes)</Label>
              <Input type="number" {...register('duration')} />
              {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration.message}</p>}
            </div>
          </div>
          <div>
            <Label>Total Marks Expected</Label>
            <Input type="number" {...register('totalMarks')} />
            <p className="text-xs text-slate-500 mt-1">Make sure the sum of question marks equals this.</p>
            {errors.totalMarks && <p className="text-xs text-red-500 mt-1">{errors.totalMarks.message}</p>}
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-teal-600">Save Blueprint</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const ManageQuestionsModal = ({ test, open, setOpen }) => {
  if (!test) return null;

  const { mutate: addQ, isPending: isAdding } = useAddQuestion()
  const { mutate: delQ, isPending: isDeleting } = useDeleteQuestion()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: { correctOption: 'A', marks: 1 }
  })

  const onAdd = (data) => {
    addQ({ testId: test.id, data }, { onSuccess: () => reset() })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Q-Bank: {test.title}</h2>
            <p className="text-sm text-slate-500 mt-1">Total added: {test.questions.length} questions</p>
          </div>
          {test.isActive && (
            <Badge variant="destructive" className="flex items-center gap-1.5 h-7">
              <ShieldAlert size={14} /> Cannot edit active test
            </Badge>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Left: Question List */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-slate-50/50">
            {test.questions.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <HelpCircle size={32} className="mx-auto mb-3 opacity-50" />
                No questions added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {test.questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group">
                    {!test.isActive && (
                      <button
                        onClick={() => { if (window.confirm('Delete question?')) delQ(q.id) }}
                        disabled={isDeleting}
                        className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="flex gap-2">
                      <span className="font-bold text-teal-600">Q{idx + 1}.</span>
                      <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{q.questionText}</p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className={cn("p-1.5 rounded", q.correctOption === 'A' ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200" : "bg-slate-50 text-slate-600 border border-slate-100")}>A: {q.optionA}</div>
                      <div className={cn("p-1.5 rounded", q.correctOption === 'B' ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200" : "bg-slate-50 text-slate-600 border border-slate-100")}>B: {q.optionB}</div>
                      <div className={cn("p-1.5 rounded", q.correctOption === 'C' ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200" : "bg-slate-50 text-slate-600 border border-slate-100")}>C: {q.optionC}</div>
                      <div className={cn("p-1.5 rounded", q.correctOption === 'D' ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200" : "bg-slate-50 text-slate-600 border border-slate-100")}>D: {q.optionD}</div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono text-right border-t border-slate-50 pt-1">
                      [Marks: {q.marks}]
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Add Form */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white">
            <h3 className="font-bold text-slate-800 mb-4">Add New Question</h3>

            {test.isActive ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                You cannot append questions while the test is marked as Active. Toggle it back to Draft mode first.
              </div>
            ) : (
              <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
                <div>
                  <Label>Question Statement</Label>
                  <textarea className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1" {...register('questionText')} />
                  {errors.questionText && <p className="text-xs text-red-500 mt-1">{errors.questionText.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Option A</Label><Input className="mt-1" {...register('optionA')} /></div>
                  <div><Label>Option B</Label><Input className="mt-1" {...register('optionB')} /></div>
                  <div><Label>Option C</Label><Input className="mt-1" {...register('optionC')} /></div>
                  <div><Label>Option D</Label><Input className="mt-1" {...register('optionD')} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Correct Answer</Label>
                    <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm mt-1" {...register('correctOption')}>
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <Label>Marks for this</Label>
                    <Input type="number" className="mt-1" {...register('marks')} />
                  </div>
                </div>
                <Button type="submit" disabled={isAdding} className="w-full bg-slate-800 hover:bg-slate-900 mt-4">
                  {isAdding ? <Spinner size={16} className="text-white mr-2" /> : <Plus size={16} className="mr-2" />}
                  Append Question
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const ResultsModal = ({ test, open, setOpen }) => {
  if (!test) return null;
  const { data, isLoading } = useTestResults(test.id)
  const results = data?.results || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Leaderboard: {test.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? <div className="flex justify-center p-8"><Spinner size={24} /></div> :
            results.length === 0 ? <p className="text-center text-slate-500">No attempts yet.</p> :
              (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 font-semibold text-slate-600">Rank</th>
                        <th className="p-3 font-semibold text-slate-600">Student</th>
                        <th className="p-3 font-semibold text-slate-600 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono text-slate-400">#{idx + 1}</td>
                          <td className="p-3">
                            <p className="font-medium text-slate-800">{r.student.firstName} {r.student.lastName}</p>
                            <p className="text-xs text-slate-500">{r.student.enrollmentNumber} • {r.student.branch}</p>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-bold text-teal-700">{r.score}</span>
                            <span className="text-slate-400 text-xs"> / {r.totalMarks}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ───────────────────────────────────────────────
const AdminMockTests = () => {
  const { data, isLoading } = useTests()
  const { mutate: toggle } = useToggleTest()
  const { mutate: delTest } = useDeleteTest()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [qBankTarget, setQBankTarget] = useState(null)
  const [resultsTarget, setResultsTarget] = useState(null)

  const tests = data?.tests || []

  return (
    <DashboardLayout title="Mock Tests Engine" subtitle="Design assessments and track student aptitudes">

      <CreateTestModal open={isCreateOpen} setOpen={setIsCreateOpen} />
      <ManageQuestionsModal test={qBankTarget} open={!!qBankTarget} setOpen={(o) => !o && setQBankTarget(null)} />
      <ResultsModal test={resultsTarget} open={!!resultsTarget} setOpen={(o) => !o && setResultsTarget(null)} />

      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsCreateOpen(true)} className="bg-teal-600 hover:bg-teal-700 shadow-sm">
          <Plus size={16} className="mr-2" /> New Setup
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size={32} /></div>
      ) : tests.length === 0 ? (
        <Card className="p-16 text-center border-dashed bg-slate-50/50">
          <FileText size={32} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No mock tests built yet.</h3>
          <p className="text-slate-500 mt-2">Create schemas and inject questions for students to practice.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {tests.map(test => (
            <Card key={test.id} className="flex flex-col sm:flex-row shadow-sm hover:shadow transition-shadow border-slate-200">

              <div className="p-5 flex-1 border-b sm:border-b-0 sm:border-r border-slate-100 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-slate-800">{test.title}</h3>
                  <Badge variant={test.isActive ? "success" : "secondary"} className="text-xs">
                    {test.isActive ? 'ACTIVE' : 'DRAFT'}
                  </Badge>
                </div>

                <span className={cn(
                  "text-[11px] font-bold px-2 py-0.5 rounded-full w-fit mb-3",
                  test.type === 'APTITUDE' ? 'bg-amber-100 text-amber-700' :
                    test.type === 'CODING' ? 'bg-indigo-100 text-indigo-700' :
                      test.type === 'TECHNICAL' ? 'bg-blue-100 text-blue-700' : 'bg-fuchsia-100 text-fuchsia-700'
                )}>{test.type}</span>

                <div className="mt-auto pt-4 flex gap-4 text-sm text-slate-600">
                  <div><span className="font-semibold text-slate-800">{test.duration}</span> Mins</div>
                  <div><span className="font-semibold text-slate-800">{test.totalMarks}</span> Marks max</div>
                  <div><span className="font-semibold text-teal-600">{test._count?.questions || 0}</span> Qs added</div>
                </div>
              </div>

              <div className="p-4 sm:w-48 bg-slate-50 flex flex-col gap-2 justify-center shrink-0">
                <Button
                  variant={test.isActive ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggle(test.id)}
                  className={cn("w-full justify-start", !test.isActive && "bg-slate-800 hover:bg-slate-900")}
                >
                  {test.isActive ? <ToggleRight size={16} className="mr-2 text-teal-600" /> : <ToggleLeft size={16} className="mr-2" />}
                  {test.isActive ? 'Deactivate' : 'Publish Test'}
                </Button>

                <Button variant="outline" size="sm" className="w-full justify-start border-slate-300" onClick={() => setQBankTarget(test)}>
                  <ListChecks size={16} className="mr-2 text-slate-500" /> {test.isActive ? 'View Q-Bank' : 'Edit Q-Bank'}
                </Button>

                <Button variant="outline" size="sm" className="w-full justify-start text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100" onClick={() => setResultsTarget(test)}>
                  <Eye size={16} className="mr-2" /> Leaderboard
                </Button>

                {!test.isActive && (
                  <button
                    onClick={() => { if (window.confirm('Delete entirely?')) delTest(test.id) }}
                    className="text-xs text-slate-400 hover:text-red-500 text-center mt-2 w-full transition-colors font-medium"
                  >
                    Delete Blueprint
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

    </DashboardLayout>
  )
}

export default AdminMockTests
