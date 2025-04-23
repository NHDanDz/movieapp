"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Send, Download, CheckCircle, XCircle } from 'lucide-react'
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

const BookingInvitation = ({ qrCode }) => {
  const [sending, setSending] = useState(false)
  const [downloading, setDownloading] = useState(false)
  
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
  
  return (
    <Card className="mb-8 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
          Đặt vé thành công
        </CardTitle>
        <CardDescription>
          Vé của bạn đã được đặt thành công. Bạn có thể mời bạn bè cùng xem phim!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* QR Code */}
        {qrCode && (
          <div className="flex justify-center py-4">
            <div className="relative w-48 h-48">
              <Image
                src={qrCode}
                alt="QR Code"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
        
        {/* Invitation form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Mời bạn bè cùng xem phim</h3>
          
          {selectedSeats.map((seat, index) => (
            <div key={`seat-${index}`} className="grid grid-cols-1 gap-2">
              <Label htmlFor={`email-${index}`}>
                Email cho ghế {convertToAlphabet(seat[0])}{seat[1] + 1}
              </Label>
              <Input
                id={`email-${index}`}
                type="email"
                placeholder="Email người được mời"
                value={invitations[`${convertToAlphabet(seat[0])}-${seat[1]}`] || ''}
                onChange={(e) => 
                  setInvitation({ 
                    target: { 
                      name: `${convertToAlphabet(seat[0])}-${seat[1]}`,
                      value: e.target.value 
                    } 
                  })
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="w-full sm:w-auto"
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
          className="w-full sm:w-auto"
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
          className="w-full sm:w-auto"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Hủy
        </Button>
        
        <Button
          onClick={handleFinish}
          className="w-full sm:w-auto"
        >
          Hoàn tất
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BookingInvitation