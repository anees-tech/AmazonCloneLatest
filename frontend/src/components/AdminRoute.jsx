"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function AdminProtectedRoutes({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminProtectedRoutes
