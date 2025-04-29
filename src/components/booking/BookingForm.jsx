"use client"

import { useState, useEffect } from 'react'
import { useBooking } from '@/hooks/useBooking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function BookingForm({ cinemas = [], rooms = [], showtimes = [] }) {
  const { 
    selectedMovie,
    selectedCinema, 
    selectedRoom,
    selectedDate, 
    selectedTime,
    setSelectedCinema,
    setSelectedRoom,
    setSelectedDate,
    setSelectedTime,
    setSelectedShowtime,
    resetBooking,
  } = useBooking()
  
  const [availableDates, setAvailableDates] = useState([])
  const [availableTimes, setAvailableTimes] = useState([])
  const [filteredShowtimes, setFilteredShowtimes] = useState([])
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi })
  }
  
  // Khi chọn rạp
  const handleCinemaChange = (value) => {
    setSelectedCinema(value)
    setSelectedRoom(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedShowtime(null)
  }
  
  // Khi chọn phòng
  const handleRoomChange = (value) => {
    setSelectedRoom(value)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedShowtime(null)
    
    // Lọc các suất chiếu cho phòng đã chọn
    if (value) {
      const filtered = showtimes.filter(
        showtime => showtime.RoomID === parseInt(value) || showtime.roomId === parseInt(value)
      )
      setFilteredShowtimes(filtered)
      
      // Lấy danh sách ngày chiếu từ các suất chiếu đã lọc
      const dates = [...new Set(filtered.map(showtime => 
        showtime.StartDate || showtime.startDate
      ))].sort()
      
      setAvailableDates(dates)
    } else {
      setFilteredShowtimes([])
      setAvailableDates([])
    }
  }
  
  // Khi chọn ngày
  const handleDateChange = (value) => {
    setSelectedDate(value)
    setSelectedTime(null)
    setSelectedShowtime(null)
    
    // Lọc các suất chiếu cho ngày đã chọn
    if (value) {
      const timeSlots = filteredShowtimes
        .filter(showtime => 
          (showtime.StartDate === value || showtime.startDate === value)
        )
        .map(showtime => ({
          id: showtime.ID || showtime.id,
          time: showtime.StartAt || showtime.startAt
        }))
        .sort((a, b) => {
          // Sắp xếp theo thời gian
          const timeA = a.time.split(':').map(Number)
          const timeB = b.time.split(':').map(Number)
          
          if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0]
          return timeA[1] - timeB[1]
        })
      
      setAvailableTimes(timeSlots)
    } else {
      setAvailableTimes([])
    }
  }
  
  // Khi chọn giờ chiếu
  const handleTimeChange = (timeSlot) => {
    // Tách id và time từ timeSlot (format: "id|time")
    const [id, time] = timeSlot.split('|')
    
    setSelectedTime(time)
    setSelectedShowtime(id)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Chọn rạp và suất chiếu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Chọn rạp */}
          <div className="grid gap-2">
            <Label htmlFor="cinema">Rạp chiếu phim</Label>
            <Select
              value={selectedCinema || ''}
              onValueChange={handleCinemaChange}
            >
              <SelectTrigger id="cinema">
                <SelectValue placeholder="Chọn rạp phim" />
              </SelectTrigger>
              <SelectContent>
                {cinemas.map((cinema) => (
                  <SelectItem 
                    key={cinema.id || cinema.ID} 
                    value={cinema.id?.toString() || cinema.ID?.toString()}
                  >
                    {cinema.name || cinema.Name} - {cinema.city || cinema.City}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Chọn phòng chiếu - Thêm mới */}
          {selectedCinema && rooms.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="room">Phòng chiếu</Label>
              <Select
                value={selectedRoom || ''}
                onValueChange={handleRoomChange}
              >
                <SelectTrigger id="room">
                  <SelectValue placeholder="Chọn phòng chiếu" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem 
                      key={room.id || room.ID} 
                      value={room.id?.toString() || room.ID?.toString()}
                    >
                      {room.name || room.Name} ({room.roomType || room.RoomType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Chọn ngày */}
          {selectedRoom && availableDates.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="date">Chọn ngày</Label>
              <RadioGroup 
                value={selectedDate || ''}
                onValueChange={handleDateChange}
                className="flex flex-wrap gap-2"
              >
                {availableDates.map((date) => (
                  <div key={date} className="flex items-center">
                    <RadioGroupItem 
                      value={date} 
                      id={`date-${date}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`date-${date}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-sm font-medium">{formatDate(date)}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
          
          {/* Chọn giờ */}
          {selectedDate && availableTimes.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="time">Chọn giờ</Label>
              <RadioGroup 
                value={selectedTime ? `${selectedShowtime}|${selectedTime}` : ''}
                onValueChange={handleTimeChange}
                className="flex flex-wrap gap-2"
              >
                {availableTimes.map((slot) => (
                  <div key={`${slot.id}-${slot.time}`} className="flex items-center">
                    <RadioGroupItem 
                      value={`${slot.id}|${slot.time}`} 
                      id={`time-${slot.id}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`time-${slot.id}`}
                      className="flex min-w-[60px] items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-sm font-medium">{slot.time}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}