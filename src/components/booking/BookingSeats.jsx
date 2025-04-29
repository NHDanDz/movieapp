"use client"

import { useState, useEffect } from 'react'
import { useBooking } from '@/hooks/useBooking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function BookingSeats({ seats = { matrix: [], rowNames: [], maxCol: 0 }, reservedSeats = [] }) {
  const { 
    selectedSeats, 
    selectSeat, 
    isSeatSelected,
    suggestedSeats 
  } = useBooking()
  
  const [showSuggestion, setShowSuggestion] = useState(false)
  
  // Hiển thị gợi ý ghế nếu có
  useEffect(() => {
    if (suggestedSeats && suggestedSeats.preferredPosition) {
      setShowSuggestion(true)
    }
  }, [suggestedSeats])
  
  // Chọn ghế gợi ý
  const selectSuggestedSeats = () => {
    if (!suggestedSeats || !seats.matrix || !seats.rowNames) return
    
    // Reset ghế đã chọn
    selectedSeats.forEach(seat => {
      selectSeat(seat.rowName, seat.seatNumber)
    })
    
    // Tìm ghế phù hợp với vị trí ưa thích
    const preferredPosition = suggestedSeats.preferredPosition
    const avgTickets = suggestedSeats.avgTickets || 2
    
    // Tìm ghế phù hợp dựa trên vị trí ưa thích
    let foundSeats = []
    const totalRows = seats.rowNames.length
    
    if (preferredPosition === 'front') {
      // Tìm ghế ở 1/3 đầu phòng
      const frontRows = Math.ceil(totalRows / 3)
      for (let row = 0; row < frontRows; row++) {
        findAvailableSeatsInRow(row, avgTickets, foundSeats)
        if (foundSeats.length === avgTickets) break
      }
    } else if (preferredPosition === 'center') {
      // Tìm ghế ở giữa phòng
      const startRow = Math.floor(totalRows / 3)
      const endRow = Math.floor(2 * totalRows / 3)
      for (let row = startRow; row < endRow; row++) {
        findAvailableSeatsInRow(row, avgTickets, foundSeats)
        if (foundSeats.length === avgTickets) break
      }
    } else {
      // Tìm ghế ở 1/3 cuối phòng
      const startRow = Math.floor(2 * totalRows / 3)
      for (let row = startRow; row < totalRows; row++) {
        findAvailableSeatsInRow(row, avgTickets, foundSeats)
        if (foundSeats.length === avgTickets) break
      }
    }
    
    // Chọn các ghế tìm được
    foundSeats.forEach(seat => {
      selectSeat(seat.rowName, seat.seatNumber, seat.seatId, seat.seatType, seat.extraCharge)
    })
    
    setShowSuggestion(false)
  }
  
  // Hàm tìm ghế liên tiếp còn trống trong một hàng
  const findAvailableSeatsInRow = (rowIndex, count, result) => {
    if (!seats.matrix || rowIndex >= seats.matrix.length) return
    
    const row = seats.matrix[rowIndex]
    const rowName = seats.rowNames[rowIndex]
    
    // Tìm cụm ghế liên tiếp còn trống
    let consecutive = []
    const middleStart = Math.floor((row.length - count) / 2)
    
    // Ưu tiên tìm ở giữa trước
    for (let col = middleStart; col < middleStart + count; col++) {
      if (col < row.length && isSeatAvailable(rowIndex, col)) {
        consecutive.push({
          rowName,
          seatNumber: (col + 1).toString(),
          seatType: row[col] === 2 ? 'premium' : 'standard',
          extraCharge: row[col] === 2 ? 15000 : 0, // Phụ thu cho ghế premium
          seatId: null // Sẽ được gán sau khi tạo đặt vé
        })
      } else {
        consecutive = []
        break
      }
    }
    
    // Nếu không tìm được ở giữa, tìm từ trái qua phải
    if (consecutive.length === 0) {
      for (let col = 0; col < row.length - count + 1; col++) {
        consecutive = []
        for (let i = 0; i < count; i++) {
          if (isSeatAvailable(rowIndex, col + i)) {
            consecutive.push({
              rowName,
              seatNumber: (col + i + 1).toString(),
              seatType: row[col + i] === 2 ? 'premium' : 'standard',
              extraCharge: row[col + i] === 2 ? 15000 : 0,
              seatId: null
            })
          } else {
            consecutive = []
            break
          }
        }
        if (consecutive.length === count) break
      }
    }
    
    result.push(...consecutive)
  }
  
  // Kiểm tra ghế có khả dụng không (không phải 0 và không phải 3)
  const isSeatAvailable = (row, col) => {
    return seats.matrix[row][col] === 1 || seats.matrix[row][col] === 2
  }
  
  // Kiểm tra ghế đã được đặt chưa
  const isSeatReserved = (row, col) => {
    if (!seats.matrix || !seats.rowNames) return false
    
    const rowName = seats.rowNames[row]
    const seatNumber = (col + 1).toString()
    return reservedSeats.includes(`${rowName}-${seatNumber}`) || seats.matrix[row][col] === 3
  }
  
  // Xác định CSS class cho ghế
  const getSeatClass = (row, col) => {
    if (!seats.matrix || !seats.rowNames) return 'invisible'
    
    const seatValue = seats.matrix[row][col]
    const rowName = seats.rowNames[row]
    const seatNumber = (col + 1).toString()
    
    if (seatValue === 0) return 'invisible' // Không có ghế
    
    let classes = 'flex items-center justify-center text-xs w-8 h-8 rounded-md cursor-pointer transition-all'
    
    // Ghế đã đặt
    if (isSeatReserved(row, col)) {
      return `${classes} bg-gray-500 text-white cursor-not-allowed opacity-50`
    }
    
    // Ghế đã chọn
    if (isSeatSelected(rowName, seatNumber)) {
      return `${classes} bg-primary text-white`
    }
    
    // Ghế premium/VIP
    if (seatValue === 2) {
      return `${classes} bg-yellow-200 hover:bg-yellow-300`
    }
    
    // Ghế thường
    return `${classes} bg-gray-200 hover:bg-gray-300`
  }

  // Nếu không có dữ liệu, hiển thị thông báo
  if (!seats.matrix || !seats.rowNames || seats.matrix.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chọn ghế</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6">
            Không có dữ liệu ghế. Vui lòng chọn phòng chiếu khác.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chọn ghế</CardTitle>
        {showSuggestion && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={selectSuggestedSeats}
          >
            Chọn ghế gợi ý
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-xl">
            {/* Màn hình */}
            <div className="w-full h-8 bg-gray-700 rounded-lg mb-8 flex items-center justify-center">
              <span className="text-white text-xs">Màn hình</span>
            </div>
            
            {/* Chú thích */}
            <div className="flex justify-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-sm bg-gray-200"></div>
                <span className="text-xs">Ghế thường</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-sm bg-yellow-200"></div>
                <span className="text-xs">Ghế Premium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-sm bg-primary"></div>
                <span className="text-xs">Ghế đã chọn</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-sm bg-gray-500 opacity-50"></div>
                <span className="text-xs">Ghế đã đặt</span>
              </div>
            </div>
            
            {/* Ma trận ghế */}
            <div className="flex flex-col items-center">
              {seats.matrix.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex justify-center space-x-2 mb-2">
                  <div className="w-6 flex items-center justify-center font-medium">
                    {seats.rowNames[rowIndex]}
                  </div>
                  {Array.from({ length: seats.maxCol }).map((_, colIndex) => (
                    <button
                      key={`seat-${rowIndex}-${colIndex}`}
                      className={getSeatClass(rowIndex, colIndex)}
                      disabled={
                        colIndex >= row.length || 
                        row[colIndex] === 0 || 
                        row[colIndex] === 3 || 
                        isSeatReserved(rowIndex, colIndex)
                      }
                      onClick={() => {
                        if (colIndex < row.length && row[colIndex] !== 0 && !isSeatReserved(rowIndex, colIndex)) {
                          const rowName = seats.rowNames[rowIndex]
                          const seatNumber = (colIndex + 1).toString()
                          const seatType = row[colIndex] === 2 ? 'premium' : 'standard'
                          const extraCharge = row[colIndex] === 2 ? 15000 : 0 // Phụ thu cho ghế premium
                          
                          selectSeat(rowName, seatNumber, null, seatType, extraCharge)
                        }
                      }}
                    >
                      {colIndex + 1}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Hiển thị ghế đã chọn */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Ghế đã chọn:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.length === 0 ? (
              <span className="text-sm text-gray-500">Chưa chọn ghế nào</span>
            ) : (
              selectedSeats.map((seat, index) => (
                <Badge 
                  key={`selected-${index}`}
                  variant={seat.seatType === 'premium' || seat.seatType === 'vip' ? 'secondary' : 'outline'}
                >
                  {`Hàng ${seat.rowName} - Ghế ${seat.seatNumber}`}
                  {(seat.seatType === 'premium' || seat.seatType === 'vip') && ' (Premium)'}
                </Badge>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}