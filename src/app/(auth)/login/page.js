"use client"

import LoginForm from '@/components/auth/LoginForm'
import Image from 'next/image'
import { Film } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Image Column */}
      <div className="hidden md:block relative">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <Image
          src="https://source.unsplash.com/featured/?cinema,popcorn"
          alt="Cinema background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-8">
          <Film className="h-20 w-20 text-primary-dark mb-4" />
          <h1 className="text-4xl font-bold mb-2 text-center">Cinema+</h1>
          <p className="text-xl max-w-md text-center text-gray-300">
            Trải nghiệm đặt vé xem phim đơn giản, nhanh chóng và thuận tiện nhất
          </p>
        </div>
      </div>
      
      {/* Form Column */}
      <div className="flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  )
}