"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Slider from 'react-slick'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MovieCard from './MovieCard'

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const MovieCarousel = ({
  title,
  movies = [],
  viewMoreLink = null,
  className = '',
}) => {
  const [slidesToShow, setSlidesToShow] = useState(4)
  
  // Update slidesToShow based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1)
      } else if (window.innerWidth < 768) {
        setSlidesToShow(2)
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(3)
      } else {
        setSlidesToShow(4)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Custom arrow components
  const NextArrow = (props) => {
    const { onClick } = props
    return (
      <div
        className="absolute right-0 top-0 h-full z-10 flex items-center justify-end pl-12 pr-4 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
        onClick={onClick}
      >
        <ChevronRight className="h-10 w-10 text-white" />
      </div>
    )
  }
  
  const PrevArrow = (props) => {
    const { onClick } = props
    return (
      <div
        className="absolute left-0 top-0 h-full z-10 flex items-center justify-start pr-12 pl-4 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
        onClick={onClick}
      >
        <ChevronLeft className="h-10 w-10 text-white" />
      </div>
    )
  }
  
  const settings = {
    dots: false,
    infinite: movies.length > slidesToShow,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    swipe: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  }
  
  if (!movies.length) return null
  
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        
        {viewMoreLink && (
          <Link href={viewMoreLink}>
            <Button 
              variant="ghost" 
              className="text-primary-dark hover:text-primary-dark/80 hover:bg-background-dark"
            >
              Xem thêm <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
      
      <div className="relative">
        <Slider {...settings}>
          {movies.map((movie) => (
            <div key={movie.id} className="px-2">
              <MovieCard movie={movie} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  )
}

export default MovieCarousel