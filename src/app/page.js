"use client"

import { useEffect, useState } from 'react'
import { movieApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import MovieBanner from '@/components/movies/MovieBanner'
import MovieCarousel from '@/components/movies/MovieCarousel'

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [suggested, setSuggested] = useState([])
  const [randomMovie, setRandomMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const { user } = useAuth()

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        
        // Fetch now showing movies
        const nowShowingRes = await movieApi.getNowShowing()
        setNowShowing(nowShowingRes.data || [])
        
        // Fetch coming soon movies
        const comingSoonRes = await movieApi.getComingSoon()
        setComingSoon(comingSoonRes.data || [])
        
        // Set random movie for banner
        if (nowShowingRes.data?.length > 0) {
          const randomIndex = Math.floor(Math.random() * nowShowingRes.data.length)
          setRandomMovie(nowShowingRes.data[randomIndex])
        }
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMovies()
  }, [])
  
  // Fetch suggested movies when user is logged in
  useEffect(() => {
    const fetchSuggestedMovies = async () => {
      if (user) {
        try {
          const suggestedRes = await movieApi.getSuggested(user.username)
          setSuggested(suggestedRes.data || [])
        } catch (error) {
          console.error('Error fetching suggested movies:', error)
        }
      }
    }
    
    fetchSuggestedMovies()
  }, [user])

  return (
    <div className="min-h-screen">
      {/* Movie Banner */}
      {randomMovie && (
        <MovieBanner movie={randomMovie} height="85vh" />
      )}
      
      {/* Movie Carousels */}
      <div className="container mx-auto px-4 pb-16">
        {/* Spacing after banner */}
        <div className="h-16"></div>
        
        {/* Suggested Movies (only if user is logged in) */}
        {user && suggested.length > 0 && (
          <MovieCarousel 
            title="Gợi ý cho bạn"
            movies={suggested}
            className="mb-16"
          />
        )}
        
        {/* Now Showing Movies */}
        <MovieCarousel 
          title="Phim đang chiếu"
          movies={nowShowing}
          viewMoreLink="/movies/category/nowShowing"
          className="mb-16"
        />
        
        {/* Coming Soon Movies */}
        <MovieCarousel 
          title="Phim sắp chiếu"
          movies={comingSoon}
          viewMoreLink="/movies/category/comingSoon"
          className="mb-16"
        />
      </div>
    </div>
  )
}