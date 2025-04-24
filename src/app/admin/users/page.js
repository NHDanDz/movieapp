// src/app/admin/users/page.js
"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { userApi } from '@/lib/api'
import { getInitials } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { 
  Users, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  Lock,
  Unlock,
  Shield,
  Mail,
  Loader2,
  UserCircle
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Form schema cho người dùng
const userSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  name: z.string().min(1, 'Họ tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Vai trò là bắt buộc'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    if (data.password) {
      return data.password === data.confirmPassword
    }
    return true
  },
  {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  }
)

export default function AdminUserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' hoặc 'desc'
  const [sortField, setSortField] = useState('name')
  const [roleFilter, setRoleFilter] = useState('all') // 'all', 'admin', 'user'
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const { toast } = useToast()
  
  // React Hook Form cho thêm/sửa người dùng
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
      confirmPassword: '',
    }
  })
  
  // Fetch danh sách người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        // Trong thực tế, sẽ gọi API:
        // const response = await userApi.getAll()
        
        // Mô phỏng dữ liệu người dùng
        const mockUsers = [
          {
            _id: 'user-1',
            username: 'admin',
            name: 'Quản trị viên',
            email: 'admin@cinema-plus.vn',
            phone: '0123456789',
            role: 'admin',
            imageurl: '/images/avatar1.jpg',
            active: true,
            createdAt: '2023-01-01',
          },
          {
            _id: 'user-2',
            username: 'ngocanh',
            name: 'Ngọc Anh',
            email: 'ngocanh@gmail.com',
            phone: '0987654321',
            role: 'user',
            imageurl: '',
            active: true,
            createdAt: '2023-02-15',
          },
          {
            _id: 'user-3',
            username: 'tuanminh',
            name: 'Tuấn Minh',
            email: 'tuanminh@gmail.com',
            phone: '0909090909',
            role: 'user',
            imageurl: '/images/avatar2.jpg',
            active: false,
            createdAt: '2023-03-20',
          },
          {
            _id: 'user-4',
            username: 'hoanganh',
            name: 'Hoàng Anh',
            email: 'hoanganh@gmail.com',
            phone: '0977123456',
            role: 'support',
            imageurl: '',
            active: true,
            createdAt: '2023-04-05',
          },
          {
            _id: 'user-5',
            username: 'thanhhuong',
            name: 'Thanh Hương',
            email: 'thanhhuong@gmail.com',
            phone: '0912345678',
            role: 'user',
            imageurl: '/images/avatar3.jpg',
            active: true,
            createdAt: '2023-05-10',
          }
        ]
        
        setUsers(mockUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách người dùng. Vui lòng thử lại sau.",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [])
  
  // Lọc và sắp xếp danh sách người dùng
  useEffect(() => {
    let result = [...users]
    
    // Lọc theo vai trò
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter)
    }
    
    // Tìm kiếm
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        user => 
          user.name?.toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.includes(search)
      )
    }
    
    // Sắp xếp
    result.sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]
      
      if (sortField === 'createdAt') {
        valA = new Date(valA || 0)
        valB = new Date(valB || 0)
      }
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1
      } else {
        return valA < valB ? 1 : -1
      }
    })
    
    setFilteredUsers(result)
  }, [users, search, sortField, sortOrder, roleFilter])
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  // Add user
  const handleAddUser = async (data) => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to add user
      // const response = await userApi.create(data)
      
      // Mô phỏng thêm người dùng
      const newUser = {
        _id: `user-${Date.now()}`,
        ...data,
        imageurl: '',
        active: true,
        createdAt: new Date().toISOString()
      }
      
      setUsers([...users, newUser])
      
      toast({
        title: "Thêm người dùng thành công",
        description: `Người dùng "${data.name}" đã được thêm vào hệ thống.`
      })
      
      setShowAddDialog(false)
      form.reset()
    } catch (error) {
      console.error('Error adding user:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm người dùng. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Edit user
  const handleEditUser = async (data) => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to update user
      // const response = await userApi.update(selectedUser._id, data)
      
      // Mô phỏng cập nhật người dùng
      const updatedUsers = users.map(user => {
        if (user._id === selectedUser._id) {
          return {
            ...user,
            ...data,
            // Không cập nhật mật khẩu ở đây
          }
        }
        return user
      })
      
      setUsers(updatedUsers)
      
      toast({
        title: "Cập nhật người dùng thành công",
        description: `Thông tin người dùng "${data.name}" đã được cập nhật.`
      })
      
      setShowEditDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật người dùng. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Delete user
  const handleDeleteUser = async () => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to delete user
      // await userApi.delete(selectedUser._id)
      
      // Mô phỏng xóa người dùng
      const updatedUsers = users.filter(user => user._id !== selectedUser._id)
      setUsers(updatedUsers)
      
      toast({
        title: "Xóa người dùng thành công",
        description: `Người dùng "${selectedUser.name}" đã được xóa khỏi hệ thống.`
      })
      
      setShowDeleteDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa người dùng. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Reset password
  const handleResetPassword = async (data) => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to reset password
      // await userApi.resetPassword(selectedUser._id, data.password)
      
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: `Mật khẩu của người dùng "${selectedUser.name}" đã được đặt lại.`
      })
      
      setShowResetPasswordDialog(false)
      setSelectedUser(null)
      form.reset({
        password: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error resetting password:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Toggle user active status
  const toggleUserStatus = async (user) => {
    try {
      // TODO: Implement API call to toggle user status
      // await userApi.updateStatus(user._id, !user.active)
      
      // Mô phỏng cập nhật trạng thái người dùng
      const updatedUsers = users.map(u => {
        if (u._id === user._id) {
          return {
            ...u,
            active: !u.active
          }
        }
        return u
      })
      
      setUsers(updatedUsers)
      
      toast({
        title: user.active ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công",
        description: `Tài khoản "${user.name}" đã được ${user.active ? 'khóa' : 'mở khóa'}.`
      })
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thay đổi trạng thái tài khoản. Vui lòng thử lại sau.",
      })
    }
  }
  
  // Setup edit user
  const setupEditUser = (user) => {
    setSelectedUser(user)
    
    form.reset({
      username: user.username || '',
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
    })
    
    setShowEditDialog(true)
  }
  
  // Setup reset password
  const setupResetPassword = (user) => {
    setSelectedUser(user)
    
    form.reset({
      password: '',
      confirmPassword: ''
    })
    
    setShowResetPasswordDialog(true)
  }
  
  // Lấy badge cho vai trò người dùng
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">Quản trị viên</Badge>
      case 'support':
        return <Badge className="bg-blue-500">Hỗ trợ viên</Badge>
      default:
        return <Badge variant="outline">Người dùng</Badge>
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        
        <Button onClick={() => {
          form.reset({
            username: '',
            name: '',
            email: '',
            phone: '',
            role: 'user',
            password: '',
            confirmPassword: '',
          })
          setShowAddDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm người dùng mới
        </Button>
      </div>
      
      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tài khoản hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(user => user.active).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tài khoản bị khóa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(user => !user.active).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(user => user.role === 'admin').length}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search và lọc */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select 
          value={roleFilter} 
          onValueChange={setRoleFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="admin">Quản trị viên</SelectItem>
            <SelectItem value="support">Hỗ trợ viên</SelectItem>
            <SelectItem value="user">Người dùng</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Bảng danh sách người dùng */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Avatar</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('name')}
                  >
                    Họ tên
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('username')}
                  >
                    Tên đăng nhập
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Không có người dùng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        {user.imageurl ? (
                          <AvatarImage src={user.imageurl} />
                        ) : (
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.active ? (
                        <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500">
                          Bị khóa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setupEditUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={user.active ? "text-destructive" : "text-green-500"}
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.active ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setupResetPassword(user)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Dialog thêm người dùng */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về người dùng mới để thêm vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên đăng nhập" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ tên" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Nhập email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số điện thoại" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Người dùng</SelectItem>
                        <SelectItem value="support">Hỗ trợ viên</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input type="password" placeholder="Nhập mật khẩu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xác nhận mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nhập lại mật khẩu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Thêm người dùng
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog sửa người dùng */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết về người dùng.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditUser)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên đăng nhập" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ tên" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Nhập email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số điện thoại" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Người dùng</SelectItem>
                        <SelectItem value="support">Hỗ trợ viên</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog đặt lại mật khẩu */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Đặt mật khẩu mới cho người dùng <strong>{selectedUser?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nhập mật khẩu mới" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xác nhận mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nhập lại mật khẩu mới" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowResetPasswordDialog(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Đặt lại mật khẩu
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog xóa người dùng */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.name}" khỏi hệ thống?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Xóa người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}