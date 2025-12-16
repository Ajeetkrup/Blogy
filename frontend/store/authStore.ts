import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as api from '@/lib/api'

interface User {
  id: number
  email: string
  is_verified: boolean
  created_at: string
}

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  fetchUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.login(email, password)
          // Access token is now stored in HTTP-only cookie by the backend
          // Store in memory only for UI state management
          set({
            accessToken: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          })
          await get().fetchUser()
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
          })
          throw error
        }
      },

      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          await api.register(email, password)
          set({ isLoading: false })
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Registration failed',
            isLoading: false,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },

      setToken: (token: string | null) => {
        set({
          accessToken: token,
          isAuthenticated: !!token,
        })
      },

      fetchUser: async () => {
        try {
          const user = await api.getCurrentUser()
          console.log('user', user)
          set({ user })
        } catch (error) {
          console.log('error', error)
          set({ user: null, isAuthenticated: false })
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Don't persist accessToken - it's in HTTP-only cookie
        // Only persist isAuthenticated for UI state
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

