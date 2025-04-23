"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cinemaApi } from '@/lib/api'
import { Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBooking } from '@/hooks/useBooking'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const CinemaShowtimes = ({ showtimes, movieId }) => {
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [groupedShowtimes, setGroupedShowtimes] = useState({})
  
  const router = useRouter()
  const { setSelectedMovie, setSelectedCinema, setSelectedDate: setBookingDate, setSelectedTime } = useBooking()
  
  // Fetch cinema details
  useEffect(() => {
    const fetchCinemasData = async () => {
      try {
        setLoading(true)
        const cinemasRes = await cinemaApi.getAll()
        setCinemas(cinemasRes.data || [])
      } catch (error) {
        console.error('Error fetching cinemas:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCinemasData()
  }, [])
  
  // Group showtimes by cinema
  useEffect(() => {
    if (!showtimes.length || !cinemas.length) return
    
    // Group by cinemaId
    const grouped = {}
    
    showtimes.forEach(showtime => {
      const cinema = cinemas.find(c => c._id === showtime.cinemaId)
      if (!cinema) return
      
      // Check if the showtime date is valid for selected date
      const showtimeDate = new Date(showtime.startDate)
      const endDate = new Date(showtime.endDate)
      
      if (selectedDate >= showtimeDate && selectedDate <= endDate) {
        if (!grouped[showtime.cinemaId]) {
          grouped[showtime.cinemaId] = {
            cinema,
            times: []
          }
        }
        
        if (!grouped[showtime.cinemaId].times.includes(showtime.startAt)) {
          grouped[showtime.cinemaId].times.push(showtime.startAt)
        }
      }
    })
    
    // Sort times
    for (const cinemaId in grouped) {
      grouped[cinemaId].times.sort((a, b) => {
        return new Date(`01/01/2021 ${a}`) - new Date(`01/01/2021 ${b}`)
      })
    }
    
    setGroupedShowtimes(grouped)
  }, [showtimes, cinemas, selectedDate])
  
  const handleTimeClick = (cinema, time) => {
    // Store booking information in context
    setSelectedMovie(movieId)
    setSelectedCinema(cinema._id)
    setBookingDate(selectedDate)
    setSelectedTime(time)
    
    // Navigate to booking page
    router.push(`/movies/${movieId}/booking`)
  }
  
  // Generate date options for next 7 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })
  
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
      
      {Object.keys(groupedShowtimes).length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">Không có suất chiếu cho ngày này</p>
          <p className="text-sm text-gray-500 mt-1">Vui lòng chọn ngày khác hoặc kiểm tra lại sau</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedShowtimes).map(({ cinema, times }) => (
            <Card key={cinema._id} className="border-gray-800 bg-background">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image 
                      src={cinema.image || '/images/cinema-placeholder.jpg'} 
                      alt={cinema.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{cinema.name}</CardTitle>
                    <p className="text-sm text-gray-400 mt-1 capitalize">{cinema.city}</p>
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
                    {times.map((time) => (
                      <Button
                        key={time}
                        variant="outline"
                        className="border-gray-700 hover:border-primary-dark hover:bg-primary-dark hover:text-black transition-colors"
                        onClick={() => handleTimeClick(cinema, time)}
                      >
                        {time}
                      </Button>
                    ))}
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