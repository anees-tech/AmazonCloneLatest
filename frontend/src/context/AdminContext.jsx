"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
  const [adminInfo, setAdminInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if admin is logged in
    const storedAdminInfo = localStorage.getItem("adminInfo")
    if (storedAdminInfo) {
      setAdminInfo(JSON.parse(storedAdminInfo))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setAdminInfo(userData)
    localStorage.setItem("adminInfo", JSON.stringify(userData))
  }

  const logout = () => {
    setAdminInfo(null)
    localStorage.removeItem("adminInfo")
    navigate("/admin/login")
  }

  return <AdminContext.Provider value={{ adminInfo, loading, login, logout }}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)
