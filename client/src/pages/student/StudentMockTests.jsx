// ============================================================
// CPMS – Student Mock Tests (src/pages/student/StudentMockTests.jsx)
// ============================================================

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Button, Badge, Spinner, Dialog, DialogContent } from '@/components/ui'
import { useTests, useTakeTest, useSubmitTest } from '@/hooks/useMockTest'
import { FileText, Clock, Award, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Quiz Taking Interface ───────────────────────────────────
const QuizModal = ({ testId, open, setOpen }) => {
  if (!testId || !open) return null;

  const { data, isLoading } = useTakeTest(testId)
  const { mutate: submit, isPending } = useSubmitTest()

  const test = data?.test

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: 'A' | 'B' | 'C' | 'D' }

  // Prevent accidental closure
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (open) e.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [open])

  if (isLoading) return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-12">
        <Spinner size={32} />
        <p className="mt-4 text-slate-500 animate-pulse">Loading secure test environment...</p>
      </DialogContent>
    </Dialog>
  )

  if (!test || test.questions.length === 0) return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <div className="p-8 text-center text-slate-500">Test not available or has no questions.</div>
        <Button onClick={() => setOpen(false)}>Close</Button>
      </DialogContent>
    </Dialog>
  )

  const question = test.questions[currentIdx]
  const totalQs = test.questions.length
  const isLast = currentIdx === totalQs - 1
  const attemptedCount = Object.keys(answers).length

  const handleSelect = (opt) => {
    setAnswers(prev => ({ ...prev, [question.id]: opt }))
  }

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit? You cannot change answers after submitting.')) {
      submit({ testId, answers }, {
        onSuccess: () => {
          setOpen(false)
        }
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val && window.confirm('Discard progress and exit?')) setOpen(false)
    }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header Navbar */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-lg">{test.title}</h2>
            <p className="text-xs text-slate-400">Time Limit: {test.duration} mins • Answered: {attemptedCount}/{totalQs}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 shrink-0">
          <div
            className="h-full bg-teal-500 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / totalQs) * 100}%` }}
          />
        </div>

        {/* Question Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
              <Badge variant="outline" className="text-slate-500">Question {currentIdx + 1} of {totalQs}</Badge>
              <span className="text-sm font-bold text-slate-400">{question.marks} Marks</span>
            </div>

            <h3 className="text-lg font-medium text-slate-800 whitespace-pre-wrap mb-8">
              {question.questionText}
            </h3>

            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map(opt => {
                const val = question[`option${opt}`]
                const isSelected = answers[question.id] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3",
                      isSelected
                        ? "border-teal-500 bg-teal-50 shadow-sm"
                        : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0",
                      isSelected ? "bg-teal-500 border-teal-500 text-white" : "border-slate-300 text-slate-400"
                    )}>
                      {opt}
                    </div>
                    <span className={cn("text-sm", isSelected ? "text-teal-900 font-medium" : "text-slate-700")}>
                      {val}
                    </span>
                  </button>
                )
              })}
            </div>

          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
          >
            <ChevronLeft size={16} className="mr-2" /> Previous
          </Button>

          {!isLast ? (
            <Button
              className="bg-slate-800 hover:bg-slate-900"
              onClick={() => setCurrentIdx(prev => prev + 1)}
            >
              Next <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              disabled={isPending}
              onClick={handleSubmit}
            >
              {isPending && <Spinner size={16} className="mr-2 text-white" />}
              Submit Assessment
            </Button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ───────────────────────────────────────────────
const StudentMockTests = () => {
  const { data, isLoading } = useTests()
  const [activeTestId, setActiveTestId] = useState(null)

  const tests = data?.tests || []

  return (
    <DashboardLayout title="Mock Tests" subtitle="Practice your aptitude and technical skills">

      <QuizModal
        testId={activeTestId}
        open={!!activeTestId}
        setOpen={(isOpen) => !isOpen && setActiveTestId(null)}
      />

      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size={32} /></div>
      ) : tests.length === 0 ? (
        <Card className="p-16 text-center border-dashed bg-slate-50/50">
          <FileText size={32} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No active tests right now.</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Your TPO has not published any mock tests for your branch yet. Keep an eye on your notifications!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(test => {
            const isCompleted = !!test.myResult

            return (
              <Card key={test.id} className={cn(
                "flex flex-col relative overflow-hidden transition-all border-slate-200",
                isCompleted ? "opacity-90 bg-slate-50 shadow-none" : "hover:shadow-md bg-white"
              )}>
                {/* Visual Badge if Done */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 p-1 bg-teal-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 rounded-bl-lg shadow-sm z-10 flex gap-1 items-center">
                    <CheckCircle2 size={12} /> Completed
                  </div>
                )}

                <div className="p-6 pb-4">
                  <Badge variant="outline" className={cn(
                    "mb-3 bg-slate-50 text-[10px]",
                    test.type === 'APTITUDE' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                      test.type === 'CODING' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' :
                        test.type === 'TECHNICAL' ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-fuchsia-200 text-fuchsia-700 bg-fuchsia-50'
                  )}>{test.type}</Badge>

                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2">{test.title}</h3>

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" /> {test.duration}m
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-slate-400" /> {test.totalMarks} Marks
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText size={14} className="text-slate-400" /> {test._count?.questions || 0} Qs
                    </div>
                  </div>
                </div>

                <div className="p-4 mt-auto border-t border-slate-100">
                  {isCompleted ? (
                    <div className="flex justify-between items-center bg-teal-50 rounded p-3 border border-teal-100">
                      <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">Final Score</span>
                      <span className="text-lg font-black text-teal-700">{test.myResult.score}<span className="text-sm font-medium text-teal-500">/{test.totalMarks}</span></span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-slate-800 hover:bg-slate-900"
                      onClick={() => setActiveTestId(test.id)}
                    >
                      Start Assessment
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

    </DashboardLayout>
  )
}

export default StudentMockTests
