// src/app/admin/layout.js
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { 
  Film, 
  Users, 
  Building2, 
  Calendar, 
  TicketIcon, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu,
  ChevronDown 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const ADMIN_LINKS = [
  {
    title: 'Bảng điều khiển',
    href: '/admin',
    icon: <LayoutDashboard className="mr-3 h-5 w-5" />
  },
  {
    title: 'Quản lý phim',
    href: '/admin/movies',
    icon: <Film className="mr-3 h-5 w-5" />
  },
  {
    title: 'Quản lý rạp',
    href: '/admin/cinemas',
    icon: <Building2 className="mr-3 h-5 w-5" />
  },
  {
    title: 'Quản lý suất chiếu',
    href: '/admin/showtimes',
    icon: <Calendar className="mr-3 h-5 w-5" />
  },
  {
    title: 'Quản lý đặt vé',
    href: '/admin/reservations',
    icon: <TicketIcon className="mr-3 h-5 w-5" />
  },
  {
    title: 'Quản lý người dùng',
    href: '/admin/users',
    icon: <Users className="mr-3 h-5 w-5" />
  },
  {
    title: 'Cài đặt hệ thống',
    href: '/admin/settings',
    icon: <Settings className="mr-3 h-5 w-5" />
  }
]

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
   
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }
  useEffect(() => {
    // Ẩn header và footer
    const header = document.querySelector('header')
    const footer = document.querySelector('footer')
    
    if (header) header.style.display = 'none'
    if (footer) footer.style.display = 'none'
    
    // Khôi phục khi component unmount
    return () => {
      if (header) header.style.display = ''
      if (footer) footer.style.display = ''
    }
  }, [])
   
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar cho desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 border-r border-border bg-card transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:block`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/admin" className="flex items-center">
            <Film className={`h-8 w-8 text-primary-dark ${!isSidebarOpen && 'mx-auto'}`} />
            {isSidebarOpen && <span className="ml-3 text-xl font-semibold">Cinema+ Admin</span>}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            <ChevronDown className={`h-5 w-5 transition-transform ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
          </Button>
        </div>
        
        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          <nav className="px-2 py-4">
            <ul className="space-y-1">
              {ADMIN_LINKS.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
                      !isSidebarOpen && 'justify-center'
                    }`}
                  >
                    {link.icon}
                    {isSidebarOpen && <span>{link.title}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 border-t border-border">
            <Button 
              variant="ghost" 
              onClick={logout} 
              className={`text-destructive ${!isSidebarOpen && 'justify-center w-full p-0'}`}
            >
              <LogOut className="mr-2 h-5 w-5" />
              {isSidebarOpen && <span>Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile sidebar */}
      <Sheet>
        <div className="fixed top-0 left-0 right-0 h-16 border-b bg-card flex items-center justify-between px-4 md:hidden z-30">
          <div className="flex items-center">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <span className="ml-3 text-xl font-semibold">Cinema+ Admin</span>
          </div>
        </div>
        
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full bg-card">
            <div className="flex h-16 items-center px-4 border-b border-border">
              <Link href="/admin" className="flex items-center">
                <Film className="h-8 w-8 text-primary-dark" />
                <span className="ml-3 text-xl font-semibold">Cinema+ Admin</span>
              </Link>
            </div>
            
            <nav className="px-2 py-4 flex-grow">
              <ul className="space-y-1">
                {ADMIN_LINKS.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href} 
                      className="flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      {link.icon}
                      <span>{link.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="text-destructive w-full justify-start"
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <main className={`flex-1 overflow-y-auto bg-background transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
      } mt-16 md:mt-0`}>
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}