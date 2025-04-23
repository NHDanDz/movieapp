"use client"

import { useState, useEffect } from 'react'
import { useBooking } from '@/hooks/useBooking'
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { convertToAlphabet } from '@/lib/utils'
import { reservationApi } from '@/lib/api'

const BookingSeats = ({ seats }) => {
  const { 
    selectedMovie,
    selectedCinema, 
    selectedDate, 
    selectedTime,
    selectedSeats, 
    suggestedSeats,
    selectSeat
  } = useBooking()
  
  const [reservedSeats, setReservedSeats] = useState([])
  const [finalSeats, setFinalSeats] = useState([])
  
  // Fetch reserved seats for this screening
  useEffect(() => {
    const fetchReservations = async () => {
      if (!selectedMovie || !selectedCinema || !selectedDate || !selectedTime) return
      
      try {
        const res = await reservationApi.getAll()
        
        if (res.data) {
          // Filter reservations for this screening
          const reservations = res.data.filter(r => 
            r.movieId === selectedMovie &&
            r.cinemaId === selectedCinema &&
            new Date(r.date).toLocaleDateString() === new Date(selectedDate).toLocaleDateString() &&
            r.startAt === selectedTime
          )
          
          // Extract reserved seats
          let reserved = []
          reservations.forEach(reservation => {
            if (reservation.seats && reservation.seats.length) {
              reserved = [...reserved, ...reservation.seats]
            }
          })
          
          setReservedSeats(reserved)
        }
      } catch (error) {
        console.error('Error fetching reservations:', error)
      }
    }
    
    fetchReservations()
  }, [selectedMovie, selectedCinema, selectedDate, selectedTime])
  
  // Process seats data
  useEffect(() => {
    if (!seats || !seats.length) {
      setFinalSeats([])
      return
    }
    
    // Create a copy of the seats
    const processedSeats = seats.map(row => [...row])
    
    // Mark reserved seats
    reservedSeats.forEach(([row, seat]) => {
      if (processedSeats[row] && processedSeats[row][seat] !== undefined) {
        processedSeats[row][seat] = 1 // 1 = reserved
      }
    })
    
    // Mark suggested seats
    if (suggestedSeats && suggestedSeats.length) {
      suggestedSeats.forEach(([row, seat]) => {
        if (
          processedSeats[row] && 
          processedSeats[row][seat] !== undefined && 
          processedSeats[row][seat] !== 1 // Not already reserved
        ) {
          processedSeats[row][seat] = 3 // 3 = suggested
        }
      })
    }
    
    // Mark selected seats
    selectedSeats.forEach(([row, seat]) => {
      if (
        processedSeats[row] && 
        processedSeats[row][seat] !== undefined && 
        processedSeats[row][seat] !== 1 // Not already reserved
      ) {
        processedSeats[row][seat] = 2 // 2 = selected
      }
    })
    
    setFinalSeats(processedSeats)
  }, [seats, reservedSeats, selectedSeats, suggestedSeats])
  
  // Handle seat click
  const handleSeatClick = (row, seat) => {
    // Check if seat is reserved
    const isReserved = reservedSeats.some(
      ([r, s]) => r === row && s === seat
    )
    
    if (isReserved) return
    
    selectSeat(row, seat)
  }
  
  // Get seat status class
  const getSeatClass = (status) => {
    switch (status) {
      case 1: return 'seat-reserved'
      case 2: return 'seat-selected'
      case 3: return 'seat-suggested'
      default: return 'seat-available'
    }
  }
  
  return (
    <Card className="mb-8 border-gray-800">
      <CardHeader>
        <CardTitle>Chọn ghế</CardTitle>
        <CardDescription>
          Vui lòng chọn ghế mà bạn muốn đặt
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Screen */}
        <div className="relative mb-8">
          <div className="w-full h-6 bg-gray-800 rounded-t-lg"></div>
          <div className="w-4/5 h-1 bg-primary-dark mx-auto rounded-b-lg"></div>
          <p className="text-center text-xs text-gray-400 mt-2">MÀN HÌNH</p>
        </div>
        
        {/* Seats */}
        <div className="flex flex-col items-center justify-center mb-8">
          {finalSeats.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex justify-center my-1">
              {/* Row label */}
              <div className="w-8 flex items-center justify-center text-sm text-gray-400 mr-2">
                {convertToAlphabet(rowIndex)}
              </div>
              
              {/* Seats */}
              <div className="flex">
                {row.map((seatStatus, seatIndex) => (
                  <div
                    key={`seat-${rowIndex}-${seatIndex}`}
                    className={`seat ${getSeatClass(seatStatus)}`}
                    onClick={() => handleSeatClick(rowIndex, seatIndex)}
                  >
                    {seatIndex + 1}
                  </div>
                ))}
              </div>
              
              {/* Row label (right side) */}
              <div className="w-8 flex items-center justify-center text-sm text-gray-400 ml-2">
                {convertToAlphabet(rowIndex)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Seat legend */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cinema-seat-available rounded mr-2"></div>
            <span>Ghế trống</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cinema-seat-reserved rounded mr-2"></div>
            <span>Ghế đã đặt</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cinema-seat-selected rounded mr-2"></div>
            <span>Ghế đang chọn</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-cinema-seat-suggested rounded mr-2"></div>
            <span>Ghế gợi ý</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSeats