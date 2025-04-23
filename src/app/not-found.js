import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Film } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <Film className="h-20 w-20 mx-auto text-primary-dark mb-6" />
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Trang không tồn tại</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến địa chỉ khác.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/movies">Xem phim</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}