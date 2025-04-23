"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useBooking } from '@/hooks/useBooking'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Form schema
const loginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
})

const LoginForm = ({ isDialog = false }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const { toggleLoginPopup } = useBooking()
  
  // React Hook Form
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })
  
  const onSubmit = async (data) => {
    setError('')
    setLoading(true)
    
    try {
      const success = await login(data.username, data.password)
      
      if (success && isDialog) {
        toggleLoginPopup()
      }
    } catch (error) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className={isDialog ? 'py-4' : 'max-w-md mx-auto py-16'}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Đăng nhập</h1>
        <p className="text-gray-400">
          Đăng nhập để đặt vé và nhận các ưu đãi đặc biệt
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên đăng nhập</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập tên đăng nhập hoặc email"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogIn className="h-4 w-4 mr-2" />
            )}
            Đăng nhập
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Chưa có tài khoản?{' '}
          <Link 
            href="/register" 
            className="text-primary-dark hover:underline"
            onClick={isDialog ? toggleLoginPopup : undefined}
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
      
      {/* Social login options can be added here */}
    </div>
  )
}

export default LoginForm