// ============================================================
// CPMS – Shared UI Utilities (src/lib/utils.js)
// ============================================================
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names intelligently.
 * Combines clsx conditional logic with twMerge de-duplication.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian Rupee currency string.
 * @param {number} value  - Amount in LPA
 */
export function formatCTC(value) {
    return `₹${value} LPA`
}

/**
 * Format a date to readable string.
 * @param {string|Date} date
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}

/**
 * Get initials from a full name.
 * @param {string} name
 */
export function getInitials(name = '') {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

/** Clamp a number between min and max */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}
