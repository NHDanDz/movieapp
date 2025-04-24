"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useBooking } from '@/hooks/useBooking'
import { movieApi, cinemaApi, showtimeApi } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import MovieInfo from '@/components/booking/MovieInfo'
import BookingForm from '@/components/booking/BookingForm'
import BookingSeats from '@/components/booking/BookingSeats'
import BookingCheckout from '@/components/booking/BookingCheckout'
import BookingInvitation from '@/components/booking/BookingInvitation'
import LoginForm from '@/components/auth/LoginForm'
import { useParams } from 'next/navigation'

export default function BookingPage() {
  const params = useParams(); 
  
  const { id: movieId } = params
  const [movie, setMovie] = useState(null)
  const [cinemas, setCinemas] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [seats, setSeats] = useState([])
  
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { 
    selectedCinema, 
    selectedDate, 
    selectedTime,
    selectedSeats,
    showLoginPopup,
    showInvitation,
    qrCode,
    setSelectedMovie,
    toggleLoginPopup,
    getSuggestedSeats
  } = useBooking()
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch movie details
        const movieRes = await movieApi.getById(movieId)
        setMovie(movieRes.data)
        setSelectedMovie(movieId)
        
        // Fetch cinemas
        const cinemasRes = user 
          ? await cinemaApi.getUserModeling(user.username)
          : await cinemaApi.getAll()
        setCinemas(cinemasRes.data || [])
        
        // Fetch showtimes for this movie
        const showtimesRes = await showtimeApi.getByMovie(movieId)
        setShowtimes(showtimesRes.data || [])
        
        // Get seat suggestions if user is logged in
        if (user) {
          await getSuggestedSeats(user.username)
        }
      } catch (error) {
        console.error('Error fetching booking data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [movieId, user, setSelectedMovie, getSuggestedSeats])
  
  // Fetch cinema seats when cinema is selected
// Fetch cinema seats when cinema is selected
useEffect(() => {
  const fetchCinemaSeats = async () => {
    if (!selectedCinema) return
    
    try {
      setLoading(true)
      const cinemaRes = await cinemaApi.getById(selectedCinema)
      
      if (cinemaRes.data && cinemaRes.data.seats) {
        // Kiểm tra định dạng của seats từ API
        console.log('Seats data format:', cinemaRes.data.seats);
        
        // Đảm bảo seats là một mảng 2 chiều
        let seatsData = cinemaRes.data.seats;
        if (!Array.isArray(seatsData) || !seatsData.length || !Array.isArray(seatsData[0])) {
          // Nếu không phải mảng 2D, tạo mảng mẫu
          seatsData = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
          ];
        }
        
        setSeats(seatsData)
      } else {
        // Tạo mảng mẫu nếu không có dữ liệu
        setSeats([
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0]
        ])
      }
    } catch (error) {
      console.error('Error fetching cinema seats:', error)
      // Tạo mảng mẫu nếu có lỗi
      setSeats([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
      ])
    } finally {
      setLoading(false)
    }
  }
  
  fetchCinemaSeats()
}, [selectedCinema])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
      </div>
    )
  }
  
  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertDescription>
            Không tìm thấy thông tin phim. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/movies')}>
          Quay lại danh sách phim
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Movie Info Sidebar */}
        <div className="lg:col-span-3">
          <MovieInfo movie={movie} />
        </div>
        
        {/* Booking Content */}
        <div className="lg:col-span-9">
          {/* Booking Form (Cinema, Date, Time selection) */}
          <BookingForm 
            cinemas={cinemas}
            showtimes={showtimes}
          />
          
          {/* If showing invitation form */}
          {showInvitation && selectedSeats.length > 0 && (
            <BookingInvitation qrCode={qrCode} />
          )}
          
          {/* If cinema, date and time are selected, show seats */}
          {selectedCinema && selectedDate && selectedTime && !showInvitation && (
            <>
              <BookingSeats seats={seats} />
              <BookingCheckout />
            </>
          )}
        </div>
      </div>
      
      {/* Login Dialog */}
      <Dialog open={showLoginPopup} onOpenChange={toggleLoginPopup}>
        <DialogContent className="sm:max-w-md">
          <LoginForm isDialog />
        </DialogContent>
      </Dialog>
    </div>
  )
}