// src/app/admin/cinemas/page.js
"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cinemaApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { 
  Building2, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  X,
  Loader2,
  MapPin
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

// Form schema cho rạp chiếu phim
const cinemaSchema = z.object({
  name: z.string().min(1, 'Tên rạp chiếu phim là bắt buộc'),
  city: z.string().min(1, 'Thành phố là bắt buộc'),
  ticketPrice: z.coerce.number().min(1, 'Giá vé là bắt buộc'),
  seatsAvailable: z.coerce.number().min(1, 'Số ghế là bắt buộc'),
  image: z.string().optional(),
})

export default function AdminCinemaManagement() {
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' hoặc 'desc'
  const [sortField, setSortField] = useState('name')
  const [filteredCinemas, setFilteredCinemas] = useState([])
  const [selectedCinema, setSelectedCinema] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [imageFile, setImageFile] = useState(null)
  
  const { toast } = useToast()
  
  // React Hook Form cho thêm/sửa rạp
  const form = useForm({
    resolver: zodResolver(cinemaSchema),
    defaultValues: {
      name: '',
      city: '',
      ticketPrice: 0,
      seatsAvailable: 0,
      image: ''
    }
  })
  
  // Fetch danh sách rạp
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true)
        const response = await cinemaApi.getAll()
        setCinemas(response.data || [])
      } catch (error) {
        console.error('Error fetching cinemas:', error)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách rạp. Vui lòng thử lại sau.",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchCinemas()
  }, [])
  
  // Lọc và sắp xếp danh sách rạp
  useEffect(() => {
    let result = [...cinemas]
    
    // Tìm kiếm
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        cinema => 
          cinema.name?.toLowerCase().includes(searchLower) ||
          cinema.city?.toLowerCase().includes(searchLower)
      )
    }
    
    // Sắp xếp
    result.sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1
      } else {
        return valA < valB ? 1 : -1
      }
    })
    
    setFilteredCinemas(result)
  }, [cinemas, search, sortField, sortOrder])
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  // Handle image change
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
  
  // Add cinema
  const handleAddCinema = async (data) => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to add cinema
      // const response = await cinemaApi.create(data)
      
      // Mô phỏng thêm rạp
      const newCinema = {
        _id: `cinema-${Date.now()}`,
        ...data,
        image: imagePreview || '/images/cinema-placeholder.jpg',
        seats: generateDefaultSeats(10, 10) // Tạo mặc định 10 hàng x 10 cột ghế
      }
      
      setCinemas([...cinemas, newCinema])
      
      toast({
        title: "Thêm rạp thành công",
        description: `Rạp "${data.name}" đã được thêm vào hệ thống.`
      })
      
      setShowAddDialog(false)
      form.reset()
      setImagePreview('')
      setImageFile(null)
    } catch (error) {
      console.error('Error adding cinema:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm rạp. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Edit cinema
  const handleEditCinema = async (data) => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to update cinema
      // const response = await cinemaApi.update(selectedCinema._id, data)
      
      // Mô phỏng cập nhật rạp
      const updatedCinemas = cinemas.map(cinema => {
        if (cinema._id === selectedCinema._id) {
          return {
            ...cinema,
            ...data,
            image: imagePreview || cinema.image
          }
        }
        return cinema
      })
      
      setCinemas(updatedCinemas)
      
      toast({
        title: "Cập nhật rạp thành công",
        description: `Rạp "${data.name}" đã được cập nhật.`
      })
      
      setShowEditDialog(false)
      setSelectedCinema(null)
      setImagePreview('')
      setImageFile(null)
    } catch (error) {
      console.error('Error updating cinema:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật rạp. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Delete cinema
  const handleDeleteCinema = async () => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to delete cinema
      // await cinemaApi.delete(selectedCinema._id)
      
      // Mô phỏng xóa rạp
      const updatedCinemas = cinemas.filter(cinema => cinema._id !== selectedCinema._id)
      setCinemas(updatedCinemas)
      
      toast({
        title: "Xóa rạp thành công",
        description: `Rạp "${selectedCinema.name}" đã được xóa khỏi hệ thống.`
      })
      
      setShowDeleteDialog(false)
      setSelectedCinema(null)
    } catch (error) {
      console.error('Error deleting cinema:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa rạp. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Setup edit cinema
  const setupEditCinema = (cinema) => {
    setSelectedCinema(cinema)
    
    form.reset({
      name: cinema.name || '',
      city: cinema.city || '',
      ticketPrice: cinema.ticketPrice || 0,
      seatsAvailable: cinema.seatsAvailable || 0,
      image: cinema.image || ''
    })
    
    setShowEditDialog(true)
  }
  
  // Tạo mảng ghế mặc định (tất cả là ghế trống = 0)
  const generateDefaultSeats = (rows, cols) => {
    return Array(rows).fill().map(() => Array(cols).fill(0))
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý rạp chiếu phim</h1>
        
        <Button onClick={() => {
          form.reset()
          setImagePreview('')
          setImageFile(null)
          setShowAddDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm rạp mới
        </Button>
      </div>
      
      {/* Search và lọc */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm rạp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Bảng danh sách rạp */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ảnh</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('name')}
                  >
                    Tên rạp
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('city')}
                  >
                    Thành phố
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('ticketPrice')}
                  >
                    Giá vé
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('seatsAvailable')}
                  >
                    Số ghế
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCinemas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Không có rạp nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCinemas.map((cinema) => (
                  <TableRow key={cinema._id}>
                    <TableCell>
                      <div className="relative w-12 h-12 overflow-hidden rounded">
                        <Image
                          src={cinema.image || '/images/cinema-placeholder.jpg'}
                          alt={cinema.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{cinema.name}</TableCell>
                    <TableCell className="capitalize">{cinema.city}</TableCell>
                    <TableCell>{formatCurrency(cinema.ticketPrice)}</TableCell>
                    <TableCell>{cinema.seatsAvailable}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setupEditCinema(cinema)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setSelectedCinema(cinema)
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
      
      {/* Dialog thêm rạp */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm rạp mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về rạp chiếu phim mới để thêm vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddCinema)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên rạp</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên rạp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thành phố</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên thành phố" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ticketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá vé (VND)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="seatsAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số ghế</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormItem>
                <FormLabel>Ảnh rạp</FormLabel>
                <div className="border rounded-md p-4 space-y-4">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  
                  {imagePreview && (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </FormItem>
              
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
                  Thêm rạp
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog sửa rạp */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa thông tin rạp</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết về rạp chiếu phim.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditCinema)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên rạp</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên rạp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thành phố</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên thành phố" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ticketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá vé (VND)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="seatsAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số ghế</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormItem>
                <FormLabel>Ảnh rạp</FormLabel>
                <div className="border rounded-md p-4 space-y-4">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  
                  {(imagePreview || selectedCinema?.image) && (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden">
                      <Image
                        src={'/images/cinema-placeholder.jpg'}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </FormItem>
              
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
      
      {/* Dialog xóa rạp */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa rạp</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa rạp "{selectedCinema?.name}" khỏi hệ thống?
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
              onClick={handleDeleteCinema}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Xóa rạp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}