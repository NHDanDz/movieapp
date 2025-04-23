"use client"

import RegisterForm from '@/components/auth/RegisterForm'
import Image from 'next/image'

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Form Column */}
      <div className="flex items-center justify-center p-4">
        <RegisterForm />
      </div>
      
      {/* Image Column */}
      <div className="hidden md:block relative">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <Image
          src="/images/register.jpg"
          alt="Cinema background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-8">
          <h1 className="text-4xl font-bold mb-4">Ưu đãi thành viên</h1>
          <ul className="space-y-4 text-lg max-w-md">
            <li className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-primary-dark mr-3 flex-shrink-0"></span>
              <span>Đặt vé trực tuyến nhanh chóng và tiện lợi</span>
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-primary-dark mr-3 flex-shrink-0"></span>
              <span>Tích lũy điểm thưởng với mỗi lần đặt vé</span>
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-primary-dark mr-3 flex-shrink-0"></span>
              <span>Nhận thông báo ưu đãi và phim mới</span>
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-primary-dark mr-3 flex-shrink-0"></span>
              <span>Đề xuất phim phù hợp với sở thích</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}