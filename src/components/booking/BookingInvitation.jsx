"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Send, Download, CheckCircle, XCircle, Share2, Mail, Copy } from 'lucide-react'
import { useBooking } from '@/hooks/useBooking'
import { convertToAlphabet, generateTicketPDF } from '@/lib/utils'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const Confetti = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M4 24h-6v-6M10 24h-6v-6M16 24h-6v-6M22 24h-6v-6M4 18h-6v-6M10 18h-6v-6M16 18h-6v-6M22 18h-6v-6M4 12h-6v-6M10 12h-6v-6M16 12h-6v-6M22 12h-6v-6"></path>
    </svg>
  )
}
const BookingInvitation = ({ qrCode }) => {
  const [sending, setSending] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const router = useRouter()
  const { 
    selectedSeats,
    selectedMovie,
    selectedCinema,
    selectedDate,
    selectedTime,
    invitations,
    setInvitation,
    sendInvitations,
    resetBooking,
    resetCheckout
  } = useBooking()
  
  useEffect(() => {
    // Animate entrance
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    
    // Show confetti animation
    const confettiTimer = setTimeout(() => {
      setShowConfetti(true)
    }, 800)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(confettiTimer)
    }
  }, [])
  
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true)
      
      // Simple PDF generation using jsPDF
      const doc = generateTicketPDF(
        selectedMovie.title,
        selectedCinema.name,
        selectedDate,
        selectedTime,
        selectedSeats,
        qrCode
      )
      
      // Save the PDF
      doc.save(`Cinema_Plus_Ticket_${new Date().getTime()}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setDownloading(false)
    }
  }
  
  const handleSendInvitations = async () => {
    try {
      setSending(true)
      await sendInvitations()
    } catch (error) {
      console.error('Error sending invitations:', error)
    } finally {
      setSending(false)
    }
  }
  
  const handleFinish = () => {
    resetBooking()
    router.push('/')
  }
  
  const handleContinue = () => {
    resetCheckout()
  }
  
  const handleCopyLink = () => {
    // Create a ticket link (fake for demo)
    const ticketLink = `https://cinema-plus.vn/tickets/${Math.random().toString(36).substring(2, 10)}`
    
    navigator.clipboard.writeText(ticketLink)
    
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }
  
  return (
    <Card className={`mb-8 border-gray-800 bg-background/80 backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <Confetti className="h-16 w-16 text-primary-dark" />
        </div>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center text-2xl text-primary-dark">
          <CheckCircle className="h-7 w-7 text-primary-dark mr-2" />
          Đặt vé thành công!
        </CardTitle>
        <CardDescription className="text-base">
          Vé của bạn đã được đặt thành công. Bạn có thể mời bạn bè cùng xem phim!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* QR Code */}
        {qrCode && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-white p-4 rounded-lg relative">
              <div className="relative w-48 h-48">
                <Image
                  src={qrCode}
                  alt="QR Code"
                  fill
                  className="object-contain"
                />
              </div>
              
              {/* Corners for design */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-dark"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary-dark"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary-dark"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-dark"></div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400 mb-2">Quét mã QR để truy cập vé của bạn</p>
              
              <div className="flex justify-center space-x-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 hover:bg-gray-800/70"
                        onClick={handleCopyLink}
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Đã sao chép" : "Sao chép liên kết"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sao chép liên kết vé để chia sẻ</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 hover:bg-gray-800/70"
                      >
                        <Share2 className="h-4 w-4" />
                        Chia sẻ
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chia sẻ vé qua mạng xã hội</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
        
        {/* Ticket summary */}
        <div className="bg-gray-800/40 rounded-lg p-4">
          <h3 className="font-medium mb-4 text-center">Chi tiết vé</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Phim</p>
              <p className="font-medium">{selectedMovie.title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Rạp</p>
              <p className="font-medium">{selectedCinema.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Ngày</p>
              <p className="font-medium">{selectedDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Giờ</p>
              <p className="font-medium">{selectedTime}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-gray-400">Ghế</p>
              <p className="font-medium">
                {selectedSeats.map((seat, index) => (
                  <span key={index}>
                    {`${seat.rowName}${seat.seatNumber}`}
                    {index < selectedSeats.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
        
        {/* Invitation form */}
        <div className="bg-gray-800/40 rounded-lg p-4">
          <h3 className="font-medium mb-4 flex items-center">
            <Mail className="h-4 w-4 mr-2 text-primary-dark" />
            Mời bạn bè cùng xem phim
          </h3>
          
          {selectedSeats.map((seat, index) => (
            <div key={`seat-${index}`} className="grid grid-cols-1 gap-2 mb-4 last:mb-0">
              <Label htmlFor={`email-${index}`}>
                Mời bạn cho ghế {seat.rowName}{seat.seatNumber}
              </Label>
              <div className="flex space-x-2">
                <Input
                  id={`email-${index}`}
                  type="email"
                  placeholder="Email người được mời"
                  value={invitations[`${seat.rowName}-${seat.seatNumber}`] || ''}
                  onChange={(e) => 
                    setInvitation({ 
                      target: { 
                        name: `${seat.rowName}-${seat.seatNumber}`,
                        value: e.target.value 
                      } 
                    })
                  }
                  className="bg-gray-900/60 border-gray-700 focus:border-primary-dark"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-800 p-6">
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="w-full sm:w-auto hover:bg-gray-800/70 transition-all"
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Tải vé PDF
        </Button>
        
        <Button
          onClick={handleSendInvitations}
          variant="outline"
          className="w-full sm:w-auto hover:bg-gray-800/70 transition-all"
          disabled={
            sending || 
            Object.values(invitations).every(value => !value || value === '')
          }
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Gửi lời mời
        </Button>
        
        <div className="flex-grow"></div>
        
        <Button
          onClick={handleContinue}
          variant="ghost"
          className="w-full sm:w-auto hover:bg-gray-800/50 transition-all"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Hủy
        </Button>
        
        <Button
          onClick={handleFinish}
          className="w-full sm:w-auto btn-gradient"
        >
          Hoàn tất
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BookingInvitation