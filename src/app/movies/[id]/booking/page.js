"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useBooking } from '@/hooks/useBooking'
import { movieApi, cinemaApi, showtimeApi, roomApi } from '@/lib/api'
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
import { Label } from '@/components/ui/label'

export default function BookingPage() {
  const params = useParams(); 
  
  const { id: movieId } = params
  const [movie, setMovie] = useState(null)
  const [cinemas, setCinemas] = useState([])
  const [rooms, setRooms] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [seats, setSeats] = useState({
    matrix: [],
    rowNames: [],
    maxCol: 0,
    originalData: []
  })
  const [reservedSeats, setReservedSeats] = useState([])
  
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { 
    selectedCinema, 
    selectedRoom,
    selectedDate, 
    selectedTime,
    selectedShowtime,
    selectedSeats,
    showLoginPopup,
    showInvitation,
    qrCode,
    setSelectedMovie,
    setSelectedRoom,
    toggleLoginPopup,
    getSuggestedSeats
  } = useBooking()
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching initial data for movieId:", movieId);
        
        // Fetch movie details
        const movieRes = await movieApi.getById(movieId);
        setMovie(movieRes.data);
        setSelectedMovie(movieId);
        
        // Fetch cinemas
        const cinemasRes = user 
          ? await cinemaApi.getUserModeling(user.username)
          : await cinemaApi.getAll();
        setCinemas(cinemasRes.data || []);
        
        // Fetch showtimes for this movie
        const showtimesRes = await showtimeApi.getByMovie(movieId);
        setShowtimes(showtimesRes.data || []);
        
        // Get seat suggestions if user is logged in
        if (user) {
          await getSuggestedSeats(user.username);
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [movieId, user]);
  
  // Fetch rooms when cinema is selected
  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedCinema) return;
      
      try {
        setLoading(true);
        console.log("Fetching rooms for cinema:", selectedCinema);
        
        const roomsRes = await roomApi.getByCinemaId(selectedCinema);
        setRooms(roomsRes.data || []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [selectedCinema]);
  
  // Fetch room seats when room is selected
  useEffect(() => {
    const fetchRoomSeats = async () => {
      if (!selectedRoom) return;
      
      try {
        setLoading(true);
        console.log("Fetching seats for room:", selectedRoom);
        
        // Lấy danh sách ghế trong phòng
        const seatsRes = await roomApi.getSeats(selectedRoom);
        console.log("Seats data from API:", seatsRes.data);
        
        if (seatsRes.data && seatsRes.data.length > 0) {
          // Tạo mảng các hàng và số cột duy nhất
          const uniqueRows = [...new Set(seatsRes.data.map(seat => seat.RowName))].sort();
          const uniqueCols = [...new Set(seatsRes.data.map(seat => parseInt(seat.SeatNumber)))].sort((a, b) => a - b);
          
          console.log('Các hàng:', uniqueRows, 'Các cột:', uniqueCols);
          
          // Tạo mảng 2D với hàng là index của uniqueRows, cột là số thứ tự thực
          const maxCol = Math.max(...uniqueCols);
          const seatsMatrix = Array(uniqueRows.length).fill().map(() => Array(maxCol).fill(0));
          
          // Lưu trữ ánh xạ giữa tên hàng và index trong mảng
          const rowMapping = {};
          uniqueRows.forEach((rowName, index) => {
            rowMapping[rowName] = index;
          });
          
          // Cập nhật ma trận ghế với dữ liệu từ API
          seatsRes.data.forEach(seat => {
            const rowIndex = rowMapping[seat.RowName];
            const colIndex = parseInt(seat.SeatNumber) - 1; // Chuyển về index 0-based
            
            if (rowIndex !== undefined && colIndex >= 0 && colIndex < maxCol) {
              // Gán kiểu ghế: 1 = thường, 2 = premium/vip
              seatsMatrix[rowIndex][colIndex] = 
                seat.SeatType === 'premium' || seat.SeatType === 'vip' ? 2 : 1;
            }
          });
          
          console.log("Matrix created:", seatsMatrix);
          
          // Lưu trữ thông tin các hàng
          setSeats({
            matrix: seatsMatrix,
            rowNames: uniqueRows,
            maxCol: maxCol,
            originalData: seatsRes.data  // Lưu dữ liệu gốc để sử dụng ID ghế
          });
          
          // Nếu đã chọn showtime, lấy danh sách ghế đã đặt
          if (selectedShowtime) {
            fetchReservedSeats(selectedShowtime);
          }
        } else {
          console.log("No seats data, using default matrix");
          // Nếu không có dữ liệu ghế, tạo ma trận mặc định 
          setSeats({
            matrix: [
              [1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1],
              [1, 1, 1, 1, 1],
              [2, 2, 2, 2, 2]  // Hàng E là ghế premium
            ],
            rowNames: ['A', 'B', 'C', 'D', 'E'],
            maxCol: 5,
            originalData: []
          });
        }
      } catch (error) {
        console.error('Error fetching room seats:', error);
        // Tạo ma trận ghế mặc định khi có lỗi
        console.log("Error, using default matrix");
        setSeats({
          matrix: [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [2, 2, 2, 2, 2]  // Hàng E là ghế premium
          ],
          rowNames: ['A', 'B', 'C', 'D', 'E'],
          maxCol: 5,
          originalData: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomSeats();
  }, [selectedRoom]);
  
  // Fetch reserved seats when showtime is selected
  const fetchReservedSeats = async (showtimeId) => {
    if (!selectedRoom || !showtimeId) return;
    
    try {
      console.log("Fetching reserved seats for showtime:", showtimeId);
      
      // Tạo request để kiểm tra ghế đã đặt
      const dummyCheck = { 
        showtimeId: parseInt(showtimeId),
        seats: [] // Empty để lấy tất cả ghế đã đặt
      };
      
      const checkRes = await roomApi.checkSeatsAvailability(selectedRoom, dummyCheck);
      console.log("Reserved seats response:", checkRes.data);
      
      if (checkRes.data && checkRes.data.reservedSeats) {
        setReservedSeats(checkRes.data.reservedSeats);
        
        // Cập nhật ma trận ghế để đánh dấu ghế đã đặt
        if (seats && seats.matrix) {
          const updatedMatrix = [...seats.matrix];
          const rowMapping = {};
          
          // Tạo mapping từ tên hàng -> index
          seats.rowNames.forEach((rowName, index) => {
            rowMapping[rowName] = index;
          });
          
          checkRes.data.reservedSeats.forEach(reservedSeat => {
            const [rowName, seatNumber] = reservedSeat.split('-');
            const rowIndex = rowMapping[rowName];
            const colIndex = parseInt(seatNumber) - 1;
            
            // Chỉ cập nhật nếu vị trí nằm trong ma trận
            if (rowIndex !== undefined && colIndex >= 0 && colIndex < seats.maxCol) {
              // Đánh dấu ghế đã đặt là 3
              if (updatedMatrix[rowIndex][colIndex] > 0) {
                updatedMatrix[rowIndex][colIndex] = 3;
              }
            }
          });
          
          // Cập nhật state seats
          setSeats({
            ...seats,
            matrix: updatedMatrix
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reserved seats:', error);
    }
  };
  
  // Cập nhật danh sách ghế đã đặt khi chọn showtime
  useEffect(() => {
    if (selectedShowtime) {
      fetchReservedSeats(selectedShowtime);
    }
  }, [selectedShowtime]);
  
  // Debug info
  useEffect(() => {
    console.log("Render state:", {
      selectedCinema,
      selectedRoom,
      selectedDate,
      selectedTime,
      selectedShowtime,
      hasSeats: seats && seats.matrix && seats.matrix.length > 0,
      showInvitation
    });
  }, [selectedCinema, selectedRoom, selectedDate, selectedTime, selectedShowtime, seats, showInvitation]);
  
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
            rooms={rooms}
            showtimes={showtimes}
          />
          
          {/* If showing invitation form */}
          {showInvitation && selectedSeats.length > 0 && (
            <BookingInvitation qrCode={qrCode} />
          )}
          
          {/* If cinema, room, date and time are selected, show seats */}
          {selectedCinema && selectedRoom && !showInvitation && (
            <>
              <BookingSeats 
                seats={seats} 
                reservedSeats={reservedSeats}
              />
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