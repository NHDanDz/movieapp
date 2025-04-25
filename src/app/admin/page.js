// src/app/admin/page.js
"use client"

import { useState, useEffect } from 'react'
import { 
    Film, // Thay thế MovieIcon bằng Film
    Building2, 
    Users, 
    Ticket, 
    TrendingUp, 
    Calendar, 
    CircleDollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
  } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { movieApi, cinemaApi, userApi, reservationApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Đăng ký Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalCinemas: 0,
    totalUsers: 0,
    totalReservations: 0,
    totalRevenue: 0,
    activeUsers: 0,
    popularMovies: [],
    popularCinemas: [],
    recentReservations: [],
    reservationByMonth: [],
    reservationByDay: [],
    revenueByMonth: [],
    moviesByGenre: []
  })
  const [timeRange, setTimeRange] = useState('week')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Trong thực tế, sẽ có API riêng để lấy dữ liệu thống kê
        // const response = await api.get('/admin/dashboard')
        // setStats(response.data)
        
        // Mô phỏng dữ liệu thống kê
        // Thống kê cơ bản
        const mockStats = {
          totalMovies: 68,
          totalCinemas: 12,
          totalUsers: 2458,
          totalReservations: 18745,
          totalRevenue: 4560000000, // 4.56 tỷ VND
          activeUsers: 1874,
          
          // Top phim phổ biến
          popularMovies: [
            { _id: '1', title: 'Avatar 3', reservations: 2451, image: '/images/movie1.jpg' },
            { _id: '2', title: 'Fast & Furious 12', reservations: 1823, image: '/images/movie2.jpg' },
            { _id: '3', title: 'Avengers: Secret Wars', reservations: 1245, image: '/images/movie3.jpg' },
            { _id: '4', title: 'Mission Impossible 8', reservations: 987, image: '/images/movie4.jpg' },
            { _id: '5', title: 'Deadpool 3', reservations: 876, image: '/images/movie5.jpg' },
          ],
          
          // Top rạp phổ biến
          popularCinemas: [
            { _id: '1', name: 'Cinema+ Đà Nẵng', reservations: 3452, revenue: 836000000 },
            { _id: '2', name: 'Cinema+ Hà Nội', reservations: 2745, revenue: 667000000 },
            { _id: '3', name: 'Cinema+ TP.HCM Q.1', reservations: 2156, revenue: 523000000 },
            { _id: '4', name: 'Cinema+ TP.HCM Q.7', reservations: 1985, revenue: 482000000 },
            { _id: '5', name: 'Cinema+ Hải Phòng', reservations: 1756, revenue: 426000000 },
          ],
          
          // Đặt vé gần đây
          recentReservations: [
            { _id: '1', username: 'ngocanh', movie: 'Avatar 3', date: '2025-04-22', seats: 2, total: 240000 },
            { _id: '2', username: 'tuanminh', movie: 'Fast & Furious 12', date: '2025-04-22', seats: 3, total: 360000 },
            { _id: '3', username: 'thanhhuong', movie: 'Avengers: Secret Wars', date: '2025-04-21', seats: 4, total: 480000 },
            { _id: '4', username: 'hoanganh', movie: 'Mission Impossible 8', date: '2025-04-21', seats: 2, total: 240000 },
            { _id: '5', username: 'admin', movie: 'Deadpool 3', date: '2025-04-20', seats: 1, total: 120000 },
          ],
          
          // Thống kê đặt vé theo tháng
          reservationByMonth: [
            { month: 'T1', count: 965 },
            { month: 'T2', count: 1250 },
            { month: 'T3', count: 1450 },
            { month: 'T4', count: 1680 },
            { month: 'T5', count: 1250 },
            { month: 'T6', count: 1500 },
            { month: 'T7', count: 1750 },
            { month: 'T8', count: 1950 },
            { month: 'T9', count: 1650 },
            { month: 'T10', count: 1580 },
            { month: 'T11', count: 1820 },
            { month: 'T12', count: 2100 },
          ],
          
          // Thống kê đặt vé theo ngày trong tuần
          reservationByDay: [
            { day: 'Thứ 2', count: 150 },
            { day: 'Thứ 3', count: 120 },
            { day: 'Thứ 4', count: 180 },
            { day: 'Thứ 5', count: 190 },
            { day: 'Thứ 6', count: 320 },
            { day: 'Thứ 7', count: 450 },
            { day: 'CN', count: 380 },
          ],
          
          // Thống kê doanh thu theo tháng
          revenueByMonth: [
            { month: 'T1', revenue: 240000000 },
            { month: 'T2', revenue: 310000000 },
            { month: 'T3', revenue: 350000000 },
            { month: 'T4', revenue: 410000000 },
            { month: 'T5', revenue: 310000000 },
            { month: 'T6', revenue: 370000000 },
            { month: 'T7', revenue: 430000000 },
            { month: 'T8', revenue: 480000000 },
            { month: 'T9', revenue: 400000000 },
            { month: 'T10', revenue: 390000000 },
            { month: 'T11', revenue: 450000000 },
            { month: 'T12', revenue: 520000000 },
          ],
          
          // Thống kê phim theo thể loại
          moviesByGenre: [
            { genre: 'Hành động', count: 20 },
            { genre: 'Tình cảm', count: 15 },
            { genre: 'Kinh dị', count: 8 },
            { genre: 'Hoạt hình', count: 10 },
            { genre: 'Khoa học viễn tưởng', count: 7 },
            { genre: 'Hài hước', count: 8 },
          ],
        }
        
        setStats(mockStats)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [timeRange])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }
  
  // Chart data
  const reservationChartData = {
    labels: stats.reservationByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Số lượng đặt vé',
        data: stats.reservationByMonth.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(120, 205, 4, 0.2)',
        borderColor: 'rgb(120, 205, 4)',
        tension: 0.3,
      },
    ],
  }
  
  const revenueChartData = {
    labels: stats.revenueByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Doanh thu (triệu VND)',
        data: stats.revenueByMonth.map(item => item.revenue / 1000000), // Convert to millions
        backgroundColor: 'rgba(14, 151, 218, 0.7)',
        borderColor: 'rgba(14, 151, 218, 1)',
        borderWidth: 1,
      },
    ],
  }
  
  const reservationByDayData = {
    labels: stats.reservationByDay.map(item => item.day),
    datasets: [
      {
        label: 'Số lượng đặt vé',
        data: stats.reservationByDay.map(item => item.count),
        backgroundColor: 'rgba(120, 205, 4, 0.7)',
        borderColor: 'rgba(120, 205, 4, 1)',
        borderWidth: 1,
      },
    ],
  }
  
  const moviesByGenreData = {
    labels: stats.moviesByGenre.map(item => item.genre),
    datasets: [
      {
        label: 'Số lượng phim',
        data: stats.moviesByGenre.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }
  
  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false,
      },
    },
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
        
        <div>
          <Tabs defaultValue="week" value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="week">Tuần này</TabsTrigger>
              <TabsTrigger value="month">Tháng này</TabsTrigger>
              <TabsTrigger value="year">Năm nay</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">Tổng doanh thu</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+14.5%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
        
        <Card  className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">Tổng đặt vé</CardTitle>
            <Ticket className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations.toLocaleString('vi-VN')}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+5.2%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
        
        <Card  className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString('vi-VN')}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+12.4%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
        
        <Card  className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800">Phim & Rạp</CardTitle>
                <Film className="h-4 w-4 text-blue-500" /> {/* Thay thế MovieIcon bằng Film */}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalMovies} Phim / {stats.totalCinemas} Rạp</div>
                <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+3 phim</span> mới trong tháng này
                </p>
            </CardContent>
        </Card>
      </div>
      
      {/* Charts - Reservation and Revenue */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card  className="bg-white">
          <CardHeader>
            <CardTitle>Lượt đặt vé</CardTitle>
            <CardDescription>Thống kê lượt đặt vé theo tháng</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Line data={reservationChartData} options={lineOptions} height="100%" />
          </CardContent>
        </Card>
        
        <Card  className="bg-white">
          <CardHeader>
            <CardTitle>Doanh thu</CardTitle>
            <CardDescription>Thống kê doanh thu theo tháng (triệu VND)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Bar data={revenueChartData} options={barOptions} height="100%" />
          </CardContent>
        </Card>
      </div>
      
      {/* Charts - Reservations by Day and Movies by Genre */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card  className="bg-white">
          <CardHeader>
            <CardTitle>Đặt vé theo ngày</CardTitle>
            <CardDescription>Số lượng đặt vé theo các ngày trong tuần</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Bar data={reservationByDayData} options={barOptions} height="100%" />
          </CardContent>
        </Card>
        
        <Card  className="bg-white">
          <CardHeader>
            <CardTitle>Phim theo thể loại</CardTitle>
            <CardDescription>Phân bố phim theo thể loại</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex justify-center items-center">
            <div className="w-4/5 h-4/5">
              <Doughnut data={moviesByGenreData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Popular Movies and Cinemas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card  className="bg-white">
          <CardHeader>
            <CardTitle>Phim phổ biến nhất</CardTitle>
            <CardDescription>Top 5 phim có lượt đặt vé cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularMovies.map((movie, index) => (
                <div key={movie._id} className="flex items-center gap-4">
                  <div className="font-bold text-muted-foreground w-5">#{index + 1}</div>
                  <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gray-100" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{movie.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {movie.reservations.toLocaleString('vi-VN')} lượt đặt vé
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card  className="bg-white">
          <CardHeader>
            <CardTitle>Rạp phổ biến nhất</CardTitle>
            <CardDescription>Top 5 rạp có lượt đặt vé cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularCinemas.map((cinema, index) => (
                <div key={cinema._id} className="flex items-center gap-4">
                  <div className="font-bold text-muted-foreground w-5">#{index + 1}</div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{cinema.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cinema.reservations.toLocaleString('vi-VN')} lượt đặt vé | 
                      {formatCurrency(cinema.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Reservations */}
      <Card  className="bg-white">
        <CardHeader>
          <CardTitle>Đặt vé gần đây</CardTitle>
          <CardDescription>Các đặt vé mới nhất trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 font-medium text-muted-foreground text-sm">
              <div>Mã đặt vé</div>
              <div>Người dùng</div>
              <div>Phim</div>
              <div>Ngày xem</div>
              <div className="text-right">Tổng tiền</div>
            </div>
            
            {stats.recentReservations.map(reservation => (
              <div key={reservation._id} className="grid grid-cols-5 items-center py-2 border-b border-border">
                <div className="font-mono text-sm">{reservation._id}</div>
                <div>{reservation.username}</div>
                <div className="font-medium">{reservation.movie}</div>
                <div>{formatDate(reservation.date)}</div>
                <div className="text-right font-medium">{formatCurrency(reservation.total)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
  
  // Helper function để định dạng ngày
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }
}