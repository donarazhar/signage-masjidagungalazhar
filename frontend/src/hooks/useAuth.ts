import { useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getStoredUser())
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getUser()
          setUser(userData)
          setIsAuthenticated(true)
        } catch {
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password)
    setUser(response.user)
    setIsAuthenticated(true)
    return response
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }
}
