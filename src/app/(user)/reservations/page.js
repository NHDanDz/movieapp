"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { reservationApi, movieApi, cinemaApi } from '@/lib/api'
import { formatDate, getMovieImage, formatCurrency, convertToAlphabet } from '@/lib/utils'
import { Loader2, Film, Calendar, Clock, MapPin, CreditCard, Users, ArrowRight, Download, Ticket } from 'lucide-react'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { jsPDF } from 'jspdf'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [movies, setMovies] = useState({})
  const [cinemas, setCinemas] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showQrCode, setShowQrCode] = useState(false)
  
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    const fetchReservations = async () => {
      try {
        setLoading(true)
        
        // Fetch all reservations
        const resReservations = await reservationApi.getAll()
        
        // Filter for current user
        const userReservations = resReservations.data.filter(
          reservation => reservation.username === user.username
        )
        
        // Sort by date (newest first)
        userReservations.sort((a, b) => new Date(b.date) - new Date(a.date))
        
        setReservations(userReservations)
        
        // Fetch movies and cinemas
        const uniqueMovieIds = [...new Set(userReservations.map(r => r.movieId))]
        const uniqueCinemaIds = [...new Set(userReservations.map(r => r.cinemaId))]
        
        // Fetch movie details
        const moviesData = {}
        for (const movieId of uniqueMovieIds) {
          const movieRes = await movieApi.getById(movieId)
          if (movieRes.data) {
            moviesData[movieId] = movieRes.data
          }
        }
        setMovies(moviesData)
        
        // Fetch cinema details
        const cinemasData = {}
        for (const cinemaId of uniqueCinemaIds) {
          const cinemaRes = await cinemaApi.getById(cinemaId)
          if (cinemaRes.data) {
            cinemasData[cinemaId] = cinemaRes.data
          }
        }
        setCinemas(cinemasData)
      } catch (error) {
        console.error('Error fetching reservations:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchReservations()
  }, [isAuthenticated, router, user])
  
  // Download ticket as PDF
  const handleDownloadTicket = (reservation) => {
    try {
      const movie = movies[reservation.movieId]
      const cinema = cinemas[reservation.cinemaId]
      
      if (!movie || !cinema) return
      
      // Create PDF document
      const doc = new jsPDF()
      
      // Add content
      doc.setFontSize(22)
      doc.text('CINEMA+', 105, 20, { align: 'center' })
      
      doc.setFontSize(18)
      doc.text('VÉ XEM PHIM', 105, 30, { align: 'center' })
      
      doc.setFontSize(14)
      doc.text(`Phim: ${movie.title}`, 20, 50)
      doc.text(`Rạp: ${cinema.name}`, 20, 60)
      doc.text(`Ngày: ${formatDate(reservation.date)}`, 20, 70)
      doc.text(`Giờ chiếu: ${reservation.startAt}`, 20, 80)
      
      // Format seats
      const seats = reservation.seats.map(
        seat => `${convertToAlphabet(seat[0])}-${seat[1] + 1}`
      ).join(', ')
      
      doc.text(`Ghế: ${seats}`, 20, 90)
      doc.text(`Tổng tiền: ${formatCurrency(reservation.total)}`, 20, 100)
      
      doc.setFontSize(10)
      doc.text('Vui lòng đến trước giờ chiếu 15 phút để check-in.', 105, 150, { align: 'center' })
      
      // Save PDF
      doc.save(`Cinema_Plus_Ticket_${reservation._id}.pdf`)
    } catch (error) {
      console.error('Error creating PDF ticket:', error)
    }
  }
  
  // Filter reservations by status (upcoming or past)
  const filterReservations = (type) => {
    const now = new Date()
    
    if (type === 'upcoming') {
      return reservations.filter(reservation => {
        const reservationDate = new Date(reservation.date)
        return reservationDate >= now
      })
    } else {
      return reservations.filter(reservation => {
        const reservationDate = new Date(reservation.date)
        return reservationDate < now
      })
    }
  }
  
  // Get formatted seats
  const getFormattedSeats = (seats) => {
    return seats.map(
      seat => `${convertToAlphabet(seat[0])}-${seat[1] + 1}`
    ).join(', ')
  }
  
  const upcomingReservations = filterReservations('upcoming')
  const pastReservations = filterReservations('past')

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-6">Vé của tôi</h1>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Sắp tới ({upcomingReservations.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Đã qua ({pastReservations.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcomingReservations.length === 0 ? (
              <div className="text-center py-20">
                <Ticket className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-medium mb-2">Bạn chưa có vé nào sắp tới</h2>
                <p className="text-gray-400 mb-6">Hãy đặt vé ngay để xem những bộ phim mới nhất</p>
                
                <Link href="/movies">
                  <Button>
                    Đặt vé ngay
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingReservations.map((reservation) => {
                  const movie = movies[reservation.movieId]
                  const cinema = cinemas[reservation.cinemaId]
                  
                  if (!movie || !cinema) return null
                  
                  return (
                    <Card 
                      key={reservation._id}
                      className="border-gray-800 overflow-hidden"
                    >
                      {/* Movie Image */}
                      <div className="relative h-40 w-full">
                        <Image
                          src={getMovieImage(movie)}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                        
                        <div className="absolute top-3 left-3">
                          <Badge variant="outline" className="bg-primary-dark text-black border-none">
                            Sắp tới
                          </Badge>
                        </div>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg capitalize">
                          {movie.title}
                        </CardTitle>
                        <CardDescription>
                          {cinema.name}, {cinema.city}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-primary-dark" />
                          <span>{formatDate(reservation.date)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-primary-dark" />
                          <span>{reservation.startAt}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-primary-dark" />
                          <span>Ghế: {getFormattedSeats(reservation.seats)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <CreditCard className="h-4 w-4 mr-2 text-primary-dark" />
                          <span>{formatCurrency(reservation.total)}</span>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-between gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownloadTicket(reservation)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Tải vé
                        </Button>
                        
                        <Button 
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedReservation(reservation)
                            setShowQrCode(true)
                          }}
                        >
                          Chi tiết
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastReservations.length === 0 ? (
              <div className="text-center py-20">
                <Film className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-medium mb-2">Bạn chưa có lịch sử xem phim</h2>
                <p className="text-gray-400 mb-6">Hãy đặt vé ngay để xem những bộ phim mới nhất</p>
                
                <Link href="/movies">
                  <Button>
                    Đặt vé ngay
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastReservations.map((reservation) => {
                  const movie = movies[reservation.movieId]
                  const cinema = cinemas[reservation.cinemaId]
                  
                  if (!movie || !cinema) return null
                  
                  return (
                    <Card 
                      key={reservation._id}
                      className="border-gray-800 overflow-hidden"
                    >
                      {/* Movie Image */}
                      <div className="relative h-40 w-full opacity-60">
                        <Image
                          src={getMovieImage(movie)}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg capitalize">
                          {movie.title}
                        </CardTitle>
                        <CardDescription>
                          {cinema.name}, {cinema.city}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-400">{formatDate(reservation.date)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-400">{reservation.startAt}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-400">Ghế: {getFormattedSeats(reservation.seats)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-400">{formatCurrency(reservation.total)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Chi tiết vé</DialogTitle>
          <DialogDescription>
            Xuất trình mã QR này tại rạp để nhận vé
          </DialogDescription>
          
          {selectedReservation && (
            <div className="py-4 space-y-4">
              <div className="flex justify-center py-4">
                <div className="relative w-48 h-48 bg-white p-4 rounded-lg">
                  {/* Placeholder for QR code */}
                  <div className="w-full h-full flex items-center justify-center border-4 border-gray-800 p-2">
                    <p className="text-black text-center">
                      Mã QR vé của bạn sẽ hiển thị ở đây
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-center">
                <p>
                  <span className="text-gray-400">Phim: </span>
                  <span className="font-medium capitalize">
                    {movies[selectedReservation.movieId]?.title}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Rạp: </span>
                  <span className="font-medium">
                    {cinemas[selectedReservation.cinemaId]?.name}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Ngày: </span>
                  <span className="font-medium">
                    {formatDate(selectedReservation.date)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Giờ: </span>
                  <span className="font-medium">
                    {selectedReservation.startAt}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Ghế: </span>
                  <span className="font-medium">
                    {getFormattedSeats(selectedReservation.seats)}
                  </span>
                </p>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button onClick={() => handleDownloadTicket(selectedReservation)}>
                  <Download className="h-4 w-4 mr-2" />
                  Tải vé PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}