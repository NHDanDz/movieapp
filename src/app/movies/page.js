"use client"

import { useState, useEffect } from 'react'
import { movieApi } from '@/lib/api'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MovieCard from '@/components/movies/MovieCard'
import { filterByKeyword } from '@/lib/utils'

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        
        // Fetch all movies
        const moviesRes = await movieApi.getAll()
        setMovies(moviesRes.data || [])
        
        // Fetch now showing and coming soon movies
        const nowShowingRes = await movieApi.getNowShowing()
        setNowShowing(nowShowingRes.data || [])
        
        const comingSoonRes = await movieApi.getComingSoon()
        setComingSoon(comingSoonRes.data || [])
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMovies()
  }, [])
  
  // Filter movies based on search
  const filteredAllMovies = filterByKeyword(movies, search, ['title', 'director', 'genre', 'cast'])
  const filteredNowShowing = filterByKeyword(nowShowing, search, ['title', 'director', 'genre', 'cast'])
  const filteredComingSoon = filterByKeyword(comingSoon, search, ['title', 'director', 'genre', 'cast'])

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Phim</h1>
        
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
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              Tất cả ({filteredAllMovies.length})
            </TabsTrigger>
            <TabsTrigger value="nowShowing">
              Đang chiếu ({filteredNowShowing.length})
            </TabsTrigger>
            <TabsTrigger value="comingSoon">
              Sắp chiếu ({filteredComingSoon.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {filteredAllMovies.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-4">Không tìm thấy phim nào phù hợp</p>
                {search && (
                  <Button variant="outline" onClick={() => setSearch('')}>
                    Xóa tìm kiếm
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                {filteredAllMovies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="nowShowing">
            {filteredNowShowing.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-4">Không tìm thấy phim nào phù hợp</p>
                {search && (
                  <Button variant="outline" onClick={() => setSearch('')}>
                    Xóa tìm kiếm
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                {filteredNowShowing.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="comingSoon">
            {filteredComingSoon.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-4">Không tìm thấy phim nào phù hợp</p>
                {search && (
                  <Button variant="outline" onClick={() => setSearch('')}>
                    Xóa tìm kiếm
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                {filteredComingSoon.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}