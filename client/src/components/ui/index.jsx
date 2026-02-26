// ============================================================
// CPMS – Reusable UI Components (src/components/ui/index.jsx)
// Hand-crafted Shadcn-style components using Radix + Tailwind
// ============================================================

import React from 'react'
import { cn } from '@/lib/utils'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as LabelPrimitive from '@radix-ui/react-label'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

// ─────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────
const buttonVariants = {
    default: 'gradient-primary text-white shadow hover:opacity-90 active:opacity-80',
    outline: 'border-2 border-teal-500 text-teal-600 bg-white hover:bg-teal-50 active:bg-teal-100',
    ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
}
const buttonSizes = {
    sm: 'h-8  px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-9 w-9 p-0',
}

export const Button = React.forwardRef(({
    className, variant = 'default', size = 'md',
    disabled, children, ...props
}, ref) => (
    <button
        ref={ref}
        disabled={disabled}
        className={cn(
            'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
            'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
            buttonVariants[variant],
            buttonSizes[size],
            disabled && 'opacity-50 cursor-not-allowed',
            className
        )}
        {...props}
    >
        {children}
    </button>
))
Button.displayName = 'Button'

// ─────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────
export const Input = React.forwardRef(({
    className, type = 'text', ...props
}, ref) => (
    <input
        type={type}
        ref={ref}
        className={cn(
            'flex h-10 w-full rounded-lg bg-white px-3 py-2 text-sm text-slate-800',
            'placeholder:text-slate-400 input-ring',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50',
            className
        )}
        {...props}
    />
))
Input.displayName = 'Input'

// ─────────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────────
export const Select = React.forwardRef(({
    className, children, ...props
}, ref) => (
    <select
        ref={ref}
        className={cn(
            'flex h-10 w-full rounded-lg bg-white px-3 py-2 text-sm text-slate-800',
            'input-ring appearance-none',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50',
            className
        )}
        {...props}
    >
        {children}
    </select>
))
Select.displayName = 'Select'

// ─────────────────────────────────────────────
// LABEL
// ─────────────────────────────────────────────
export const Label = React.forwardRef(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(
            'block text-sm font-medium text-slate-700 mb-1',
            className
        )}
        {...props}
    />
))
Label.displayName = 'Label'

// ─────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────
export const Card = ({ className, children, ...props }) => (
    <div
        className={cn('card-base', className)}
        {...props}
    >
        {children}
    </div>
)
export const CardHeader = ({ className, children, ...props }) => (
    <div className={cn('px-6 pt-6 pb-3', className)} {...props}>{children}</div>
)
export const CardTitle = ({ className, children, ...props }) => (
    <h3 className={cn('text-lg font-bold text-slate-800', className)} {...props}>{children}</h3>
)
export const CardDescription = ({ className, children, ...props }) => (
    <p className={cn('text-sm text-slate-500 mt-0.5', className)} {...props}>{children}</p>
)
export const CardContent = ({ className, children, ...props }) => (
    <div className={cn('px-6 pb-6', className)} {...props}>{children}</div>
)
export const CardFooter = ({ className, children, ...props }) => (
    <div className={cn('px-6 pb-6 pt-0 flex items-center', className)} {...props}>{children}</div>
)

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────
const badgeVariants = {
    default: 'bg-teal-100 text-teal-700',
    selected: 'badge-selected',
    rejected: 'badge-rejected',
    pending: 'badge-pending',
    absent: 'badge-absent',
    upcoming: 'badge-upcoming',
    active: 'badge-active',
    completed: 'badge-completed',
    secondary: 'bg-slate-100 text-slate-700',
    outline: 'border border-slate-300 text-slate-600 bg-transparent',
}

export const Badge = ({ className, variant = 'default', children, ...props }) => (
    <span
        className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            badgeVariants[variant] || badgeVariants.default,
            className
        )}
        {...props}
    >
        {children}
    </span>
)

// ─────────────────────────────────────────────
// TABS (Radix)
// ─────────────────────────────────────────────
export const Tabs = TabsPrimitive.Root
export const TabsList = React.forwardRef(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            'inline-flex items-center rounded-xl bg-slate-100 p-1 gap-1',
            className
        )}
        {...props}
    />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold',
            'text-slate-500 transition-all',
            'data-[state=active]:gradient-primary data-[state=active]:text-white',
            'data-[state=active]:shadow-sm',
            'focus:outline-none',
            className
        )}
        {...props}
    />
))
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = TabsPrimitive.Content

// ─────────────────────────────────────────────
// AVATAR (Radix)
// ─────────────────────────────────────────────
export const Avatar = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn('relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full', className)}
        {...props}
    />
))
Avatar.displayName = 'Avatar'

export const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn('aspect-square h-full w-full object-cover', className)}
        {...props}
    />
))
AvatarImage.displayName = 'AvatarImage'

export const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            'flex h-full w-full items-center justify-center rounded-full',
            'gradient-primary text-white text-sm font-bold',
            className
        )}
        {...props}
    />
))
AvatarFallback.displayName = 'AvatarFallback'

// ─────────────────────────────────────────────
// PROGRESS (Radix)
// ─────────────────────────────────────────────
export const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}
        {...props}
    >
        <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 gradient-primary transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </ProgressPrimitive.Root>
))
Progress.displayName = 'Progress'

// ─────────────────────────────────────────────
// SEPARATOR (Radix)
// ─────────────────────────────────────────────
export const Separator = React.forwardRef(({
    className, orientation = 'horizontal', ...props
}, ref) => (
    <SeparatorPrimitive.Root
        ref={ref}
        orientation={orientation}
        className={cn(
            'shrink-0 bg-slate-200',
            orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
            className
        )}
        {...props}
    />
))
Separator.displayName = 'Separator'

// ─────────────────────────────────────────────
// DIALOG (Radix)
// ─────────────────────────────────────────────
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal

export const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            className
        )}
        {...props}
    />
))
DialogOverlay.displayName = 'DialogOverlay'

export const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
                'w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200',
                'p-6 focus:outline-none',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                className
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X size={16} />
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
))
DialogContent.displayName = 'DialogContent'

export const DialogHeader = ({ className, children, ...props }) => (
    <div className={cn('mb-4 space-y-1', className)} {...props}>{children}</div>
)
export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn('text-lg font-bold text-slate-900', className)}
        {...props}
    />
))
DialogTitle.displayName = 'DialogTitle'

// ─────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────
export const Spinner = ({ size = 20, className }) => (
    <svg
        className={cn('animate-spin text-teal-500', className)}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
)
