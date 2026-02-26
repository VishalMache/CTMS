// ============================================================
// CPMS – Top Header (src/components/shared/TopHeader.jsx)
// Global search + notification bell + user avatar
// ============================================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { Search, Bell, ChevronDown, LogOut, UserCircle, Settings, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useNotifications, useMarkAsRead } from '@/hooks/useNotification'

const TopHeader = ({ title, subtitle }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifMenu, setShowNotifMenu] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    const { data: notifData } = useNotifications()
    const { mutate: markAsRead } = useMarkAsRead()

    const unreadCount = notifData?.unreadCount || 0
    const notifications = notifData?.notifications?.slice(0, 5) || []

    const isAdmin = user?.role === 'TPO_ADMIN'
    const displayName = isAdmin
        ? 'TPO Admin'
        : `${user?.student?.firstName || ''} ${user?.student?.lastName || ''}`.trim() || user?.email || ''

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center gap-4 sticky top-0 z-20">

            {/* ── Page title ──────────────────────────────── */}
            <div className="flex-1 min-w-0">
                {title && (
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 leading-tight truncate">{title}</h1>
                        {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
                    </div>
                )}
            </div>

            {/* ── Global search ───────────────────────────── */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 h-9 w-64 transition-all focus-within:border-teal-400 focus-within:bg-white">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                    type="text"
                    placeholder="Search anything..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="bg-transparent flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                />
            </div>

            {/* ── Notification bell ───────────────────────── */}
            <div className="relative ml-auto md:ml-0">
                <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                </button>

                {showNotifMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-[400px]">
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">Notifications</h3>
                                {unreadCount > 0 && (
                                    <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-none">{unreadCount} New</Badge>
                                )}
                            </div>

                            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-500">No notifications yet.</div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => {
                                                if (!notif.isRead) markAsRead(notif.id)
                                                setShowNotifMenu(false)
                                            }}
                                            className={cn(
                                                "p-3 rounded-lg flex gap-3 cursor-pointer transition-colors border border-transparent",
                                                notif.isRead ? "hover:bg-slate-50" : "bg-teal-50 border-teal-100"
                                            )}
                                        >
                                            <div className={cn(
                                                "mt-0.5 shrink-0",
                                                notif.type === 'INFO' && "text-blue-500",
                                                notif.type === 'SUCCESS' && "text-emerald-500",
                                                notif.type === 'WARNING' && "text-amber-500",
                                                notif.type === 'ERROR' && "text-red-500"
                                            )}>
                                                {notif.type === 'SUCCESS' ? <CheckCircle2 size={16} /> :
                                                    notif.type === 'WARNING' || notif.type === 'ERROR' ? <AlertTriangle size={16} /> :
                                                        <Info size={16} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className={cn("text-xs font-bold truncate", notif.isRead ? "text-slate-700" : "text-teal-900")}>
                                                    {notif.title}
                                                </p>
                                                <p className={cn("text-xs line-clamp-2 mt-0.5", notif.isRead ? "text-slate-500" : "text-teal-700")}>
                                                    {notif.message}
                                                </p>
                                                <span className="text-[10px] text-slate-400 mt-1 block">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-2 border-t border-slate-100 bg-slate-50 shrink-0">
                                <button
                                    onClick={() => {
                                        navigate(isAdmin ? '/admin/notifications' : '/student/notifications')
                                        setShowNotifMenu(false)
                                    }}
                                    className="w-full py-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 text-center transition-colors"
                                >
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── User avatar + dropdown ───────────────────── */}
            <div className="relative">
                <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={user?.student?.profilePhotoUrl} />
                        <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                        {displayName.split(' ')[0]}
                    </span>
                    <ChevronDown
                        size={14}
                        className={cn('text-slate-400 transition-transform', showUserMenu && 'rotate-180')}
                    />
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                            {/* User info header */}
                            <div className="px-4 py-3 border-b border-slate-100">
                                <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                <Badge
                                    variant={isAdmin ? 'secondary' : 'default'}
                                    className="mt-1 text-[10px]"
                                >
                                    {isAdmin ? 'TPO Admin' : user?.student?.branch || 'Student'}
                                </Badge>
                            </div>

                            {/* Menu items */}
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        navigate(isAdmin ? '/admin/profile' : '/student/profile')
                                        setShowUserMenu(false)
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <UserCircle size={15} /> My Profile
                                </button>
                                <button
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <Settings size={15} /> Settings
                                </button>
                            </div>
                            <div className="py-1 border-t border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={15} /> Sign out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    )
}

export default TopHeader
