"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext'
import { BookingProvider } from '@/context/BookingContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <BookingProvider>
            <div className="flex flex-col min-h-screen">
              {!isAdminPage && <Header />}
              <main className={`flex-grow ${isAdminPage ? 'w-full' : ''}`}>{children}</main>
              {!isAdminPage && <Footer />}
            </div>
            <Toaster />
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}