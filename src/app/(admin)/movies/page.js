import React, { useState, useEffect } from 'react'
import { 
  Film, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Calendar, 
  Clock, 
  Loader2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const movieSchema = z.object({
  title: z.string().min(1, "Tên phim là bắt buộc"),
  genre: z.string().min(1, "Thể loại là bắt buộc"),
  language: z.string().min(1, "Ngôn ngữ là bắt buộc"),
  director: z.string().min(1, "Đạo diễn là bắt buộc"),
  cast: z.string().min(1, "Diễn viên là bắt buộc"),
  duration: z.string().min(1, "Thời lượng là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  releaseDate: z.string().min(1, "Ngày khởi chiếu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc")
})

// Hàm định dạng ngày tháng từ chuỗi ISO
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  })
}

const AdminMovieManagement = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  // Form cho thêm/sửa phim
  const form = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "",
      genre: "",
      language: "",
      director: "",
      cast: "",
      duration: "",
      description: "",
      releaseDate: "",
      endDate: ""
    }
  })

  // Tải danh sách phim
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      try {
        // Mô phỏng việc tải danh sách phim
        setTimeout(() => {
          setMovies([
            {
              _id: '1',
              title: 'Venom 3',
              image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
              genre: 'Hành động, Khoa học viễn tưởng',
              language: 'Tiếng Anh',
              director: 'Kelly Marcel',
              cast: 'Tom Hardy, Juno Temple, Chiwetel Ejiofor',
              duration: 120,
              description: 'Eddie Brock và Venom trở lại trong phần ba của loạt phim.',
              releaseDate: '2025-04-01',
              endDate: '2025-05-30'
            },
            {
              _id: '2',
              title: 'Joker: Folie à Deux',
              image: 'https://images.unsplash.com/photo-1601513445506-2ab0d4fb4229',
              genre: 'Tội phạm, Tâm lý, Âm nhạc',
              language: 'Tiếng Anh',
              director: 'Todd Phillips',
              cast: 'Joaquin Phoenix, Lady Gaga, Zazie Beetz',
              duration: 138,
              description: 'Phần tiếp theo của bộ phim nổi tiếng Joker (2019).',
              releaseDate: '2025-04-05',
              endDate: '2025-06-10'
            },
            {
              _id: '3',
              title: 'Inside Out 2',
              image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
              genre: 'Hoạt hình, Hài hước, Gia đình',
              language: 'Tiếng Anh',
              director: 'Kelsey Mann',
              cast: 'Amy Poehler, Phyllis Smith, Lewis Black',
              duration: 107,
              description: 'Phần tiếp theo của Inside Out, khám phá thêm về cảm xúc con người.',
              releaseDate: '2025-03-15',
              endDate: '2025-05-15'
            },
            {
              _id: '4',
              title: 'The Marvels',
              image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
              genre: 'Hành động, Siêu anh hùng, Khoa học viễn tưởng',
              language: 'Tiếng Anh',
              director: 'Nia DaCosta',
              cast: 'Brie Larson, Teyonah Parris, Iman Vellani',
              duration: 105,
              description: 'Carol Danvers, Monica Rambeau, và Kamala Khan hợp tác trong một cuộc phiêu lưu vũ trụ mới.',
              releaseDate: '2025-03-01',
              endDate: '2025-04-30'
            },
            {
              _id: '5',
              title: 'Kung Fu Panda 4',
              image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434',
              genre: 'Hoạt hình, Võ thuật, Hài hước',
              language: 'Tiếng Anh',
              director: 'Mike Mitchell',
              cast: 'Jack Black, Awkwafina, Viola Davis',
              duration: 94,
              description: 'Po phải đối mặt với một kẻ thù mới trong cuộc phiêu lưu lần này.',
              releaseDate: '2025-04-10',
              endDate: '2025-06-15'
            }
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Lỗi khi tải danh sách phim:', error)
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Mở dialog thêm phim
  const handleOpenAddDialog = () => {
    form.reset()
    setPreviewImage(null)
    setOpenAddDialog(true)
  }

  // Mở dialog sửa phim
  const handleOpenEditDialog = (movie) => {
    setSelectedMovie(movie)
    form.reset({
      title: movie.title,
      genre: movie.genre,
      language: movie.language,
      director: movie.director,
      cast: movie.cast,
      duration: movie.duration.toString(),
      description: movie.description,
      releaseDate: movie.releaseDate,
      endDate: movie.endDate
    })
    setPreviewImage(movie.image)
    setOpenEditDialog(true)
  }

  // Mở dialog xóa phim
  const handleOpenDeleteDialog = (movie) => {
    setSelectedMovie(movie)
    setOpenDeleteDialog(true)
  }

  // Xử lý thêm phim
  const handleAddMovie = (data) => {
    console.log('Thêm phim mới:', data)
    // Trong thực tế, sẽ gọi API để thêm phim
    const newMovie = {
      _id: Date.now().toString(),
      ...data,
      image: previewImage || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b',
      duration: parseInt(data.duration)
    }
    
    setMovies([...movies, newMovie])
    setOpenAddDialog(false)
    form.reset()
  }

  // Xử lý sửa phim
  const handleEditMovie = (data) => {
    console.log('Cập nhật phim:', data)
    // Trong thực tế, sẽ gọi API để cập nhật phim
    const updatedMovies = movies.map(movie => {
      if (movie._id === selectedMovie._id) {
        return {
          ...movie,
          ...data,
          image: previewImage || movie.image,
          duration: parseInt(data.duration)
        }
      }
      return movie
    })
    
    setMovies(updatedMovies)
    setOpenEditDialog(false)
    setSelectedMovie(null)
  }

  // Xử lý xóa phim
  const handleDeleteMovie = () => {
    console.log('Xóa phim:', selectedMovie)
    // Trong thực tế, sẽ gọi API để xóa phim
    const updatedMovies = movies.filter(movie => movie._id !== selectedMovie._id)
    
    setMovies(updatedMovies)
    setOpenDeleteDialog(false)
    setSelectedMovie(null)
  }

  // Xử lý tải lên hình ảnh
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)

    // Mô phỏng việc tải lên hình ảnh
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result)
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  // Lọc phim theo từ khóa tìm kiếm
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(search.toLowerCase()) ||
    movie.director.toLowerCase().includes(search.toLowerCase()) ||
    movie.genre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Quản lý phim</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm phim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button onClick={handleOpenAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm phim
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-16">
          <Film className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">Không tìm thấy phim nào phù hợp</p>
          {search && (
            <Button variant="outline" onClick={() => setSearch('')}>
              Xóa tìm kiếm
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard 
              key={movie._id} 
              movie={movie} 
              onEdit={() => handleOpenEditDialog(movie)}
              onDelete={() => handleOpenDeleteDialog(movie)}
            />
          ))}
        </div>
      )}

      {/* Dialog thêm phim */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thêm phim mới</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddMovie)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
                  {/* Phần tải lên hình ảnh */}
                  <div className="w-full md:w-1/3">
                    <div className="relative aspect-[2/3] w-full mb-4 bg-gray-800 rounded-md overflow-hidden">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Film className="h-12 w-12" />
                        </div>
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('uploadImage').click()}
                      >
                        Tải lên ảnh
                      </Button>
                      <input
                        id="uploadImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  {/* Phần thông tin cơ bản */}
                  <div className="w-full md:w-2/3 space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên phim</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nhập tên phim" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="genre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thể loại</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="VD: Hành động, Viễn tưởng" />
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn ngôn ngữ" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Tiếng Anh">Tiếng Anh</SelectItem>
                                  <SelectItem value="Tiếng Việt">Tiếng Việt</SelectItem>
                                  <SelectItem value="Tiếng Hàn">Tiếng Hàn</SelectItem>
                                  <SelectItem value="Tiếng Trung">Tiếng Trung</SelectItem>
                                  <SelectItem value="Tiếng Nhật">Tiếng Nhật</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thời lượng (phút)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" placeholder="VD: 120" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="releaseDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ngày khởi chiếu</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
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
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="director"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đạo diễn</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nhập tên đạo diễn" />
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
                        <Input {...field} placeholder="VD: Tom Hanks, Emma Stone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Nhập mô tả phim"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  Thêm phim
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog sửa phim */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phim</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditMovie)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
                  {/* Phần tải lên hình ảnh */}
                  <div className="w-full md:w-1/3">
                    <div className="relative aspect-[2/3] w-full mb-4 bg-gray-800 rounded-md overflow-hidden">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Film className="h-12 w-12" />
                        </div>
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('editImage').click()}
                      >
                        Cập nhật ảnh
                      </Button>
                      <input
                        id="editImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  {/* Phần thông tin cơ bản */}
                  <div className="w-full md:w-2/3 space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên phim</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nhập tên phim" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="genre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thể loại</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="VD: Hành động, Viễn tưởng" />
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
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn ngôn ngữ" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Tiếng Anh">Tiếng Anh</SelectItem>
                                  <SelectItem value="Tiếng Việt">Tiếng Việt</SelectItem>
                                  <SelectItem value="Tiếng Hàn">Tiếng Hàn</SelectItem>
                                  <SelectItem value="Tiếng Trung">Tiếng Trung</SelectItem>
                                  <SelectItem value="Tiếng Nhật">Tiếng Nhật</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thời lượng (phút)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" placeholder="VD: 120" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="releaseDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ngày khởi chiếu</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
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
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="director"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đạo diễn</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nhập tên đạo diễn" />
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
                        <Input {...field} placeholder="VD: Tom Hanks, Emma Stone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Nhập mô tả phim"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa phim */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa phim</DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <p>Bạn có chắc chắn muốn xóa phim "<span className="font-semibold">{selectedMovie?.title}</span>"?</p>
            <p className="text-gray-400 mt-2">Hành động này không thể hoàn tác.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteMovie}>
              Xóa phim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const MovieCard = ({ movie, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden bg-background border-gray-800 h-full">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img 
          src={movie.image} 
          alt={movie.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-70"></div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{movie.title}</h3>
        
        <div className="space-y-1 text-sm text-gray-400 mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{movie.duration} phút</span>
          </div>
          <div className="flex items-start">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
            <span>
              {formatDate(movie.releaseDate)} - {formatDate(movie.endDate)}
            </span>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm line-clamp-3 mb-4">{movie.description}</p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onEdit}>
          <Edit2 className="h-4 w-4 mr-2" />
          Sửa
        </Button>
        <Button variant="destructive" className="flex-1" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AdminMovieManagement