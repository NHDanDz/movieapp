"use client"

import { useEffect, useState } from 'react'
import { movieApi, showtimeApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MovieBanner from '@/components/movies/MovieBanner'
import CinemaShowtimes from '@/components/booking/CinemaShowtimes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Loader2, PlayCircle, Star, Calendar, Clock, User, Languages, Tag, Ticket, Film, Award, Info, X, BookOpen } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function MovieDetailPage() {
  const params = useParams()

  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('showtimes')
  const [similarMovies, setSimilarMovies] = useState([])
  
  const router = useRouter()
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true)
        
        // Fetch movie details
        const movieRes = await movieApi.getById(params.id)
        setMovie(movieRes.data)
        
        // Fetch showtimes for this movie
        // console.log(params.id);
        const showtimesRes = await showtimeApi.getByMovie(params.id)
         setShowtimes(showtimesRes.data || [])
        
        // Fetch similar movies
        const allMoviesRes = await movieApi.getAll()
        if (allMoviesRes.data && movieRes.data) {
          const genre = movieRes.data.genre ? movieRes.data.genre.split(',')[0].trim() : null
          
          const similar = allMoviesRes.data
            .filter(m => 
              m.id !== params.id && 
              m.genre && 
              m.genre.toLowerCase().includes(genre?.toLowerCase())
            )
            .slice(0, 4)
          
          setSimilarMovies(similar)
        }
      } catch (error) {
        console.error('Error fetching movie details:', error)
      } finally {
        setLoading(false)
        
        // Hiệu ứng fade in
        setTimeout(() => {
          setIsVisible(true)
        }, 300)
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
        <Loader2 className="h-12 w-12 loading-spinner text-primary-dark" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md p-8 bg-gray-800/30 rounded-lg border border-gray-800 text-center">
          <Film className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy phim</h1>
          <p className="text-gray-400 mb-6">Phim bạn đang tìm kiếm không tồn tại hoặc đã được gỡ bỏ</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/movies')}
            className="hover:bg-primary-dark hover:text-black transition-all"
          >
            Xem tất cả phim
          </Button>
        </div>
      </div>
    )
  }

  // Tạo rating giả
  const rating = (Math.random() * 2 + 7).toFixed(1) // Random từ 7.0 đến 9.0

  return (
    <div className="min-h-screen">
      {/* Movie Banner with full description */}
      <MovieBanner movie={movie} height="85vh" fullDescription />
      
      <div className={`container mx-auto px-4 py-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Tabs defaultValue="showtimes" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 gap-2 p-1 mb-8 bg-gray-800/30 rounded-lg">
            <TabsTrigger 
              value="showtimes" 
              className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Lịch chiếu
            </TabsTrigger>
            <TabsTrigger 
              value="details"
              className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white"
            >
              <Info className="h-4 w-4 mr-2" />
              Chi tiết
            </TabsTrigger>
            <TabsTrigger 
              value="similar"
              className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white"
            >
              <Film className="h-4 w-4 mr-2" />
              Tương tự
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="showtimes" className="tabs-effect-content">
            <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-primary-dark" />
                Lịch chiếu phim
              </h2>
              
              {showtimes.length > 0 ? (
                <CinemaShowtimes 
                  showtimes={showtimes} 
                  movieId={movie.id}
                />
              ) : (
                <div className="text-center py-10">
                  <Calendar className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-xl text-gray-300 mb-4">Chưa có lịch chiếu cho phim này</p>
                  <Button onClick={() => router.push('/movies')} className="bg-primary-dark text-black hover:bg-primary-dark/90">
                    Xem phim khác
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="tabs-effect-content">
            <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Info className="h-6 w-6 mr-2 text-primary-dark" />
                Thông tin chi tiết
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column: Movie poster and ratings */}
                <div>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-4 hover-card-effect">
                    <Image 
                      src={movie.image || '/images/movie-placeholder.jpg'}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    
                    {/* Play trailer button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-16 w-16 bg-black/60 hover:bg-primary-dark hover:scale-110 transition-all duration-300"
                        onClick={() => setShowTrailer(true)}
                      >
                        <PlayCircle className="h-10 w-10 text-white" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Đánh giá</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-bold text-yellow-500">{rating}</span>
                        <span className="text-sm text-gray-400 ml-1">/10</span>
                      </div>
                    </div>
                    
                    {/* Star ratings */}
                    <div className="flex items-center mb-3">
                      <div className="flex flex-1">
                        {Array(5).fill(0).map((_, index) => (
                          <Star 
                            key={index} 
                            className={`h-5 w-5 ${
                              index < Math.floor(rating / 2) 
                                ? 'text-yellow-500 fill-current' 
                                : (index < rating / 2 ? 'text-yellow-500 fill-current opacity-50' : 'text-gray-600')
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">{Math.floor(Math.random() * 500 + 100)} đánh giá</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Kịch bản</span>
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Diễn xuất</span>
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Hình ảnh</span>
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Âm thanh</span>
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleBooking}
                    className="w-full btn-gradient"
                  >
                    <Ticket className="h-5 w-5 mr-2" />
                    Đặt vé ngay
                  </Button>
                </div>
                
                {/* Right column: Movie information */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary-dark" />
                      Nội dung phim
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">{movie.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-primary-dark mt-0.5" />
                        <div>
                          <h4 className="font-medium">Đạo diễn</h4>
                          <p className="text-gray-300">{movie.director}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-primary-dark mt-0.5" />
                        <div>
                          <h4 className="font-medium">Diễn viên</h4>
                          <p className="text-gray-300">{movie.cast}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Tag className="h-5 w-5 text-primary-dark mt-0.5" />
                        <div>
                          <h4 className="font-medium">Thể loại</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {movie.genre?.split(',').map((genre, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="bg-gray-800 border-gray-700"
                              >
                                {genre.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Languages className="h-5 w-5 text-primary-dark mt-0.5" />
                        <div>
                          <h4 className="font-medium">Ngôn ngữ</h4>
                          <p className="text-gray-300 capitalize">{movie.language}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-primary-dark mt-0.5" />
                        <div>
                          <h4 className="font-medium">Thời lượng</h4>
                          <p className="text-gray-300">{movie.duration} phút</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-primary-dark mt-0.5" />
                        <div>
                          <h4 className="font-medium">Ngày khởi chiếu</h4>
                          <p className="text-gray-300">{formatDate(movie.releaseDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional sections */}
                  <Accordion type="single" collapsible className="bg-gray-800/50 rounded-lg">
                    <AccordionItem value="item-1" className="border-b-gray-700 px-4">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 mr-2 text-primary-dark" />
                          <span>Giải thưởng và ghi nhận</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-300">
                        <p>Phim đã nhận được nhiều lời khen từ giới phê bình về cách kể chuyện sáng tạo và diễn xuất ấn tượng của dàn diễn viên. Mặc dù chưa giành được giải thưởng lớn, nhưng đã được đề cử ở nhiều hạng mục tại các liên hoan phim quốc tế.</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2" className="border-b-gray-700 px-4">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center">
                          <Film className="h-5 w-5 mr-2 text-primary-dark" />
                          <span>Hậu trường sản xuất</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-300">
                        <p>Phim được quay trong thời gian 3 tháng tại nhiều địa điểm khác nhau. Các hiệu ứng đặc biệt được thực hiện bởi đội ngũ kỹ thuật hàng đầu, sử dụng công nghệ tiên tiến nhất để tạo ra những cảnh quay hoành tráng và sống động.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="similar" className="tabs-effect-content">
            <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Film className="h-6 w-6 mr-2 text-primary-dark" />
                Phim tương tự
              </h2>
              
              {similarMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {similarMovies.map((similarMovie, index) => (
                    <div 
                      key={similarMovie.id} 
                      className="transition-all duration-700 hover-card-effect"
                      style={{ 
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: `${index * 0.1}s`
                      }}
                      onClick={() => router.push(`/movies/${similarMovie.id}`)}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer">
                        <Image
                          src={similarMovie.image || '/images/movie-placeholder.jpg'}
                          alt={similarMovie.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                        <div className="absolute bottom-0 left-0 p-3 w-full">
                          <h3 className="text-md font-bold">{similarMovie.title}</h3>
                          <div className="flex items-center text-sm mt-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                            <span>{(Math.random() * 2 + 7).toFixed(1)}</span>
                            <Clock className="h-3 w-3 text-gray-400 ml-3 mr-1" />
                            <span className="text-gray-400">{similarMovie.duration} phút</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Film className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-xl text-gray-300 mb-4">Không tìm thấy phim tương tự</p>
                  <Button onClick={() => router.push('/movies')} className="bg-primary-dark text-black hover:bg-primary-dark/90">
                    Xem tất cả phim
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl mx-auto px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -top-12 right-4 hover:bg-white/10 rounded-full"
              onClick={() => setShowTrailer(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="relative pb-[56.25%] h-0">
              <iframe 
                className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-700"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title={`${movie.title} trailer`}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}