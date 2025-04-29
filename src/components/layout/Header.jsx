"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X, Film, Home, User, LogOut, UserCircle, Ticket, Search } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearchBox, setShowSearchBox] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md py-2 shadow-lg border-b border-gray-800/50' 
        : 'bg-gradient-to-b from-background/80 to-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Film className="h-8 w-8 text-primary-dark transition-transform duration-300 group-hover:rotate-12" />
          <span className="text-xl font-bold relative">
            Cinema<span className="text-primary-dark">+</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-dark transition-all duration-300 group-hover:w-full"></span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/" 
            className="text-gray-200 hover:text-primary-dark transition-colors relative py-1 group"
          >
            Trang chủ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-dark transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link 
            href="/movies" 
            className="text-gray-200 hover:text-primary-dark transition-colors relative py-1 group"
          >
            Phim
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-dark transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link 
            href="/cinemas" 
            className="text-gray-200 hover:text-primary-dark transition-colors relative py-1 group"
          >
            Rạp chiếu
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-dark transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <button 
            onClick={() => setShowSearchBox(!showSearchBox)}
            className="text-gray-200 hover:text-primary-dark transition-colors p-2 rounded-full hover:bg-gray-800/50"
          >
            <Search className="h-5 w-5" />
          </button>
        </nav>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="group">
                <Avatar className="cursor-pointer border-2 border-transparent transition-all duration-300 group-hover:border-primary-dark">
                  <AvatarImage src={user.imageurl || ''} />
                  <AvatarFallback className="bg-primary-dark">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="text-gray-200 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  className="text-gray-200 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button className="btn-gradient">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-gray-800/50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="border-l border-gray-800">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <Link href="/" className="flex items-center gap-2 group">
                  <Film className="h-6 w-6 text-primary-dark transition-transform duration-300 group-hover:rotate-12" />
                  <span className="text-lg font-bold">Cinema<span className="text-primary-dark">+</span></span>
                </Link>
              </div>
              
              <div className="space-y-4 py-4">
                {user && (
                  <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-gray-800/50">
                    <Avatar className="border-2 border-primary-dark h-12 w-12">
                      <AvatarImage src={user.imageurl || ''} />
                      <AvatarFallback className="bg-primary-dark">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                )}
                
                <Link href="/" className="flex items-center py-3 px-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                  <Home className="mr-3 h-5 w-5 text-primary-dark" />
                  <span>Trang chủ</span>
                </Link>
                <Link href="/movies" className="flex items-center py-3 px-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                  <Film className="mr-3 h-5 w-5 text-primary-dark" />
                  <span>Phim</span>
                </Link>
                <Link href="/cinemas" className="flex items-center py-3 px-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                  <Ticket className="mr-3 h-5 w-5 text-primary-dark" />
                  <span>Rạp chiếu</span>
                </Link>
                
                {user ? (
                  <>
                    <Link href="/profile" className="flex items-center py-3 px-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                      <User className="mr-3 h-5 w-5 text-primary-dark" />
                      <span>Trang cá nhân</span>
                    </Link>
                    <Link href="/reservations" className="flex items-center py-3 px-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                      <Ticket className="mr-3 h-5 w-5 text-primary-dark" />
                      <span>Vé của tôi</span>
                    </Link>
                    <div className="pt-4 my-4 border-t border-gray-800"></div>
                    <button 
                      onClick={logout}
                      className="flex items-center py-3 px-2 w-full text-left rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <LogOut className="mr-3 h-5 w-5 text-primary-dark" />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <div className="pt-4 space-y-3">
                    <Link href="/login">
                      <Button variant="outline" className="w-full justify-start">
                        <UserCircle className="mr-2 h-5 w-5" />
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full justify-start btn-gradient">
                        <User className="mr-2 h-5 w-5" />
                        Đăng ký
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Search Box Popup */}
      {showSearchBox && (
        <div className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-md p-4 shadow-lg border-t border-gray-800/50 animate-fadeIn">
          <div className="container mx-auto">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm phim, rạp chiếu..." 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-2 px-5 pr-12 focus:outline-none focus:border-primary-dark transition-all duration-300"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-dark">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header