"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { movieApi } from '@/lib/api'
import { Loader2, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MovieCard from '@/components/movies/MovieCard'
import { filterByKeyword } from '@/lib/utils'

export default function MovieCategoryPage({ params }) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const router = useRouter()
  const { category } = params
  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        
        let response
        if (category === 'nowShowing') {
          response = await movieApi.getNowShowing()
        } else if (category === 'comingSoon') {
          response = await movieApi.getComingSoon()
        } else {
          // Invalid category, fetch all movies
          response = await movieApi.getAll()
        }
        
        setMovies(response.data || [])
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMovies()
  }, [category])
  
  // Format category name for display
  const getCategoryTitle = () => {
    switch (category) {
      case 'nowShowing':
        return 'Phim đang chiếu'
      case 'comingSoon':
        return 'Phim sắp chiếu'
      default:
        return 'Tất cả phim'
    }
  }
  
  // Filter movies based on search
  const filteredMovies = filterByKeyword(movies, search, ['title', 'director', 'genre', 'cast'])
  
  return (
    <div className="container mx-auto px-4 py-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2 -ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">{getCategoryTitle()}</h1>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Movies Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Không tìm thấy phim nào phù hợp</p>
          {search && (
            <Button variant="outline" onClick={() => setSearch('')}>
              Xóa tìm kiếm
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}