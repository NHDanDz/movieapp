"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getMovieImage, formatDate } from '@/lib/utils'
import { 
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card'

const MovieInfo = ({ movie }) => {
  if (!movie) return null
  
  const movieImage = getMovieImage(movie)
  
  return (
    <Card className="overflow-hidden border-gray-800 h-full sticky top-24">
      {/* Movie Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={movieImage}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90"></div>
        
        {/* Genre Badge */}
        <div className="absolute top-3 left-3">
          {movie.genre && (
            <Badge variant="secondary" className="bg-primary-dark text-black">
              {movie.genre.split(',')[0]}
            </Badge>
          )}
        </div>
        
        {/* Movie Title */}
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h1 className="text-xl font-bold capitalize">
            {movie.title}
          </h1>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        {/* Movie Info */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{movie.duration} phút</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(movie.releaseDate)}</span>
          </div>
        </div>
        
        {/* Movie Details */}
        <div className="space-y-3 pt-2 border-t border-gray-800">
          {movie.director && (
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Đạo diễn</h3>
              <p className="text-sm">{movie.director}</p>
            </div>
          )}
          
          {movie.cast && (
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Diễn viên</h3>
              <p className="text-sm line-clamp-2">{movie.cast}</p>
            </div>
          )}
          
          {movie.language && (
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Ngôn ngữ</h3>
              <p className="text-sm capitalize">{movie.language}</p>
            </div>
          )}
          
          {movie.genre && (
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Thể loại</h3>
              <p className="text-sm capitalize">{movie.genre}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t border-gray-800">
        <Link 
          href={`/movies/${movie._id}`}
          className="text-sm flex items-center text-primary-dark hover:text-primary-dark/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại chi tiết phim
        </Link>
      </CardFooter>
    </Card>
  )
}

export default MovieInfo