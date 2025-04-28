"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { showtimeApi, movieApi, cinemaApi, roomApi } from '@/lib/api'
import { formatDate, formatTime } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { 
  Calendar, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  X,
  Loader2,
  Film,
  Building2,
  Clock,
  LayoutGrid,
  TimerIcon,
  Info,
  AlertCircle,
  Check,
  CalendarDays,
  CalendarRange,
  Filter,
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
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Form schema cho suất chiếu
const showtimeSchema = z.object({
  movieId: z.coerce.number().min(1, 'Phim là bắt buộc'),
  roomId: z.coerce.number().min(1, 'Phòng chiếu là bắt buộc'),
  startDate: z.date({
    required_error: "Ngày bắt đầu là bắt buộc",
  }),
  endDate: z.date({
    required_error: "Ngày kết thúc là bắt buộc",
  }),
  startAt: z.string().min(1, 'Giờ chiếu là bắt buộc'),
}).refine(data => data.endDate >= data.startDate, {
  message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu',
  path: ['endDate']
})

export default function AdminShowtimeManagement() {
  const [showtimes, setShowtimes] = useState([])
  const [movies, setMovies] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [sortField, setSortField] = useState('startDate')
  const [filteredShowtimes, setFilteredShowtimes] = useState([])
  const [selectedShowtime, setSelectedShowtime] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedCinemaId, setSelectedCinemaId] = useState(0)
  const [selectedMovieId, setSelectedMovieId] = useState(0)
  const [conflictChecking, setConflictChecking] = useState(false)
  const [conflictResult, setConflictResult] = useState(null)
  const [movieDuration, setMovieDuration] = useState(0)
  
  const { toast } = useToast()
  
  // React Hook Form cho thêm/sửa suất chiếu
  const form = useForm({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      movieId: 0,
      roomId: 0,
      startDate: new Date(),
      endDate: new Date(),
      startAt: '',
    }
  })
  
  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch tất cả dữ liệu cần thiết
        const [showtimesRes, moviesRes, cinemasRes] = await Promise.all([
          showtimeApi.getAll(),
          movieApi.getAll(),
          cinemaApi.getAll()
        ])
        
        setShowtimes(showtimesRes.data || [])
        setMovies(moviesRes.data || [])
        setCinemas(cinemasRes.data || [])
        
        // Fetch tất cả phòng chiếu
        const roomsRes = await roomApi.getAll()
        setRooms(roomsRes.data || [])
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
      ).map(movie => movie.id)
      
      const matchingCinemas = cinemas.filter(cinema => 
        cinema.name?.toLowerCase().includes(searchLower) || 
        cinema.city?.toLowerCase().includes(searchLower)
      ).map(cinema => cinema.id)
      
      const matchingRooms = rooms.filter(room => 
        room.name?.toLowerCase().includes(searchLower)
      ).map(room => room.id)
      
      result = result.filter(
        showtime => 
          matchingMovies.includes(showtime.movieId) ||
          matchingRooms.includes(showtime.roomId) ||
          matchingCinemas.some(cinemaId => 
            rooms.find(room => room.id === showtime.roomId)?.cinemaId === cinemaId
          ) ||
          showtime.startAt?.toLowerCase().includes(searchLower)
      )
    }
    
    // Lọc theo rạp
    if (selectedCinemaId) {
      result = result.filter(showtime => {
        const room = rooms.find(r => r.id === showtime.roomId)
        return room && room.cinemaId === selectedCinemaId
      })
    }
    
    // Lọc theo phim
    if (selectedMovieId) {
      result = result.filter(showtime => showtime.movieId === selectedMovieId)
    }
    
    // Sắp xếp
    result.sort((a, b) => {
      let valA, valB
      
      if (sortField === 'movie') {
        const movieA = movies.find(m => m.id === a.movieId)
        const movieB = movies.find(m => m.id === b.movieId)
        valA = movieA?.title || ''
        valB = movieB?.title || ''
      } else if (sortField === 'cinema') {
        const roomA = rooms.find(r => r.id === a.roomId)
        const roomB = rooms.find(r => r.id === b.roomId)
        const cinemaA = cinemas.find(c => c.id === roomA?.cinemaId)
        const cinemaB = cinemas.find(c => c.id === roomB?.cinemaId)
        valA = cinemaA?.name || ''
        valB = cinemaB?.name || ''
      } else if (sortField === 'room') {
        const roomA = rooms.find(r => r.id === a.roomId)
        const roomB = rooms.find(r => r.id === b.roomId)
        valA = roomA?.name || ''
        valB = roomB?.name || ''
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
  }, [showtimes, movies, cinemas, rooms, search, sortField, sortOrder, selectedCinemaId, selectedMovieId])
  
  // Theo dõi thay đổi rạp để lọc phòng
  useEffect(() => {
    if (selectedCinemaId) {
      const cinemasRooms = rooms.filter(room => room.cinemaId === selectedCinemaId)
      setFilteredRooms(cinemasRooms)
    } else {
      setFilteredRooms([])
    }
  }, [selectedCinemaId, rooms])
  
  // Theo dõi thay đổi phim để lấy thời lượng
  useEffect(() => {
    const movieId = form.watch('movieId')
    if (movieId) {
      const movie = movies.find(m => m.id === Number(movieId))
      if (movie) {
        setMovieDuration(movie.duration || 0)
      }
    } else {
      setMovieDuration(0)
    }
  }, [form.watch('movieId'), movies])
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  // Handle room change for conflict check
  const handleRoomChange = (roomId) => {
    form.setValue('roomId', roomId)
    checkShowtimeConflict()
  }
  
  // Handle time change for conflict check
  const handleTimeChange = (startAt) => {
    form.setValue('startAt', startAt)
    checkShowtimeConflict()
  }
  
  // Handle date change for conflict check
  const handleDateChange = (field, date) => {
    form.setValue(field, date)
    checkShowtimeConflict()
  }
  
  // Kiểm tra xung đột suất chiếu
  const checkShowtimeConflict = async () => {
    const roomId = form.getValues('roomId')
    const startDate = form.getValues('startDate')
    const startAt = form.getValues('startAt')
    const excludeId = selectedShowtime?.id || null
    
    if (!roomId || !startDate || !startAt || !movieDuration) {
      setConflictResult(null)
      return
    }
    
    try {
      setConflictChecking(true)
      
      // Chuyển thời gian từ chuỗi sang số phút
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + minutes
      }
      
      // Tính thời gian bắt đầu và kết thúc suất chiếu mới
      const newShowStartMinutes = timeToMinutes(startAt)
      const newShowEndMinutes = newShowStartMinutes + movieDuration
      
      // Lấy ngày ở định dạng chuỗi YYYY-MM-DD
      const formattedDate = startDate.toISOString().split('T')[0]
      
      // Lọc ra các suất chiếu trong cùng phòng, cùng ngày
      const showtimesInRoom = showtimes.filter(st => 
        st.roomId === roomId && 
        new Date(st.startDate).toISOString().split('T')[0] === formattedDate &&
        (excludeId ? st.id !== excludeId : true)
      )
      
      // Kiểm tra xung đột với từng suất chiếu
      for (const showtime of showtimesInRoom) {
        const movie = movies.find(m => m.id === showtime.movieId)
        if (!movie) continue
        
        const existingStartMinutes = timeToMinutes(showtime.startAt)
        const existingEndMinutes = existingStartMinutes + movie.duration
        
        // Kiểm tra nếu có xung đột thời gian
        if (
          (newShowStartMinutes >= existingStartMinutes && newShowStartMinutes < existingEndMinutes) ||
          (newShowEndMinutes > existingStartMinutes && newShowEndMinutes <= existingEndMinutes) ||
          (newShowStartMinutes <= existingStartMinutes && newShowEndMinutes >= existingEndMinutes)
        ) {
          setConflictResult({
            hasConflict: true,
            conflictShowtime: {
              id: showtime.id,
              startAt: showtime.startAt,
              movieTitle: movie.title,
              duration: movie.duration
            }
          })
          setConflictChecking(false)
          return
        }
      }
      
      // Không có xung đột
      setConflictResult({
        hasConflict: false
      })
    } catch (error) {
      console.error('Lỗi kiểm tra xung đột:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể kiểm tra xung đột suất chiếu.",
      })
      setConflictResult(null)
    } finally {
      setConflictChecking(false)
    }
  }
  
  // Thêm suất chiếu mới
  const handleAddShowtime = async (data) => {
    try {
      setSubmitting(true)
      
      // Kiểm tra xung đột một lần nữa trước khi thêm
      // Thực hiện kiểm tra nội bộ
      const startDate = data.startDate.toISOString().split('T')[0]
      const { startAt, roomId } = data
      
      // Chuyển thời gian từ chuỗi sang số phút
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + minutes
      }
      
      // Tính thời gian bắt đầu và kết thúc suất chiếu mới
      const newShowStartMinutes = timeToMinutes(startAt)
      const newShowEndMinutes = newShowStartMinutes + movieDuration
      
      // Lọc ra các suất chiếu trong cùng phòng, cùng ngày
      const showtimesInRoom = showtimes.filter(st => 
        st.roomId === roomId && 
        new Date(st.startDate).toISOString().split('T')[0] === startDate
      )
      
      // Kiểm tra xung đột với từng suất chiếu
      let hasConflict = false
      let conflictShowtime = null
      
      for (const showtime of showtimesInRoom) {
        const movie = movies.find(m => m.id === showtime.movieId)
        if (!movie) continue
        
        const existingStartMinutes = timeToMinutes(showtime.startAt)
        const existingEndMinutes = existingStartMinutes + movie.duration
        
        // Kiểm tra nếu có xung đột thời gian
        if (
          (newShowStartMinutes >= existingStartMinutes && newShowStartMinutes < existingEndMinutes) ||
          (newShowEndMinutes > existingStartMinutes && newShowEndMinutes <= existingEndMinutes) ||
          (newShowStartMinutes <= existingStartMinutes && newShowEndMinutes >= existingEndMinutes)
        ) {
          hasConflict = true
          conflictShowtime = {
            movieTitle: movie.title,
            startAt: showtime.startAt
          }
          break
        }
      }
      
      if (hasConflict) {
        toast({
          variant: "destructive",
          title: "Xung đột lịch chiếu",
          description: `Suất chiếu xung đột với phim "${conflictShowtime.movieTitle}" lúc ${conflictShowtime.startAt}`,
        })
        return
      }
      
      // Chuẩn bị dữ liệu để gửi lên API
      const showtimeData = {
        movieId: Number(data.movieId),
        roomId: Number(data.roomId),
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        startAt: data.startAt
      }
      
      console.log("Dữ liệu gửi lên API:", showtimeData)
      
      // Gọi API để thêm suất chiếu mới
      const response = await showtimeApi.create(showtimeData)
      
      // Cập nhật state
      setShowtimes([...showtimes, response.data])
      
      toast({
        title: "Thêm suất chiếu thành công",
        description: "Suất chiếu mới đã được thêm vào hệ thống."
      })
      
      setShowAddDialog(false)
      form.reset()
      setConflictResult(null)
    } catch (error) {
      console.error('Lỗi thêm suất chiếu:', error)
      if (error.response && error.response.data) {
        console.error('Chi tiết lỗi:', error.response.data)
      }
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể thêm suất chiếu. Vui lòng thử lại sau."
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Cập nhật suất chiếu
  const handleEditShowtime = async (data) => {
    try {
      setSubmitting(true)
      
      // Kiểm tra xung đột một lần nữa trước khi cập nhật
      // Thực hiện kiểm tra nội bộ
      const startDate = data.startDate.toISOString().split('T')[0]
      const { startAt, roomId } = data
      
      // Chuyển thời gian từ chuỗi sang số phút
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + minutes
      }
      
      // Tính thời gian bắt đầu và kết thúc suất chiếu mới
      const newShowStartMinutes = timeToMinutes(startAt)
      const newShowEndMinutes = newShowStartMinutes + movieDuration
      
      // Lọc ra các suất chiếu trong cùng phòng, cùng ngày (trừ suất chiếu hiện tại)
      const showtimesInRoom = showtimes.filter(st => 
        st.roomId === roomId && 
        new Date(st.startDate).toISOString().split('T')[0] === startDate &&
        st.id !== selectedShowtime.id
      )
      
      // Kiểm tra xung đột với từng suất chiếu
      let hasConflict = false
      let conflictShowtime = null
      
      for (const showtime of showtimesInRoom) {
        const movie = movies.find(m => m.id === showtime.movieId)
        if (!movie) continue
        
        const existingStartMinutes = timeToMinutes(showtime.startAt)
        const existingEndMinutes = existingStartMinutes + movie.duration
        
        // Kiểm tra nếu có xung đột thời gian
        if (
          (newShowStartMinutes >= existingStartMinutes && newShowStartMinutes < existingEndMinutes) ||
          (newShowEndMinutes > existingStartMinutes && newShowEndMinutes <= existingEndMinutes) ||
          (newShowStartMinutes <= existingStartMinutes && newShowEndMinutes >= existingEndMinutes)
        ) {
          hasConflict = true
          conflictShowtime = {
            movieTitle: movie.title,
            startAt: showtime.startAt
          }
          break
        }
      }
      
      if (hasConflict) {
        toast({
          variant: "destructive",
          title: "Xung đột lịch chiếu",
          description: `Suất chiếu xung đột với phim "${conflictShowtime.movieTitle}" lúc ${conflictShowtime.startAt}`,
        })
        return
      }
      
      // Chuẩn bị dữ liệu để gửi lên API
      const showtimeData = {
        ...data,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
      }
      
      // Gọi API để cập nhật suất chiếu
      const response = await showtimeApi.update(selectedShowtime.id, showtimeData)
      
      // Cập nhật state
      const updatedShowtimes = showtimes.map(showtime => {
        if (showtime.id === selectedShowtime.id) {
          return response.data
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
      setConflictResult(null)
    } catch (error) {
      console.error('Lỗi cập nhật suất chiếu:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật suất chiếu. Vui lòng thử lại sau."
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Xóa suất chiếu
  const handleDeleteShowtime = async () => {
    try {
      setSubmitting(true)
      
      // Gọi API để xóa suất chiếu
      await showtimeApi.delete(selectedShowtime.id)
      
      // Cập nhật state
      const updatedShowtimes = showtimes.filter(showtime => showtime.id !== selectedShowtime.id)
      setShowtimes(updatedShowtimes)
      
      toast({
        title: "Xóa suất chiếu thành công",
        description: "Suất chiếu đã được xóa khỏi hệ thống."
      })
      
      setShowDeleteDialog(false)
      setSelectedShowtime(null)
    } catch (error) {
      console.error('Lỗi xóa suất chiếu:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa suất chiếu. Vui lòng thử lại sau."
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Chuẩn bị dữ liệu cho form chỉnh sửa
  const setupEditShowtime = (showtime) => {
    setSelectedShowtime(showtime)
    
    // Tìm phòng chiếu để lấy thông tin về rạp
    const room = rooms.find(r => r.id === showtime.roomId)
    
    if (room) {
      setSelectedCinemaId(room.cinemaId)
      // Lọc phòng theo rạp
      const roomsOfCinema = rooms.filter(r => r.cinemaId === room.cinemaId)
      setFilteredRooms(roomsOfCinema)
    }
    
    // Lấy thông tin phim để hiển thị thời lượng
    const movie = movies.find(m => m.id === showtime.movieId)
    if (movie) {
      setMovieDuration(movie.duration || 0)
    }
    
    form.reset({
      movieId: showtime.movieId,
      roomId: showtime.roomId,
      startDate: new Date(showtime.startDate),
      endDate: new Date(showtime.endDate),
      startAt: showtime.startAt,
    })
    
    setShowEditDialog(true)
  }
  
  // Helper để lấy thông tin phim từ movieId
  const getMovie = (movieId) => {
    return movies.find(m => m.id === movieId) || {}
  }
  
  // Helper để lấy thông tin phòng từ roomId
  const getRoom = (roomId) => {
    return rooms.find(r => r.id === roomId) || {}
  }
  
  // Helper để lấy thông tin rạp từ cinemaId
  const getCinema = (cinemaId) => {
    return cinemas.find(c => c.id === cinemaId) || {}
  }
  
  // Helper để lấy thông tin rạp từ roomId
  const getCinemaByRoomId = (roomId) => {
    const room = getRoom(roomId)
    return getCinema(room.cinemaId)
  }
  
  // Component hiển thị thông tin xung đột suất chiếu
  const ConflictAlert = ({ conflict }) => {
    if (!conflict) return null
    
    return (
      <Alert variant={conflict.hasConflict ? "destructive" : "success"} className="mt-4">
        {conflict.hasConflict ? (
          <>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Xung đột lịch chiếu!</AlertTitle>
            <AlertDescription>
              Suất chiếu này xung đột với phim "{conflict.conflictShowtime.movieTitle}" 
              lúc {conflict.conflictShowtime.startAt}.
            </AlertDescription>
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            <AlertTitle>Không có xung đột</AlertTitle>
            <AlertDescription>
              Bạn có thể thêm suất chiếu này.
            </AlertDescription>
          </>
        )}
      </Alert>
    )
  }
  
  // Component hiển thị dropdown chọn ngày
  const DatePickerField = ({ field, label, icon, onDateChange }) => {
    return (
      <FormItem className="flex flex-col">
        <FormLabel className="text-base">
          <span className="flex items-center">
            {icon}
            {label}
          </span>
        </FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                className={`w-full h-10 pl-3 text-left font-normal border border-input ${
                  field.value 
                    ? "bg-white text-foreground" 
                    : "text-muted-foreground bg-transparent"
                }`}
              >
                {field.value ? (
                  <span className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {format(field.value, "dd/MM/yyyy", { locale: vi })}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    Chọn ngày
                  </span>
                )} 
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-lg border" align="start">
            <div className="p-2 bg-primary/5 border-b">
              <div className="text-sm font-medium text-center">{label}</div>
            </div>
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={(date) => {
                field.onChange(date)
                if (onDateChange) onDateChange(date)
              }}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className="rounded-md border-0"
            />
            <div className="p-2 border-t flex justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const today = new Date()
                  field.onChange(today)
                  if (onDateChange) onDateChange(today)
                }}
                className="text-xs h-7"
              >
                Hôm nay
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  field.onChange(undefined)
                  if (onDateChange) onDateChange(undefined)
                }}
                className="text-xs h-7 text-destructive"
              >
                Xóa
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )
  }
  
  // Form suất chiếu chung cho cả thêm và sửa
  const ShowtimeForm = ({ onSubmit, isEditing }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Chọn phim */}
          <FormField
            control={form.control}
            name="movieId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">
                  <span className="flex items-center">
                    <Film className="h-4 w-4 mr-2" />
                    Phim
                  </span>
                </FormLabel>
                <Select 
                  value={String(field.value)} 
                  onValueChange={(value) => {
                    field.onChange(Number(value))
                    const selectedMovie = movies.find(m => m.id === Number(value))
                    if (selectedMovie) {
                      setMovieDuration(selectedMovie.duration || 0)
                      
                      // Tự động điền ngày kết thúc dựa trên ngày khởi chiếu của phim
                      if (selectedMovie.endDate) {
                        form.setValue('endDate', new Date(selectedMovie.endDate))
                      }
                    }
                    
                    // Kiểm tra xung đột khi thay đổi phim
                    checkShowtimeConflict()
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Chọn phim" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px]">
                    {movies.map((movie) => (
                      <SelectItem key={movie.id} value={String(movie.id)}>
                        <div className="flex items-center">
                          <span className="font-medium">{movie.title}</span>
                          <Badge className="ml-2" variant="outline">
                            {movie.duration} phút
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {movieDuration > 0 && (
                    <div className="text-xs flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      Thời lượng: {movieDuration} phút
                    </div>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Chọn rạp và phòng chiếu */}
          <div className="space-y-4">
            <FormItem>
              <FormLabel className="text-base">
                <span className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Rạp chiếu
                </span>
              </FormLabel>
              <Select 
                value={selectedCinemaId ? String(selectedCinemaId) : ""} 
                onValueChange={(value) => {
                  const cinemaId = Number(value)
                  setSelectedCinemaId(cinemaId)
                  form.setValue('roomId', 0)
                  
                  // Reset phòng khi thay đổi rạp
                  if (filteredRooms.length > 0) {
                    form.setValue('roomId', 0)
                  }
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chọn rạp chiếu" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {cinemas.map((cinema) => (
                    <SelectItem key={cinema.id} value={String(cinema.id)}>
                      <div className="flex items-center">
                        <span className="font-medium">{cinema.name}</span>
                        <Badge className="ml-2" variant="outline">
                          {cinema.city}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    <span className="flex items-center">
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Phòng chiếu
                    </span>
                  </FormLabel>
                  <Select 
                    value={field.value ? String(field.value) : ""} 
                    onValueChange={(value) => handleRoomChange(Number(value))}
                    disabled={!selectedCinemaId}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={selectedCinemaId ? "Chọn phòng chiếu" : "Vui lòng chọn rạp trước"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {filteredRooms.map((room) => (
                        <SelectItem key={room.id} value={String(room.id)}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <span className="font-medium">{room.name}</span>
                              <Badge className="ml-2" variant="outline">
                                {room.roomType}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {room.capacity} ghế
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Chọn ngày bắt đầu, kết thúc và giờ chiếu */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <DatePickerField 
                    field={field} 
                    label="Ngày bắt đầu" 
                    icon={<CalendarDays className="h-4 w-4 mr-2" />}
                    onDateChange={(date) => handleDateChange('startDate', date)}
                  />
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <DatePickerField 
                    field={field} 
                    label="Ngày kết thúc" 
                    icon={<CalendarRange className="h-4 w-4 mr-2" />}
                    onDateChange={(date) => handleDateChange('endDate', date)}
                  />
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    <span className="flex items-center">
                      <TimerIcon className="h-4 w-4 mr-2" />
                      Giờ chiếu
                    </span>
                  </FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={(value) => handleTimeChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Chọn giờ chiếu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:30">11:30</SelectItem>
                      <SelectItem value="13:00">13:00</SelectItem>
                      <SelectItem value="14:30">14:30</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="17:30">17:30</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                      <SelectItem value="20:30">20:30</SelectItem>
                      <SelectItem value="22:00">22:00</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Kết quả kiểm tra xung đột */}
          {conflictChecking ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span className="text-sm">Đang kiểm tra xung đột lịch chiếu...</span>
            </div>
          ) : (
            <ConflictAlert conflict={conflictResult} />
          )}
        </div>
      </form>
    </Form>
  )
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Quản lý suất chiếu
          </CardTitle>
          <Button
            onClick={() => {
              form.reset({
                movieId: 0,
                roomId: 0,
                startDate: new Date(),
                endDate: new Date(),
                startAt: '',
              })
              setSelectedCinemaId(0)
              setFilteredRooms([])
              setMovieDuration(0)
              setConflictResult(null)
              setShowAddDialog(true)
            }}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Thêm suất chiếu mới
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search và lọc */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên phim, rạp, phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            <Select 
              value={selectedCinemaId ? String(selectedCinemaId) : "all"} 
              onValueChange={(value) => setSelectedCinemaId(value === "all" ? 0 : Number(value))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Lọc theo rạp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả rạp</SelectItem>
                {cinemas.map((cinema) => (
                  <SelectItem key={`filter-${cinema.id}`} value={String(cinema.id)}>
                    {cinema.name} ({cinema.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedMovieId ? String(selectedMovieId) : "all"} 
              onValueChange={(value) => setSelectedMovieId(value === "all" ? 0 : Number(value))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Lọc theo phim" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phim</SelectItem>
                {movies.map((movie) => (
                  <SelectItem key={`filter-${movie.id}`} value={String(movie.id)}>
                    {movie.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="my-4" />
          
          {/* Bảng danh sách suất chiếu */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Đang tải danh sách suất chiếu...</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="p-0 font-bold hover:bg-transparent"
                              onClick={() => handleSort('movie')}
                            >
                              Phim
                              <ArrowUpDown className="h-4 w-4 ml-2" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sắp xếp theo tên phim</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="p-0 font-bold hover:bg-transparent"
                              onClick={() => handleSort('cinema')}
                            >
                              Rạp
                              <ArrowUpDown className="h-4 w-4 ml-2" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sắp xếp theo tên rạp</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="p-0 font-bold hover:bg-transparent"
                              onClick={() => handleSort('room')}
                            >
                              Phòng
                              <ArrowUpDown className="h-4 w-4 ml-2" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sắp xếp theo phòng</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="p-0 font-bold hover:bg-transparent"
                              onClick={() => handleSort('startDate')}
                            >
                              Ngày chiếu
                              <ArrowUpDown className="h-4 w-4 ml-2" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sắp xếp theo ngày chiếu</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="p-0 font-bold hover:bg-transparent"
                              onClick={() => handleSort('startAt')}
                            >
                              Giờ chiếu
                              <ArrowUpDown className="h-4 w-4 ml-2" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sắp xếp theo giờ chiếu</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShowtimes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-40">
                        <div className="flex flex-col items-center justify-center">
                          <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Không có suất chiếu nào</p>
                          <Button 
                            variant="link" 
                            onClick={() => {
                              setSearch('')
                              setSelectedCinemaId(0)
                              setSelectedMovieId(0)
                            }}
                            className="mt-2"
                          >
                            Xóa bộ lọc
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShowtimes.map((showtime) => {
                      const movie = getMovie(showtime.movieId)
                      const room = getRoom(showtime.roomId)
                      const cinema = getCinemaByRoomId(showtime.roomId)
                      
                      return (
                        <TableRow key={showtime.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {movie.image && (
                                <div className="relative w-10 h-14 overflow-hidden rounded-md border">
                                  <Image
                                    src={movie.image || '/images/default-movie.jpg'}
                                    alt={movie.title}
                                    width={40}
                                    height={56}
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{movie.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {movie.duration} phút
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{cinema.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {cinema.city}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-primary/5 border-primary/30">
                              {room.name} - {room.roomType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>
                                {formatDate(showtime.startDate)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                đến {formatDate(showtime.endDate)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="text-xs">
                              {showtime.startAt}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => setupEditShowtime(showtime)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Sửa suất chiếu</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => {
                                        setSelectedShowtime(showtime)
                                        setShowDeleteDialog(true)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xóa suất chiếu</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t py-3">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredShowtimes.length} / {showtimes.length} suất chiếu
          </div>
        </CardFooter>
      </Card>
      
      {/* Dialog thêm suất chiếu */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="!max-w-[600px] p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <div className="flex flex-col !max-h-[90vh]">
            <DialogHeader className="bg-gradient-to-r from-black to-gray-600 text-white">
              <div className="bg-gradient-to-r from-black to-gray-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Thêm suất chiếu mới
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      Nhập thông tin chi tiết về suất chiếu mới
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddDialog(false)}
                    className="rounded-full h-8 w-8 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6 max-h-[calc(80vh-140px)]">
              <ShowtimeForm onSubmit={handleAddShowtime} isEditing={false} />
            </ScrollArea>
            
            <div className="border-t p-4 mt-2 flex justify-end gap-2 bg-muted/20">
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
                className="min-w-[100px]"
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                className="min-w-[120px]"
                disabled={submitting || (conflictResult && conflictResult.hasConflict)}
                onClick={form.handleSubmit(handleAddShowtime)}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Thêm suất chiếu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog sửa suất chiếu */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="!max-w-[600px] p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <DialogHeader className="bg-gradient-to-r from-black to-gray-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center text-white">
                  <Pencil className="h-5 w-5 mr-2" />
                  Sửa thông tin suất chiếu
                </DialogTitle>
                <DialogDescription className="text-white/80 text-sm mt-1">
                  Cập nhật thông tin chi tiết về suất chiếu
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditDialog(false)}
                className="rounded-full h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-140px)]">
            <ShowtimeForm onSubmit={handleEditShowtime} isEditing={true} />
          </ScrollArea>
          
          <div className="border-t p-4 mt-2 flex justify-end gap-2 bg-muted/20">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              className="min-w-[100px]"
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              className="min-w-[120px]"
              disabled={submitting || (conflictResult && conflictResult.hasConflict)}
              onClick={form.handleSubmit(handleEditShowtime)}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Cập nhật
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog xóa suất chiếu */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <DialogHeader className="bg-red-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Xác nhận xóa suất chiếu
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(false)}
                className="rounded-full h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-6">
            <div className="flex items-start mb-6">
              <div className="mr-4 mt-0.5">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">
                  Bạn sắp xóa suất chiếu này
                </h3>
                <p className="text-muted-foreground text-sm">
                  Hành động này sẽ xóa vĩnh viễn suất chiếu khỏi hệ thống và không thể hoàn tác.
                  Bạn có chắc chắn muốn tiếp tục?
                </p>
              </div>
            </div>
            
            {selectedShowtime && (
              <div className="mb-6 p-3 bg-muted/20 rounded-lg border border-muted">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Phim:</span>
                    <span className="font-medium">
                      {getMovie(selectedShowtime.movieId).title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Rạp chiếu:</span>
                    <span>
                      {getCinemaByRoomId(selectedShowtime.roomId).name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Phòng:</span>
                    <span>
                      {getRoom(selectedShowtime.roomId).name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Ngày chiếu:</span>
                    <span>{formatDate(selectedShowtime.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Giờ chiếu:</span>
                    <Badge>
                      {selectedShowtime.startAt}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
  
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="min-w-[100px]"
              >
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteShowtime}
                disabled={submitting}
                className="min-w-[100px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Xóa suất chiếu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}