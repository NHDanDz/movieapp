import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Film, 
  Home, 
  CreditCard, 
  Clock, 
  Calendar, 
  BarChart3, 
  LayoutDashboard, 
  Settings, 
  LogOut 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    movies: 0,
    cinemas: 0,
    reservations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    // Mô phỏng việc tải dữ liệu thống kê
    const fetchStats = async () => {
      setLoading(true)
      try {
        // Trong thực tế, sẽ gọi API để lấy dữ liệu
        // Ví dụ: const response = await userApi.getStats()
        setTimeout(() => {
          setStats({
            users: 1245,
            movies: 48,
            cinemas: 12,
            reservations: 3892
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu thống kê:', error)
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <DashboardContent stats={stats} loading={loading} />
      case 'movies':
        return <MovieManagement />
      case 'cinemas':
        return <CinemaManagement />
      case 'showtimes':
        return <ShowtimeManagement />
      case 'reservations':
        return <ReservationManagement />
      case 'users':
        return <UserManagement />
      case 'settings':
        return <Settings />
      default:
        return <DashboardContent stats={stats} loading={loading} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <Film className="h-8 w-8 text-primary-dark mr-2" />
          <span className="text-xl font-bold">Cinema+ Admin</span>
        </div>
        <nav className="mt-5">
          <SidebarItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarItem
            icon={<Film className="h-5 w-5" />}
            title="Phim"
            active={activeTab === 'movies'}
            onClick={() => setActiveTab('movies')}
          />
          <SidebarItem
            icon={<Home className="h-5 w-5" />}
            title="Rạp chiếu"
            active={activeTab === 'cinemas'}
            onClick={() => setActiveTab('cinemas')}
          />
          <SidebarItem
            icon={<Clock className="h-5 w-5" />}
            title="Suất chiếu"
            active={activeTab === 'showtimes'}
            onClick={() => setActiveTab('showtimes')}
          />
          <SidebarItem
            icon={<CreditCard className="h-5 w-5" />}
            title="Đặt vé"
            active={activeTab === 'reservations'}
            onClick={() => setActiveTab('reservations')}
          />
          <SidebarItem
            icon={<Users className="h-5 w-5" />}
            title="Người dùng"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            title="Cài đặt"
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
          <div className="px-4 mt-8">
            <div className="pt-4 border-t border-gray-700">
              <SidebarItem
                icon={<LogOut className="h-5 w-5" />}
                title="Đăng xuất"
                onClick={() => console.log('Đăng xuất')}
              />
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-gray-800 text-white shadow-md py-4 px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'movies' && 'Quản lý phim'}
              {activeTab === 'cinemas' && 'Quản lý rạp chiếu'}
              {activeTab === 'showtimes' && 'Quản lý suất chiếu'}
              {activeTab === 'reservations' && 'Quản lý đặt vé'}
              {activeTab === 'users' && 'Quản lý người dùng'}
              {activeTab === 'settings' && 'Cài đặt hệ thống'}
            </h1>
            <div className="flex items-center">
              <span className="mr-2">Admin</span>
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

const SidebarItem = ({ icon, title, active, onClick }) => {
  return (
    <div
      className={`flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 ${
        active ? 'bg-gray-700 text-primary-dark' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-3">{title}</span>
    </div>
  )
}

const DashboardContent = ({ stats, loading }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Người dùng"
          value={stats.users}
          icon={<Users className="h-8 w-8 text-primary-dark" />}
          loading={loading}
        />
        <StatCard
          title="Phim"
          value={stats.movies}
          icon={<Film className="h-8 w-8 text-primary-dark" />}
          loading={loading}
        />
        <StatCard
          title="Rạp chiếu"
          value={stats.cinemas}
          icon={<Home className="h-8 w-8 text-primary-dark" />}
          loading={loading}
        />
        <StatCard
          title="Đặt vé"
          value={stats.reservations}
          icon={<CreditCard className="h-8 w-8 text-primary-dark" />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <BarChart3 className="h-40 w-40 text-gray-500" />
              <p className="text-gray-500 ml-4">Đang tải biểu đồ doanh thu...</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Phim nổi bật nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TopMovieItem title="Venom 3" tickets={1259} />
              <TopMovieItem title="Joker: Folie à Deux" tickets={987} />
              <TopMovieItem title="Inside Out 2" tickets={754} />
              <TopMovieItem title="The Marvels" tickets={621} />
              <TopMovieItem title="Kung Fu Panda 4" tickets={532} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lịch chiếu gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left">Phim</th>
                    <th className="px-4 py-3 text-left">Rạp</th>
                    <th className="px-4 py-3 text-left">Ngày</th>
                    <th className="px-4 py-3 text-left">Giờ</th>
                    <th className="px-4 py-3 text-right">Đặt chỗ</th>
                  </tr>
                </thead>
                <tbody>
                  <ShowtimeRow
                    movie="Venom 3"
                    cinema="Cinema+ Hà Nội"
                    date="23/04/2025"
                    time="19:30"
                    bookings={48}
                  />
                  <ShowtimeRow
                    movie="Joker: Folie à Deux"
                    cinema="Cinema+ Hồ Chí Minh"
                    date="23/04/2025"
                    time="20:00"
                    bookings={56}
                  />
                  <ShowtimeRow
                    movie="Inside Out 2"
                    cinema="Cinema+ Đà Nẵng"
                    date="23/04/2025"
                    time="18:00"
                    bookings={37}
                  />
                  <ShowtimeRow
                    movie="The Marvels"
                    cinema="Cinema+ Hà Nội"
                    date="23/04/2025"
                    time="21:15"
                    bookings={42}
                  />
                  <ShowtimeRow
                    movie="Kung Fu Panda 4"
                    cinema="Cinema+ Hồ Chí Minh"
                    date="23/04/2025"
                    time="17:30"
                    bookings={64}
                  />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon, loading }) => {
  return (
    <Card className="border-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-700 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            )}
          </div>
          <div className="p-2 bg-gray-800 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

const TopMovieItem = ({ title, tickets }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Film className="h-5 w-5 text-primary-dark mr-3" />
        <span>{title}</span>
      </div>
      <div className="flex items-center">
        <span className="text-sm text-gray-400 mr-2">{tickets} vé</span>
        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-dark" 
            style={{ width: `${Math.min(100, (tickets / 1300) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

const ShowtimeRow = ({ movie, cinema, date, time, bookings }) => {
  return (
    <tr className="border-b border-gray-800">
      <td className="px-4 py-3">{movie}</td>
      <td className="px-4 py-3">{cinema}</td>
      <td className="px-4 py-3">{date}</td>
      <td className="px-4 py-3">{time}</td>
      <td className="px-4 py-3 text-right">{bookings} vé</td>
    </tr>
  )
}

// Các thành phần quản lý khác
const MovieManagement = () => (
  <div className="text-center py-20">
    <Film className="h-16 w-16 mx-auto text-gray-500 mb-4" />
    <h2 className="text-xl font-semibold mb-2">Quản lý phim</h2>
    <p className="text-gray-500 mb-6">Thêm, sửa, xóa thông tin phim và phân loại phim</p>
  </div>
)

const CinemaManagement = () => (
  <div className="text-center py-20">
    <Home className="h-16 w-16 mx-auto text-gray-500 mb-4" />
    <h2 className="text-xl font-semibold mb-2">Quản lý rạp chiếu</h2>
    <p className="text-gray-500 mb-6">Thêm, sửa, xóa thông tin rạp chiếu và quản lý ghế ngồi</p>
  </div>
)

const ShowtimeManagement = () => (
  <div className="text-center py-20">
    <Clock className="h-16 w-16 mx-auto text-gray-500 mb-4" />
    <h2 className="text-xl font-semibold mb-2">Quản lý suất chiếu</h2>
    <p className="text-gray-500 mb-6">Thêm, sửa, xóa các suất chiếu phim và sắp xếp lịch</p>
  </div>
)

const ReservationManagement = () => (
  <div className="text-center py-20">
    <CreditCard className="h-16 w-16 mx-auto text-gray-500 mb-4" />
    <h2 className="text-xl font-semibold mb-2">Quản lý đặt vé</h2>
    <p className="text-gray-500 mb-6">Xem tất cả các đặt vé và quản lý trạng thái</p>
  </div>
)

const UserManagement = () => (
  <div className="text-center py-20">
    <Users className="h-16 w-16 mx-auto text-gray-500 mb-4" />
    <h2 className="text-xl font-semibold mb-2">Quản lý người dùng</h2>
    <p className="text-gray-500 mb-6">Thêm, sửa, xóa tài khoản người dùng và phân quyền</p>
  </div>
)

export default AdminDashboard