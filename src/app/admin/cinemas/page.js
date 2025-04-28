"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cinemaApi, roomApi } from '@/lib/api'
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
  MapPin,
  ImagePlus,
  Upload,
  Check,
  Info,
  LayoutGrid,
  Grid3X3,
  TicketCheck,
  DollarSign,
  Film,
  EyeIcon,
  Users
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Danh sách thành phố phổ biến
const popularCities = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Nha Trang", "Hải Phòng", 
  "Cần Thơ", "Huế", "Vũng Tàu", "Đà Lạt", "Quy Nhơn"
];

// Form schema cho rạp chiếu phim - đã cập nhật theo cấu trúc DB mới
const cinemaSchema = z.object({
  name: z.string().min(1, 'Tên rạp chiếu phim là bắt buộc'),
  city: z.string().min(1, 'Thành phố là bắt buộc'),
  image: z.string().optional(),
})

// Form schema cho phòng chiếu
const roomSchema = z.object({
  name: z.string().min(1, 'Tên phòng chiếu là bắt buộc'),
  capacity: z.coerce.number().min(1, 'Sức chứa phải lớn hơn 0'),
  roomType: z.string().min(1, 'Loại phòng là bắt buộc'),
  ticketPrice: z.coerce.number().min(1000, 'Giá vé phải lớn hơn 1.000 VND'),
  status: z.string().default('active')
})

// Hàm lấy hình ảnh rạp với xử lý domain chưa được cấu hình
const getCinemaImage = (cinema) => {
  if (!cinema || !cinema.image) return '/images/cinema-placeholder.jpg';
  
  // Xử lý URL từ domain chưa được cấu hình
  if (cinema.image.includes('example.com')) {
    return '/images/cinema-placeholder.jpg';
  }
  
  return cinema.image;
}

export default function AdminCinemaManagement() {
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [filteredCinemas, setFilteredCinemas] = useState([])
  const [selectedCinema, setSelectedCinema] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [activeCityFilter, setActiveCityFilter] = useState('')
  
  // States cho quản lý phòng chiếu
  const [rooms, setRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false)
  const [showEditRoomDialog, setShowEditRoomDialog] = useState(false)
  const [showDeleteRoomDialog, setShowDeleteRoomDialog] = useState(false)
  const [showRoomsPanel, setShowRoomsPanel] = useState(false)
  const [selectedCinemaForRooms, setSelectedCinemaForRooms] = useState(null)
  
  const { toast } = useToast()
  
  // React Hook Form cho thêm/sửa rạp
  const form = useForm({
    resolver: zodResolver(cinemaSchema),
    defaultValues: {
      name: '',
      city: '',
      image: ''
    }
  })
  
  // React Hook Form cho thêm/sửa phòng
  const roomForm = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '',
      capacity: 100,
      roomType: '2D',
      ticketPrice: 70000,
      status: 'active'
    }
  })
  
  // Fetch danh sách rạp
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true)
        const response = await cinemaApi.getAll();
        
        // Lấy danh sách rạp ban đầu (chưa có thông tin phòng)
        const cinemasData = response.data || [];
        
        // Tạo một mảng các promise để lấy phòng cho từng rạp
        const cinemasWithRooms = await Promise.all(
          cinemasData.map(async (cinema) => {
            try {
              // Gọi API lấy danh sách phòng cho từng rạp
              const roomsResponse = await roomApi.getByCinemaId(cinema.id);
              const rooms = roomsResponse.data || [];
              
              // Tính toán roomCount và totalCapacity từ danh sách phòng thực tế
              const roomCount = rooms.length;
              const totalCapacity = rooms.reduce(
                (sum, room) => sum + (room.capacity || 0), 
                0
              );
              
              // Trả về rạp đã được bổ sung thông tin phòng
              return {
                ...cinema,
                rooms,
                roomCount,
                totalCapacity
              };
            } catch (error) {
              console.error(`Error fetching rooms for cinema ID ${cinema.id}:`, error);
              // Nếu có lỗi, vẫn trả về rạp nhưng không có thông tin phòng
              return {
                ...cinema,
                rooms: [],
                roomCount: 0,
                totalCapacity: 0
              };
            }
          })
        );
        
        setCinemas(cinemasWithRooms);
      } catch (error) {
        console.error('Error fetching cinemas:', error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách rạp. Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCinemas();
  }, []);
  
  // Fetch danh sách phòng cho rạp đã chọn
  const fetchRooms = async (cinemaId) => {
    try {
      setLoadingRooms(true)
      // Sử dụng roomApi thay vì gọi fetch trực tiếp
      const response = await roomApi.getByCinemaId(cinemaId)
      setRooms(response.data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách phòng chiếu. Vui lòng thử lại sau.",
      })
    } finally {
      setLoadingRooms(false)
    }
  }
  
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
    
    // Lọc theo thành phố
    if (activeCityFilter) {
      result = result.filter(cinema => 
        cinema.city === activeCityFilter
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
  }, [cinemas, search, sortField, sortOrder, activeCityFilter])
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  // Lấy danh sách thành phố đã sử dụng
  const getUsedCities = () => {
    const allCities = new Set()
    cinemas.forEach(cinema => {
      if (cinema.city) {
        allCities.add(cinema.city)
      }
    })
    return Array.from(allCities).sort()
  }
  
  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setImageFile(file)
    setShowImagePreview(true)
    
    // Create image preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }
  
  // Upload hình ảnh
  const handleUploadImage = async (cinemaId) => {
    if (!imageFile) return null;
    
    try {
      setSubmitting(true);
      console.log('Uploading image for cinema ID:', cinemaId);
      
      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('file', imageFile);
      
      // Log để kiểm tra formData
      console.log('FormData created with file:', imageFile.name);
      
      // Đảm bảo cinemaId là string
      const id = String(cinemaId);
      
      // Gọi API upload ảnh
      const response = await cinemaApi.uploadPhoto(id, formData);
      
      if (response.data && response.data.cinema) {
        console.log('Upload successful, new image path:', response.data.cinema.image);
        // Trả về đường dẫn ảnh mới
        return response.data.cinema.image;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      console.log('Error response data:', error.response?.data);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải ảnh lên. Vui lòng thử lại sau.",
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };
  
  // Add cinema
  const handleAddCinema = async (data) => {
    try {
      setSubmitting(true);
      console.log('==== CLIENT LOG - ADD CINEMA ====');
      console.log('Data being sent to server:', data);
      
      // Chỉ gửi các trường phù hợp với DB
      const cinemaData = {
        name: data.name,
        city: data.city
      };
      
      // Gọi API để thêm rạp mới
      const response = await cinemaApi.create(cinemaData);
      console.log('Server response for create:', response);

      // Nếu có file ảnh, upload sau khi tạo rạp thành công
      if (imageFile && response.data && response.data.id) {
        const imageUrl = await handleUploadImage(response.data.id);
        
        // Nếu upload ảnh thành công, cập nhật thông tin rạp
        if (imageUrl) {
          await cinemaApi.update(response.data.id, { image: imageUrl });
          response.data.image = imageUrl;
        }
      }
      
      // Thêm thông tin phòng ảo để dễ hiển thị
      const newCinema = {
        ...response.data,
        roomCount: 0,
        totalCapacity: 0
      };
      
      // Cập nhật state
      setCinemas([...cinemas, newCinema]);
      
      toast({
        title: "Thêm rạp thành công",
        description: `Rạp "${data.name}" đã được thêm vào hệ thống.`
      });
      
      setShowAddDialog(false);
      form.reset();
      setImagePreview('');
      setImageFile(null);
      setShowImagePreview(false);
    } catch (error) {
      console.error('Error adding cinema:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm rạp. Vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Edit cinema
  const handleEditCinema = async (data) => {
    try {
      setSubmitting(true);
      
      // Thêm ID vào dữ liệu cập nhật
      const cinemaData = { 
        name: data.name,
        city: data.city
      };
      
      // Nếu có file ảnh mới, upload trước
      if (imageFile) {
        const imageUrl = await handleUploadImage(selectedCinema.id);
        if (imageUrl) {
          cinemaData.image = imageUrl;
        }
      }
      
      console.log('Sending update data:', cinemaData); // Để debug
      
      // Gọi API để cập nhật thông tin rạp
      const response = await cinemaApi.update(selectedCinema.id, cinemaData);
      
      // Cập nhật state sau khi API thành công
      const updatedCinemas = cinemas.map(cinema => {
        if (cinema.id === selectedCinema.id) {
          return {
            ...response.data,
            // Giữ lại thông tin về phòng nếu có
            roomCount: cinema.roomCount || 0,
            totalCapacity: cinema.totalCapacity || 0
          };
        }
        return cinema;
      });
      
      setCinemas(updatedCinemas);
      
      toast({
        title: "Cập nhật rạp thành công",
        description: `Rạp "${data.name}" đã được cập nhật.`
      });
      
      setShowEditDialog(false);
      setSelectedCinema(null);
      setImagePreview('');
      setImageFile(null);
      setShowImagePreview(false);
    } catch (error) {
      console.error('Error updating cinema:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật rạp. Vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete cinema
  const handleDeleteCinema = async () => {
    try {
      setSubmitting(true)
      
      // Gọi API để xóa rạp
      await cinemaApi.delete(selectedCinema.id)
      
      // Cập nhật state
      const updatedCinemas = cinemas.filter(cinema => cinema.id !== selectedCinema.id)
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
    setImagePreview('')
    setShowImagePreview(cinema.image ? true : false)
    form.reset({
      name: cinema.name || '',
      city: cinema.city || '',
      image: cinema.image || ''
    })
    
    // Hiệu ứng nhấp nháy thông báo trước khi mở form
    toast({
      description: (
        <div className="flex items-center">
          <Pencil className="mr-2 h-4 w-4 text-blue-500" /> 
          Đang mở thông tin rạp <span className="font-medium ml-1">{cinema.name}</span>
        </div>
      ),
      duration: 1000,
    })
    
    setTimeout(() => {
      setShowEditDialog(true)
    }, 300)
  }
  
  // Mở bảng quản lý phòng cho rạp đã chọn
  const openRoomsPanel = async (cinema) => {
    setSelectedCinemaForRooms(cinema)
    setShowRoomsPanel(true)
    
    // Fetch danh sách phòng cho rạp đã chọn
    await fetchRooms(cinema.id)
    
    toast({
      description: (
        <div className="flex items-center">
          <Grid3X3 className="mr-2 h-4 w-4 text-blue-500" /> 
          Đang mở danh sách phòng của rạp <span className="font-medium ml-1">{cinema.name}</span>
        </div>
      ),
      duration: 2000,
    })
  }
  
  // Thêm phòng mới
  const handleAddRoom = async (data) => {
    try {
      setSubmitting(true)
      
      // Thêm cinemaId vào dữ liệu
      const roomData = {
        ...data,
        cinemaId: selectedCinemaForRooms.id
      }
      
      // Gọi API để thêm phòng mới
      const response = await roomApi.create(roomData)
      
      // Cập nhật danh sách phòng
      setRooms([...rooms, response.data])
      
      // Cập nhật thông tin rạp
      const updatedCinemas = cinemas.map(c => {
        if (c.id === selectedCinemaForRooms.id) {
          return {
            ...c,
            roomCount: (c.roomCount || 0) + 1,
            totalCapacity: (c.totalCapacity || 0) + Number(data.capacity)
          }
        }
        return c
      })
      
      setCinemas(updatedCinemas)
      
      toast({
        title: "Thêm phòng thành công",
        description: `Phòng "${data.name}" đã được thêm vào rạp ${selectedCinemaForRooms.name}.`
      })
      
      setShowAddRoomDialog(false)
      roomForm.reset()
    } catch (error) {
      console.error('Error adding room:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm phòng. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Sửa thông tin phòng
  const handleEditRoom = async (data) => {
    try {
      setSubmitting(true)
      
      // Thêm ID vào dữ liệu
      const roomData = {
        ...data,
        id: selectedRoom.id,
        cinemaId: selectedCinemaForRooms.id
      }
      
      // Gọi API để cập nhật thông tin phòng
      const response = await roomApi.update(selectedRoom.id, roomData)
      
      // Cập nhật danh sách phòng
      const updatedRooms = rooms.map(room => {
        if (room.id === selectedRoom.id) {
          return response.data
        }
        return room
      })
      
      setRooms(updatedRooms)
      
      // Cập nhật thông tin rạp (nếu sức chứa thay đổi)
      if (selectedRoom.capacity !== Number(data.capacity)) {
        const capacityDiff = Number(data.capacity) - selectedRoom.capacity
        
        const updatedCinemas = cinemas.map(c => {
          if (c.id === selectedCinemaForRooms.id) {
            return {
              ...c,
              totalCapacity: (c.totalCapacity || 0) + capacityDiff
            }
          }
          return c
        })
        
        setCinemas(updatedCinemas)
      }
      
      toast({
        title: "Cập nhật phòng thành công",
        description: `Phòng "${data.name}" đã được cập nhật.`
      })
      
      setShowEditRoomDialog(false)
      setSelectedRoom(null)
    } catch (error) {
      console.error('Error updating room:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật phòng. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Xóa phòng
  const handleDeleteRoom = async () => {
    try {
      setSubmitting(true)
      
      // Gọi API để xóa phòng
      await roomApi.delete(selectedRoom.id)
      
      // Cập nhật danh sách phòng
      const updatedRooms = rooms.filter(room => room.id !== selectedRoom.id)
      setRooms(updatedRooms)
      
      // Cập nhật thông tin rạp
      const updatedCinemas = cinemas.map(c => {
        if (c.id === selectedCinemaForRooms.id) {
          return {
            ...c,
            roomCount: (c.roomCount || 0) - 1,
            totalCapacity: (c.totalCapacity || 0) - selectedRoom.capacity
          }
        }
        return c
      })
      
      setCinemas(updatedCinemas)
      
      toast({
        title: "Xóa phòng thành công",
        description: `Phòng "${selectedRoom.name}" đã được xóa khỏi rạp ${selectedCinemaForRooms.name}.`
      })
      
      setShowDeleteRoomDialog(false)
      setSelectedRoom(null)
    } catch (error) {
      console.error('Error deleting room:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa phòng. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Setup form sửa phòng
  const setupEditRoom = (room) => {
    setSelectedRoom(room)
    
    roomForm.reset({
      name: room.name || '',
      capacity: room.capacity || 0,
      roomType: room.roomType || '2D',
      ticketPrice: room.ticketPrice || 0,
      status: room.status || 'active'
    })
    
    setShowEditRoomDialog(true)
  }
  
  // Component render các thẻ thành phố
  const CityFilter = () => {
    const usedCities = getUsedCities()
    
    return (
      <div className="flex flex-wrap gap-2 my-4">
        <Badge 
          key="all-cities"
          variant={activeCityFilter === '' ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 transition-colors" 
          onClick={() => setActiveCityFilter('')}
        >
          Tất cả
        </Badge>
        
        {usedCities.map(city => (
          <Badge 
            key={`filter-${city}`}
            variant={activeCityFilter === city ? "default" : "outline"} 
            className="cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={() => setActiveCityFilter(activeCityFilter === city ? '' : city)}
          >
            {city}
          </Badge>
        ))}
      </div>
    )
  }
  
  // Component form rạp chung cho cả thêm và sửa
  const CinemaForm = ({ onSubmit, modalTitle, submitText }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái - thông tin cơ bản */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      <span className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        Tên rạp
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên rạp" className="h-10" {...field} />
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
                    <FormLabel className="text-base">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Thành phố
                      </span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Chọn thành phố" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-100">
                        {popularCities.map(city => (
                          <SelectItem key={`city-${city}`} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedCinema && (
                <div className="p-4 bg-muted/20 rounded-lg mt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1 text-muted-foreground" />
                    Thông tin phòng chiếu
                  </h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Số phòng: {selectedCinema.roomCount || 0}</p>
                    <p>Tổng số ghế: {selectedCinema.totalCapacity || 0}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Cột phải - hình ảnh và thông tin khác */}
            <div className="space-y-5">
              <FormItem>
                <FormLabel className="text-base">
                  <span className="flex items-center">
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Ảnh rạp
                  </span>
                </FormLabel>
                <div className="border rounded-lg p-4 space-y-4 bg-white">
                  {!(imagePreview || (showImagePreview && selectedCinema?.image)) ? (
                    <div className="flex items-center justify-center border-2 border-dashed rounded-md py-6 px-2 border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <label htmlFor="cinema-image" className="cursor-pointer flex flex-col items-center justify-center w-full">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Kéo thả hoặc nhấp để tải ảnh lên</span>
                        <span className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, GIF tối đa 5MB</span>
                        <Button variant="outline" className="mt-3 h-8 text-xs gap-1">
                          <ImagePlus className="h-3.5 w-3.5" />
                          Chọn ảnh
                        </Button>
                        <Input 
                          type="file" 
                          id="cinema-image"
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
                          {imageFile ? imageFile.name : 'Ảnh đại diện rạp phim'}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/40 text-white"
                            onClick={() => {
                              // Mở input file
                              document.getElementById('cinema-image').click();
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
                              setShowImagePreview(false);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="w-full aspect-video">
                        <Image
                          src={imagePreview || (selectedCinema ? getCinemaImage(selectedCinema) : '')}
                          alt="Preview"
                          width={400}
                          height={240}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <Input 
                        type="file" 
                        id="cinema-image"
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
      <Tabs defaultValue="cinemas" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2 h-14">
          <TabsTrigger value="cinemas" className="text-base flex gap-2 py-3 font-medium">
            <Building2 className="h-5 w-5" />
            Quản lý rạp chiếu phim
          </TabsTrigger>
          <TabsTrigger 
            value="rooms" 
            className="text-base flex gap-2 py-3 font-medium"
            disabled={!showRoomsPanel}
          >
            <Grid3X3 className="h-5 w-5" />
            Quản lý phòng chiếu
            {selectedCinemaForRooms && (
              <Badge className="ml-2">{selectedCinemaForRooms.name}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cinemas">
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Building2 className="h-6 w-6 mr-2" />
                Quản lý rạp chiếu phim
              </CardTitle>
              <Button
                onClick={() => {
                  form.reset({
                    name: '',
                    city: '',
                    image: ''
                  })
                  setImagePreview('')
                  setImageFile(null)
                  setShowImagePreview(false)
                  setShowAddDialog(true)
                }}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Thêm rạp mới
              </Button>
            </CardHeader>
            <CardContent>
              {/* Search và lọc */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên rạp hoặc thành phố..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
              
              {/* Bộ lọc thành phố */}
              <CityFilter />
              
              <Separator className="my-4" />
              
              {/* Bảng danh sách rạp */}
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Đang tải danh sách rạp...</p>
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
                                  onClick={() => handleSort('name')}
                                >
                                  Tên rạp
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
                                  onClick={() => handleSort('city')}
                                >
                                  Thành phố
                                  <ArrowUpDown className="h-4 w-4 ml-2" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sắp xếp theo thành phố</p>
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
                                  onClick={() => handleSort('roomCount')}
                                >
                                  Số phòng
                                  <ArrowUpDown className="h-4 w-4 ml-2" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sắp xếp theo số phòng</p>
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
                                  onClick={() => handleSort('totalCapacity')}
                                >
                                  Tổng số ghế
                                  <ArrowUpDown className="h-4 w-4 ml-2" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sắp xếp theo tổng số ghế</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCinemas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-40">
                            <div className="flex flex-col items-center justify-center">
                              <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">Không có rạp nào</p>
                              <Button 
                                variant="link" 
                                onClick={() => {
                                  setSearch('')
                                  setActiveCityFilter('')
                                }}
                                className="mt-2"
                              >
                                Xóa bộ lọc
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCinemas.map((cinema) => (
                          <TableRow key={cinema.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="relative w-12 h-16 overflow-hidden rounded-md border">
                                <Image
                                  src={getCinemaImage(cinema)}
                                  alt={cinema.name}
                                  width={48}
                                  height={64}
                                  className="object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{cinema.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-primary/5 border-primary/30">
                                {cinema.city}
                              </Badge>
                            </TableCell>
                            <TableCell>{cinema.roomCount || 0}</TableCell>
                            <TableCell>{cinema.totalCapacity || 0}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => openRoomsPanel(cinema)}
                                      >
                                        <Grid3X3 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Quản lý phòng chiếu</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => setupEditCinema(cinema)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Sửa rạp</p>
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
                                          setSelectedCinema(cinema)
                                          setShowDeleteDialog(true)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Xóa rạp</p>
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
                Hiển thị {filteredCinemas.length} / {cinemas.length} rạp
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="rooms">
          {selectedCinemaForRooms && (
            <Card className="shadow-sm border-t-4 border-t-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <div className="flex items-center">
                    <Grid3X3 className="h-6 w-6 mr-2 text-blue-500" />
                    <CardTitle className="text-2xl font-bold">
                      Phòng chiếu - {selectedCinemaForRooms.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-1">
                    Quản lý các phòng chiếu của rạp {selectedCinemaForRooms.city}
                  </CardDescription>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      setShowRoomsPanel(false)
                      setSelectedCinemaForRooms(null)
                    }}
                  >
                    <Building2 className="h-4 w-4" />
                    Quay lại danh sách rạp
                  </Button>
                  
                  <Button
                    variant="default"
                    className="gap-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      roomForm.reset({
                        name: '',
                        capacity: 100,
                        roomType: '2D',
                        ticketPrice: 70000,
                        status: 'active'
                      })
                      setShowAddRoomDialog(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm phòng mới
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Bảng danh sách phòng */}
                {loadingRooms ? (
                  <div className="flex justify-center py-10">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                      <p className="text-muted-foreground">Đang tải danh sách phòng...</p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50">
                          <TableHead>Tên phòng</TableHead>
                          <TableHead>Loại phòng</TableHead>
                          <TableHead>Sức chứa</TableHead>
                          <TableHead>Giá vé</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rooms.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center h-40">
                              <div className="flex flex-col items-center justify-center">
                                <LayoutGrid className="h-10 w-10 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Rạp này chưa có phòng chiếu nào</p>
                                <Button 
                                  variant="link" 
                                  onClick={() => {
                                    roomForm.reset({
                                      name: '',
                                      capacity: 100,
                                      roomType: '2D',
                                      ticketPrice: 70000,
                                      status: 'active'
                                    })
                                    setShowAddRoomDialog(true)
                                  }}
                                  className="mt-2"
                                >
                                  Thêm phòng chiếu mới
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          rooms.map((room) => (
                            <TableRow key={room.id} className="hover:bg-blue-50/50">
                              <TableCell className="font-medium">{room.name}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    room.roomType === '3D' ? 'bg-purple-50 border-purple-300 text-purple-700' :
                                    room.roomType === '4D' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' :
                                    room.roomType === 'IMAX' ? 'bg-amber-50 border-amber-300 text-amber-700' :
                                    'bg-blue-50 border-blue-300 text-blue-700'
                                  }
                                >
                                  {room.roomType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  {room.capacity} ghế
                                </div>
                              </TableCell>
                              <TableCell>{formatCurrency(room.ticketPrice)}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={room.status === 'active' ? 'default' : 'secondary'}
                                  className={
                                    room.status === 'active' ? 'bg-green-500' : 
                                    room.status === 'maintenance' ? 'bg-amber-500' : 
                                    'bg-slate-500'
                                  }
                                >
                                  {room.status === 'active' ? 'Hoạt động' : 
                                   room.status === 'maintenance' ? 'Bảo trì' : 
                                   'Không hoạt động'}
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
                                          onClick={() => setupEditRoom(room)}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Sửa phòng</p>
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
                                            setSelectedRoom(room)
                                            setShowDeleteRoomDialog(true)
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Xóa phòng</p>
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
                  Tổng số: {rooms.length} phòng - Sức chứa: {rooms.reduce((sum, room) => sum + (room.capacity || 0), 0)} ghế
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Modal thêm rạp */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="!max-w-[900px] p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <div className="flex flex-col !max-h-[90vh]">
            <DialogHeader className="bg-gradient-to-r from-black to-gray-600 text-white">
              <div className="bg-gradient-to-r from-black to-gray-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Thêm rạp mới
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      Nhập thông tin chi tiết về rạp mới để thêm vào hệ thống
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
              <CinemaForm 
                onSubmit={handleAddCinema} 
                modalTitle="Thêm rạp mới" 
                submitText="Thêm rạp" 
              />
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
                disabled={submitting}
                onClick={form.handleSubmit(handleAddCinema)}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Thêm rạp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal sửa rạp */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="!max-w-[900px] p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <DialogHeader className="bg-gradient-to-r from-black to-gray-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center text-white">
                  <Pencil className="h-5 w-5 mr-2" />
                  Sửa thông tin rạp
                </DialogTitle>
                <DialogDescription className="text-white/80 text-sm mt-1">
                  Cập nhật thông tin chi tiết về rạp
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
            <CinemaForm 
              onSubmit={handleEditCinema} 
              modalTitle="Sửa thông tin rạp" 
              submitText="Cập nhật" 
            />
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
              disabled={submitting}
              onClick={form.handleSubmit(handleEditCinema)}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Cập nhật
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal xóa rạp */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <DialogHeader className="bg-red-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Xác nhận xóa rạp
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
                  Bạn sắp xóa rạp "{selectedCinema?.name}"
                </h3>
                <p className="text-muted-foreground text-sm">
                  Hành động này sẽ xóa vĩnh viễn rạp khỏi hệ thống và không thể hoàn tác.
                  Bạn có chắc chắn muốn tiếp tục?
                </p>
              </div>
            </div>
            
            {selectedCinema?.image && (
              <div className="mb-6 p-3 bg-muted/20 rounded-lg border border-muted">
                <div className="flex items-center">
                  <div className="relative w-14 h-20 overflow-hidden rounded-md border mr-3">
                    <Image
                      src={getCinemaImage(selectedCinema)}
                      alt={selectedCinema.name}
                      width={56}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedCinema?.name}</h4>
                    <p className="text-sm">
                      {selectedCinema?.city && `Thành phố: ${selectedCinema.city}`}
                    </p>
                    {selectedCinema?.roomCount > 0 && (
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {selectedCinema.roomCount} phòng
                        </Badge>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {selectedCinema.totalCapacity} ghế
                        </Badge>
                      </div>
                    )}
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
                onClick={handleDeleteCinema}
                disabled={submitting}
                className="min-w-[100px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Xóa rạp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal thêm phòng */}
      <Dialog open={showAddRoomDialog} onOpenChange={setShowAddRoomDialog}>
        <DialogContent className="max-w-md p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Thêm phòng chiếu mới
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Thêm phòng mới cho rạp {selectedCinemaForRooms?.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddRoomDialog(false)}
                className="rounded-full h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="p-6">
            <Form {...roomForm}>
              <form onSubmit={roomForm.handleSubmit(handleAddRoom)} className="space-y-4">
                <FormField
                  control={roomForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên phòng</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Phòng 01, Phòng VIP..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={roomForm.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại phòng</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại phòng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2D">2D Standard</SelectItem>
                          <SelectItem value="3D">3D</SelectItem>
                          <SelectItem value="4D">4D</SelectItem>
                          <SelectItem value="IMAX">IMAX</SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={roomForm.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sức chứa (ghế)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={roomForm.control}
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
                </div>
                
                <FormField
                  control={roomForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="maintenance">Bảo trì</SelectItem>
                          <SelectItem value="inactive">Không hoạt động</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddRoomDialog(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Thêm phòng
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal sửa phòng */}
      <Dialog open={showEditRoomDialog} onOpenChange={setShowEditRoomDialog}>
        <DialogContent className="max-w-md p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <DialogHeader className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  <Pencil className="h-5 w-5 mr-2" />
                  Sửa thông tin phòng
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Cập nhật thông tin phòng {selectedRoom?.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditRoomDialog(false)}
                className="rounded-full h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="p-6">
            <Form {...roomForm}>
              <form onSubmit={roomForm.handleSubmit(handleEditRoom)} className="space-y-4">
                <FormField
                  control={roomForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên phòng</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Phòng 01, Phòng VIP..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={roomForm.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại phòng</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại phòng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2D">2D Standard</SelectItem>
                          <SelectItem value="3D">3D</SelectItem>
                          <SelectItem value="4D">4D</SelectItem>
                          <SelectItem value="IMAX">IMAX</SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={roomForm.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sức chứa (ghế)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={roomForm.control}
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
                </div>
                
                <FormField
                  control={roomForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="maintenance">Bảo trì</SelectItem>
                          <SelectItem value="inactive">Không hoạt động</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditRoomDialog(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Cập nhật
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal xóa phòng */}
      <Dialog open={showDeleteRoomDialog} onOpenChange={setShowDeleteRoomDialog}>
        <DialogContent className="max-w-md p-0 bg-white overflow-hidden rounded-xl shadow-xl border-none">
          <DialogHeader className="bg-red-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Xác nhận xóa phòng
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteRoomDialog(false)}
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
                  Bạn sắp xóa phòng "{selectedRoom?.name}"
                </h3>
                <p className="text-muted-foreground text-sm">
                  Hành động này sẽ xóa vĩnh viễn phòng chiếu khỏi hệ thống và không thể hoàn tác.
                  Bạn có chắc chắn muốn tiếp tục?
                </p>
              </div>
            </div>
            
            {selectedRoom && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Tên phòng:</span>
                    <span className="font-medium">{selectedRoom.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Loại phòng:</span>
                    <Badge 
                      variant="outline" 
                      className={
                        selectedRoom.roomType === '3D' ? 'bg-purple-50 border-purple-300 text-purple-700' :
                        selectedRoom.roomType === '4D' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' :
                        selectedRoom.roomType === 'IMAX' ? 'bg-amber-50 border-amber-300 text-amber-700' :
                        'bg-blue-50 border-blue-300 text-blue-700'
                      }
                    >
                      {selectedRoom.roomType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Sức chứa:</span>
                    <span>{selectedRoom.capacity} ghế</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Giá vé:</span>
                    <span>{formatCurrency(selectedRoom.ticketPrice)}</span>
                  </div>
                </div>
              </div>
            )}
  
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteRoomDialog(false)}
                className="min-w-[100px]"
              >
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteRoom}
                disabled={submitting}
                className="min-w-[100px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Xóa phòng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}