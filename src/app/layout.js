import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext'
import { BookingProvider } from '@/context/BookingContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Cinema+ | Book Movie Tickets Online',
  description: 'Book movie tickets online for the latest movies playing in theaters',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <BookingProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}