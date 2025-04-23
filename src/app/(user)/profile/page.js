"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { userApi } from '@/lib/api'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, Upload } from 'lucide-react'
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getInitials } from '@/lib/utils'

// Form schema
const profileSchema = z.object({
  name: z.string().min(1, 'Họ tên là bắt buộc'),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
})

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  
  const router = useRouter()
  const { user, isAuthenticated, updateUser, uploadImage } = useAuth()
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])
  
  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    },
  })
  
  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setImageFile(file)
    
    // Create image preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }
  
  // Upload profile image
  const handleImageUpload = async () => {
    if (!imageFile || !user) return
    
    try {
      setUploading(true)
      setError('')
      
      await uploadImage(user._id, imageFile)
      
      setSuccess('Ảnh đại diện đã được cập nhật thành công!')
      setImageFile(null)
    } catch (error) {
      setError('Không thể tải lên ảnh đại diện. Vui lòng thử lại sau.')
    } finally {
      setUploading(false)
    }
  }
  
  // Update profile
  const onUpdateProfile = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      await updateUser(data)
      setSuccess('Thông tin cá nhân đã được cập nhật thành công!')
    } catch (error) {
      setError('Không thể cập nhật thông tin. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }
  
  // Update password
  const onUpdatePassword = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      await updateUser({ password: data.newPassword })
      setSuccess('Mật khẩu đã được cập nhật thành công!')
      passwordForm.reset()
    } catch (error) {
      setError('Không thể cập nhật mật khẩu. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-6">Thông tin tài khoản</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Quản lý thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} />
                  ) : (
                    <>
                      <AvatarImage src={user.imageurl} />
                      <AvatarFallback className="text-2xl">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <Label htmlFor="picture" className="block mb-2">
                      Ảnh đại diện
                    </Label>
                    <Input
                      id="picture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  
                  {imageFile && (
                    <Button
                      onClick={handleImageUpload}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Cập nhật ảnh
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="w-full mt-4">
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-gray-500">Tên đăng nhập</Label>
                    <p className="font-medium">{user.username}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  
                  {user.phone && (
                    <div>
                      <Label className="text-xs text-gray-500">Số điện thoại</Label>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-8">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle>Cài đặt tài khoản</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân và mật khẩu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <Alert className="mb-6 bg-green-900/20 text-green-500 border-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Tabs defaultValue="profile">
                <TabsList className="mb-6">
                  <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                  <TabsTrigger value="password">Mật khẩu</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ tên</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập họ tên đầy đủ"
                                {...field}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Nhập email"
                                {...field}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Nhập số điện thoại"
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
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Cập nhật thông tin
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="password">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu hiện tại</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập mật khẩu hiện tại"
                                {...field}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu mới</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập mật khẩu mới"
                                {...field}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
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
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Cập nhật mật khẩu
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}