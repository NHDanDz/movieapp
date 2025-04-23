// src/app/(admin)/layout.js
"use client"

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({ children }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Kiểm tra xem người dùng có quyền admin không
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null
  }

  return (
    <div>
      {children}
    </div>
  )
}