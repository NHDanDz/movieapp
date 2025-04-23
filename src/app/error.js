"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <AlertTriangle className="h-20 w-20 mx-auto text-red-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Đã xảy ra lỗi</h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Đã có lỗi xảy ra khi tải trang. Vui lòng thử lại sau hoặc liên hệ với chúng tôi nếu vấn đề vẫn tiếp tục.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()}>
            Thử lại
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}