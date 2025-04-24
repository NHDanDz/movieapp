// src/app/admin/showtimes/page.js
"use client"

import { useState, useEffect } from 'react'
import { showtimeApi, movieApi, cinemaApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { 
  Calendar, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  Loader2,
  Film,
  Building2
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

// Form schema cho suất chiếu
const showtimeSchema = z.object({
  movieId: z.string().min(1, 'Phim là bắt buộc'),
  cinemaId: z.string().min(1, 'Rạp chiếu là bắt buộc'),
  startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
  endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  startAt: z.string().min(1, 'Giờ chiếu là bắt buộc'),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu',
  path: ['endDate']
})

export default function AdminShowtimeManagement() {
  const [showtimes, setShowtimes] = useState([])
  const [movies, setMovies] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' hoặc 'desc'
  const [sortField, setSortField] = useState('startDate')
  const [filteredShowtimes, setFilteredShowtimes] = useState([])
  const [selectedShowtime, setSelectedShowtime] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const { toast } = useToast()
  
  // React Hook Form cho thêm/sửa suất chiếu
  const form = useForm({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      movieId: '',
      cinemaId: '',
      startDate: '',
      endDate: '',
      startAt: '',
    }
  })
  
  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch showtimes
        const showtimesRes = await showtimeApi.getAll()
        setShowtimes(showtimesRes.data || [])
        
        // Fetch movies
        const moviesRes = await movieApi.getAll()
        setMovies(moviesRes.data || [])
        
        // Fetch cinemas
        const cinemasRes = await cinemaApi.getAll()
        setCinemas(cinemasRes.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Lọc và sắp xếp danh sách suất chiếu
  useEffect(() => {
    let result = [...showtimes]
    
    // Tìm kiếm
    if (search) {
      const searchLower = search.toLowerCase()
      const matchingMovies = movies.filter(movie => 
        movie.title?.toLowerCase().includes(searchLower)
      ).map(movie => movie._id)
      
      const matchingCinemas = cinemas.filter(cinema => 
        cinema.name?.toLowerCase().includes(searchLower) || 
        cinema.city?.toLowerCase().includes(searchLower)
      ).map(cinema => cinema._id)
      
      result = result.filter(
        showtime => 
          matchingMovies.includes(showtime.movieId) ||
          matchingCinemas.includes(showtime.cinemaId) ||
          showtime.startAt?.toLowerCase().includes(searchLower)
      )
    }
    
    // Sắp xếp
    result.sort((a, b) => {
      let valA, valB
      
      if (sortField === 'movie') {
        const movieA = movies.find(m => m._id === a.movieId)
        const movieB = movies.find(m => m._id === b.movieId)
        valA = movieA?.title || ''
        valB = movieB?.title || ''
      } else if (sortField === 'cinema') {
        const cinemaA = cinemas.find(c => c._id === a.cinemaId)
        const cinemaB = cinemas.find(c => c._id === b.cinemaId)
        valA = cinemaA?.name || ''
        valB = cinemaB?.name || ''
      } else {
        valA = a[sortField]
        valB = b[sortField]
        
        // Xử lý trường hợp ngày tháng
        if (sortField === 'startDate' || sortField === 'endDate') {
          valA = new Date(valA || 0)
          valB = new Date(valB || 0)
        }
      }
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1
      } else {
        return valA < valB ? 1 : -1
      }
    })
    
    setFilteredShowtimes(result)
  }, [showtimes, movies, cinemas, search, sortField, sortOrder])
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  // Add showtime
  const handleAddShowtime = async (data) => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to add showtime
      // const response = await showtimeApi.create(data)
      
      // Mô phỏng thêm suất chiếu
      const newShowtime = {
        _id: `showtime-${Date.now()}`,
        ...data,
      }
      
      setShowtimes([...showtimes, newShowtime])
      
      toast({
        title: "Thêm suất chiếu thành công",
        description: "Suất chiếu mới đã được thêm vào hệ thống."
      })
      
      setShowAddDialog(false)
      form.reset()
    } catch (error) {
      console.error('Error adding showtime:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm suất chiếu. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Edit showtime
  const handleEditShowtime = async (data) => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to update showtime
      // const response = await showtimeApi.update(selectedShowtime._id, data)
      
      // Mô phỏng cập nhật suất chiếu
      const updatedShowtimes = showtimes.map(showtime => {
        if (showtime._id === selectedShowtime._id) {
          return {
            ...showtime,
            ...data,
          }
        }
        return showtime
      })
      
      setShowtimes(updatedShowtimes)
      
      toast({
        title: "Cập nhật suất chiếu thành công",
        description: "Suất chiếu đã được cập nhật."
      })
      
      setShowEditDialog(false)
      setSelectedShowtime(null)
    } catch (error) {
      console.error('Error updating showtime:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật suất chiếu. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Delete showtime
  const handleDeleteShowtime = async () => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to delete showtime
      // await showtimeApi.delete(selectedShowtime._id)
      
      // Mô phỏng xóa suất chiếu
      const updatedShowtimes = showtimes.filter(showtime => showtime._id !== selectedShowtime._id)
      setShowtimes(updatedShowtimes)
      
      toast({
        title: "Xóa suất chiếu thành công",
        description: "Suất chiếu đã được xóa khỏi hệ thống."
      })
      
      setShowDeleteDialog(false)
      setSelectedShowtime(null)
    } catch (error) {
      console.error('Error deleting showtime:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa suất chiếu. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Setup edit showtime
  const setupEditShowtime = (showtime) => {
    setSelectedShowtime(showtime)
    
    form.reset({
      movieId: showtime.movieId || '',
      cinemaId: showtime.cinemaId || '',
      startDate: showtime.startDate ? new Date(showtime.startDate).toISOString().split('T')[0] : '',
      endDate: showtime.endDate ? new Date(showtime.endDate).toISOString().split('T')[0] : '',
      startAt: showtime.startAt || '',
    })
    
    setShowEditDialog(true)
  }
  
  // Helper để lấy tên phim từ movieId
  const getMovieName = (movieId) => {
    const movie = movies.find(m => m._id === movieId)
    return movie ? movie.title : 'Không xác định'
  }
  
  // Helper để lấy tên rạp từ cinemaId
  const getCinemaName = (cinemaId) => {
    const cinema = cinemas.find(c => c._id === cinemaId)
    return cinema ? cinema.name : 'Không xác định'
  }
  
  // Helper để lấy thành phố từ cinemaId
  const getCinemaCity = (cinemaId) => {
    const cinema = cinemas.find(c => c._id === cinemaId)
    return cinema ? cinema.city : ''
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý suất chiếu phim</h1>
        
        <Button onClick={() => {
          form.reset()
          setShowAddDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm suất chiếu mới
        </Button>
      </div>
      
      {/* Search và lọc */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm suất chiếu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Bảng danh sách suất chiếu */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('movie')}
                  >
                    Phim
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('cinema')}
                  >
                    Rạp chiếu
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('startDate')}
                  >
                    Ngày bắt đầu
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('endDate')}
                  >
                    Ngày kết thúc
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('startAt')}
                  >
                    Giờ chiếu
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShowtimes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Không có suất chiếu nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredShowtimes.map((showtime) => (
                  <TableRow key={showtime._id}>
                    <TableCell className="font-medium">{getMovieName(showtime.movieId)}</TableCell>
                    <TableCell>
                      <div>
                        <div>{getCinemaName(showtime.cinemaId)}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {getCinemaCity(showtime.cinemaId)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(showtime.startDate)}</TableCell>
                    <TableCell>{formatDate(showtime.endDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{showtime.startAt}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setupEditShowtime(showtime)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setSelectedShowtime(showtime)
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
      
      {/* Dialog thêm suất chiếu */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm suất chiếu mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về suất chiếu phim mới để thêm vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddShowtime)} className="space-y-6">
              <FormField
                control={form.control}
                name="movieId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phim</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phim" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {movies.map((movie) => (
                          <SelectItem key={movie._id} value={movie._id}>
                            {movie.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cinemaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rạp chiếu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn rạp chiếu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cinemas.map((cinema) => (
                          <SelectItem key={cinema._id} value={cinema._id}>
                            {cinema.name} - {cinema.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
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
              
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ chiếu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giờ chiếu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="11:30">11:30</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="16:30">16:30</SelectItem>
                        <SelectItem value="19:00">19:00</SelectItem>
                        <SelectItem value="21:30">21:30</SelectItem>
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
                  onClick={() => setShowAddDialog(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Thêm suất chiếu
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog sửa suất chiếu */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa thông tin suất chiếu</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết về suất chiếu phim.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditShowtime)} className="space-y-6">
              <FormField
                control={form.control}
                name="movieId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phim</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phim" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {movies.map((movie) => (
                          <SelectItem key={movie._id} value={movie._id}>
                            {movie.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cinemaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rạp chiếu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn rạp chiếu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cinemas.map((cinema) => (
                          <SelectItem key={cinema._id} value={cinema._id}>
                            {cinema.name} - {cinema.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
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
              
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ chiếu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giờ chiếu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="11:30">11:30</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="16:30">16:30</SelectItem>
                        <SelectItem value="19:00">19:00</SelectItem>
                        <SelectItem value="21:30">21:30</SelectItem>
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
      
      {/* Dialog xóa suất chiếu */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa suất chiếu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa suất chiếu này khỏi hệ thống?
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
              onClick={handleDeleteShowtime}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Xóa suất chiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}