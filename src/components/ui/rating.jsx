"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const Rating = ({
  value = 0,
  max = 5,
  onChange,
  readOnly = false,
  size = 'default',
  className,
}) => {
  const [hoverValue, setHoverValue] = useState(0)
  
  const handleMouseEnter = (index) => {
    if (readOnly) return
    setHoverValue(index)
  }
  
  const handleMouseLeave = () => {
    if (readOnly) return
    setHoverValue(0)
  }
  
  const handleClick = (index) => {
    if (readOnly) return
    onChange?.(index)
  }
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3'
      case 'lg':
        return 'w-6 h-6'
      case 'default':
      default:
        return 'w-5 h-5'
    }
  }
  
  return (
    <div className={cn('flex', className)}>
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1
        
        return (
          <div
            key={index}
            className={cn(
              'cursor-pointer flex items-center justify-center transition-colors',
              readOnly ? 'cursor-default' : 'cursor-pointer'
            )}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          >
            <Star
              className={cn(
                getSizeClasses(),
                'transition-colors',
                starValue <= (hoverValue || value)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-400'
              )}
            />
          </div>
        )
      })}
    </div>
  )
}

export { Rating }