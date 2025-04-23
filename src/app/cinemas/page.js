"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cinemaApi } from '@/lib/api'
import { Loader2, Search, MapPin } from 'lucide-react'
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

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  
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
      }
    }
    
    fetchCinemas()
  }, [user])
  
  // Extract unique cities from cinemas
  const cities = cinemas
    ? [...new Set(cinemas.map(cinema => cinema.city))]
    : []
  
  // Filter cinemas based on search and city filter
  const filteredCinemas = cinemas
    .filter(cinema => 
      !cityFilter || cinema.city.toLowerCase() === cityFilter.toLowerCase()
    )
    .filter(cinema => 
      !search || 
      cinema.name.toLowerCase().includes(search.toLowerCase()) ||
      cinema.city.toLowerCase().includes(search.toLowerCase())
    )
  
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Rạp chiếu phim</h1>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm rạp chiếu phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* City Filter */}
        <div className="w-full md:w-48">
          <Select 
            value={cityFilter} 
            onValueChange={setCityFilter}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Tất cả thành phố" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả thành phố</SelectItem>
              {cities.map((city, index) => (
                <SelectItem key={index} value={city} className="capitalize">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Cinemas Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
        </div>
      ) : filteredCinemas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Không tìm thấy rạp chiếu phim nào phù hợp</p>
          {(search || cityFilter) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('')
                setCityFilter('')
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCinemas.map((cinema) => (
            <CinemaCard key={cinema._id} cinema={cinema} />
          ))}
        </div>
      )}
    </div>
  )
}