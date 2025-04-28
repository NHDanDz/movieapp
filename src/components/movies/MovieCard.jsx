"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getMovieImage, textTruncate, formatDate } from '@/lib/utils'

const MovieCard = ({ movie, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  if (!movie) return null
  
  const movieImage = getMovieImage(movie)
  
  return (
    <Link 
      href={`/movies/${movie.id}`}
      className={`block ${className}`}
    >
      <Card 
        className="overflow-hidden h-full transition-all duration-300 bg-background hover:bg-background-dark border-gray-800 hover:shadow-xl group"
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
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-70"></div>
          
          {/* Movie genre badge */}
          <div className="absolute top-3 left-3 z-10">
            {movie.genre && (
              <Badge variant="secondary" className="bg-primary-dark text-black">
                {movie.genre.split(',')[0]}
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 capitalize line-clamp-1 group-hover:text-primary-dark transition-colors">
            {movie.title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {textTruncate(movie.description, 120)}
          </p>
          
          <div className="flex justify-between items-center mb-4 text-sm">
            <div className="flex items-center text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{movie.duration} phút</span>
            </div>
            
            <div className="flex items-center text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(movie.releaseDate)}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2 border-gray-700 hover:bg-primary-dark hover:text-black transition-colors"
          >
            Chi tiết
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}

export default MovieCard