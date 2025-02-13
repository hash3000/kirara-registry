"use client"

import { createContext, useState, useContext, type ReactNode, useEffect } from "react"

interface AuthContextType {
  isLoggedIn: boolean
  login: (apiKey: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey")
    setIsLoggedIn(!!apiKey)
  }, [])

  const login = (apiKey: string) => {
    localStorage.setItem("apiKey", apiKey)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem("apiKey")
    setIsLoggedIn(false)
  }

  return <AuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

