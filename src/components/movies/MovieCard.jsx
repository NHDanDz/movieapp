"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar, Star, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getMovieImage, textTruncate, formatDate } from '@/lib/utils'

const MovieCard = ({ movie, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  if (!movie) return null
  
  const movieImage = getMovieImage(movie)
  
  // Tạo ngẫu nhiên một rating cho mục đích hiển thị
  const rating = Math.floor(Math.random() * 20 + 70) / 10; // random từ 7.0-9.0
  
  // Phân loại phim theo rating
  const getRatingColor = (rating) => {
    if (rating >= 8.5) return 'text-green-500';
    if (rating >= 7.5) return 'text-yellow-500';
    return 'text-gray-400';
  }
  
  return (
    <Link 
      href={`/movies/${movie.id}`}
      className={`block ${className}`}
    >
      <Card 
        className="overflow-hidden h-full transition-all duration-500 bg-background hover:bg-background-dark border-gray-800 hover-card-effect relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Movie Image */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <Image
            src={movieImage}
            alt={movie.title}
            fill
            className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80 transition-opacity duration-500 ${isHovered ? 'opacity-60' : 'opacity-90'}`}></div>
          
          {/* Movie genre badge */}
          <div className="absolute top-3 left-3 z-10">
            {movie.genre && (
              <Badge variant="secondary" className="badge-3d text-black font-medium">
                {movie.genre.split(',')[0]}
              </Badge>
            )}
          </div>
          
          {/* Rating */}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center bg-black/70 px-2 py-1 rounded-full">
              <Star className={`h-3 w-3 mr-1 ${getRatingColor(rating)} fill-current`} />
              <span className={`text-xs font-medium ${getRatingColor(rating)}`}>{rating.toFixed(1)}</span>
            </div>
          </div>
          
          {/* Play button overlay on hover */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="h-14 w-14 rounded-full bg-primary-dark/90 flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
              <Eye className="h-7 w-7 text-black" />
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 relative">
          {/* Title with animated underline on hover */}
          <h3 className="text-lg font-semibold mb-2 capitalize line-clamp-1 group-hover:text-primary-dark transition-colors relative">
            {movie.title}
            <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-dark transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'}`}></span>
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {textTruncate(movie.description, 120)}
          </p>
          
          <div className="flex justify-between items-center mb-4 text-sm">
            <div className="flex items-center text-gray-400 group">
              <Clock className="h-4 w-4 mr-1 transition-colors duration-300 group-hover:text-primary-dark" />
              <span>{movie.duration} phút</span>
            </div>
            
            <div className="flex items-center text-gray-400 group">
              <Calendar className="h-4 w-4 mr-1 transition-colors duration-300 group-hover:text-primary-dark" />
              <span>{formatDate(movie.releaseDate)}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className={`w-full mt-2 border-gray-700 transition-all duration-500 ${
              isHovered 
                ? 'bg-primary-dark text-black border-primary-dark' 
                : 'hover:bg-primary-dark hover:text-black hover:border-primary-dark'
            }`}
          >
            Chi tiết
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}

export default MovieCard