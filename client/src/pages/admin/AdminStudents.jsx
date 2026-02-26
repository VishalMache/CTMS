import React from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { Card, Badge, Spinner } from '@/components/ui'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axiosInstance'
import { Users, Mail, Phone, BookOpen, Award, Link } from 'lucide-react'

const fetchAdminStudents = async () => {
  const res = await api.get('/students/all')
  return res.data.students
}

const AdminStudents = () => {
  const { data: students, isLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: fetchAdminStudents
  })

  return (
    <DashboardLayout title="Student Ledger" subtitle="Master list of all registered candidates">
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12"><Spinner size={32} /></div>
          ) : !students || students.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <Users size={32} className="mb-2 opacity-50" />
              <p>No students registered yet.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-4 whitespace-nowrap">Enrollment No.</th>
                  <th className="p-4 whitespace-nowrap">Name</th>
                  <th className="p-4 whitespace-nowrap">Contact</th>
                  <th className="p-4 whitespace-nowrap">Academic</th>
                  <th className="p-4 whitespace-nowrap text-center">Placement</th>
                  <th className="p-4 whitespace-nowrap text-center">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => {
                  const isPlaced = stu.roundResults?.length > 0;
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-slate-600 font-medium">{stu.enrollmentNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{stu.firstName} {stu.lastName}</div>
                        <div className="text-xs text-slate-400">{stu.gender}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1">
                          <Mail size={12} className="text-slate-400" /> {stu.user?.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <Phone size={12} className="text-slate-400" /> {stu.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium mb-1">
                          <BookOpen size={14} className="text-teal-600" /> {stu.branch}
                        </div>
                        <div className="text-xs text-slate-500">
                          CGPA: <span className="font-bold">{stu.cgpa}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {isPlaced ? (
                          <Badge variant="success" className="text-[10px] w-fit mx-auto gap-1">
                            <Award size={10} /> PLACED
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] w-fit mx-auto text-slate-500">
                            Looking
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {stu.resumeUrl ? (
                          <a href={stu.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex drop-shadow-sm text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 p-2 rounded-full transition-colors">
                            <Link size={16} />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </DashboardLayout>
  )
}

export default AdminStudents
