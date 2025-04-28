"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getMovieImage, textTruncate } from '@/lib/utils'
import { Rating } from '@/components/ui/rating'

const MovieBanner = ({ movie, height = '100%', fullDescription = false }) => {
  if (!movie) return null

  const movieImage = getMovieImage(movie)
  
  return (
    <div className="movie-banner" style={{ height }}>
      {/* Background Image with Overlay */}
      <div 
        className="movie-banner__bg"
        style={{
          backgroundImage: `url(${movieImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      
      {/* Content with Gradient Overlay */}
      <div className="movie-banner__content bg-gradient-cinema">
        <div className="w-full md:max-w-3xl">
          {fullDescription && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {movie.genre?.split(',').map((genre, index) => (
                <Badge 
                  key={`${genre}-${index}`} 
                  variant="outline" 
                  className="text-white border-white/80 px-4 py-1 rounded-full"
                >
                  {genre.trim()}
                </Badge>
              ))}
              <div className="ml-2">
                <Rating value={4} readOnly />
              </div>
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 capitalize">
            {movie.title}
          </h1>
          
          <p className="text-gray-200 mb-6 max-w-xl">
            {textTruncate(movie.description, fullDescription ? 1000 : 450)}
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {movie.director && (
              <div>
                <p className="text-primary-dark font-medium">Đạo diễn</p>
                <p className="text-white">{movie.director}</p>
              </div>
            )}
            
            {movie.duration && (
              <div>
                <p className="text-primary-dark font-medium">Thời lượng</p>
                <p className="inline-block border border-white/20 px-3 py-1 mt-1">
                  {movie.duration} phút
                </p>
              </div>
            )}
            
            {movie.genre && (
              <div>
                <p className="text-primary-dark font-medium">Thể loại</p>
                <p className="text-white">{movie.genre}</p>
              </div>
            )}
          </div>
          
          {fullDescription && movie.cast && (
            <div className="mb-6">
              <p className="text-primary-dark font-medium">Diễn viên</p>
              <p className="text-white">{movie.cast}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 mt-6">
            {fullDescription ? (
              <Link href={`/movies/${movie.id}/booking`}>
                <Button className="gap-2 px-6">
                  Đặt vé ngay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href={`/movies/${movie.id}`}>
                <Button variant="secondary" className="gap-2 px-6">
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