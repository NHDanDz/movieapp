"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cinemaApi } from '@/lib/api'
import { Loader2, Search, MapPin, Filter, SlidersHorizontal, ChevronsUp, ChevronsDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import CinemaCard from '@/components/cinemas/CinemaCard'
import { filterByKeyword } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('nameAsc') // 'nameAsc', 'nameDesc', 'priceAsc', 'priceDesc'
  const [showFilters, setShowFilters] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  
  const { user } = useAuth()
  
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true)
        
        // Fetch cinemas (with user modeling if logged in)
        const response = user 
          ? await cinemaApi.getUserModeling(user.username)
          : await cinemaApi.getAll()
        
        setCinemas(response.data || [])
      } catch (error) {
        console.error('Error fetching cinemas:', error)
      } finally {
        setLoading(false)
        setTimeout(() => {
          setPageLoaded(true)
        }, 300)
      }
    }
    
    fetchCinemas()
  }, [user])
  
  // Extract unique cities from cinemas
  const cities = cinemas
    ? [...new Set(cinemas.map(cinema => cinema.city))]
    : []
  
  // Filter cinemas based on search, city filter, and sort
  const getFilteredCinemas = () => {
    let filtered = cinemas;
    
    // Apply city filter
    if (cityFilter && cityFilter !== 'all') {
      filtered = filtered.filter(cinema => 
        cinema.city.toLowerCase() === cityFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(cinema => 
        cinema.name.toLowerCase().includes(search.toLowerCase()) ||
        cinema.city.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortOrder === 'nameAsc') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'nameDesc') {
      filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === 'priceAsc') {
      filtered = [...filtered].sort((a, b) => a.ticketPrice - b.ticketPrice);
    } else if (sortOrder === 'priceDesc') {
      filtered = [...filtered].sort((a, b) => b.ticketPrice - a.ticketPrice);
    }
    
    return filtered;
  }
  
  const filteredCinemas = getFilteredCinemas();
  
  // Handle sort change
  const handleSortChange = (value) => {
    setSortOrder(value);
  }
  
  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setCityFilter('');
    setSortOrder('nameAsc');
  }
  
  // Get sort options label
  const getSortLabel = () => {
    switch (sortOrder) {
      case 'nameAsc': return 'Tên A-Z';
      case 'nameDesc': return 'Tên Z-A';
      case 'priceAsc': return 'Giá thấp - cao';
      case 'priceDesc': return 'Giá cao - thấp';
      default: return 'Sắp xếp';
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-32">
      <div className={`flex flex-col transition-all duration-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Heading and Filters Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Rạp chiếu phim</h1>
            <div className="h-1 w-20 bg-primary-dark rounded-full"></div>
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </Button>
        </div>
        
        {/* Filters */}
        <div className={`transition-all duration-500 overflow-hidden ${showFilters ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm rạp chiếu phim..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 bg-gray-900/70 border-gray-700"
                />
              </div>
              
              {/* City Filter */}
              <div className="w-full md:w-48">
                <Select 
                  value={cityFilter} 
                  onValueChange={setCityFilter}
                >
                  <SelectTrigger className="h-12 bg-gray-900/70 border-gray-700">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Tất cả thành phố" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="all">Tất cả thành phố</SelectItem>
                    {cities.map((city, index) => (
                      <SelectItem key={index} value={city} className="capitalize">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort options */}
              <div className="w-full md:w-48">
                <Select 
                  value={sortOrder} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="h-12 bg-gray-900/70 border-gray-700">
                    <div className="flex items-center">
                      <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Sắp xếp" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nameAsc">Tên A-Z</SelectItem>
                    <SelectItem value="nameDesc">Tên Z-A</SelectItem>
                    <SelectItem value="priceAsc">Giá thấp - cao</SelectItem>
                    <SelectItem value="priceDesc">Giá cao - thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetFilters}
                className="text-gray-400 hover:text-white"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </div>
        
        {/* Active Filters Summary */}
        {(search || (cityFilter && cityFilter !== 'all') || sortOrder !== 'nameAsc') && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-800/20 rounded-lg">
            <span className="text-sm text-gray-400">Bộ lọc:</span>
            
            {search && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 bg-gray-800/50 hover:bg-gray-700/50"
                onClick={() => setSearch('')}
              >
                Tìm kiếm: {search}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            )}
            
            {cityFilter && cityFilter !== 'all' && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 bg-gray-800/50 hover:bg-gray-700/50"
                onClick={() => setCityFilter('')}
              >
                Thành phố: {cityFilter}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            )}
            
            {sortOrder !== 'nameAsc' && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 bg-gray-800/50 hover:bg-gray-700/50"
              >
                Sắp xếp: {getSortLabel()}
                {sortOrder === 'nameDesc' ? (
                  <ChevronsDown className="h-3 w-3 ml-1" />
                ) : sortOrder === 'priceAsc' ? (
                  <ChevronsUp className="h-3 w-3 ml-1" />
                ) : sortOrder === 'priceDesc' ? (
                  <ChevronsDown className="h-3 w-3 ml-1" />
                ) : null}
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-gray-400 hover:text-white p-0 h-6"
              onClick={resetFilters}
            >
              Xóa tất cả
            </Button>
          </div>
        )}
      </div>
      
      {/* Cinemas Grid */}
      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-12 w-12 loading-spinner text-primary-dark" />
        </div>
      ) : filteredCinemas.length === 0 ? (
        <div className="text-center py-20 max-w-lg mx-auto">
          <div className="bg-gray-800/30 p-8 rounded-lg border border-gray-800">
            <MapPin className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <p className="text-xl text-gray-300 mb-4">Không tìm thấy rạp chiếu phim nào phù hợp</p>
            {(search || cityFilter) && (
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="hover:bg-primary-dark hover:text-black transition-all"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCinemas.map((cinema, index) => (
            <div 
              key={cinema.id} 
              className="transition-all duration-700"
              style={{ 
                opacity: pageLoaded ? 1 : 0,
                transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${index * 0.1}s`
              }}
            >
              <CinemaCard cinema={cinema} />
            </div>
          ))}
        </div>
      )}
      
      {/* Additional information */}
      {!loading && filteredCinemas.length > 0 && (
        <div className="mt-16">
          <Accordion type="single" collapsible className="bg-gray-800/30 rounded-lg border border-gray-800">
            <AccordionItem value="item-1" className="border-b-gray-700">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-800/50">
                Thông tin rạp chiếu phim
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-300">
                <p className="mb-3">
                  Rạp chiếu phim tại Cinema+ cung cấp các dịch vụ và tiện ích hiện đại nhất, mang đến trải nghiệm xem phim tuyệt vời cho khách hàng.
                </p>
                <p>
                  Rạp được trang bị hệ thống âm thanh Dolby Atmos cùng với màn hình 4K sắc nét, ghế ngồi êm ái và không gian thoáng đãng. 
                  Ngoài ra, còn có các dịch vụ ăn uống phong phú và đa dạng để phục vụ khách hàng trong suốt thời gian thưởng thức bộ phim yêu thích.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-800/50">
                Câu hỏi thường gặp
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-primary-dark">Làm thế nào để đặt vé xem phim?</h4>
                    <p className="text-gray-300">Bạn có thể đặt vé trực tuyến thông qua trang web hoặc ứng dụng di động của chúng tôi, hoặc mua trực tiếp tại quầy vé của rạp.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-dark">Chính sách hoàn trả vé như thế nào?</h4>
                    <p className="text-gray-300">Vé đã mua không thể hoàn trả, nhưng có thể đổi sang suất chiếu khác nếu thông báo trước ít nhất 2 giờ.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-dark">Có thể mang thức ăn từ bên ngoài vào rạp không?</h4>
                    <p className="text-gray-300">Chúng tôi không khuyến khích mang thức ăn từ bên ngoài vào rạp. Rạp có quầy bán đồ ăn nhẹ và nước uống phục vụ khách hàng.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  )
}