"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { adminAPI } from "../../api/adminApi" // Changed from axios to adminApi
import "../../styles/admin/adminUsers.css"
import EditUserModal from "../../components/admin/EditUserModal"

function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await adminAPI.getUsers() // Use specific method
        setUsers(response.data.users)
      } catch (err) {
        setError("Failed to load users")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user && user._id) {
      fetchUsers()
    }
  }, [user])

  const handleToggleAdmin = async (userId) => {
    try {
      const response = await adminAPI.toggleAdminStatus(userId) // Use specific method
      setUsers(users.map((u) => (u._id === userId ? response.data.user : u)))
      setSuccessMessage("User role updated successfully")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user")
      console.error(err)
    }
  }

  // Count total admins
  const adminCount = users.filter((u) => u.isAdmin).length

  const handleDeleteUser = async (userId, isAdmin) => {
    try {
      // Client-side validation for better UX
      if (userId === user._id) {
        setError("You cannot delete your own account while logged in.")
        return
      }

      if (isAdmin && adminCount <= 1) {
        setError("Cannot delete the last admin account. Promote another user first.")
        return
      }

      if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        return
      }

      await adminAPI.deleteUser(userId) // Use specific method
      setUsers(users.filter((u) => u._id !== userId))
      setError("")
      setSuccessMessage("User deleted successfully")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user")
      console.error(err)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
  }

  const handleSaveUser = async (updatedUser) => {
    try {
      const response = await adminAPI.updateUser(updatedUser._id, updatedUser) // Use specific method
      setUsers(users.map((u) => (u._id === updatedUser._id ? response.data.user : u)))
      setEditingUser(null)
      setSuccessMessage("User updated successfully")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user")
      console.error(err)
    }
  }

  if (loading) {
    return <div className="admin-users loading">Loading users...</div>
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <h1 className="users-title">Users Management</h1>
        <div className="users-stats">
          <span className="stat-item">Total Users: {users.length}</span>
          <span className="stat-item">Admins: {adminCount}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Admin Action</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u._id} className={u._id === user._id ? "current-user" : ""}>
                  <td className="user-id">{u._id}</td>
                  <td className="user-name">
                    {u.name} {u.lastName}
                  </td>
                  <td className="user-email">{u.email}</td>
                  <td>
                    <span className={`user-role ${u.isAdmin ? "admin" : "user"}`}>{u.isAdmin ? "Admin" : "User"}</span>
                  </td>
                  {u._id !== user._id ? (
                    <>
                      <td>
                        <button
                          className={u.isAdmin ? "demote-button" : "promote-button"}
                          onClick={() => handleToggleAdmin(u._id)}
                        >
                          {u.isAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                      </td>
                      <td>
                        <button className="edit-button" onClick={() => handleEditUser(u)}>
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteUser(u._id, u.isAdmin)}
                          disabled={u._id === user._id || (u.isAdmin && adminCount <= 1)}
                          title={
                            u._id === user._id
                              ? "Cannot delete your own account"
                              : u.isAdmin && adminCount <= 1
                                ? "Cannot delete the last admin"
                                : "Delete this user"
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td colSpan={3} className="self-user">
                        Current User
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
    </div>
  )
}

export default AdminUsers
