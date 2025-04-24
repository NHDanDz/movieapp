// src/app/admin/reservations/page.js
"use client"

import { useState, useEffect } from 'react'
import { reservationApi, movieApi, cinemaApi, userApi } from '@/lib/api'
import { formatDate, formatCurrency, convertToAlphabet } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { 
  Ticket, 
  Search, 
  Eye, 
  ArrowUpDown, 
  X,
  Loader2,
  Download,
  CalendarDays,
  Clock,
  Users,
  CreditCard,
  Check,
  AlertTriangle
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminReservationManagement() {
  const [reservations, setReservations] = useState([])
  const [movies, setMovies] = useState({})
  const [cinemas, setCinemas] = useState({})
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' hoặc 'desc'
  const [sortField, setSortField] = useState('date')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'upcoming', 'past'
  const [filteredReservations, setFilteredReservations] = useState([])
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const { toast } = useToast()
  
  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch reservations
        const reservationsRes = await reservationApi.getAll()
        setReservations(reservationsRes.data || [])
        
        // Fetch movies, cinemas, users for display
        const moviesData = {}
        const cinemasData = {}
        const usersData = {}
        
        // Fetch unique movie IDs
        const uniqueMovieIds = [...new Set((reservationsRes.data || []).map(r => r.movieId))]
        for (const movieId of uniqueMovieIds) {
          try {
            const movieRes = await movieApi.getById(movieId)
            if (movieRes.data) {
              moviesData[movieId] = movieRes.data
            }
          } catch (error) {
            console.error(`Error fetching movie ${movieId}:`, error)
          }
        }
        
        // Fetch unique cinema IDs
        const uniqueCinemaIds = [...new Set((reservationsRes.data || []).map(r => r.cinemaId))]
        for (const cinemaId of uniqueCinemaIds) {
          try {
            const cinemaRes = await cinemaApi.getById(cinemaId)
            if (cinemaRes.data) {
              cinemasData[cinemaId] = cinemaRes.data
            }
          } catch (error) {
            console.error(`Error fetching cinema ${cinemaId}:`, error)
          }
        }
        
        // Fetch unique usernames
        const uniqueUsernames = [...new Set((reservationsRes.data || []).map(r => r.username))]
        for (const username of uniqueUsernames) {
          try {
            // Mô phỏng dữ liệu người dùng vì không có API lấy theo username
            // Thực tế sẽ sử dụng API như userApi.getByUsername(username)
            usersData[username] = {
              username,
              name: username,
              email: `${username}@example.com`,
              phone: "0123456789"
            }
          } catch (error) {
            console.error(`Error fetching user ${username}:`, error)
          }
        }
        
        setMovies(moviesData)
        setCinemas(cinemasData)
        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Lọc và sắp xếp danh sách đặt vé
  useEffect(() => {
    if (!reservations.length) return
    
    let result = [...reservations]
    const now = new Date()
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      result = result.filter(reservation => {
        const reservationDate = new Date(reservation.date)
        if (statusFilter === 'upcoming') {
          return reservationDate >= now
        } else if (statusFilter === 'past') {
          return reservationDate < now
        }
        return true
      })
    }
    
    // Tìm kiếm
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(reservation => {
        const movie = movies[reservation.movieId]
        const cinema = cinemas[reservation.cinemaId]
        const user = users[reservation.username]
        
        return (
          reservation.username?.toLowerCase().includes(searchLower) ||
          user?.name?.toLowerCase().includes(searchLower) ||
          user?.email?.toLowerCase().includes(searchLower) ||
          movie?.title?.toLowerCase().includes(searchLower) ||
          cinema?.name?.toLowerCase().includes(searchLower) ||
          cinema?.city?.toLowerCase().includes(searchLower) ||
          reservation.startAt?.toLowerCase().includes(searchLower)
        )
      })
    }
    
    // Sắp xếp
    result.sort((a, b) => {
      let valA, valB
      
      if (sortField === 'movie') {
        valA = movies[a.movieId]?.title || ''
        valB = movies[b.movieId]?.title || ''
      } else if (sortField === 'cinema') {
        valA = cinemas[a.cinemaId]?.name || ''
        valB = cinemas[b.cinemaId]?.name || ''
      } else if (sortField === 'username') {
        valA = users[a.username]?.name || a.username || ''
        valB = users[b.username]?.name || b.username || ''
      } else {
        valA = a[sortField]
        valB = b[sortField]
        
        // Xử lý trường hợp ngày tháng
        if (sortField === 'date') {
          valA = new Date(valA || 0)
          valB = new Date(valB || 0)
        }
      }
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1
      } else {
        return valA < valB ? 1 : -1
      }
    })
    
    setFilteredReservations(result)
  }, [reservations, movies, cinemas, users, search, sortField, sortOrder, statusFilter])
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  // Mô phỏng hủy đặt vé
  const handleCancelReservation = async () => {
    try {
      setSubmitting(true)
      
      // TODO: Implement API call to cancel reservation
      // await reservationApi.cancel(selectedReservation._id)
      
      // Mô phỏng hủy đặt vé
      const updatedReservations = reservations.map(reservation => {
        if (reservation._id === selectedReservation._id) {
          return {
            ...reservation,
            status: 'cancelled'
          }
        }
        return reservation
      })
      
      setReservations(updatedReservations)
      
      toast({
        title: "Hủy đặt vé thành công",
        description: `Đã hủy vé mã ${selectedReservation._id}`
      })
      
      setShowCancelDialog(false)
      setSelectedReservation(null)
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể hủy đặt vé. Vui lòng thử lại sau.",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Format ghế đã chọn
  const formatSeats = (seats) => {
    if (!seats || !Array.isArray(seats)) return '-'
    
    return seats.map(seat => {
      if (Array.isArray(seat) && seat.length >= 2) {
        return `${convertToAlphabet(seat[0])}-${seat[1] + 1}`
      }
      return '-'
    }).join(', ')
  }
  
  // Kiểm tra xem đặt vé đã qua chưa
  const isPastReservation = (date) => {
    return new Date(date) < new Date()
  }
  
  // Mô phỏng xuất file PDF vé
  const handleDownloadTicket = (reservation) => {
    toast({
      title: "Tính năng đang phát triển",
      description: "Chức năng xuất vé PDF đang được phát triển."
    })
  }
  
  // Mô phỏng xuất file Excel danh sách đặt vé
  const handleExportReservations = () => {
    toast({
      title: "Tính năng đang phát triển",
      description: "Chức năng xuất file Excel đang được phát triển."
    })
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý đặt vé</h1>
        
        <Button onClick={handleExportReservations}>
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>
      
      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng đặt vé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations.length}</div>
            <p className="text-xs text-muted-foreground">
              {reservations.filter(r => !isPastReservation(r.date)).length} sắp diễn ra
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reservations.reduce((sum, r) => sum + (r.total || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Từ {reservations.length} lượt đặt vé
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ hủy vé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservations.length > 0 
                ? `${((reservations.filter(r => r.status === 'cancelled').length / reservations.length) * 100).toFixed(1)}%` 
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {reservations.filter(r => r.status === 'cancelled').length} vé đã bị hủy
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Search và lọc */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đặt vé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
            <SelectItem value="past">Đã qua</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Bảng danh sách đặt vé */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('date')}
                  >
                    Ngày
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('movie')}
                  >
                    Phim
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('username')}
                  >
                    Người đặt
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Ghế</TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    className="p-0 font-bold"
                    onClick={() => handleSort('total')}
                  >
                    Tổng tiền
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center">
                      <Ticket className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Không có đặt vé nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => {
                  const movie = movies[reservation.movieId]
                  const cinema = cinemas[reservation.cinemaId]
                  const user = users[reservation.username]
                  const isPast = isPastReservation(reservation.date)
                  
                  return (
                    <TableRow key={reservation._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatDate(reservation.date)}</div>
                          <div className="text-xs text-muted-foreground">
                            {reservation.startAt}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{movie?.title || '-'}</div>
                          <div className="text-xs text-muted-foreground">
                            {cinema?.name || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user?.name || reservation.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {user?.email || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatSeats(reservation.seats)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(reservation.total)}
                      </TableCell>
                      <TableCell>
                        {reservation.status === 'cancelled' ? (
                          <Badge variant="destructive">Đã hủy</Badge>
                        ) : isPast ? (
                          <Badge variant="secondary">Đã qua</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">
                            Sắp diễn ra
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedReservation(reservation)
                              setShowDetailDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!isPast && reservation.status !== 'cancelled' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                setSelectedReservation(reservation)
                                setShowCancelDialog(true)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Dialog chi tiết đặt vé */}
      {selectedReservation && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chi tiết đặt vé</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về đặt vé
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mã đặt vé:</span>
                <span className="font-medium">{selectedReservation._id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phim:</span>
                <span className="font-medium">{movies[selectedReservation.movieId]?.title || '-'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rạp:</span>
                <span className="font-medium">{cinemas[selectedReservation.cinemaId]?.name || '-'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ngày chiếu:</span>
                <span className="font-medium">{formatDate(selectedReservation.date)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Giờ chiếu:</span>
                <span className="font-medium">{selectedReservation.startAt}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ghế:</span>
                <span className="font-medium">{formatSeats(selectedReservation.seats)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Người đặt:</span>
                <span className="font-medium">
                  {users[selectedReservation.username]?.name || selectedReservation.username}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">
                  {users[selectedReservation.username]?.email || '-'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Số điện thoại:</span>
                <span className="font-medium">
                  {users[selectedReservation.username]?.phone || selectedReservation.phone || '-'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Giá vé:</span>
                <span className="font-medium">{formatCurrency(selectedReservation.ticketPrice)} / vé</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Số lượng:</span>
                <span className="font-medium">{selectedReservation.seats?.length || 0} vé</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tổng cộng:</span>
                <span className="font-bold text-lg">{formatCurrency(selectedReservation.total)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <div>
                  {selectedReservation.status === 'cancelled' ? (
                    <Badge variant="destructive">Đã hủy</Badge>
                  ) : isPastReservation(selectedReservation.date) ? (
                    <Badge variant="secondary">Đã qua</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">
                      Sắp diễn ra
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDetailDialog(false)}
              >
                Đóng
              </Button>
              
              <Button 
                variant="default" 
                onClick={() => handleDownloadTicket(selectedReservation)}
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất vé
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialog hủy đặt vé */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy đặt vé</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy đặt vé này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-4">
              <Alert variant="warning" className="bg-amber-500/10 text-amber-500 border-amber-500/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Việc hủy đặt vé sẽ giải phóng ghế và cho phép người khác đặt.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phim:</span>
                  <span className="font-medium">{movies[selectedReservation.movieId]?.title || '-'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ngày:</span>
                  <span className="font-medium">{formatDate(selectedReservation.date)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Giờ:</span>
                  <span className="font-medium">{selectedReservation.startAt}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ghế:</span>
                  <span className="font-medium">{formatSeats(selectedReservation.seats)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tổng tiền:</span>
                  <span className="font-medium">{formatCurrency(selectedReservation.total)}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
            >
              Giữ lại
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelReservation}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Hủy đặt vé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}