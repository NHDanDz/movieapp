"use client"

import { useState, useEffect } from 'react'
import { movieApi } from '@/lib/api'
import { Loader2, Search, Filter, Film, Calendar, Tag, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { filterByKeyword } from '@/lib/utils'
import MovieCard from '@/components/movies/MovieCard'

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentTab, setCurrentTab] = useState('all')
  const [pageLoaded, setPageLoaded] = useState(false)
  
  // Filters
  const [genreFilter, setGenreFilter] = useState([])
  const [sortOrder, setSortOrder] = useState('newest')
  const [languageFilter, setLanguageFilter] = useState([])
  
  // Unique filters values
  const [genres, setGenres] = useState([])
  const [languages, setLanguages] = useState([])
  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        
        // Fetch all movies
        const moviesRes = await movieApi.getAll()
        setMovies(moviesRes.data || [])
        
        // Fetch now showing and coming soon movies
        const nowShowingRes = await movieApi.getNowShowing()
        setNowShowing(nowShowingRes.data || [])
        
        const comingSoonRes = await movieApi.getComingSoon()
        setComingSoon(comingSoonRes.data || [])
        
        // Extract unique genres and languages
        const allMovies = moviesRes.data || []
        
        // Extract and combine all genres
        const allGenres = allMovies
          .map(movie => movie.genre ? movie.genre.split(',').map(g => g.trim()) : [])
          .flat()
          .filter(genre => genre) // Remove empty
        
        // Get unique genres
        setGenres([...new Set(allGenres)].sort())
        
        // Get unique languages
        setLanguages([...new Set(allMovies.map(movie => movie.language))].sort())
        
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        setLoading(false)
        setTimeout(() => {
          setPageLoaded(true)
        }, 300)
      }
    }
    
    fetchMovies()
  }, [])
  
  // Filter and sort movies
  const applyFilters = (movieList) => {
    let filtered = [...movieList]
    
    // Apply search filter
    if (search) {
      filtered = filterByKeyword(filtered, search, ['title', 'director', 'genre', 'cast'])
    }
    
    // Apply genre filter
    if (genreFilter.length > 0) {
      filtered = filtered.filter(movie => {
        if (!movie.genre) return false
        
        const movieGenres = movie.genre.split(',').map(g => g.trim())
        return genreFilter.some(genre => movieGenres.includes(genre))
      })
    }
    
    // Apply language filter
    if (languageFilter.length > 0) {
      filtered = filtered.filter(movie => 
        languageFilter.includes(movie.language)
      )
    }
    
    // Apply sorting
    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    } else if (sortOrder === 'oldest') {
      filtered.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
    } else if (sortOrder === 'titleAsc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortOrder === 'titleDesc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title))
    } else if (sortOrder === 'durationAsc') {
      filtered.sort((a, b) => a.duration - b.duration)
    } else if (sortOrder === 'durationDesc') {
      filtered.sort((a, b) => b.duration - a.duration)
    }
    
    return filtered
  }
  
  const filteredAllMovies = applyFilters(movies)
  const filteredNowShowing = applyFilters(nowShowing)
  const filteredComingSoon = applyFilters(comingSoon)
  
  // Reset all filters
  const resetFilters = () => {
    setSearch('')
    setGenreFilter([])
    setLanguageFilter([])
    setSortOrder('newest')
  }
  
  // Toggle genre filter
  const toggleGenreFilter = (genre) => {
    if (genreFilter.includes(genre)) {
      setGenreFilter(genreFilter.filter(g => g !== genre))
    } else {
      setGenreFilter([...genreFilter, genre])
    }
  }
  
  // Toggle language filter
  const toggleLanguageFilter = (language) => {
    if (languageFilter.includes(language)) {
      setLanguageFilter(languageFilter.filter(l => l !== language))
    } else {
      setLanguageFilter([...languageFilter, language])
    }
  }
  
  // Check if any filters are active
  const hasActiveFilters = search || genreFilter.length > 0 || languageFilter.length > 0 || sortOrder !== 'newest'
  
  return (
    <div className="container mx-auto px-4 py-32">
      <div className={`transition-all duration-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Khám phá phim</h1>
            <div className="h-1 w-20 bg-primary-dark rounded-full"></div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm phim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 bg-gray-900/70 border-gray-700"
              />
            </div>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </Button>
          </div>
        </div>
        
        {/* Filters Panel */}
        <div className={`transition-all duration-500 overflow-hidden ${showFilters ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Genre Filter */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center text-gray-300">
                  <Tag className="h-4 w-4 mr-2 text-primary-dark" />
                  Thể loại
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                  {genres.map((genre) => (
                    <div key={genre} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`genre-${genre}`} 
                        checked={genreFilter.includes(genre)}
                        onCheckedChange={() => toggleGenreFilter(genre)}
                        className="data-[state=checked]:bg-primary-dark data-[state=checked]:border-primary-dark"
                      />
                      <Label 
                        htmlFor={`genre-${genre}`}
                        className="text-sm cursor-pointer"
                      >
                        {genre}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Language Filter */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center text-gray-300">
                  <Tag className="h-4 w-4 mr-2 text-primary-dark" />
                  Ngôn ngữ
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {languages.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`language-${language}`} 
                        checked={languageFilter.includes(language)}
                        onCheckedChange={() => toggleLanguageFilter(language)}
                        className="data-[state=checked]:bg-primary-dark data-[state=checked]:border-primary-dark"
                      />
                      <Label 
                        htmlFor={`language-${language}`}
                        className="text-sm cursor-pointer capitalize"
                      >
                        {language}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sort Order */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center text-gray-300">
                  <SlidersHorizontal className="h-4 w-4 mr-2 text-primary-dark" />
                  Sắp xếp theo
                </h3>
                <Select 
                  value={sortOrder} 
                  onValueChange={setSortOrder}
                >
                  <SelectTrigger className="h-12 bg-gray-900/70 border-gray-700">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                    <SelectItem value="titleAsc">Tên A-Z</SelectItem>
                    <SelectItem value="titleDesc">Tên Z-A</SelectItem>
                    <SelectItem value="durationAsc">Thời lượng tăng dần</SelectItem>
                    <SelectItem value="durationDesc">Thời lượng giảm dần</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetFilters}
                    className="text-gray-400 hover:text-white"
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-800/20 rounded-lg">
            <span className="text-sm text-gray-400">Bộ lọc:</span>
            
            {search && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 bg-gray-800/50 hover:bg-gray-700/50"
                onClick={() => setSearch('')}
              >
                {search}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            )}
            
            {genreFilter.map(genre => (
              <Badge 
                key={genre}
                variant="outline" 
                className="flex items-center gap-1 bg-gray-800/50 hover:bg-gray-700/50"
                onClick={() => toggleGenreFilter(genre)}
              >
                {genre}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            ))}
            
            {languageFilter.map(language => (
              <Badge 
                key={language}
                variant="outline" 
                className="flex items-center gap-1 bg-gray-800/50 hover:bg-gray-700/50"
                onClick={() => toggleLanguageFilter(language)}
              >
                {language}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            ))}
            
            {sortOrder !== 'newest' && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 bg-gray-800/50 hover:bg-gray-700/50"
                onClick={() => setSortOrder('newest')}
              >
                {sortOrder === 'titleAsc' ? 'Tên A-Z' : 
                  sortOrder === 'titleDesc' ? 'Tên Z-A' : 
                  sortOrder === 'oldest' ? 'Cũ nhất' :
                  sortOrder === 'durationAsc' ? 'Thời lượng tăng dần' :
                  sortOrder === 'durationDesc' ? 'Thời lượng giảm dần' : ''}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-gray-400 hover:text-white p-0 h-6"
              onClick={resetFilters}
            >
              Xóa tất cả
            </Button>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-12 w-12 loading-spinner text-primary-dark" />
          </div>
        ) : (
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="tabs-effect">
            <TabsList className="w-full grid grid-cols-3 mb-6 bg-gray-800/30 p-1 rounded-lg">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white"
              >
                <Film className="h-4 w-4 mr-2" />
                Tất cả ({filteredAllMovies.length})
              </TabsTrigger>
              <TabsTrigger 
                value="nowShowing"
                className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Đang chiếu ({filteredNowShowing.length})
              </TabsTrigger>
              <TabsTrigger 
                value="comingSoon"
                className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Sắp chiếu ({filteredComingSoon.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="tabs-effect-content">
              {filteredAllMovies.length === 0 ? (
                <div className="text-center py-20 max-w-lg mx-auto">
                  <div className="bg-gray-800/30 p-8 rounded-lg border border-gray-800">
                    <Film className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-xl text-gray-300 mb-4">Không tìm thấy phim nào phù hợp</p>
                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        onClick={resetFilters}
                        className="hover:bg-primary-dark hover:text-black transition-all"
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                  {filteredAllMovies.map((movie, index) => (
                    <div 
                      key={movie.id} 
                      className="transition-all duration-700"
                      style={{ 
                        opacity: pageLoaded ? 1 : 0,
                        transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: `${index * 0.1}s`
                      }}
                    >
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="nowShowing" className="tabs-effect-content">
              {filteredNowShowing.length === 0 ? (
                <div className="text-center py-20 max-w-lg mx-auto">
                  <div className="bg-gray-800/30 p-8 rounded-lg border border-gray-800">
                    <Film className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-xl text-gray-300 mb-4">Không tìm thấy phim đang chiếu nào phù hợp</p>
                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        onClick={resetFilters}
                        className="hover:bg-primary-dark hover:text-black transition-all"
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                  {filteredNowShowing.map((movie, index) => (
                    <div 
                      key={movie.id} 
                      className="transition-all duration-700"
                      style={{ 
                        opacity: pageLoaded ? 1 : 0,
                        transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: `${index * 0.1}s`
                      }}
                    >
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comingSoon" className="tabs-effect-content">
              {filteredComingSoon.length === 0 ? (
                <div className="text-center py-20 max-w-lg mx-auto">
                  <div className="bg-gray-800/30 p-8 rounded-lg border border-gray-800">
                    <Film className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-xl text-gray-300 mb-4">Không tìm thấy phim sắp chiếu nào phù hợp</p>
                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        onClick={resetFilters}
                        className="hover:bg-primary-dark hover:text-black transition-all"
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                  {filteredComingSoon.map((movie, index) => (
                    <div 
                      key={movie.id} 
                      className="transition-all duration-700"
                      style={{ 
                        opacity: pageLoaded ? 1 : 0,
                        transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: `${index * 0.1}s`
                      }}
                    >
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* FAQ Section */}
        {!loading && currentTab === "all" && filteredAllMovies.length > 0 && (
          <div className="mt-16">
            <Accordion type="single" collapsible className="bg-gray-800/30 rounded-lg border border-gray-800">
              <AccordionItem value="item-1" className="border-b-gray-700">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-800/50">
                  Thông tin về phim
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-300">
                  <p className="mb-3">
                    Cinema+ luôn mang đến cho khách hàng những bộ phim mới nhất, hấp dẫn nhất với chất lượng hình ảnh và âm thanh tuyệt vời.
                    Khám phá thế giới điện ảnh đa dạng với nhiều thể loại phim khác nhau.
                  </p>
                  <p>
                    Chúng tôi thường xuyên cập nhật danh sách phim mới nhất, từ các bom tấn Hollywood đến những tác phẩm độc lập đầy sáng tạo. 
                    Hãy thường xuyên ghé thăm trang web của chúng tôi để không bỏ lỡ bất kỳ bộ phim nào.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-800/50">
                  Câu hỏi thường gặp
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-primary-dark">Làm thế nào để đặt vé xem phim?</h4>
                      <p className="text-gray-300">Chọn phim bạn muốn xem, sau đó chọn rạp chiếu, ngày và giờ chiếu. Tiếp theo, chọn ghế và thanh toán để hoàn tất việc đặt vé.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary-dark">Phim có phụ đề không?</h4>
                      <p className="text-gray-300">Hầu hết các phim nước ngoài đều có phụ đề tiếng Việt. Thông tin này được hiển thị trong chi tiết của từng phim.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary-dark">Có thể hủy hoặc đổi vé sau khi đặt không?</h4>
                      <p className="text-gray-300">Vé đã mua không thể hoàn trả, nhưng có thể đổi sang suất chiếu khác nếu thông báo trước ít nhất 2 giờ.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </div>
  )
}