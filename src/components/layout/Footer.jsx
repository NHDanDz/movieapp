import Link from 'next/link'
import Image from 'next/image'
import { Film, Mail, MapPin, Phone, Calendar, Tag, CreditCard, Info, ChevronRight, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 pt-20 pb-8 border-t border-gray-800 relative overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-dark/20 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-dark/10 rounded-full filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Column 1: About */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <Film className="h-10 w-10 text-primary-dark transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-2xl font-bold">
                Cinema<span className="text-primary-dark">+</span>
              </span>
            </Link>
            
            <p className="text-gray-400 leading-relaxed">
              Cinema+ là nền tảng đặt vé xem phim trực tuyến hàng đầu, cung cấp cho bạn trải nghiệm đặt vé nhanh chóng và thuận tiện nhất với nhiều ưu đãi hấp dẫn.
            </p>
            
            <div className="pt-4">
              <h4 className="text-white font-medium mb-3">Kết nối với chúng tôi</h4>
              <div className="flex space-x-4">
                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 hover:bg-primary-dark/20 hover:text-primary-dark transition-colors">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 hover:bg-primary-dark/20 hover:text-primary-dark transition-colors">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 hover:bg-primary-dark/20 hover:text-primary-dark transition-colors">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 hover:bg-primary-dark/20 hover:text-primary-dark transition-colors">
                  <Youtube className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="lg:mx-auto">
            <h3 className="text-lg font-semibold mb-6 inline-flex items-center relative">
              Liên kết nhanh
              <div className="absolute -bottom-2 left-0 h-1 w-12 bg-primary-dark"></div>
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Trang chủ</span>
                </Link>
              </li>
              <li>
                <Link href="/movies" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Phim</span>
                </Link>
              </li>
              <li>
                <Link href="/movies/category/nowShowing" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Phim đang chiếu</span>
                </Link>
              </li>
              <li>
                <Link href="/movies/category/comingSoon" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Phim sắp chiếu</span>
                </Link>
              </li>
              <li>
                <Link href="/cinemas" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Rạp chiếu</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Khuyến mãi</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Support */}
          <div className="lg:mx-auto">
            <h3 className="text-lg font-semibold mb-6 inline-flex items-center relative">
              Hỗ trợ
              <div className="absolute -bottom-2 left-0 h-1 w-12 bg-primary-dark"></div>
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Câu hỏi thường gặp</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Điều khoản sử dụng</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Chính sách bảo mật</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Hướng dẫn đặt vé</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary-dark transition-colors inline-flex items-center group">
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">Liên hệ</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 inline-flex items-center relative">
              Liên hệ với chúng tôi
              <div className="absolute -bottom-2 left-0 h-1 w-12 bg-primary-dark"></div>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-6 w-6 text-primary-dark mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">123 Đường Phim, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-6 w-6 text-primary-dark mr-3 flex-shrink-0" />
                <span className="text-gray-400">+84 123 456 789</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-6 w-6 text-primary-dark mr-3 flex-shrink-0" />
                <span className="text-gray-400">info@cinema-plus.vn</span>
              </li>
              <li className="flex items-center">
                <Calendar className="h-6 w-6 text-primary-dark mr-3 flex-shrink-0" />
                <span className="text-gray-400">Mở cửa: 9:00 - 22:00</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Đăng ký nhận tin</h4>
              <div className="flex">
                <Input 
                  placeholder="Email của bạn" 
                  className="rounded-r-none border-r-0 bg-gray-800 border-gray-700 focus:border-primary-dark"
                />
                <Button className="rounded-l-none btn-gradient">
                  Đăng ký
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Cinema+. Tất cả quyền được bảo lưu.
            </p>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-primary-dark mr-2" />
                <span className="text-gray-400 text-sm">Thanh toán an toàn</span>
              </div>
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-primary-dark mr-2" />
                <span className="text-gray-400 text-sm">Giá tốt nhất</span>
              </div>
              <div className="flex items-center">
                <Info className="h-5 w-5 text-primary-dark mr-2" />
                <span className="text-gray-400 text-sm">Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment methods */}
        <div className="flex justify-center mt-6 space-x-4">
          <div className="w-10 h-6 bg-white/90 rounded flex items-center justify-center">
            <span className="text-[10px] font-bold text-blue-700">VISA</span>
          </div>
          <div className="w-10 h-6 bg-white/90 rounded flex items-center justify-center">
            <span className="text-[10px] font-bold text-red-600">MC</span>
          </div>
          <div className="w-10 h-6 bg-white/90 rounded flex items-center justify-center">
            <span className="text-[10px] font-bold text-blue-800">PP</span>
          </div>
          <div className="w-10 h-6 bg-white/90 rounded flex items-center justify-center">
            <span className="text-[10px] font-bold text-green-600">MP</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer