"use client"

import { useEffect, useState } from 'react'
import { movieApi, showtimeApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import MovieBanner from '@/components/movies/MovieBanner'
import CinemaShowtimes from '@/components/booking/CinemaShowtimes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function MovieDetailPage() {
  const params = useParams()

  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter() 
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true)
        
        // Fetch movie details
        const movieRes = await movieApi.getById(params.id)
        setMovie(movieRes.data)
        
        // Fetch showtimes for this movie
        const showtimesRes = await showtimeApi.getByMovie(params.id)
        setShowtimes(showtimesRes.data || [])
      } catch (error) {
        console.error('Error fetching movie details:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMovieDetails()
  }, [params.id])
  
  const handleBooking = () => {
    router.push(`/movies/${params.id}/booking`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Không tìm thấy phim</h1>
        <Button 
          variant="link" 
          onClick={() => router.push('/movies')}
          className="mt-4"
        >
          Xem tất cả phim
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Movie Banner with full description */}
      <MovieBanner movie={movie} height="85vh" fullDescription />
      
      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="showtimes" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="showtimes">Lịch chiếu</TabsTrigger>
            <TabsTrigger value="details">Thông tin chi tiết</TabsTrigger>
          </TabsList>
          
          <TabsContent value="showtimes">
            <div className="bg-background-dark p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Lịch chiếu phim</h2>
              
              {showtimes.length > 0 ? (
                <CinemaShowtimes 
                  showtimes={showtimes} 
                  movieId={movie.id}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 mb-4">Chưa có lịch chiếu cho phim này</p>
                  <Button onClick={() => router.push('/movies')}>
                    Xem phim khác
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <div className="bg-background-dark p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Thông tin chi tiết</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Nội dung phim</h3>
                  <p className="text-gray-300 mb-6">{movie.description}</p>
                  
                  <h3 className="text-lg font-semibold mb-2">Thông tin</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li><span className="font-medium text-white">Đạo diễn:</span> {movie.director}</li>
                    <li><span className="font-medium text-white">Diễn viên:</span> {movie.cast}</li>
                    <li><span className="font-medium text-white">Thể loại:</span> {movie.genre}</li>
                    <li><span className="font-medium text-white">Ngôn ngữ:</span> {movie.language}</li>
                    <li><span className="font-medium text-white">Thời lượng:</span> {movie.duration} phút</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Lịch chiếu</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li><span className="font-medium text-white">Ngày khởi chiếu:</span> {formatDate(movie.releaseDate)}</li>
                    <li><span className="font-medium text-white">Ngày kết thúc:</span> {formatDate(movie.endDate)}</li>
                  </ul>
                  
                  <div className="mt-8">
                    <Button 
                      onClick={handleBooking}
                      size="lg"
                      className="w-full md:w-auto"
                    >
                      Đặt vé ngay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}