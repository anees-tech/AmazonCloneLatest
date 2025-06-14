"use client"

import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"
import "../../styles/admin/adminLayout.css"

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  // Keep sidebar state in localStorage to persist between page refreshes
  useEffect(() => {
    const savedState = localStorage.getItem("adminSidebarOpen")
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState))
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    localStorage.setItem("adminSidebarOpen", JSON.stringify(newState))
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="admin-content">
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
