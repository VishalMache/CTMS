// ============================================================
// CPMS – Zustand Auth Store (src/store/authStore.js)
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set) => ({
            token: localStorage.getItem('cpms_token') || null,
            user: JSON.parse(localStorage.getItem('cpms_user') || 'null'),
            lastRole: localStorage.getItem('cpms_last_role') || null,

            /** Called after successful login / register API response */
            setAuth: (token, user) => {
                localStorage.setItem('cpms_token', token)
                localStorage.setItem('cpms_user', JSON.stringify(user))
                if (user?.role) {
                    localStorage.setItem('cpms_last_role', user.role)
                }
                set({ token, user, lastRole: user?.role || null })
            },

            /** Update user data (e.g., after profile edit) */
            updateUser: (updatedUser) => {
                const merged = { ...useAuthStore.getState().user, ...updatedUser }
                localStorage.setItem('cpms_user', JSON.stringify(merged))
                set({ user: merged })
            },

            /** Clear auth state on logout */
            logout: () => {
                localStorage.removeItem('cpms_token')
                localStorage.removeItem('cpms_user')
                set({ token: null, user: null })
            },
        }),
        {
            name: 'cpms-auth',
            // Only persist token, user, and lastRole
            partialize: (state) => ({ token: state.token, user: state.user, lastRole: state.lastRole }),
        }
    )
)

export default useAuthStore
