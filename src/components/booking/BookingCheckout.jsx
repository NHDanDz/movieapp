"use client"

import { useState, useEffect } from 'react'
import { useBooking } from '@/hooks/useBooking'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { roomApi } from '@/lib/api'

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
    
    const result = await addReservation(reservationData)
    
    if (result && result.status === 'success') {
      showInvitationForm()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thanh toán</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Thông tin giá vé */}
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Giá vé cơ bản:</div>
            <div className="text-right">{formatCurrency(roomPrice)}</div>
            
            <div className="font-medium">Phụ thu ghế Premium:</div>
            <div className="text-right">{formatCurrency(15000)} / ghế</div>
            
            <div className="font-medium">Số lượng ghế:</div>
            <div className="text-right">{selectedSeats.length}</div>
            
            <div className="font-medium">Ghế đã chọn:</div>
            <div className="text-right">
              {selectedSeats.map((seat, index) => (
                <span key={`checkout-seat-${index}`}>
                  {`Hàng ${seat.rowName} - Ghế ${seat.seatNumber}`}
                  {(seat.seatType === 'premium' || seat.seatType === 'vip') ? ' (Premium)' : ''}
                  {index < selectedSeats.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
            
            <div className="font-medium text-lg pt-2">Tổng tiền:</div>
            <div className="text-right text-lg font-bold text-primary pt-2">
              {formatCurrency(calculateTotal())}
            </div>
          </div>
          
          {/* Thông tin liên hệ */}
          <div className="space-y-2 pt-4">
            <div className="font-medium">Số điện thoại liên hệ:</div>
            <Input
              type="tel"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isAuthenticated ? (
          <Button 
            className="w-full" 
            disabled={
              selectedSeats.length === 0 || 
              !phone ||
              loading
            }
            onClick={handleBooking}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Đặt vé ngay'
            )}
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={toggleLoginPopup}
          >
            Đăng nhập để đặt vé
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}