"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, User, Star, Tag, Languages, PlayCircle, BookOpen, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getMovieImage, formatDate } from '@/lib/utils'
import { 
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const MovieInfo = ({ movie }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!movie) return null
  
  const movieImage = getMovieImage(movie)
  
  // Rating giả
  const rating = (Math.random() * 2 + 7).toFixed(1) // Random từ 7.0 đến 9.0
  
  return (
    <Card className={`overflow-hidden border-gray-800 h-full sticky top-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} hover-card-effect`}>
      {/* Movie Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={movieImage}
          alt={movie.title}
          fill
          sizes="(max-width: 1024px) 100vw, 25vw"
          className="object-cover transition-transform duration-700 hover:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90"></div>
        
        {/* Play trailer button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-16 w-16 bg-black/40 backdrop-blur-sm hover:bg-primary-dark hover:scale-110 transition-all duration-300"
            onClick={() => setShowTrailer(true)}
          >
            <PlayCircle className="h-10 w-10 text-white" />
          </Button>
        </div>
        
        {/* Genre Badge */}
        <div className="absolute top-3 left-3">
          {movie.genre && (
            <Badge variant="secondary" className="badge-3d text-black">
              {movie.genre.split(',')[0]}
            </Badge>
          )}
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center bg-black/70 px-2 py-1 rounded-full">
            <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
            <span className="text-xs font-medium text-yellow-500">{rating}</span>
          </div>
        </div>
        
        {/* Movie Title */}
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h1 className="text-xl font-bold capitalize">
            {movie.title}
          </h1>
          <div className="flex items-center mt-1">
            <div className="flex">
              {Array(5).fill(0).map((_, index) => (
                <Star 
                  key={index} 
                  className={`h-4 w-4 ${
                    index < Math.floor(rating) 
                      ? 'text-yellow-500 fill-current' 
                      : (index < rating ? 'text-yellow-500 fill-current opacity-50' : 'text-gray-600')
                  }`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 ml-2">({Math.floor(Math.random() * 500 + 100)} đánh giá)</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        {/* Movie Info */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-primary-dark" />
            <span>{movie.duration} phút</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-primary-dark" />
            <span>{formatDate(movie.releaseDate)}</span>
          </div>
        </div>
        
        {/* Movie Details */}
        <div className="space-y-3 pt-2 border-t border-gray-800">
          {movie.director && (
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-primary-dark mt-0.5" />
              <div>
                <h3 className="text-xs text-gray-500 mb-1">Đạo diễn</h3>
                <p className="text-sm">{movie.director}</p>
              </div>
            </div>
          )}
          
          {movie.cast && (
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-primary-dark mt-0.5" />
              <div>
                <h3 className="text-xs text-gray-500 mb-1">Diễn viên</h3>
                <p className="text-sm line-clamp-2">{movie.cast}</p>
              </div>
            </div>
          )}
          
          {movie.language && (
            <div className="flex items-start space-x-3">
              <Languages className="h-5 w-5 text-primary-dark mt-0.5" />
              <div>
                <h3 className="text-xs text-gray-500 mb-1">Ngôn ngữ</h3>
                <p className="text-sm capitalize">{movie.language}</p>
              </div>
            </div>
          )}
          
          {movie.genre && (
            <div className="flex items-start space-x-3">
              <Tag className="h-5 w-5 text-primary-dark mt-0.5" />
              <div>
                <h3 className="text-xs text-gray-500 mb-1">Thể loại</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.genre.split(',').map((genre, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs border-gray-700 bg-gray-800/50"
                    >
                      {genre.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Synopsis */}
          <div className="flex items-start space-x-3 pt-2">
            <BookOpen className="h-5 w-5 text-primary-dark mt-0.5" />
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Nội dung</h3>
              <p className="text-sm line-clamp-4">{movie.description}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t border-gray-800">
        <Link 
          href={`/movies/${movie._id}`}
          className="text-sm flex items-center text-primary-dark hover:text-primary-dark/80 transition-colors group w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Quay lại chi tiết phim
        </Link>
      </CardFooter>
      
      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl mx-auto px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -top-12 right-4 hover:bg-white/10 rounded-full"
              onClick={() => setShowTrailer(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="relative pb-[56.25%] h-0">
              <iframe 
                className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-700"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title={`${movie.title} trailer`}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default MovieInfo