"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, CreditCard, Users, Star, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const CinemaCard = ({ cinema, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  if (!cinema) return null
  
  const cinemaImage = cinema.image || '/images/cinema-placeholder.jpg'
  
  // Tạo rating giả để hiển thị
  const rating = Math.floor(Math.random() * 15 + 75) / 10; // random từ 7.5 đến 9.0
  
  // Tạo số đánh giá giả
  const reviews = Math.floor(Math.random() * 500 + 100);
  
  return (
    <Card 
      className={`h-full overflow-hidden bg-background border-gray-800 hover-card-effect relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={cinemaImage}
          alt={cinema.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-70"></div>
        
        {/* Badge position */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="badge-3d text-black">
            Rạp chiếu phim
          </Badge>
        </div>
        
        {/* Rating */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center bg-black/70 px-2 py-1 rounded-full">
            <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
            <span className="text-xs font-medium text-yellow-500">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400 ml-1">({reviews})</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 relative">
        {/* Cinema name with animated underline */}
        <h3 className="text-xl font-semibold mb-1 group-hover:text-primary-dark transition-colors relative">
          {cinema.name}
          <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-dark transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'}`}></span>
        </h3>
        
        {/* Thêm thông tin đánh giá */}
        <div className="flex items-center mb-4">
          <div className="flex">
            {Array(5).fill(0).map((_, index) => (
              <Star 
                key={index} 
                className={`h-4 w-4 ${index < Math.floor(rating) ? 'text-yellow-500 fill-current' : (index < rating ? 'text-yellow-500 fill-current opacity-50' : 'text-gray-600')}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-2">{reviews} đánh giá</span>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 text-gray-400 group hover:text-gray-300 transition-colors">
            <MapPin className="h-5 w-5 text-primary-dark flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110 duration-300" />
            <div>
              <span className="text-xs text-gray-500">Địa chỉ</span>
              <p className="capitalize">{cinema.city}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-gray-400 group hover:text-gray-300 transition-colors">
            <CreditCard className="h-5 w-5 text-primary-dark flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110 duration-300" />
            <div>
              <span className="text-xs text-gray-500">Giá vé</span>
              <p>{formatCurrency(cinema.ticketPrice)} / vé</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-gray-400 group hover:text-gray-300 transition-colors">
            <Users className="h-5 w-5 text-primary-dark flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110 duration-300" />
            <div>
              <span className="text-xs text-gray-500">Sức chứa</span>
              <p>{cinema.seatsAvailable} ghế</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-gray-400 group hover:text-gray-300 transition-colors">
            <Calendar className="h-5 w-5 text-primary-dark flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110 duration-300" />
            <div>
              <span className="text-xs text-gray-500">Lịch chiếu hôm nay</span>
              <p>{Math.floor(Math.random() * 10 + 5)} suất chiếu</p>
            </div>
          </div>
        </div>
        
        <Link href={`/cinemas/${cinema.id}`}>
          <Button 
            className={`w-full transition-all duration-500 ${
              isHovered ? 'btn-gradient' : 'bg-gray-800 hover:bg-primary-dark hover:text-black'
            }`}
          >
            Xem suất chiếu
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default CinemaCard