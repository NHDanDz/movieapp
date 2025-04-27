"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { movieApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { 
  Film, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  X,
  Loader2,
  ImagePlus,
  Clock,
  VideoIcon,
  User,
  Users,
  Tag,
  Upload,
  Check,
  Info
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge'
import { Checkbox } from "@/components/ui/checkbox"
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
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Danh sách thể loại phim
const movieGenres = [
  "Hành động", "Phiêu lưu", "Hoạt hình", "Hài kịch", "Tội phạm", 
  "Tài liệu", "Chính kịch", "Gia đình", "Giả tưởng", "Lịch sử", 
  "Kinh dị", "Âm nhạc", "Bí ẩn", "Lãng mạn", "Khoa học viễn tưởng", 
  "Ly kỳ", "Chiến tranh"
];

// Danh sách ngôn ngữ phim
const movieLanguages = [
  "Tiếng Việt", "Tiếng Anh", "Tiếng Hàn", "Tiếng Nhật", "Tiếng Trung", 
  "Tiếng Pháp", "Tiếng Đức", "Tiếng Tây Ban Nha", "Tiếng Ý", "Tiếng Nga"
];

// Form schema cho phim
const movieSchema = z.object({
  title: z.string().min(1, 'Tiêu đề phim là bắt buộc'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  director: z.string().min(1, 'Đạo diễn là bắt buộc'),
  cast: z.string().min(1, 'Diễn viên là bắt buộc'),
  genre: z.string().min(1, 'Vui lòng chọn ít nhất một thể loại'),
  duration: z.coerce.number().min(1, 'Thời lượng phim là bắt buộc'),
  language: z.string().min(1, 'Ngôn ngữ là bắt buộc'),
  releaseDate: z.date({
    required_error: "Ngày khởi chiếu là bắt buộc",
  }),
  endDate: z.date({
    required_error: "Ngày kết thúc là bắt buộc",
  }),
  image: z.string().optional(),
})

// Hàm lấy hình ảnh phim với xử lý domain chưa được cấu hình
const getMovieImage = (movie) => {
  if (!movie || !movie.image) return '/images/default-movie.jpg';
  
  // Xử lý URL từ domain chưa được cấu hình
  if (movie.image.includes('example.com')) {
    return '/images/default-movie.jpg';
  }
  
  return movie.image;
}

export default function AdminMovieManagement() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [sortField, setSortField] = useState('releaseDate')
  const [filteredMovies, setFilteredMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [showEditDrawer, setShowEditDrawer] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [activeGenreFilter, setActiveGenreFilter] = useState('')
  
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
      duration: 90,
      language: '',
      releaseDate: undefined,
      endDate: undefined,
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
    
    // Lọc theo thể loại
    if (activeGenreFilter) {
      result = result.filter(movie => 
        movie.genre?.split(',').map(g => g.trim()).includes(activeGenreFilter)
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
  }, [movies, search, sortField, sortOrder, activeGenreFilter])
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  // Lấy danh sách thể loại phim đã sử dụng
  const getUsedGenres = () => {
    const allGenres = new Set()
    movies.forEach(movie => {
      if (movie.genre) {
        movie.genre.split(',').map(g => g.trim()).forEach(g => {
          if (g) allGenres.add(g)
        })
      }
    })
    return Array.from(allGenres).sort()
  }
  
  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setImageFile(file)
    setShowImagePreview(true) // Thêm dòng này

    // Create image preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }
// Sửa lại hàm handleUploadImage trong component phim
const handleUploadImage = async (movieId) => {
  if (!imageFile) return null;
  
  try {
    setSubmitting(true);
    console.log('Uploading image for movie ID:', movieId);
    
    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Log để kiểm tra formData
    console.log('FormData created with file:', imageFile.name);
    
    // Đảm bảo movieId là string
    const id = String(movieId);
    
    // Gọi API upload ảnh
    const response = await movieApi.uploadPhoto(id, formData);
    
    if (response.data && response.data.movie) {
      console.log('Upload successful, new image path:', response.data.movie.image);
      // Trả về đường dẫn ảnh mới
      return response.data.movie.image;
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi tải ảnh:', error);
    toast({
      variant: "destructive",
      title: "Lỗi",
      description: "Không thể tải ảnh lên. Vui lòng thử lại sau.",
    });
    return null;
  }
};
  // Add movie
  const handleAddMovie = async (data) => {
    try {
      setSubmitting(true);
      
      // Chuẩn bị dữ liệu để gửi lên API
      const movieData = {
        ...data,
        releaseDate: data.releaseDate.toISOString(),
        endDate: data.endDate.toISOString(),
      };
      
      // Gọi API để thêm phim mới
      const response = await movieApi.create(movieData);
      
      // Nếu có file ảnh, upload sau khi tạo phim thành công
      if (imageFile && response.data && response.data.id) {
        const imageUrl = await handleUploadImage(response.data.id);
        
        // Nếu upload ảnh thành công, cập nhật thông tin phim
        if (imageUrl) {
          await movieApi.update(response.data.id, { image: imageUrl });
          response.data.image = imageUrl;
        }
      }
      
      // Cập nhật state
      setMovies([...movies, response.data]);
      
      toast({
        title: "Thêm phim thành công",
        description: `Phim "${data.title}" đã được thêm vào hệ thống.`
      });
      
      setShowAddDrawer(false);
      form.reset();
      setImagePreview('');
      setImageFile(null);
      setShowImagePreview(false);
    } catch (error) {
      console.error('Error adding movie:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm phim. Vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Edit movie
  const handleEditMovie = async (data) => {
    try {
      setSubmitting(true);
      
      // Nếu có file ảnh mới, upload trước
      let imageUrl = null;
      if (imageFile && selectedMovie) {
        imageUrl = await handleUploadImage(selectedMovie.id);
      }
      
      // Chuẩn bị dữ liệu để gửi lên API
      const movieData = {
        ...data,
        releaseDate: data.releaseDate.toISOString(),
        endDate: data.endDate.toISOString(),
      };
      
      // Nếu có ảnh mới đã upload thành công, cập nhật URL ảnh
      if (imageUrl) {
        movieData.image = imageUrl;
      }
      
      // Gọi API để cập nhật thông tin phim
      const response = await movieApi.update(selectedMovie.id, movieData);
      
      // Cập nhật state sau khi API thành công
      const updatedMovies = movies.map(movie => {
        if (movie.id === selectedMovie.id) {
          return response.data;
        }
        return movie;
      });
      
      setMovies(updatedMovies);
      
      toast({
        title: "Cập nhật phim thành công",
        description: `Phim "${data.title}" đã được cập nhật.`
      });
      
      setShowEditDrawer(false);
      setSelectedMovie(null);
      setImagePreview('');
      setImageFile(null);
      setShowImagePreview(false);
    } catch (error) {
      console.error('Error updating movie:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật phim. Vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete movie
  const handleDeleteMovie = async () => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to delete movie
      // await movieApi.delete(selectedMovie.id)
      
      // Mô phỏng xóa phim
      const updatedMovies = movies.filter(movie => movie.id !== selectedMovie.id)
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
    setImagePreview('')
    setShowImagePreview(movie.image ? true : false) // Thêm dòng này
    form.reset({
      title: movie.title || '',
      description: movie.description || '',
      director: movie.director || '',
      cast: movie.cast || '',
      genre: movie.genre || '',
      duration: movie.duration || 90,
      language: movie.language || '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate) : undefined,
      endDate: movie.endDate ? new Date(movie.endDate) : undefined,
      image: movie.image || ''
    })
    
    // Hiệu ứng nhấp nháy thông báo trước khi mở form
    toast({
      description: (
        <div className="flex items-center">
          <Pencil className="mr-2 h-4 w-4 text-blue-500" /> 
          Đang mở thông tin phim <span className="font-medium ml-1">{movie.title}</span>
        </div>
      ),
      duration: 1000,
    })
    
    setTimeout(() => {
      setShowEditDrawer(true)
    }, 300)
  }
  
  // Component render các thẻ thể loại
  const GenreFilter = () => {
    const usedGenres = getUsedGenres()
    
    return (
      <div className="flex flex-wrap gap-2 my-4">
        <Badge 
          key="all-genres"
          variant={activeGenreFilter === '' ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 transition-colors" 
          onClick={() => setActiveGenreFilter('')}
        >
          Tất cả
        </Badge>
        
        {usedGenres.map(genre => (
          <Badge 
            key={`filter-${genre}`}
            variant={activeGenreFilter === genre ? "default" : "outline"} 
            className="cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={() => setActiveGenreFilter(activeGenreFilter === genre ? '' : genre)}
          >
            {genre}
          </Badge>
        ))}
      </div>
    )
  }
  
  // Component form thể loại
  const GenreSelector = ({ field }) => {
    const selectedGenres = field.value ? field.value.split(',').map(g => g.trim()).filter(Boolean) : []
    
    const handleRemoveGenre = (genre) => {
      const newGenres = selectedGenres.filter(g => g !== genre)
      field.onChange(newGenres.join(','))
    }
    
    const handleAddGenre = (genre, checked) => {
      if (checked) {
        if (!selectedGenres.includes(genre)) {
          field.onChange([...selectedGenres, genre].join(','))
        }
      } else {
        handleRemoveGenre(genre)
      }
    }
    
    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="mb-2 font-medium text-sm flex items-center justify-between">
          <span className="flex items-center">
            <Tag className="h-3.5 w-3.5 mr-1 text-primary" />
            Chọn thể loại:
          </span>
          <span className="text-xs text-muted-foreground flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {selectedGenres.length} thể loại đã chọn
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {selectedGenres.length > 0 && selectedGenres.map(genre => (
            <Badge 
              key={`selected-${genre}`}
              variant="outline" 
              className="group text-xs py-1 flex items-center justify-between pl-2 pr-1 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <span className="truncate">{genre}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full ml-1 hover:bg-white hover:text-destructive"
                onClick={() => handleRemoveGenre(genre)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <Separator className="my-2" />
        <div className="mt-2">
          <ScrollArea className="h-[120px] pr-3">
            <div className="grid grid-cols-2 gap-2">
              {movieGenres.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <div 
                    key={`genre-option-${genre}`}
                    className={`flex items-center space-x-2 p-1.5 rounded-md cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                    onClick={() => handleAddGenre(genre, !isSelected)}
                  >
                    <Checkbox
                      id={`genre-${genre}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleAddGenre(genre, checked)}
                      className={isSelected ? 'border-primary text-primary' : ''}
                    />
                    <label 
                      htmlFor={`genre-${genre}`}
                      className={`text-sm leading-none cursor-pointer ${isSelected ? 'font-medium' : ''}`}
                    >
                      {genre}
                    </label> 
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }
  
  // Date picker component
  const DatePickerField = ({ field, label, icon }) => {
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
              onSelect={field.onChange}
              initialFocus
              className="rounded-md border-0"
            />
            <div className="p-2 border-t flex justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => field.onChange(new Date())}
                className="text-xs h-7"
              >
                Hôm nay
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => field.onChange(undefined)}
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
  
  // Component movie form chung cho cả thêm và sửa
  const MovieForm = ({ onSubmit, modalTitle, submitText }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-1">
            {/* Cột trái - thông tin cơ bản */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      <span className="flex items-center">
                        <VideoIcon className="h-4 w-4 mr-2" />
                        Tên phim
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên phim" className="h-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="director"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Đạo diễn
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Tên đạo diễn" className="h-10" {...field} />
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
                      <FormLabel className="text-base ">Ngôn ngữ</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10 ">
                            <SelectValue  placeholder="Chọn ngôn ngữ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className = 'bg-gray-100'>
                          {movieLanguages.map(lang => (
                            <SelectItem key={`lang-${lang}`} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="cast"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Diễn viên
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Danh sách diễn viên" className="h-10" {...field} />
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
                      <FormLabel className="text-base">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Thời lượng (phút)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="releaseDate"
                  render={({ field }) => (
                    <DatePickerField 
                      field={field} 
                      label="Ngày khởi chiếu" 
                      icon={<CalendarIcon className="h-4 w-4 mr-2" />}
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
                      icon={<CalendarIcon className="h-4 w-4 mr-2" />}
                    />
                  )}
                />
              </div>
            </div>
            
            {/* Cột phải - thông tin mở rộng */}
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Mô tả</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Nhập mô tả phim" 
                        className="min-h-[140px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Thể loại phim
                      </span>
                    </FormLabel>
                    <FormControl>
                      <GenreSelector field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel className="text-base">
                  <span className="flex items-center">
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Ảnh phim
                  </span>
                </FormLabel>
                <div className="border rounded-lg p-4 space-y-4 bg-white">
                {!(imagePreview || (showImagePreview && selectedMovie?.image)) ? (
                    <div className="flex items-center justify-center border-2 border-dashed rounded-md py-6 px-2 border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <label htmlFor="movie-image" className="cursor-pointer flex flex-col items-center justify-center w-full">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Kéo thả hoặc nhấp để tải ảnh lên</span>
                        <span className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG 
                        JPG, PNG, GIF tối đa 5MB</span>
                        <Button variant="outline" className="mt-3 h-8 text-xs gap-1">
                          <ImagePlus className="h-3.5 w-3.5" />
                          Chọn ảnh
                        </Button>
                        <Input 
                          type="file" 
                          id="movie-image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative rounded-md overflow-hidden border">
                      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center justify-between px-3">
                        <span className="text-white text-xs font-medium truncate">
                          {imageFile ? imageFile.name : 'Ảnh đại diện phim'}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/40 text-white"
                            onClick={() => {
                              // Mở input file
                              document.getElementById('movie-image').click();
                            }}
                          >
                            <ImagePlus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/40 text-white"
                            onClick={() => {
                              setImagePreview('');
                              setImageFile(null);
                              setShowImagePreview(false); // Thêm dòng này
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="w-full aspect-video">
                        <Image
                          src={imagePreview || (selectedMovie ? getMovieImage(selectedMovie) : '')}
                          alt="Preview"
                          width={400}
                          height={240}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <Input 
                        type="file" 
                        id="movie-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </FormItem>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Film className="h-6 w-6 mr-2" />
            Quản lý phim
          </CardTitle>
          <Button
            onClick={() => {
              form.reset({
                title: '',
                description: '',
                director: '',
                cast: '',
                genre: '',
                duration: 90,
                language: '',
                releaseDate: undefined,
                endDate: undefined,
                image: ''
              })
              setImagePreview('')
              setImageFile(null)
              setShowAddDrawer(true)
            }}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Thêm phim mới
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search và lọc */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, đạo diễn hoặc thể loại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>
          
          {/* Bộ lọc thể loại */}
          <GenreFilter />
          
          <Separator className="my-4" />
          
          {/* Bảng danh sách phim */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Đang tải danh sách phim...</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[80px]">Ảnh</TableHead>
                    <TableHead>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="p-0 font-bold hover:bg-transparent"
                              onClick={() => handleSort('title')}
                            >
                              Tên phim
                              <ArrowUpDown className="h-4 w-4 ml-2" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sắp xếp theo tên phim</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead>Thể loại</TableHead>
                    <TableHead>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="p-0 font-bold hover:bg-transparent"
                              onClick={() => handleSort('duration')}
                            >
                              Thời lượng
                              <ArrowUpDown className="h-4 w-4 ml-2" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sắp xếp theo thời lượng</p>
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
                              onClick={() => handleSort('releaseDate')}
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
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-40">
                        <div className="flex flex-col items-center justify-center">
                          <Film className="h-10 w-10 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Không có phim nào</p>
                          <Button 
                            variant="link" 
                            onClick={() => {
                              setSearch('')
                              setActiveGenreFilter('')
                            }}
                            className="mt-2"
                          >
                            Xóa bộ lọc
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMovies.map((movie) => (
                      <TableRow key={movie.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="relative w-12 h-16 overflow-hidden rounded-md border">
                             <Image
                              src={getMovieImage(movie)}
                              alt={movie.title}
                              width={48}
                              height={64}
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{movie.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {movie.genre && movie.genre.split(',').map((g, idx) => (
                              <Badge key={`${movie.id}-genre-${idx}`} variant="outline" className="text-xs">
                                {g.trim()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{movie.duration} phút</TableCell>
                        <TableCell>{formatDate(movie.releaseDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setupEditMovie(movie)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Sửa phim</p>
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
                                      setSelectedMovie(movie)
                                      setShowDeleteDialog(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xóa phim</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t py-3">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredMovies.length} / {movies.length} phim
          </div>
        </CardFooter>
      </Card>
      
      {/* Modal thêm phim */}
      <Dialog open={showAddDrawer} onOpenChange={setShowAddDrawer}>
        <DialogContent className="!max-w-[900px] p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
           <div className="flex flex-col !max-h-[90vh]">
           <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 text-white">

          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 text-white">
           <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Thêm phim mới
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Nhập thông tin chi tiết về phim mới để thêm vào hệ thống
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddDrawer(false)}
                  className="rounded-full h-8 w-8 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6 max-h-[calc(80vh-140px)]">
              <MovieForm 
                onSubmit={handleAddMovie} 
                modalTitle="Thêm phim mới" 
                submitText="Thêm phim" 
              />
            </ScrollArea>
            
            <div className="border-t p-4 mt-2 flex justify-end gap-2 bg-muted/20">
              <Button 
                variant="outline" 
                onClick={() => setShowAddDrawer(false)}
                className="min-w-[100px]"
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                className="min-w-[120px]"
                disabled={submitting}
                onClick={form.handleSubmit(handleAddMovie)}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Thêm phim
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal sửa phim */}
      <Dialog open={showEditDrawer} onOpenChange={setShowEditDrawer}>
        <DialogContent className="!max-w-[900px] p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <DialogHeader className="bg-gradient-to-r from-black to-gray-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center text-white">
                  <Pencil className="h-5 w-5 mr-2" />
                  Sửa thông tin phim
                </DialogTitle>
                <DialogDescription className="text-white/80 text-sm mt-1">
                  Cập nhật thông tin chi tiết về phim
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditDrawer(false)}
                className="rounded-full h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
            <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-140px)]">
              <MovieForm 
                onSubmit={handleEditMovie} 
                modalTitle="Sửa thông tin phim" 
                submitText="Cập nhật" 
              />
            </ScrollArea>
            
            <div className="border-t p-4 mt-2 flex justify-end gap-2 bg-muted/20">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDrawer(false)}
                className="min-w-[100px]"
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                className="min-w-[120px]"
                disabled={submitting}
                onClick={form.handleSubmit(handleEditMovie)}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Cập nhật
              </Button>
            </div> 
        </DialogContent>
      </Dialog>
      
      {/* Modal xóa phim */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
        <DialogHeader className="bg-red-500 px-6 py-4 text-white">

          <div className="bg-red-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Xác nhận xóa phim
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
                  Bạn sắp xóa phim "{selectedMovie?.title}"
                </h3>
                <p className="text-muted-foreground text-sm">
                  Hành động này sẽ xóa vĩnh viễn phim khỏi hệ thống và không thể hoàn tác.
                  Bạn có chắc chắn muốn tiếp tục?
                </p>
              </div>
            </div>
            
            {selectedMovie?.image && (
              <div className="mb-6 p-3 bg-muted/20 rounded-lg border border-muted">
                <div className="flex items-center">
                  <div className="relative w-14 h-20 overflow-hidden rounded-md border mr-3">
                    <Image
                      src={getMovieImage(selectedMovie)}
                      alt={selectedMovie.title}
                      width={56}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedMovie?.title}</h4>
                    <p className="text-sm">
                      {selectedMovie?.director && `Đạo diễn: ${selectedMovie.director}`}
                    </p>
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
                onClick={handleDeleteMovie}
                disabled={submitting}
                className="min-w-[100px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Xóa phim
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}