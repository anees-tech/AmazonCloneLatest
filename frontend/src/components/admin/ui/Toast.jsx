"use client"

import { useState, useEffect } from "react"

function Toast({ message, type, onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        onClose()
      }, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`toast toast-${type} ${visible ? "" : "fade-out"}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={() => setVisible(false)}>
        &times;
      </button>
    </div>
  )
}

export default Toast
