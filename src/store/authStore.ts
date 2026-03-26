import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { setToken, clearToken } from '../api/client'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateUser: (partial: Partial<User>) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (token, user) => {
        setToken(token)
        set({ user, isAuthenticated: true, error: null })
      },

      logout: () => {
        clearToken()
        set({ user: null, isAuthenticated: false, error: null })
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'bytik-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
