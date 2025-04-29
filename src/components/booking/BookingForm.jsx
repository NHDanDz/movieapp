"use client"

import { useState, useEffect } from 'react'
import { useBooking } from '@/hooks/useBooking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { MapPin, Calendar, Clock, Building2, Check } from 'lucide-react'
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
  const [formLoaded, setFormLoaded] = useState(false)
  
  // Hiệu ứng load form
  useEffect(() => {
    const timer = setTimeout(() => {
      setFormLoaded(true)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const dayOfWeek = format(date, 'EEEE', { locale: vi })
    const dayAndMonth = format(date, 'dd/MM', { locale: vi })
    
    return { dayOfWeek, dayAndMonth }
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
    setSelectedRoom(value);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedShowtime(null);
    
    // Lọc các suất chiếu cho phòng đã chọn
    if (value) {
      // Lưu ý cấu trúc dữ liệu từ API - RoomID phải viết hoa theo DB
      const filtered = showtimes.filter(
        showtime => showtime.RoomID === parseInt(value)
      );
      setFilteredShowtimes(filtered);
      
      // Lấy danh sách ngày chiếu từ các suất chiếu đã lọc
      const dates = [...new Set(filtered.map(showtime => 
        showtime.StartDate
      ))].sort();
      
      setAvailableDates(dates);
    } else {
      setFilteredShowtimes([]);
      setAvailableDates([]);
    }
  };
  
  // Khi chọn ngày - cũng cần điều chỉnh tương tự
  const handleDateChange = (value) => {
    setSelectedDate(value);
    setSelectedTime(null);
    setSelectedShowtime(null);
    
    // Lọc các suất chiếu cho ngày đã chọn
    if (value) {
      const timeSlots = filteredShowtimes
        .filter(showtime => showtime.StartDate === value)
        .map(showtime => ({
          id: showtime.ID,
          time: showtime.StartAt
        }))
        .sort((a, b) => {
          // Sắp xếp theo thời gian
          const timeA = a.time.split(':').map(Number);
          const timeB = b.time.split(':').map(Number);
          
          if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
          return timeA[1] - timeB[1];
        });
      
      setAvailableTimes(timeSlots);
    } else {
      setAvailableTimes([]);
    }
  };
  
  // Khi chọn giờ chiếu
  const handleTimeChange = (timeSlot) => {
    // Tách id và time từ timeSlot (format: "id|time")
    const [id, time] = timeSlot.split('|')
    
    setSelectedTime(time)
    setSelectedShowtime(id)
  }

  return (
    <Card className={`mb-6 border-gray-800 bg-background/70 backdrop-blur-sm transition-all duration-500 ${formLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <CardHeader className="border-b border-gray-800 pb-4">
        <CardTitle className="flex items-center text-lg">
          <Calendar className="h-5 w-5 mr-2 text-primary-dark" />
          Chọn rạp và suất chiếu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 mt-4">
          {/* Chọn rạp */}
          <div className="grid gap-2">
            <Label htmlFor="cinema" className="flex items-center text-gray-300">
              <MapPin className="h-4 w-4 mr-2 text-primary-dark" />
              Rạp chiếu phim
            </Label>
            <Select
              value={selectedCinema || ''}
              onValueChange={handleCinemaChange}
            >
              <SelectTrigger id="cinema" className="h-12">
                <SelectValue placeholder="Chọn rạp phim" />
              </SelectTrigger>
              <SelectContent>
                {cinemas.map((cinema) => (
                  <SelectItem 
                    key={cinema.id || cinema.ID} 
                    value={cinema.id?.toString() || cinema.ID?.toString()}
                    className="capitalize"
                  >
                    {cinema.name || cinema.Name} - {cinema.city || cinema.City}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Chọn phòng chiếu - Thêm mới */}
          {selectedCinema && rooms.length > 0 && (
            <div className={`grid gap-2 transition-all duration-500 ${selectedCinema ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Label htmlFor="room" className="flex items-center text-gray-300">
                <Building2 className="h-4 w-4 mr-2 text-primary-dark" />
                Phòng chiếu
              </Label>
              <Select
                value={selectedRoom || ''}
                onValueChange={handleRoomChange}
              >
                <SelectTrigger id="room" className="h-12">
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
            <div className={`grid gap-3 transition-all duration-500 ${selectedRoom ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Label htmlFor="date" className="flex items-center text-gray-300">
                <Calendar className="h-4 w-4 mr-2 text-primary-dark" />
                Chọn ngày
              </Label>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <RadioGroup 
                  value={selectedDate || ''}
                  onValueChange={handleDateChange}
                  className="flex flex-wrap gap-2"
                >
                  {availableDates.map((date) => {
                    const { dayOfWeek, dayAndMonth } = formatDate(date);
                    const isSelected = selectedDate === date;
                    
                    return (
                      <div key={date} className="flex items-center">
                        <RadioGroupItem 
                          value={date} 
                          id={`date-${date}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`date-${date}`}
                          className={`flex flex-col items-center justify-between rounded-md border-2 p-3 hover:bg-gray-800 hover:border-primary-dark peer-data-[state=checked]:border-primary-dark peer-data-[state=checked]:bg-gray-800/70 [&:has([data-state=checked])]:border-primary-dark cursor-pointer w-20 transition-all duration-300 ${
                            isSelected ? 'border-primary-dark bg-gray-800/70' : 'border-gray-700 bg-gray-800/30'
                          }`}
                        >
                          <span className={`text-xs font-medium capitalize ${isSelected ? 'text-primary-dark' : 'text-gray-400'}`}>
                            {dayOfWeek}
                          </span>
                          <span className="text-lg font-bold mt-1">{dayAndMonth}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary-dark mt-1" />}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          )}
          
          {/* Chọn giờ */}
          {selectedDate && availableTimes.length > 0 && (
            <div className={`grid gap-3 transition-all duration-500 ${selectedDate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Label htmlFor="time" className="flex items-center text-gray-300">
                <Clock className="h-4 w-4 mr-2 text-primary-dark" />
                Chọn giờ
              </Label>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <RadioGroup 
                  value={selectedTime ? `${selectedShowtime}|${selectedTime}` : ''}
                  onValueChange={handleTimeChange}
                  className="flex flex-wrap gap-3"
                >
                  {availableTimes.map((slot) => {
                    const isSelected = selectedTime === slot.time && selectedShowtime === slot.id.toString();
                    
                    return (
                      <div key={`${slot.id}-${slot.time}`} className="flex items-center">
                        <RadioGroupItem 
                          value={`${slot.id}|${slot.time}`} 
                          id={`time-${slot.id}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`time-${slot.id}`}
                          className={`flex min-w-16 items-center justify-center rounded-md border-2 p-3 hover:bg-gray-800 hover:border-primary-dark peer-data-[state=checked]:border-primary-dark peer-data-[state=checked]:bg-gray-800/70 [&:has([data-state=checked])]:border-primary-dark cursor-pointer transition-all duration-300 ${
                            isSelected ? 'border-primary-dark bg-gray-800/70' : 'border-gray-700 bg-gray-800/30'
                          }`}
                        >
                          <Clock className={`h-4 w-4 mr-2 ${isSelected ? 'text-primary-dark' : 'text-gray-400'}`} />
                          <span className={`text-md font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {slot.time}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-primary-dark ml-2" />}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}