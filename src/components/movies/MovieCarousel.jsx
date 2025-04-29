"use client"

import { useState, useEffect, useRef } from 'react'
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const sliderRef = useRef(null)
  
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
    
    // Tạo hiệu ứng khi load trang
    setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Custom arrow components
  const NextArrow = (props) => {
    const { onClick } = props
    return (
      <div
        className={`absolute right-0 top-0 h-full z-10 flex items-center justify-end pl-12 pr-4 cursor-pointer transition-all duration-300 ${
          isLoaded ? 'opacity-0 hover:opacity-100' : 'opacity-0'
        }`}
        onClick={onClick}
      >
        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm border border-white/10 hover:bg-primary-dark hover:scale-110 transition-all duration-300">
          <ChevronRight className="h-6 w-6 text-white" />
        </div>
      </div>
    )
  }
  
  const PrevArrow = (props) => {
    const { onClick } = props
    return (
      <div
        className={`absolute left-0 top-0 h-full z-10 flex items-center justify-start pr-12 pl-4 cursor-pointer transition-all duration-300 ${
          isLoaded ? 'opacity-0 hover:opacity-100' : 'opacity-0'
        }`}
        onClick={onClick}
      >
        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm border border-white/10 hover:bg-primary-dark hover:scale-110 transition-all duration-300">
          <ChevronLeft className="h-6 w-6 text-white" />
        </div>
      </div>
    )
  }
  
  // Xử lý các phím mũi tên
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sliderRef.current) return
      
      if (e.key === 'ArrowLeft') {
        sliderRef.current.slickPrev()
      } else if (e.key === 'ArrowRight') {
        sliderRef.current.slickNext()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  
  const settings = {
    dots: false,
    infinite: movies.length > slidesToShow,
    speed: 600,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    swipe: true,
    beforeChange: (current, next) => setCurrentSlide(next),
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
    <div className={`${className} transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-baseline justify-between mb-8 relative">
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <div className={`h-1 w-12 bg-primary-dark mt-2 rounded-full transition-all duration-500 ${isLoaded ? 'w-24' : 'w-0'}`}></div>
        </div>
        
        {viewMoreLink && (
          <Link href={viewMoreLink}>
            <Button 
              variant="ghost" 
              className="text-primary-dark hover:text-primary-dark/80 hover:bg-background-dark group"
            >
              Xem thêm <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        )}
      </div>
      
      <div className="relative overflow-visible">
        <Slider {...settings} ref={sliderRef}>
          {movies.map((movie, index) => (
            <div 
              key={movie.id} 
              className={`px-3 transition-all duration-500 carousel-item ${index === currentSlide ? 'active scale-100 opacity-100' : ''}`}
              style={{
                transform: `scale(${index === currentSlide ? '1' : '0.95'})`,
                opacity: index === currentSlide ? 1 : 0.8,
                transition: 'all 0.5s ease'
              }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </Slider>
        
        {/* Hiển thị vị trí slide hiện tại */}
        {movies.length > slidesToShow && (
          <div className="flex justify-center mt-6 space-x-1">
            {Array.from({ length: Math.ceil(movies.length / slidesToShow) }).map((_, index) => {
              const slideStart = index * slidesToShow
              const slideEnd = slideStart + slidesToShow - 1
              const isActive = currentSlide >= slideStart && currentSlide <= slideEnd
              
              return (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-primary-dark w-8' : 'bg-gray-600 hover:bg-gray-400'
                  }`}
                  onClick={() => sliderRef.current.slickGoTo(slideStart)}
                ></button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieCarousel