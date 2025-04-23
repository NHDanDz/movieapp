"use client"

import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { vi } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { useBooking } from '@/hooks/useBooking'

import "react-datepicker/dist/react-datepicker.css"

const BookingForm = ({ cinemas, showtimes }) => {
  const { 
    selectedCinema,
    selectedDate,
    selectedTime,
    setSelectedCinema,
    setSelectedDate,
    setSelectedTime
  } = useBooking()
  
  const [availableTimes, setAvailableTimes] = useState([])
  const [minDate, setMinDate] = useState(new Date())
  const [maxDate, setMaxDate] = useState(null)
  
  // Filter available showtimes based on selected cinema and date
  useEffect(() => {
    if (!selectedCinema || !selectedDate || !showtimes.length) {
      setAvailableTimes([])
      return
    }
    
    // Convert selectedDate to start of day for comparison
    const selectedDateStart = new Date(selectedDate)
    selectedDateStart.setHours(0, 0, 0, 0)
    
    // Find showtimes for selected cinema
    const filteredShowtimes = showtimes.filter(showtime => {
      // Check cinema
      if (showtime.cinemaId !== selectedCinema) return false
      
      // Check if date is within showtime range
      const startDate = new Date(showtime.startDate)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(showtime.endDate)
      endDate.setHours(23, 59, 59, 999)
      
      return selectedDateStart >= startDate && selectedDateStart <= endDate
    })
    
    // Extract unique times
    const times = filteredShowtimes
      .map(showtime => showtime.startAt)
      .filter((time, index, self) => self.indexOf(time) === index)
      .sort()
    
    setAvailableTimes(times)
    
    // If current selected time is not available, reset it
    if (selectedTime && !times.includes(selectedTime)) {
      setSelectedTime('')
    }
  }, [selectedCinema, selectedDate, showtimes, selectedTime, setSelectedTime])
  
  // Set min and max date range when cinema is selected
  useEffect(() => {
    if (!selectedCinema || !showtimes.length) {
      setMinDate(new Date())
      setMaxDate(null)
      return
    }
    
    // Find all showtimes for the selected cinema
    const cinemaShowtimes = showtimes.filter(
      showtime => showtime.cinemaId === selectedCinema
    )
    
    if (!cinemaShowtimes.length) return
    
    // Find min and max dates
    let minDateValue = new Date()
    let maxDateValue = new Date()
    maxDateValue.setDate(maxDateValue.getDate() + 30) // Default 30 days
    
    cinemaShowtimes.forEach(showtime => {
      const startDate = new Date(showtime.startDate)
      const endDate = new Date(showtime.endDate)
      
      if (startDate < minDateValue) {
        minDateValue = startDate
      }
      
      if (endDate > maxDateValue) {
        maxDateValue = endDate
      }
    })
    
    // If minDate is in the past, use today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (minDateValue < today) {
      minDateValue = today
    }
    
    setMinDate(minDateValue)
    setMaxDate(maxDateValue)
    
    // If current selected date is outside new range, reset it
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate)
      selectedDateObj.setHours(0, 0, 0, 0)
      
      if (selectedDateObj < minDateValue || selectedDateObj > maxDateValue) {
        setSelectedDate(minDateValue)
      }
    } else {
      // If no date selected, set to min date
      setSelectedDate(minDateValue)
    }
  }, [selectedCinema, showtimes, selectedDate, setSelectedDate])
  
  const handleCinemaChange = (value) => {
    setSelectedCinema(value)
    setSelectedTime('')
  }
  
  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
  }
  
  return (
    <Card className="mb-8 border-gray-800">
      <CardHeader>
        <CardTitle>Chọn suất chiếu</CardTitle>
        <CardDescription>
          Vui lòng chọn rạp, ngày và suất chiếu để tiếp tục đặt vé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cinema Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Rạp chiếu phim
            </label>
            <Select 
              value={selectedCinema || ''} 
              onValueChange={handleCinemaChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn rạp chiếu" />
              </SelectTrigger>
              <SelectContent>
                {cinemas.map(cinema => (
                  <SelectItem key={cinema._id} value={cinema._id}>
                    {cinema.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ngày xem phim
            </label>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={minDate}
                maxDate={maxDate}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                disabled={!selectedCinema}
                className="w-full p-2 rounded-md bg-background border border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-dark"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Suất chiếu
            </label>
            <Select 
              value={selectedTime || ''} 
              onValueChange={setSelectedTime}
              disabled={!selectedCinema || !selectedDate || availableTimes.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn giờ chiếu" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {(!selectedCinema || !selectedDate || !selectedTime) && (
          <div className="mt-6 text-sm text-center text-gray-400">
            {!selectedCinema 
              ? "Vui lòng chọn rạp chiếu để tiếp tục" 
              : !selectedDate 
                ? "Vui lòng chọn ngày xem phim" 
                : !selectedTime 
                  ? "Vui lòng chọn suất chiếu" 
                  : ""}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BookingForm