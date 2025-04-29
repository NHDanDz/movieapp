"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar, Clock, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBooking } from '@/hooks/useBooking'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const CinemaShowtimes = ({ showtimes, movieId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [displayShowtimes, setDisplayShowtimes] = useState([])
  
  const router = useRouter()
  const { setSelectedMovie, setSelectedCinema, setSelectedDate: setBookingDate, setSelectedTime } = useBooking()
  
  // Chuẩn bị dữ liệu suất chiếu
  useEffect(() => {
    if (!showtimes.length) return
    
    // Lọc suất chiếu theo ngày đã chọn
    const filteredShowtimes = showtimes.filter(showtime => {
      const showtimeStartDate = new Date(showtime.StartDate)
      const showtimeEndDate = new Date(showtime.EndDate)
      return selectedDate >= showtimeStartDate && selectedDate <= showtimeEndDate
    })
    
    setDisplayShowtimes(filteredShowtimes)
  }, [showtimes, selectedDate])
  
  const handleTimeClick = (showtime) => {
    // Lưu thông tin đặt vé vào context
    setSelectedMovie(movieId)
    setSelectedCinema(showtime.RoomID) // Dùng tạm RoomID thay cho CinemaID
    setBookingDate(selectedDate)
    setSelectedTime(showtime.StartAt)
    
    // Chuyển đến trang đặt vé
    router.push(`/movies/${movieId}/booking`)
  }
  
  // Tạo tùy chọn ngày cho 7 ngày tới
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })
  
  // Format giá vé để hiển thị
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ'
  }
  
  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-8">
        {dateOptions.map((date, index) => (
          <Button
            key={index}
            variant={selectedDate.toDateString() === date.toDateString() ? "default" : "outline"}
            onClick={() => setSelectedDate(date)}
            className="min-w-24"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs font-normal">
                {format(date, 'EEEE', { locale: vi })}
              </span>
              <span className="font-medium">
                {format(date, 'd/M', { locale: vi })}
              </span>
            </div>
          </Button>
        ))}
      </div>
      
      {displayShowtimes.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">Không có suất chiếu cho ngày này</p>
          <p className="text-sm text-gray-500 mt-1">Vui lòng chọn ngày khác hoặc kiểm tra lại sau</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayShowtimes.map((showtime) => (
            <Card key={showtime.ID} className="border-gray-800 bg-background">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image 
                      src={'/images/cinema-placeholder.jpg'} 
                      alt={showtime.CinemaName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{showtime.CinemaName}</CardTitle>
                    <p className="text-sm text-gray-400 mt-1 capitalize">{showtime.City}</p>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-300">
                      <span className="flex items-center">
                        <Ticket className="h-4 w-4 mr-1 text-primary-dark" />
                        Giá vé: {formatPrice(showtime.TicketPrice)}
                      </span>
                      <span className="mx-2">•</span>
                      <span>Phòng: {showtime.RoomName} ({showtime.RoomType})</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2">
                  <h4 className="text-sm text-gray-400 flex items-center mb-3">
                    <Clock className="h-4 w-4 mr-2 text-primary-dark" />
                    Suất chiếu
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="border-gray-700 hover:border-primary-dark hover:bg-primary-dark hover:text-black transition-colors"
                      onClick={() => handleTimeClick(showtime)}
                    >
                      {showtime.StartAt}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default CinemaShowtimes