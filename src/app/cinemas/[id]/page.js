"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cinemaApi, showtimeApi, movieApi } from '@/lib/api'
import { Loader2, ArrowLeft, MapPin, CreditCard, Clock, Users, Calendar, Star, Phone, Mail, Globe, Info } from 'lucide-react'
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
import { useParams } from 'next/navigation'

export default function CinemaDetailPage() {
  const [cinema, setCinema] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [movies, setMovies] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  
  const params = useParams()
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
        
        // Thiết lập tab mặc định sau khi tải dữ liệu
        setTimeout(() => {
          const dates = Object.keys(groupShowtimesByDay()).sort((a, b) => new Date(a) - new Date(b))
          if (dates.length > 0) {
            setActiveTab(dates[0])
          }
          setIsPageLoaded(true)
        }, 100)
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
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-12 w-12 loading-spinner text-primary-dark" />
      </div>
    )
  }
  
  if (!cinema) {
    return (
      <div className="container mx-auto px-4 py-32">
        <div className="text-center max-w-lg mx-auto p-8 bg-gray-800/30 rounded-lg border border-gray-700">
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-300 mb-4">Không tìm thấy thông tin rạp chiếu phim</p>
          <Button variant="outline" onClick={() => router.push('/cinemas')} className="hover:bg-primary-dark hover:text-black transition-all">
            Quay lại danh sách rạp
          </Button>
        </div>
      </div>
    )
  }

  // Rating giả
  const rating = Math.floor(Math.random() * 15 + 75) / 10; // 7.5-9.0
  const reviews = Math.floor(Math.random() * 500 + 200);

  return (
    <div className="container mx-auto px-4 py-32">
      {/* Header với hiệu ứng fade-in */}
      <div className={`transition-all duration-1000 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Button 
          variant="ghost" 
          className="-ml-2 mb-6 hover:bg-gray-800/50 transition-all group"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Quay lại
        </Button>
      </div>
      
      {/* Cinema Details */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 transition-all duration-1000 delay-100 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Cinema Image */}
        <div className="relative w-full aspect-video lg:aspect-square rounded-xl overflow-hidden hover-card-effect">
          <Image
            src={cinema.image || '/images/cinema-placeholder.jpg'}
            alt={cinema.name}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
          
          {/* Rating badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center bg-black/70 px-3 py-2 rounded-lg">
              <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-yellow-500">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400 ml-1">({reviews})</span>
            </div>
          </div>
        </div>
        
        {/* Cinema Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Badge variant="outline" className="badge-3d text-black mb-3">
              Rạp chiếu phim
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{cinema.name}</h1>
            <div className="flex items-center text-gray-300 capitalize space-x-2">
              <MapPin className="h-4 w-4 text-primary-dark" />
              <p>{cinema.city}</p>
            </div>
            
            {/* Rating stars */}
            <div className="flex items-center mt-3">
              <div className="flex">
                {Array(5).fill(0).map((_, index) => (
                  <Star 
                    key={index} 
                    className={`h-5 w-5 ${
                      index < Math.floor(rating) 
                        ? 'text-yellow-500 fill-current' 
                        : (index < rating ? 'text-yellow-500 fill-current opacity-50' : 'text-gray-600')
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400 ml-2">{reviews} đánh giá</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-800/30 rounded-lg border border-gray-800">
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-primary-dark mt-1" />
              <div>
                <p className="text-sm text-gray-400">Giá vé</p>
                <p className="font-medium text-white">{formatCurrency(cinema.ticketPrice)}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-primary-dark mt-1" />
              <div>
                <p className="text-sm text-gray-400">Sức chứa</p>
                <p className="font-medium text-white">{cinema.seatsAvailable} ghế</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary-dark mt-1" />
              <div>
                <p className="text-sm text-gray-400">Địa chỉ</p>
                <p className="font-medium text-white capitalize">{cinema.city}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary-dark" />
              Giới thiệu
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {cinema.name} là một trong những rạp chiếu phim hiện đại nhất tại {cinema.city}, 
              trang bị hệ thống âm thanh vòm Dolby Atmos và màn hình 4K mang đến trải nghiệm 
              xem phim tuyệt vời. Rạp có {cinema.seatsAvailable} ghế ngồi thoải mái, 
              khu vực chờ rộng rãi và nhiều tiện ích bổ sung.
            </p>
            
            {/* Thêm thông tin liên hệ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary-dark mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Điện thoại</p>
                  <p className="font-medium text-white">+84 28 1234 5678</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary-dark mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium text-white">{cinema.name.toLowerCase().replace(/\s+/g, '')}@cinemaplus.vn</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-primary-dark mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Website</p>
                  <p className="font-medium text-white">www.cinemaplus.vn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Showtimes */}
      <div className={`transition-all duration-1000 delay-300 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-primary-dark" />
          Lịch chiếu phim
        </h2>
        
        {dates.length === 0 ? (
          <Card className="border-gray-800 bg-background-dark">
            <CardContent className="py-16">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto text-gray-500 mb-6" />
                <p className="text-xl font-medium mb-3">Không có suất chiếu nào</p>
                <p className="text-gray-400 mb-6">Vui lòng quay lại sau để xem lịch chiếu mới nhất</p>
                <Button onClick={() => router.push('/movies')} className="bg-primary-dark text-black hover:bg-primary-dark/90">
                  Xem phim hiện tại
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs 
            defaultValue={dates[0]} 
            value={activeTab}
            onValueChange={setActiveTab}
            className="tabs-effect"
          >
            <div className="bg-gray-800/30 p-4 rounded-lg mb-6">
              <TabsList className="w-full grid grid-cols-3 md:grid-cols-7 gap-2">
                {dates.map((date) => (
                  <TabsTrigger 
                    key={date} 
                    value={date}
                    className="date-button transition-all duration-300"
                  >
                    {formatDate(date)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {dates.map((date) => (
              <TabsContent 
                key={date} 
                value={date}
                className="tabs-effect-content space-y-6"
              >
                {Object.values(
                  showtimesByDay[date].reduce((groups, showtime) => {
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
                )
                .sort((a, b) => a.movie.title.localeCompare(b.movie.title))
                .map(({ movie, showtimes }) => (
                  <Card key={movie._id} className="border-gray-800 hover-card-effect bg-background-dark overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative w-16 h-24 md:w-20 md:h-28 rounded-lg overflow-hidden">
                          <Image
                            src={getMovieImage(movie)}
                            alt={movie.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <Badge className="mr-2 badge-3d text-black text-xs">{movie.genre?.split(',')[0]}</Badge>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs ml-1">{(Math.random() * 2 + 7).toFixed(1)}</span>
                            </div>
                          </div>
                          <CardTitle className="text-lg md:text-xl capitalize">
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
                              className="time-button hover:scale-105 transition-transform hover:bg-primary-dark hover:text-black hover:border-primary-dark"
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
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
}