"use client"

import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Kiểm tra người dùng đã đăng nhập chưa
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem('jwtToken')
        
        if (token) {
          const response = await api.get('/users/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          setUser(response.data)
        }
      } catch (error) {
        console.error('Authentication error:', error)
        localStorage.removeItem('jwtToken')
      } finally {
        setLoading(false)
      }
    }
    
    checkUserLoggedIn()
  }, [])

  // Đăng nhập
  const login = async (username, password) => {
    try {
      setLoading(true)
      const response = await api.post('/users/login', { username, password })
      
      if (response.data.token) {
        localStorage.setItem('jwtToken', response.data.token)
        setUser(response.data.user)
        
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng ${response.data.user.name} quay trở lại!`,
        })
        
        router.push('/')
        return true
      }
    } catch (error) { 
      console.log('Chi tiết lỗi:', error.response?.data);
          toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: error.response?.data?.error?.message || "Tên đăng nhập hoặc mật khẩu không đúng",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Đăng ký
  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await api.post('/users', userData)
      
      if (response.data.token) {
        localStorage.setItem('jwtToken', response.data.token)
        setUser(response.data.user)
        
        toast({
          title: "Đăng ký thành công",
          description: "Tài khoản của bạn đã được tạo thành công!",
        })
        
        router.push('/')
        return true
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi đăng ký",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('jwtToken')
    setUser(null)
    toast({
      title: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi tài khoản",
    })
    router.push('/')
  }

  // Facebook login
  const facebookLogin = async (response) => {
    try {
      setLoading(true)
      const apiResponse = await api.post('/users/login/facebook', response)
      
      if (apiResponse.data.token) {
        localStorage.setItem('jwtToken', apiResponse.data.token)
        setUser(apiResponse.data.user)
        
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng ${apiResponse.data.user.name} quay trở lại!`,
        })
        
        router.push('/')
        return true
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng nhập bằng Facebook thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Google login
  const googleLogin = async (response) => {
    try {
      setLoading(true)
      const apiResponse = await api.post('/users/login/google', {
        email: response.profileObj.email,
        googleId: response.profileObj.googleId,
        name: response.profileObj.name
      })
      
      if (apiResponse.data.token) {
        localStorage.setItem('jwtToken', apiResponse.data.token)
        setUser(apiResponse.data.user)
        
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng ${apiResponse.data.user.name} quay trở lại!`,
        })
        
        router.push('/')
        return true
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng nhập bằng Google thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Cập nhật thông tin người dùng
  const updateUser = async (userData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwtToken')
      
      const response = await api.patch('/users/me', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setUser(response.data)
      
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin tài khoản đã được cập nhật",
      })
      
      return true
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật thông tin",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Upload ảnh đại diện
  const uploadImage = async (userId, file) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwtToken')
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post(`/users/photo/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setUser({
        ...user,
        imageurl: response.data.user.imageurl
      })
      
      toast({
        title: "Cập nhật ảnh đại diện thành công",
        description: "Ảnh đại diện của bạn đã được cập nhật",
      })
      
      return true
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cập nhật ảnh đại diện thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật ảnh đại diện",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        facebookLogin,
        googleLogin,
        updateUser,
        uploadImage,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}