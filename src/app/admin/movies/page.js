// src/app/admin/movies/page.js
"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { movieApi } from '@/lib/api'
import { formatDate, getMovieImage } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { 
  Film, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  X,
  Loader2
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
import { Textarea } from '@/components/ui/textarea'
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

// Form schema cho phim
const movieSchema = z.object({
  title: z.string().min(1, 'Tiêu đề phim là bắt buộc'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  director: z.string().min(1, 'Đạo diễn là bắt buộc'),
  cast: z.string().min(1, 'Diễn viên là bắt buộc'),
  genre: z.string().min(1, 'Thể loại là bắt buộc'),
  duration: z.coerce.number().min(1, 'Thời lượng phim là bắt buộc'),
  language: z.string().min(1, 'Ngôn ngữ là bắt buộc'),
  releaseDate: z.string().min(1, 'Ngày khởi chiếu là bắt buộc'),
  endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  image: z.string().optional(),
})

export default function AdminMovieManagement() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' hoặc 'desc'
  const [sortField, setSortField] = useState('releaseDate')
  const [filteredMovies, setFilteredMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [imageFile, setImageFile] = useState(null)
  
  const { toast } = useToast()
  
  // React Hook Form cho thêm/sửa phim
  const form = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: '',
      description: '',
      director: '',
      cast: '',
      genre: '',
      duration: 0,
      language: '',
      releaseDate: '',
      endDate: '',
      image: ''
    }
  })
  
  // Fetch danh sách phim
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const response = await movieApi.getAll()
        setMovies(response.data || [])
      } catch (error) {
        console.error('Error fetching movies:', error)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách phim. Vui lòng thử lại sau.",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchMovies()
  }, [])
  
  // Lọc và sắp xếp danh sách phim
  useEffect(() => {
    let result = [...movies]
    
    // Tìm kiếm
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        movie => 
          movie.title?.toLowerCase().includes(searchLower) ||
          movie.director?.toLowerCase().includes(searchLower) ||
          movie.genre?.toLowerCase().includes(searchLower)
      )
    }
    
    // Sắp xếp
    result.sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]
      
      // Xử lý trường hợp ngày tháng
      if (sortField === 'releaseDate' || sortField === 'endDate') {
        valA = new Date(valA || 0)
        valB = new Date(valB || 0)
      }
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1
      } else {
        return valA < valB ? 1 : -1
      }
    })
    
    setFilteredMovies(result)
  }, [movies, search, sortField, sortOrder])
  
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
  
  // Add movie
  const handleAddMovie = async (data) => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to add movie
      // const response = await movieApi.create(data)
      
      // Mô phỏng thêm phim
      const newMovie = {
        _id: `movie-${Date.now()}`,
        ...data,
        image: imagePreview || '/images/login.jpg'
      }
      
      setMovies([...movies, newMovie])
      
      toast({
        title: "Thêm phim thành công",
        description: `Phim "${data.title}" đã được thêm vào hệ thống.`
      })
      
      setShowAddDialog(false)
      form.reset()
      setImagePreview('')
      setImageFile(null)
    } catch (error) {
      console.error('Error adding movie:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm phim. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Edit movie
  const handleEditMovie = async (data) => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to update movie
      // const response = await movieApi.update(selectedMovie._id, data)
      
      // Mô phỏng cập nhật phim
      const updatedMovies = movies.map(movie => {
        if (movie._id === selectedMovie._id) {
          return {
            ...movie,
            ...data,
            image: imagePreview || movie.image
          }
        }
        return movie
      })
      
      setMovies(updatedMovies)
      
      toast({
        title: "Cập nhật phim thành công",
        description: `Phim "${data.title}" đã được cập nhật.`
      })
      
      setShowEditDialog(false)
      setSelectedMovie(null)
      setImagePreview('')
      setImageFile(null)
    } catch (error) {
      console.error('Error updating movie:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật phim. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Delete movie
  const handleDeleteMovie = async () => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to delete movie
      // await movieApi.delete(selectedMovie._id)
      
      // Mô phỏng xóa phim
      const updatedMovies = movies.filter(movie => movie._id !== selectedMovie._id)
      setMovies(updatedMovies)
      
      toast({
        title: "Xóa phim thành công",
        description: `Phim "${selectedMovie.title}" đã được xóa khỏi hệ thống.`
      })
      
      setShowDeleteDialog(false)
      setSelectedMovie(null)
    } catch (error) {
      console.error('Error deleting movie:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa phim. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Setup edit movie
  const setupEditMovie = (movie) => {
    setSelectedMovie(movie)
    
    form.reset({
      title: movie.title || '',
      description: movie.description || '',
      director: movie.director || '',
      cast: movie.cast || '',
      genre: movie.genre || '',
      duration: movie.duration || 0,
      language: movie.language || '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      endDate: movie.endDate ? new Date(movie.endDate).toISOString().split('T')[0] : '',
      image: movie.image || ''
    })
    
    setShowEditDialog(true)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý phim</h1>
        
        <Button onClick={() => {
          form.reset()
          setImagePreview('')
          setImageFile(null)
          setShowAddDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm phim mới
        </Button>
      </div>
      
      {/* Search và lọc */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Bảng danh sách phim */}
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
                    onClick={() => handleSort('title')}
                  >
                    Tên phim
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Thể loại</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('duration')}
                  >
                    Thời lượng
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('releaseDate')}
                  >
                    Ngày chiếu
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center">
                      <Film className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Không có phim nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovies.map((movie) => (
                  <TableRow key={movie._id}>
                    <TableCell>
                      <div className="relative w-12 h-16 overflow-hidden rounded">
                        <Image
                          src={getMovieImage(movie)}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{movie.title}</TableCell>
                    <TableCell>
                      {movie.genre && (
                        <Badge variant="outline">
                          {movie.genre.split(',')[0]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{movie.duration} phút</TableCell>
                    <TableCell>{formatDate(movie.releaseDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setupEditMovie(movie)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setSelectedMovie(movie)
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
      
      {/* Dialog thêm phim */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm phim mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về phim mới để thêm vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddMovie)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên phim</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên phim" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="director"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đạo diễn</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên đạo diễn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cast"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diễn viên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên diễn viên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thời lượng (phút)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngôn ngữ</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn ngôn ngữ" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tiếng Việt">Tiếng Việt</SelectItem>
                                <SelectItem value="Tiếng Anh">Tiếng Anh</SelectItem>
                                <SelectItem value="Tiếng Hàn">Tiếng Hàn</SelectItem>
                                <SelectItem value="Tiếng Nhật">Tiếng Nhật</SelectItem>
                                <SelectItem value="Tiếng Trung">Tiếng Trung</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thể loại</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập thể loại" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="releaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày khởi chiếu</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày kết thúc</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Nhập mô tả phim" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel>Ảnh phim</FormLabel>
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
                </div>
              </div>
              
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
                  Thêm phim
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog sửa phim */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="max-w-2xl  z-[9999]">
      <DialogHeader>
            <DialogTitle>Sửa thông tin phim</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết về phim.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditMovie)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên phim</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên phim" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Các trường khác giống như trong dialog thêm phim */}
                  <FormField
                    control={form.control}
                    name="director"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đạo diễn</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên đạo diễn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cast"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diễn viên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên diễn viên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thời lượng (phút)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngôn ngữ</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn ngôn ngữ" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tiếng Việt">Tiếng Việt</SelectItem>
                                <SelectItem value="Tiếng Anh">Tiếng Anh</SelectItem>
                                <SelectItem value="Tiếng Hàn">Tiếng Hàn</SelectItem>
                                <SelectItem value="Tiếng Nhật">Tiếng Nhật</SelectItem>
                                <SelectItem value="Tiếng Trung">Tiếng Trung</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Nhập mô tả phim" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel>Ảnh phim</FormLabel>
                    <div className="border rounded-md p-4 space-y-4">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      
                      {(imagePreview || selectedMovie?.image) && (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden">
                          <Image
                            src={imagePreview || getMovieImage(selectedMovie)}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </FormItem>
                </div>
              </div>
              
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
      
      {/* Dialog xóa phim */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa phim</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phim "{selectedMovie?.title}" khỏi hệ thống?
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
              onClick={handleDeleteMovie}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Xóa phim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}