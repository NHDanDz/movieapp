import React, { useState, useEffect } from 'react'
import { 
  Home, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  CreditCard, 
  Users, 
  Loader2,
  Grid3X3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

const cinemaSchema = z.object({
  name: z.string().min(1, "Tên rạp là bắt buộc"),
  city: z.string().min(1, "Thành phố là bắt buộc"),
  ticketPrice: z.string().min(1, "Giá vé là bắt buộc"),
  seatsAvailable: z.string().min(1, "Số ghế là bắt buộc"),
  rows: z.string().min(1, "Số hàng ghế là bắt buộc"),
  seatsPerRow: z.string().min(1, "Số ghế mỗi hàng là bắt buộc")
})

const AdminCinemaManagement = () => {
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openSeatsDialog, setOpenSeatsDialog] = useState(false)
  const [selectedCinema, setSelectedCinema] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [seats, setSeats] = useState([])

  // Form cho thêm/sửa rạp
  const form = useForm({
    resolver: zodResolver(cinemaSchema),
    defaultValues: {
      name: "",
      city: "",
      ticketPrice: "",
      seatsAvailable: "",
      rows: "10",
      seatsPerRow: "8"
    }
  })

  // Tải danh sách rạp
  useEffect(() => {
    const fetchCinemas = async () => {
      setLoading(true)
      try {
        // Mô phỏng việc tải danh sách rạp
        setTimeout(() => {
          setCinemas([
            {
              _id: '1',
              name: 'Cinema+ Hà Nội',
              image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
              city: 'Hà Nội',
              ticketPrice: 120000,
              seatsAvailable: 160,
              seats: Array(10).fill().map(() => Array(8).fill(0)) // 10 hàng, 8 ghế mỗi hàng
            },
            {
              _id: '2',
              name: 'Cinema+ Hồ Chí Minh',
              image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
              city: 'Hồ Chí Minh',
              ticketPrice: 120000,
              seatsAvailable: 200,
              seats: Array(10).fill().map(() => Array(10).fill(0)) // 10 hàng, 10 ghế mỗi hàng
            },
            {
              _id: '3',
              name: 'Cinema+ Đà Nẵng',
              image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
              city: 'Đà Nẵng',
              ticketPrice: 100000,
              seatsAvailable: 120,
              seats: Array(8).fill().map(() => Array(8).fill(0)) // 8 hàng, 8 ghế mỗi hàng
            },
            {
              _id: '4',
              name: 'Cinema+ Nha Trang',
              image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87',
              city: 'Khánh Hòa',
              ticketPrice: 100000,
              seatsAvailable: 140,
              seats: Array(10).fill().map(() => Array(7).fill(0)) // 10 hàng, 7 ghế mỗi hàng
            },
            {
              _id: '5',
              name: 'Cinema+ Cần Thơ',
              image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
              city: 'Cần Thơ',
              ticketPrice: 90000,
              seatsAvailable: 100,
              seats: Array(10).fill().map(() => Array(5).fill(0)) // 10 hàng, 5 ghế mỗi hàng
            }
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Lỗi khi tải danh sách rạp chiếu:', error)
        setLoading(false)
      }
    }

    fetchCinemas()
  }, [])

  // Mở dialog thêm rạp
  const handleOpenAddDialog = () => {
    form.reset()
    setPreviewImage(null)
    setOpenAddDialog(true)
  }

  // Mở dialog sửa rạp
  const handleOpenEditDialog = (cinema) => {
    setSelectedCinema(cinema)
    form.reset({
      name: cinema.name,
      city: cinema.city,
      ticketPrice: cinema.ticketPrice.toString(),
      seatsAvailable: cinema.seatsAvailable.toString(),
      rows: cinema.seats.length.toString(),
      seatsPerRow: (cinema.seats[0] ? cinema.seats[0].length : 0).toString()
    })
    setPreviewImage(cinema.image)
    setOpenEditDialog(true)
  }

  // Mở dialog xóa rạp
  const handleOpenDeleteDialog = (cinema) => {
    setSelectedCinema(cinema)
    setOpenDeleteDialog(true)
  }

  // Mở dialog quản lý ghế
  const handleOpenSeatsDialog = (cinema) => {
    setSelectedCinema(cinema)
    setSeats([...cinema.seats])
    setOpenSeatsDialog(true)
  }

  // Xử lý thêm rạp
  const handleAddCinema = (data) => {
    console.log('Thêm rạp mới:', data)
    // Trong thực tế, sẽ gọi API để thêm rạp
    
    // Tạo ma trận ghế ngồi từ số hàng và số ghế mỗi hàng
    const rows = parseInt(data.rows)
    const seatsPerRow = parseInt(data.seatsPerRow)
    const seatsMatrix = Array(rows).fill().map(() => Array(seatsPerRow).fill(0))
    
    const newCinema = {
      _id: Date.now().toString(),
      name: data.name,
      city: data.city,
      image: previewImage || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
      ticketPrice: parseInt(data.ticketPrice),
      seatsAvailable: parseInt(data.seatsAvailable),
      seats: seatsMatrix
    }
    
    setCinemas([...cinemas, newCinema])
    setOpenAddDialog(false)
    form.reset()
  }

  // Xử lý sửa rạp
  const handleEditCinema = (data) => {
    console.log('Cập nhật rạp:', data)
    // Trong thực tế, sẽ gọi API để cập nhật rạp
    
    // Kiểm tra xem kích thước ma trận ghế có thay đổi không
    const newRows = parseInt(data.rows)
    const newSeatsPerRow = parseInt(data.seatsPerRow)
    let updatedSeats = [...selectedCinema.seats]
    
    // Nếu kích thước ma trận thay đổi, tạo ma trận mới
    if (newRows !== selectedCinema.seats.length || 
        newSeatsPerRow !== (selectedCinema.seats[0] ? selectedCinema.seats[0].length : 0)) {
      updatedSeats = Array(newRows).fill().map(() => Array(newSeatsPerRow).fill(0))
    }
    
    const updatedCinemas = cinemas.map(cinema => {
      if (cinema._id === selectedCinema._id) {
        return {
          ...cinema,
          name: data.name,
          city: data.city,
          image: previewImage || cinema.image,
          ticketPrice: parseInt(data.ticketPrice),
          seatsAvailable: parseInt(data.seatsAvailable),
          seats: updatedSeats
        }
      }
      return cinema
    })
    
    setCinemas(updatedCinemas)
    setOpenEditDialog(false)
    setSelectedCinema(null)
  }

  // Xử lý xóa rạp
  const handleDeleteCinema = () => {
    console.log('Xóa rạp:', selectedCinema)
    // Trong thực tế, sẽ gọi API để xóa rạp
    const updatedCinemas = cinemas.filter(cinema => cinema._id !== selectedCinema._id)
    
    setCinemas(updatedCinemas)
    setOpenDeleteDialog(false)
    setSelectedCinema(null)
  }

  // Xử lý lưu cấu hình ghế
  const handleSaveSeats = () => {
    console.log('Lưu cấu hình ghế:', seats)
    // Trong thực tế, sẽ gọi API để cập nhật cấu hình ghế
    const updatedCinemas = cinemas.map(cinema => {
      if (cinema._id === selectedCinema._id) {
        return {
          ...cinema,
          seats: [...seats]
        }
      }
      return cinema
    })
    
    setCinemas(updatedCinemas)
    setOpenSeatsDialog(false)
    setSelectedCinema(null)
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

  // Xử lý đổi trạng thái ghế
  const handleToggleSeat = (rowIndex, seatIndex) => {
    const newSeats = [...seats]
    // Chuyển đổi trạng thái: 0 -> 1 -> 0
    newSeats[rowIndex][seatIndex] = newSeats[rowIndex][seatIndex] === 0 ? 1 : 0
    setSeats(newSeats)
  }

  // Lọc rạp theo từ khóa tìm kiếm
  const filteredCinemas = cinemas.filter(cinema => 
    cinema.name.toLowerCase().includes(search.toLowerCase()) ||
    cinema.city.toLowerCase().includes(search.toLowerCase())
  )

  // Hàm chuyển đổi số thành chữ cái (0 -> A, 1 -> B, ...)
  const convertToAlphabet = (index) => {
    return String.fromCharCode(65 + index)
  }

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Quản lý rạp chiếu</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm rạp chiếu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button onClick={handleOpenAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm rạp
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
        </div>
      ) : filteredCinemas.length === 0 ? (
        <div className="text-center py-16">
          <Home className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">Không tìm thấy rạp chiếu nào phù hợp</p>
          {search && (
            <Button variant="outline" onClick={() => setSearch('')}>
              Xóa tìm kiếm
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCinemas.map((cinema) => (
            <CinemaCard 
              key={cinema._id} 
              cinema={cinema} 
              onEdit={() => handleOpenEditDialog(cinema)}
              onDelete={() => handleOpenDeleteDialog(cinema)}
              onManageSeats={() => handleOpenSeatsDialog(cinema)}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}

      {/* Dialog thêm rạp */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thêm rạp chiếu mới</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddCinema)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
                  {/* Phần tải lên hình ảnh */}
                  <div className="w-full md:w-1/3">
                    <div className="relative aspect-video w-full mb-4 bg-gray-800 rounded-md overflow-hidden">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Home className="h-12 w-12" />
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
                        onClick={() => document.getElementById('uploadCinemaImage').click()}
                      >
                        Tải lên ảnh
                      </Button>
                      <input
                        id="uploadCinemaImage"
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên rạp</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nhập tên rạp" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thành phố</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn thành phố" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                                  <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                                  <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                                  <SelectItem value="Khánh Hòa">Khánh Hòa</SelectItem>
                                  <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                                  <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ticketPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giá vé (VNĐ)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="50000" placeholder="VD: 100000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="seatsAvailable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tổng số ghế</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" placeholder="VD: 120" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Cấu hình chỗ ngồi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rows"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số hàng ghế</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="15" placeholder="VD: 10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="seatsPerRow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số ghế mỗi hàng</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="15" placeholder="VD: 8" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  Thêm rạp
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog sửa rạp */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa rạp chiếu</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditCinema)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
                  {/* Phần tải lên hình ảnh */}
                  <div className="w-full md:w-1/3">
                    <div className="relative aspect-video w-full mb-4 bg-gray-800 rounded-md overflow-hidden">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Home className="h-12 w-12" />
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
                        onClick={() => document.getElementById('editCinemaImage').click()}
                      >
                        Cập nhật ảnh
                      </Button>
                      <input
                        id="editCinemaImage"
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên rạp</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nhập tên rạp" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thành phố</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn thành phố" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                                  <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                                  <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                                  <SelectItem value="Khánh Hòa">Khánh Hòa</SelectItem>
                                  <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                                  <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ticketPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giá vé (VNĐ)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="50000" placeholder="VD: 100000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="seatsAvailable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tổng số ghế</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" placeholder="VD: 120" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Cấu hình chỗ ngồi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rows"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số hàng ghế</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="15" placeholder="VD: 10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="seatsPerRow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số ghế mỗi hàng</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="15" placeholder="VD: 8" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-sm text-yellow-500 mt-2">
                    <strong>Lưu ý:</strong> Thay đổi kích thước sẽ tạo lại ma trận ghế và xóa cấu hình hiện tại.
                  </p>
                </div>
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

      {/* Dialog xóa rạp */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa rạp chiếu</DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <p>Bạn có chắc chắn muốn xóa rạp "<span className="font-semibold">{selectedCinema?.name}</span>"?</p>
            <p className="text-gray-400 mt-2">Hành động này không thể hoàn tác.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteCinema}>
              Xóa rạp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog quản lý ghế */}
      <Dialog open={openSeatsDialog} onOpenChange={setOpenSeatsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quản lý sơ đồ ghế - {selectedCinema?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center">
              {/* Màn hình */}
              <div className="relative mb-8 w-4/5">
                <div className="w-full h-6 bg-gray-800 rounded-t-lg"></div>
                <div className="w-4/5 h-1 bg-primary-dark mx-auto rounded-b-lg"></div>
                <p className="text-center text-xs text-gray-400 mt-2">MÀN HÌNH</p>
              </div>
              
              {/* Sơ đồ ghế */}
              <div className="overflow-x-auto w-full">
                <div className="inline-block min-w-full">
                  <div className="flex flex-col items-center">
                    {seats.map((row, rowIndex) => (
                      <div key={`row-${rowIndex}`} className="flex items-center my-1">
                        {/* Chỉ số hàng */}
                        <div className="w-6 flex-shrink-0 flex items-center justify-center text-sm text-gray-400 mr-2">
                          {convertToAlphabet(rowIndex)}
                        </div>
                        
                        {/* Ghế */}
                        <div className="flex">
                          {row.map((seat, seatIndex) => (
                            <div
                              key={`seat-${rowIndex}-${seatIndex}`}
                              className={`
                                cursor-pointer w-8 h-8 flex items-center justify-center m-1 rounded 
                                ${seat === 0 ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}
                              `}
                              onClick={() => handleToggleSeat(rowIndex, seatIndex)}
                            >
                              {seatIndex + 1}
                            </div>
                          ))}
                        </div>
                        
                        {/* Chỉ số hàng (bên phải) */}
                        <div className="w-6 flex-shrink-0 flex items-center justify-center text-sm text-gray-400 ml-2">
                          {convertToAlphabet(rowIndex)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Chú thích */}
              <div className="flex gap-6 mt-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-700 rounded mr-2"></div>
                  <span className="text-sm">Ghế có thể sử dụng</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                  <span className="text-sm">Ghế không thể sử dụng</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 mt-4">
                Nhấn vào ghế để đổi trạng thái sử dụng của ghế.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSeatsDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveSeats}>
              Lưu cấu hình
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const CinemaCard = ({ cinema, onEdit, onDelete, onManageSeats, formatPrice }) => {
  return (
    <Card className="overflow-hidden bg-background border-gray-800 h-full">
      <div className="relative w-full aspect-video overflow-hidden">
        <img 
          src={cinema.image} 
          alt={cinema.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-70"></div>
        
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-primary-dark text-black border-none">
            Rạp chiếu phim
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{cinema.name}</h3>
        
        <div className="space-y-2 text-sm text-gray-400 mb-4">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
            <span className="capitalize">{cinema.city}</span>
          </div>
          <div className="flex items-start">
            <CreditCard className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
            <span>{formatPrice(cinema.ticketPrice)} / vé</span>
          </div>
          <div className="flex items-start">
            <Users className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
            <span>{cinema.seatsAvailable} ghế</span>
          </div>
          <div className="flex items-start">
            <Grid3X3 className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
            <span>{cinema.seats.length} hàng × {cinema.seats[0] ? cinema.seats[0].length : 0} ghế</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <Button variant="outline" className="w-full" onClick={onManageSeats}>
          <Grid3X3 className="h-4 w-4 mr-2" />
          Quản lý ghế
        </Button>
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Sửa
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default AdminCinemaManagement