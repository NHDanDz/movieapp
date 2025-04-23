"use client"

import { createContext, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { generateQR } from '@/lib/utils'

export const BookingContext = createContext()

export const BookingProvider = ({ children }) => {
  // State cho quá trình đặt vé
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedCinema, setSelectedCinema] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [suggestedSeats, setSuggestedSeats] = useState([])
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [showInvitation, setShowInvitation] = useState(false)
  const [invitations, setInvitations] = useState({})
  const [qrCode, setQRCode] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const { toast } = useToast()

  // Chọn ghế
  const selectSeat = (row, seat) => {
    const seatIndex = selectedSeats.findIndex(
      s => s[0] === row && s[1] === seat
    )

    if (seatIndex !== -1) {
      // Nếu ghế đã được chọn, bỏ chọn nó
      setSelectedSeats(selectedSeats.filter((_, i) => i !== seatIndex))
    } else {
      // Thêm ghế mới vào danh sách đã chọn
      setSelectedSeats([...selectedSeats, [row, seat]])
    }
  }

  // Reset toàn bộ quá trình đặt vé
  const resetBooking = () => {
    setSelectedCinema(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedSeats([])
    setSuggestedSeats([])
    setShowInvitation(false)
    setInvitations({})
    setQRCode(null)
  }

  // Reset chỉ phần checkout
  const resetCheckout = () => {
    setShowInvitation(false)
    setInvitations({})
  }

  // Hiển thị form mời bạn bè
  const showInvitationForm = () => {
    setShowInvitation(true)
  }

  // Hiển thị popup đăng nhập
  const toggleLoginPopup = () => {
    setShowLoginPopup(!showLoginPopup)
  }

  // Thêm email mời cho một ghế cụ thể
  const setInvitation = (event) => {
    setInvitations({
      ...invitations,
      [event.target.name]: event.target.value
    })
  }

  // API calls
  // Đặt vé
  const addReservation = async (reservationData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwtToken')
      
      const response = await api.post('/reservations', reservationData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.data) {
        toast({
          title: "Đặt vé thành công",
          description: "Vé của bạn đã được đặt thành công!",
        })
        
        // Tạo QR code cho vé
        if (response.data.QRCode) {
          setQRCode(response.data.QRCode)
        } else {
          const qr = await generateQR(
            `${window.location.origin}/reservations/${response.data.reservation._id}`
          )
          setQRCode(qr)
        }
        
        return { status: 'success', data: response.data }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đặt vé thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi đặt vé",
      })
      return { status: 'error', message: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Gửi lời mời xem phim
  const sendInvitations = async (invitationsData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwtToken')
      
      const response = await api.post('/invitations', invitationsData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.data) {
        toast({
          title: "Gửi lời mời thành công",
          description: "Lời mời xem phim đã được gửi thành công!",
        })
        
        resetCheckout()
        return { status: 'success', message: 'Invitations sent' }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gửi lời mời thất bại",
        description: error.response?.data?.message || "Đã xảy ra lỗi khi gửi lời mời",
      })
      return { status: 'error', message: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Lấy gợi ý chỗ ngồi
  const getSuggestedSeats = async (username) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwtToken')
      
      const response = await api.get(`/reservations/usermodeling/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.data) {
        setSuggestedSeats(response.data)
        return response.data
      }
    } catch (error) {
      console.error('Failed to get suggested seats:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return (
    <BookingContext.Provider
      value={{
        selectedMovie,
        selectedCinema,
        selectedDate,
        selectedTime,
        selectedSeats,
        suggestedSeats,
        showLoginPopup,
        showInvitation,
        invitations,
        qrCode,
        loading,
        setSelectedMovie,
        setSelectedCinema,
        setSelectedDate,
        setSelectedTime,
        selectSeat,
        setSuggestedSeats,
        resetBooking,
        resetCheckout,
        showInvitationForm,
        toggleLoginPopup,
        setInvitation,
        setQRCode,
        addReservation,
        sendInvitations,
        getSuggestedSeats
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}