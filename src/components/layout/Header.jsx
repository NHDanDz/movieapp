"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X, Film, Home, User, LogOut, UserCircle, Ticket } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  
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
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md py-2 shadow-md' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Film className="h-8 w-8 text-primary-dark" />
          <span className="text-xl font-bold">Cinema+</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-200 hover:text-primary-dark transition-colors">
            Trang chủ
          </Link>
          <Link href="/movies" className="text-gray-200 hover:text-primary-dark transition-colors">
            Phim
          </Link>
          <Link href="/cinemas" className="text-gray-200 hover:text-primary-dark transition-colors">
            Rạp chiếu
          </Link>
        </nav>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.imageurl || ''} />
                  <AvatarFallback className="bg-primary-dark">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" onClick={logout} className="text-gray-200">
                <LogOut className="h-5 w-5 mr-2" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-200">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button>Đăng ký</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <Link href="/" className="flex items-center gap-2">
                  <Film className="h-6 w-6 text-primary-dark" />
                  <span className="text-lg font-bold">Cinema+</span>
                </Link>
              </div>
              
              <div className="space-y-4 py-4">
                {user && (
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar>
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
                
                <Link href="/" className="flex items-center py-2">
                  <Home className="mr-2 h-5 w-5" />
                  <span>Trang chủ</span>
                </Link>
                <Link href="/movies" className="flex items-center py-2">
                  <Film className="mr-2 h-5 w-5" />
                  <span>Phim</span>
                </Link>
                <Link href="/cinemas" className="flex items-center py-2">
                  <Ticket className="mr-2 h-5 w-5" />
                  <span>Rạp chiếu</span>
                </Link>
                
                {user ? (
                  <>
                    <Link href="/profile" className="flex items-center py-2">
                      <User className="mr-2 h-5 w-5" />
                      <span>Trang cá nhân</span>
                    </Link>
                    <Link href="/reservations" className="flex items-center py-2">
                      <Ticket className="mr-2 h-5 w-5" />
                      <span>Vé của tôi</span>
                    </Link>
                    <button 
                      onClick={logout}
                      className="flex items-center py-2 w-full text-left"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
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
                      <Button className="w-full justify-start">
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
    </header>
  )
}

export default Header