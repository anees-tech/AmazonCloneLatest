// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
    // In a real app, this would verify a JWT token
    // For simplicity, we're checking if user info exists in the request
    // This would be set by a previous middleware after token verification
    const user = req.user || req.session?.user
  
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }
  
    next()
  }
  
  // Middleware to check if user is an admin
  const isAdmin = (req, res, next) => {
    // First check if authenticated
    const user = req.user || req.session?.user
  
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }
  
    // Then check if admin
    if (!user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized as admin" })
    }
  
    next()
  }
  
  module.exports = { isAuth, isAdmin }
  