import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NotFound = () => {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()

    const handleGoHome = () => {
        if (!isAuthenticated) {
            navigate('/login')
        } else if (user?.role === 'TPO_ADMIN') {
            navigate('/admin/dashboard')
        } else {
            navigate('/student/dashboard')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-200">
                    <FileQuestion size={48} className="text-teal-600" />
                </div>

                <h1 className="text-4xl font-black text-slate-800 tracking-tight">404</h1>
                <h2 className="text-2xl font-bold text-slate-700">Page Not Found</h2>
                <p className="text-slate-500 text-lg">
                    We couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                        <ArrowLeft size={16} /> Go Back
                    </Button>
                    <Button
                        onClick={handleGoHome}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    >
                        <Home size={16} /> Return Home
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default NotFound
