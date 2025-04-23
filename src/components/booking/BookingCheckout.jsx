"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useBooking } from '@/hooks/useBooking'
import { cinemaApi } from '@/lib/api'
import { formatCurrency, formatDate, convertToAlphabet } from '@/lib/utils'
import { Loader2, CalendarDays, Clock, MapPin, CircleDollarSign, Users } from 'lucide-react'
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const BookingCheckout = () => {
  const [cinema, setCinema] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const { user, isAuthenticated } = useAuth()
  const { 
    selectedCinema, 
    selectedDate,
    selectedTime,
    selectedSeats,
    addReservation,
    toggleLoginPopup
  } = useBooking()
  
  // Fetch cinema details
  useEffect(() => {
    const fetchCinema = async () => {
      if (!selectedCinema) return
      
      try {
        setLoading(true)
        const res = await cinemaApi.getById(selectedCinema)
        setCinema(res.data)
      } catch (error) {
        console.error('Error fetching cinema details:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCinema()
  }, [selectedCinema])
  
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toggleLoginPopup()
      return
    }
    
    if (!selectedSeats.length) {
      return
    }
    
    try {
      setSubmitting(true)
      
      // Format seats for API
      const formattedSeats = selectedSeats.map(seat => [seat[0], seat[1]])
      
      // Create reservation data
      const reservationData = {
        date: selectedDate,
        startAt: selectedTime,
        seats: formattedSeats,
        ticketPrice: cinema.ticketPrice,
        total: selectedSeats.length * cinema.ticketPrice,
        movieId: selectedCinema,
        cinemaId: cinema._id,
        username: user.username,
        phone: user.phone || ''
      }
      
      await addReservation(reservationData)
    } catch (error) {
      console.error('Error during checkout:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  // Calculate total price
  const calculateTotal = () => {
    if (!cinema) return 0
    return selectedSeats.length * cinema.ticketPrice
  }
  
  // Format selected seats for display
  const formatSelectedSeats = () => {
    if (!selectedSeats.length) return 'Chưa chọn ghế'
    
    return selectedSeats
      .map(([row, seat]) => `${convertToAlphabet(row)}${seat + 1}`)
      .join(', ')
  }
  
  if (loading) {
    return (
      <Card className="border-gray-800">
        <CardContent className="py-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!cinema) return null
  
  return (
    <Card className="border-gray-800">
      <CardHeader>
        <CardTitle>Thông tin đặt vé</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {selectedSeats.length === 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              Vui lòng chọn ít nhất một ghế để tiếp tục đặt vé
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-primary-dark flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-gray-400">Ngày chiếu</p>
              <p className="font-medium">{formatDate(selectedDate)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary-dark flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-gray-400">Giờ chiếu</p>
              <p className="font-medium">{selectedTime}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary-dark flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-gray-400">Rạp chiếu</p>
              <p className="font-medium">{cinema.name}</p>
              <p className="text-sm text-gray-400 capitalize">{cinema.city}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-primary-dark flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-gray-400">Ghế đã chọn</p>
              <p className="font-medium">{formatSelectedSeats()}</p>
              {selectedSeats.length > 0 && (
                <p className="text-sm text-gray-400">{selectedSeats.length} ghế</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Giá vé:</span>
            <span>{formatCurrency(cinema.ticketPrice)} / vé</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Số lượng:</span>
            <span>{selectedSeats.length} vé</span>
          </div>
          
          <div className="flex justify-between items-center text-lg font-semibold mt-4">
            <span>Tổng cộng:</span>
            <span className="text-primary-dark">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-4 pt-2">
        <Button
          size="lg"
          onClick={handleCheckout}
          disabled={selectedSeats.length === 0 || submitting}
          className="relative"
        >
          {submitting && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          Đặt vé ngay
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BookingCheckout