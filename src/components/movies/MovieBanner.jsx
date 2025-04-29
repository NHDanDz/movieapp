"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, Star, Calendar, Clock, User, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getMovieImage, textTruncate, formatDate } from '@/lib/utils'

const MovieBanner = ({ movie, height = '100%', fullDescription = false }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100);
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!movie) return null

  const movieImage = getMovieImage(movie)
  
  // Tạo rating giả
  const rating = Math.floor(Math.random() * 20 + 70) / 10; // random từ 7.0-9.0
  
  return (
    <div className="movie-banner" style={{ height }}>
      {/* Background Image with Overlay */}
      <div 
        className={`movie-banner__bg transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url(${movieImage})`,
          backgroundPosition: 'center 20%',
        }}
      />
      
      {/* Content with Gradient Overlay */}
      <div className="movie-banner__content bg-gradient-cinema">
        <div className={`w-full md:max-w-3xl transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
          {/* Badges */}
          {fullDescription && (
            <div className="flex flex-wrap items-center gap-2 mb-6 animate-fadeIn">
              {movie.genre?.split(',').map((genre, index) => (
                <Badge 
                  key={`${genre}-${index}`} 
                  variant="outline" 
                  className="text-white border-white/50 px-4 py-1 rounded-full backdrop-blur-sm bg-black/30 hover:bg-black/50 transition-all"
                >
                  {genre.trim()}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Title with animated entrance */}
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 capitalize transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {movie.title}
          </h1>
          
          {/* Rating stars */}
          <div className="flex items-center mb-6 space-x-4">
            <div className="flex items-center">
              {Array(5).fill(0).map((_, index) => (
                <Star 
                  key={index} 
                  className={`h-5 w-5 ${
                    index < Math.floor(rating) 
                      ? 'text-yellow-500 fill-current' 
                      : (index < rating ? 'text-yellow-500 fill-current opacity-50' : 'text-gray-600')
                  }`} 
                />
              ))}
              <span className="ml-2 text-yellow-500 font-medium">{rating.toFixed(1)}/10</span>
            </div>
            
            <Badge variant="outline" className="text-white border-white/30 px-3 py-1">
              {movie.language}
            </Badge>
          </div>
          
          {/* Description with staggered animation */}
          <p className={`text-gray-200 mb-6 max-w-xl text-base md:text-lg leading-relaxed transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {textTruncate(movie.description, fullDescription ? 1000 : 450)}
          </p>
          
          {/* Movie details with icons */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {movie.director && (
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-primary-dark mt-1" />
                <div>
                  <p className="text-primary-dark font-medium">Đạo diễn</p>
                  <p className="text-white">{movie.director}</p>
                </div>
              </div>
            )}
            
            {movie.duration && (
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary-dark mt-1" />
                <div>
                  <p className="text-primary-dark font-medium">Thời lượng</p>
                  <p className="text-white">{movie.duration} phút</p>
                </div>
              </div>
            )}
            
            {movie.releaseDate && (
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-primary-dark mt-1" />
                <div>
                  <p className="text-primary-dark font-medium">Khởi chiếu</p>
                  <p className="text-white">{formatDate(movie.releaseDate)}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Cast information */}
          {fullDescription && movie.cast && (
            <div className={`mb-8 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-start space-x-3">
                <Tag className="h-5 w-5 text-primary-dark mt-1" />
                <div>
                  <p className="text-primary-dark font-medium">Diễn viên</p>
                  <p className="text-white">{movie.cast}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action buttons with hover effects */}
          <div className={`flex flex-wrap gap-4 mt-6 transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {fullDescription ? (
              <>
                <Link href={`/movies/${movie.id}/booking`}>
                  <Button className="gap-2 px-6 btn-gradient hover:scale-105 transition-transform">
                    Đặt vé ngay
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  className="gap-2 px-6 border-white/50 hover:bg-white/10 transition-all"
                >
                  <Play className="h-4 w-4" />
                  Xem trailer
                </Button>
              </>
            ) : (
              <Link href={`/movies/${movie.id}`}>
                <Button 
                  variant="secondary" 
                  className="gap-2 px-6 hover:scale-105 transition-transform bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  Xem chi tiết
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieBanner