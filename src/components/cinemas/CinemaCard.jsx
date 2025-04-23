"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, CreditCard, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const CinemaCard = ({ cinema, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  if (!cinema) return null
  
  const cinemaImage = cinema.image || '/images/cinema-placeholder.jpg'
  
  return (
    <Card 
      className={`h-full overflow-hidden bg-background border-gray-800 hover:shadow-xl transition-all duration-300 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={cinemaImage}
          alt={cinema.name}
          fill
          className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-70"></div>
        
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-primary-dark text-black">
            Rạp chiếu phim
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-dark transition-colors">
          {cinema.name}
        </h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2 text-gray-400">
            <MapPin className="h-5 w-5 text-primary-dark flex-shrink-0 mt-0.5" />
            <span className="capitalize">{cinema.city}</span>
          </div>
          
          <div className="flex items-start gap-2 text-gray-400">
            <CreditCard className="h-5 w-5 text-primary-dark flex-shrink-0 mt-0.5" />
            <span>{formatCurrency(cinema.ticketPrice)} / vé</span>
          </div>
          
          <div className="flex items-start gap-2 text-gray-400">
            <Users className="h-5 w-5 text-primary-dark flex-shrink-0 mt-0.5" />
            <span>{cinema.seatsAvailable} ghế trống</span>
          </div>
        </div>
        
        <Link href={`/cinemas/${cinema._id}`}>
          <Button 
            className="w-full"
            variant="outline"
          >
            Xem suất chiếu
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default CinemaCard