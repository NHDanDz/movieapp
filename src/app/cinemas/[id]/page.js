"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cinemaApi, showtimeApi, movieApi } from '@/lib/api'
import { Loader2, ArrowLeft, MapPin, CreditCard, Clock, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { formatCurrency, formatDate, getMovieImage } from '@/lib/utils'

export default function CinemaDetailPage({ params }) {
  const [cinema, setCinema] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [movies, setMovies] = useState({})
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const { id } = params
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch cinema details
        const cinemaRes = await cinemaApi.getById(id)
        setCinema(cinemaRes.data)
        
        // Fetch all showtimes for this cinema
        const showtimesRes = await showtimeApi.getAll()
        const cinemaShowtimes = showtimesRes.data
          ? showtimesRes.data.filter(showtime => showtime.cinemaId === id)
          : []
        
        setShowtimes(cinemaShowtimes)
        
        // Fetch all movies for these showtimes
        const uniqueMovieIds = [...new Set(cinemaShowtimes.map(showtime => showtime.movieId))]
        
        const movieData = {}
        for (const movieId of uniqueMovieIds) {
          const movieRes = await movieApi.getById(movieId)
          if (movieRes.data) {
            movieData[movieId] = movieRes.data
          }
        }
        
        setMovies(movieData)
      } catch (error) {
        console.error('Error fetching cinema data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [id])
  
  // Group showtimes by day
  const groupShowtimesByDay = () => {
    const groups = {}
    
    showtimes.forEach(showtime => {
      const movie = movies[showtime.movieId]
      if (!movie) return
      
      const startDate = new Date(showtime.startDate)
      const endDate = new Date(showtime.endDate)
      
      // Generate dates between start and end
      let currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toDateString()
        
        if (!groups[dateStr]) {
          groups[dateStr] = []
        }
        
        groups[dateStr].push({
          ...showtime,
          movie
        })
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })
    
    return groups
  }
  
  const showtimesByDay = groupShowtimesByDay()
  const dates = Object.keys(showtimesByDay).sort((a, b) => new Date(a) - new Date(b))
  
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
      </div>
    )
  }
  
  if (!cinema) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Không tìm thấy thông tin rạp chiếu phim</p>
          <Button variant="outline" onClick={() => router.push('/cinemas')}>
            Quay lại danh sách rạp
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20">
      {/* Header */}
      <Button 
        variant="ghost" 
        className="-ml-2 mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>
      
      {/* Cinema Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Cinema Image */}
        <div className="relative w-full aspect-video lg:aspect-square rounded-lg overflow-hidden">
          <Image
            src={cinema.image || '/images/cinema-placeholder.jpg'}
            alt={cinema.name}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Cinema Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Badge variant="outline" className="bg-primary-dark text-black border-none mb-2">
              Rạp chiếu phim
            </Badge>
            <h1 className="text-3xl font-bold">{cinema.name}</h1>
            <p className="text-gray-400 capitalize mt-2">{cinema.city}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-start space-x-2">
              <CreditCard className="h-5 w-5 text-primary-dark mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Giá vé</p>
                <p className="font-medium">{formatCurrency(cinema.ticketPrice)}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Users className="h-5 w-5 text-primary-dark mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Sức chứa</p>
                <p className="font-medium">{cinema.seatsAvailable} ghế</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 text-primary-dark mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Địa chỉ</p>
                <p className="font-medium capitalize">{cinema.city}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <h2 className="text-xl font-semibold mb-4">Giới thiệu</h2>
            <p className="text-gray-300">
              {cinema.name} là một trong những rạp chiếu phim hiện đại nhất tại {cinema.city}, 
              trang bị hệ thống âm thanh vòm Dolby Atmos và màn hình 4K mang đến trải nghiệm 
              xem phim tuyệt vời. Rạp có {cinema.seatsAvailable} ghế ngồi thoải mái, 
              khu vực chờ rộng rãi và nhiều tiện ích bổ sung.
            </p>
          </div>
        </div>
      </div>
      
      {/* Showtimes */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Lịch chiếu phim</h2>
        
        {dates.length === 0 ? (
          <Card className="border-gray-800">
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <p className="text-xl font-medium mb-2">Không có suất chiếu nào</p>
                <p className="text-gray-400">Vui lòng quay lại sau để xem lịch chiếu mới nhất</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={dates[0]}>
            <TabsList className="mb-6">
              {dates.map((date) => (
                <TabsTrigger key={date} value={date}>
                  {formatDate(date)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {dates.map((date) => (
              <TabsContent key={date} value={date}>
                <div className="space-y-6">
                  {showtimesByDay[date]
                    // Group by movie
                    .reduce((groups, showtime) => {
                      const movieId = showtime.movieId
                      if (!groups[movieId]) {
                        groups[movieId] = {
                          movie: showtime.movie,
                          showtimes: []
                        }
                      }
                      groups[movieId].showtimes.push(showtime)
                      return groups
                    }, {})
                    // Convert to array and sort by movie title
                    .toSorted((a, b) => a.movie.title.localeCompare(b.movie.title))
                    .map(({ movie, showtimes }) => (
                      <Card key={movie._id} className="border-gray-800">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-24 rounded overflow-hidden">
                              <Image
                                src={getMovieImage(movie)}
                                alt={movie.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <CardTitle className="text-lg capitalize">
                                {movie.title}
                              </CardTitle>
                              <div className="flex items-center text-sm text-gray-400 mt-1">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{movie.duration} phút</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3 pt-2">
                            {showtimes
                              // Remove duplicates and sort by time
                              .filter((showtime, index, self) =>
                                index === self.findIndex(s => s.startAt === showtime.startAt)
                              )
                              .sort((a, b) => 
                                new Date(`01/01/2020 ${a.startAt}`) - new Date(`01/01/2020 ${b.startAt}`)
                              )
                              .map((showtime) => (
                                <Button
                                  key={`${showtime._id}-${showtime.startAt}`}
                                  variant="outline"
                                  className="border-gray-700 hover:border-primary-dark hover:bg-primary-dark hover:text-black transition-colors"
                                  onClick={() => router.push(`/movies/${movie._id}/booking`)}
                                >
                                  {showtime.startAt}
                                </Button>
                              ))
                            }
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
}