"use client"

import { useState, useEffect } from 'react'
import { useBooking } from '@/hooks/useBooking'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Ticket, CreditCard, Info, User, Phone, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { roomApi } from '@/lib/api'
import { Label } from '@/components/ui/label'

export default function BookingCheckout() {
  const { 
    selectedMovie,
    selectedCinema,
    selectedRoom,
    selectedDate,
    selectedTime,
    selectedShowtime,
    selectedSeats,
    addReservation,
    showInvitationForm,
    toggleLoginPopup,
    loading
  } = useBooking()
  
  const { user, isAuthenticated } = useAuth()
  const [phone, setPhone] = useState(user?.phone || '')
  const [roomPrice, setRoomPrice] = useState(0)
  const [isCardVisible, setIsCardVisible] = useState(false)
  
  // Hiệu ứng hiển thị card
  useEffect(() => {
    if (selectedSeats.length > 0) {
      setTimeout(() => {
        setIsCardVisible(true)
      }, 300)
    } else {
      setIsCardVisible(false)
    }
  }, [selectedSeats])
  
  // Lấy giá vé cơ bản của phòng
  useEffect(() => {
    const fetchRoomPrice = async () => {
      if (!selectedRoom) return
      
      try {
        const roomData = await roomApi.getById(selectedRoom)
        if (roomData.data && roomData.data.TicketPrice) {
          setRoomPrice(parseFloat(roomData.data.TicketPrice))
        } else {
          // Giá mặc định nếu không lấy được từ API
          setRoomPrice(85000)
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin phòng:', error)
        setRoomPrice(85000) // Giá mặc định
      }
    }
    
    fetchRoomPrice()
  }, [selectedRoom])
  
  // Tính tổng tiền dựa trên số ghế đã chọn và loại ghế
  const calculateTotal = () => {
    // Sử dụng giá vé từ phòng chiếu
    const basePrice = roomPrice
    
    // Tính tổng tiền dựa trên số ghế và loại ghế
    return selectedSeats.reduce((total, seat) => {
      // Phụ thu nếu là ghế Premium
      const extraCharge = seat.extraCharge || (seat.seatType === 'premium' ? 15000 : 0)
      return total + basePrice + extraCharge
    }, 0)
  }
  
  // Tính tổng phụ phí
  const calculateExtraCharge = () => {
    return selectedSeats.reduce((total, seat) => {
      const extraCharge = seat.extraCharge || (seat.seatType === 'premium' ? 15000 : 0)
      return total + extraCharge
    }, 0)
  }
  
  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }
  
  // Xử lý khi click vào nút đặt vé
  const handleBooking = async () => {
    if (!isAuthenticated) {
      toggleLoginPopup()
      return
    }
    
    if (!phone) {
      alert('Vui lòng nhập số điện thoại')
      return
    }
    
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế')
      return
    }
    
    const today = new Date()
    const reservationData = {
      date: selectedDate,
      startAt: selectedTime,
      ticketPrice: roomPrice, // Giá vé cơ bản của phòng
      total: calculateTotal(),
      userId: user.id,
      movieId: parseInt(selectedMovie),
      showtimeId: parseInt(selectedShowtime),
      roomId: parseInt(selectedRoom),
      cinemaId: parseInt(selectedCinema),
      username: user.username,
      phone,
      seats: selectedSeats.map(seat => ({
        ...seat,
        seatPrice: roomPrice + (seat.extraCharge || 0)
      }))
    }
      // Thêm log kiểm tra dữ liệu
  console.log('=== DATA TRƯỚC KHI GỬI LÊN SERVER ===');
  console.log('Reservation Data:', reservationData);
  console.log('date:', reservationData.date, 'Type:', typeof reservationData.date);
  console.log('startAt:', reservationData.startAt, 'Type:', typeof reservationData.startAt);
  console.log('selectedDate:', selectedDate, 'Type:', typeof selectedDate);
  console.log('selectedTime:', selectedTime, 'Type:', typeof selectedTime);
  
  // Kiểm tra null hoặc undefined
  if (!reservationData.date) {
    console.error('Reservation Data:', reservationData);
    console.error('CẢNH BÁO: Trường date đang bị null hoặc undefined!');
  }
  
  if (!reservationData.startAt) {
    console.error('CẢNH BÁO: Trường startAt đang bị null hoặc undefined!');
  }
  
    const result = await addReservation(reservationData)
    
    if (result && result.status === 'success') {
      showInvitationForm()
    }
  }

  // Nếu không có ghế được chọn, không hiển thị card
  if (selectedSeats.length === 0) {
    return null
  }

  return (
    <Card className={`border-gray-800 bg-background/70 backdrop-blur-sm transition-all duration-500 ${isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <CardHeader className="border-b border-gray-800 pb-4">
        <CardTitle className="flex items-center text-lg">
          <CreditCard className="h-5 w-5 mr-2 text-primary-dark" />
          Thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Thông tin ghế đã chọn */}
          <div className="bg-gray-800/40 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center text-gray-300">
              <Ticket className="h-4 w-4 mr-2 text-primary-dark" />
              Thông tin vé
            </h3>
            <div className="space-y-3">
              {selectedSeats.map((seat, index) => (
                <div 
                  key={`summary-seat-${index}`} 
                  className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0"
                >
                  <div className="flex items-center">
                    <div className={`h-6 w-6 flex items-center justify-center text-xs rounded-md mr-3 ${seat.seatType === 'premium' ? 'bg-yellow-600' : 'bg-blue-700'}`}>
                      {seat.rowName}{seat.seatNumber}
                    </div>
                    <div>
                      <p className="font-medium">Hàng {seat.rowName} - Ghế {seat.seatNumber}</p>
                      <p className="text-xs text-gray-400">
                        {seat.seatType === 'premium' ? 'Ghế Premium' : 'Ghế Thường'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(roomPrice + (seat.extraCharge || 0))}
                    </p>
                    {seat.seatType === 'premium' && (
                      <p className="text-xs text-yellow-500">
                        +{formatCurrency(seat.extraCharge || 15000)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Thông tin giá vé */}
          <div className="bg-gray-800/40 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center text-gray-300">
              <Info className="h-4 w-4 mr-2 text-primary-dark" />
              Chi tiết thanh toán
            </h3>
            <div className="space-y-3 divide-y divide-gray-700/50">
              <div className="flex justify-between py-2">
                <span className="text-gray-300">Giá vé cơ bản:</span>
                <span>{formatCurrency(roomPrice)} x {selectedSeats.length}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-300">Phụ thu ghế Premium:</span>
                <span>{formatCurrency(calculateExtraCharge())}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-300">Phí dịch vụ:</span>
                <span>{formatCurrency(10000 * selectedSeats.length)}</span>
              </div>
              
              <div className="flex justify-between pt-4 font-bold">
                <span>Tổng thanh toán:</span>
                <span className="text-primary-dark text-lg">
                  {formatCurrency(calculateTotal() + 10000 * selectedSeats.length)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Thông tin liên hệ */}
          <div className="bg-gray-800/40 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center text-gray-300">
              <User className="h-4 w-4 mr-2 text-primary-dark" />
              Thông tin liên hệ
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="phone" className="text-gray-300 flex items-center mb-2">
                  <Phone className="h-4 w-4 mr-2 text-primary-dark" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 bg-gray-900/70 border-gray-700 focus:border-primary-dark"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/40 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary-dark mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-300">
                Bằng cách đặt vé, bạn đồng ý với <span className="text-primary-dark cursor-pointer hover:underline">Điều khoản sử dụng</span> và <span className="text-primary-dark cursor-pointer hover:underline">Chính sách bảo mật</span> của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 pb-5">
        {isAuthenticated ? (
          <Button 
            className="w-full h-12 text-base font-medium btn-gradient group"
            disabled={
              selectedSeats.length === 0 || 
              !phone ||
              loading
            }
            onClick={handleBooking}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                Đặt vé ngay
                <Ticket className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              </>
            )}
          </Button>
        ) : (
          <Button 
            className="w-full h-12 text-base font-medium"
            onClick={toggleLoginPopup}
          >
            Đăng nhập để đặt vé
            <User className="ml-2 h-5 w-5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}