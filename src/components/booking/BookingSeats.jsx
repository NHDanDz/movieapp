"use client"

import { useState, useEffect } from 'react'
import { useBooking } from '@/hooks/useBooking'
import { roomApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, HelpCircle, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function BookingSeats({ seats = { matrix: [], rowNames: [], maxCol: 0 }, reservedSeats = [] }) {
  const { 
    selectedSeats, 
    selectSeat, 
    isSeatSelected,
    suggestedSeats,
    selectedRoom,
    selectedShowtime
  } = useBooking()
  
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localSeats, setLocalSeats] = useState(seats)
  const [localReservedSeats, setLocalReservedSeats] = useState(reservedSeats)
  const [screenAnimation, setScreenAnimation] = useState(false)
  
  // Hiệu ứng màn hình khi tải xong
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreenAnimation(true)
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Cập nhật localSeats khi props seats thay đổi
  useEffect(() => {
    console.log("BookingSeats - props seats changed:", seats);
    if (seats && seats.matrix && seats.matrix.length > 0) {
      setLocalSeats(seats);
    }
  }, [seats]);
  
  // Cập nhật localReservedSeats khi props reservedSeats thay đổi
  useEffect(() => {
    console.log("BookingSeats - props reservedSeats changed:", reservedSeats);
    setLocalReservedSeats(reservedSeats);
  }, [reservedSeats]);
  
  // Lấy ghế đã đặt khi chọn suất chiếu
  useEffect(() => {
    if (selectedShowtime && selectedRoom) {
      fetchReservedSeats(selectedShowtime);
    }
  }, [selectedShowtime, selectedRoom]);
  
  // Hiển thị gợi ý ghế nếu có
  useEffect(() => {
    if (suggestedSeats && suggestedSeats.preferredPosition) {
      setShowSuggestion(true);
    }
  }, [suggestedSeats]);
  
  // Lấy danh sách ghế đã đặt
  const fetchReservedSeats = async (showtimeId) => {
    try {
      setLoading(true);
      console.log("Fetching reserved seats for showtime:", showtimeId);
      
      const checkData = {
        showtimeId: parseInt(showtimeId),
        seats: [] // Gửi mảng rỗng để lấy tất cả ghế đã đặt
      };
      
      const response = await roomApi.checkSeatsAvailability(selectedRoom, checkData);
      console.log("Reserved seats response:", response.data);
      
      if (response.data && response.data.reservedSeats) {
        setLocalReservedSeats(response.data.reservedSeats);
        
        // Cập nhật ma trận ghế để đánh dấu ghế đã đặt
        if (localSeats && localSeats.matrix && localSeats.matrix.length > 0) {
          updateReservedSeatsInMatrix(response.data.reservedSeats);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ghế đã đặt:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Cập nhật ma trận ghế với ghế đã đặt
  const updateReservedSeatsInMatrix = (reservedSeatsList) => {
    if (!localSeats.matrix || !localSeats.rowNames) return;
    
    const updatedMatrix = [...localSeats.matrix];
    const rowMapping = {};
    
    // Tạo mapping từ tên hàng -> index
    localSeats.rowNames.forEach((rowName, index) => {
      rowMapping[rowName] = index;
    });
    
    reservedSeatsList.forEach(reservedSeat => {
      const [rowName, seatNumber] = reservedSeat.split('-');
      const rowIndex = rowMapping[rowName];
      const colIndex = parseInt(seatNumber) - 1;
      
      // Chỉ cập nhật nếu vị trí nằm trong ma trận
      if (rowIndex !== undefined && colIndex >= 0 && colIndex < localSeats.maxCol) {
        // Đánh dấu ghế đã đặt là 3
        if (updatedMatrix[rowIndex][colIndex] > 0) {
          updatedMatrix[rowIndex][colIndex] = 3;
        }
      }
    });
    
    // Cập nhật state seats
    setLocalSeats({
      ...localSeats,
      matrix: updatedMatrix
    });
  };
  
  // Chọn ghế gợi ý
  const selectSuggestedSeats = () => {
    if (!suggestedSeats || !localSeats.matrix || !localSeats.rowNames) return;
    
    // Reset ghế đã chọn
    selectedSeats.forEach(seat => {
      selectSeat(seat.rowName, seat.seatNumber);
    });
    
    // Tìm ghế phù hợp với vị trí ưa thích
    const preferredPosition = suggestedSeats.preferredPosition;
    const avgTickets = suggestedSeats.avgTickets || 2;
    
    // Tìm ghế phù hợp dựa trên vị trí ưa thích
    let foundSeats = [];
    const totalRows = localSeats.rowNames.length;
    
    if (preferredPosition === 'front') {
      // Tìm ghế ở 1/3 đầu phòng
      const frontRows = Math.ceil(totalRows / 3);
      for (let row = 0; row < frontRows; row++) {
        findAvailableSeatsInRow(row, avgTickets, foundSeats);
        if (foundSeats.length === avgTickets) break;
      }
    } else if (preferredPosition === 'center') {
      // Tìm ghế ở giữa phòng
      const startRow = Math.floor(totalRows / 3);
      const endRow = Math.floor(2 * totalRows / 3);
      for (let row = startRow; row < endRow; row++) {
        findAvailableSeatsInRow(row, avgTickets, foundSeats);
        if (foundSeats.length === avgTickets) break;
      }
    } else {
      // Tìm ghế ở 1/3 cuối phòng
      const startRow = Math.floor(2 * totalRows / 3);
      for (let row = startRow; row < totalRows; row++) {
        findAvailableSeatsInRow(row, avgTickets, foundSeats);
        if (foundSeats.length === avgTickets) break;
      }
    }
    
    // Chọn các ghế tìm được
    foundSeats.forEach(seat => {
      // Tìm ID của ghế trong dữ liệu gốc
      const originalSeat = localSeats.originalData?.find(
        s => s.RowName === seat.rowName && s.SeatNumber === seat.seatNumber
      );
      
      const seatId = originalSeat ? originalSeat.ID : null;
      
      selectSeat(seat.rowName, seat.seatNumber, seatId, seat.seatType, seat.extraCharge);
    });
    
    setShowSuggestion(false);
  };
  
  // Hàm tìm ghế liên tiếp còn trống trong một hàng
  const findAvailableSeatsInRow = (rowIndex, count, result) => {
    if (!localSeats.matrix || rowIndex >= localSeats.matrix.length) return;
    
    const row = localSeats.matrix[rowIndex];
    const rowName = localSeats.rowNames[rowIndex];
    
    // Tìm cụm ghế liên tiếp còn trống
    let consecutive = [];
    const middleStart = Math.floor((row.length - count) / 2);
    
    // Ưu tiên tìm ở giữa trước
    for (let col = middleStart; col < middleStart + count; col++) {
      if (col < row.length && isSeatAvailable(rowIndex, col)) {
        consecutive.push({
          rowName,
          seatNumber: (col + 1).toString(),
          seatType: row[col] === 2 ? 'premium' : 'standard',
          extraCharge: row[col] === 2 ? 15000 : 0,
          seatId: getSeatId(rowName, (col + 1).toString())
        });
      } else {
        consecutive = [];
        break;
      }
    }
    
    // Nếu không tìm được ở giữa, tìm từ trái qua phải
    if (consecutive.length === 0) {
      for (let col = 0; col < row.length - count + 1; col++) {
        consecutive = [];
        for (let i = 0; i < count; i++) {
          if (isSeatAvailable(rowIndex, col + i)) {
            consecutive.push({
              rowName,
              seatNumber: (col + i + 1).toString(),
              seatType: row[col + i] === 2 ? 'premium' : 'standard',
              extraCharge: row[col + i] === 2 ? 15000 : 0,
              seatId: getSeatId(rowName, (col + i + 1).toString())
            });
          } else {
            consecutive = [];
            break;
          }
        }
        if (consecutive.length === count) break;
      }
    }
    
    result.push(...consecutive);
  };
  
  // Lấy ID của ghế từ dữ liệu gốc
  const getSeatId = (rowName, seatNumber) => {
    const originalSeat = localSeats.originalData?.find(
      seat => seat.RowName === rowName && seat.SeatNumber === seatNumber
    );
    return originalSeat ? originalSeat.ID : null;
  };
  
  // Kiểm tra ghế có khả dụng không (không phải 0 và không phải 3)
  const isSeatAvailable = (row, col) => {
    return localSeats.matrix[row][col] === 1 || localSeats.matrix[row][col] === 2;
  };
  
  // Kiểm tra ghế đã được đặt chưa
  const isSeatReserved = (row, col) => {
    if (!localSeats.matrix || !localSeats.rowNames) return false;
    
    const rowName = localSeats.rowNames[row];
    const seatNumber = (col + 1).toString();
    return localReservedSeats.includes(`${rowName}-${seatNumber}`) || localSeats.matrix[row][col] === 3;
  };
  
  // Kiểm tra ghế có phải ghế gợi ý 
  const isSuggestedSeat = (rowName, seatNumber) => {
    if (!suggestedSeats || !suggestedSeats.suggestedSeats) return false;
    
    return suggestedSeats.suggestedSeats.some(
      seat => seat.rowName === rowName && seat.seatNumber === seatNumber
    );
  };
  
  // Xác định CSS class cho ghế
  const getSeatClass = (row, col) => {
    if (!localSeats.matrix || !localSeats.rowNames || 
        row >= localSeats.matrix.length || 
        col >= localSeats.matrix[row].length) {
      return 'invisible';
    }
    
    const seatValue = localSeats.matrix[row][col];
    const rowName = localSeats.rowNames[row];
    const seatNumber = (col + 1).toString();
    
    if (seatValue === 0) return 'invisible'; // Không có ghế
    
    let classes = 'seat flex items-center justify-center text-xs w-9 h-9 rounded-md cursor-pointer transition-all';
    
    // Ghế đã đặt
    if (isSeatReserved(row, col)) {
      return `${classes} bg-gray-600 text-gray-400 cursor-not-allowed`;
    }
    
    // Ghế đã chọn
    if (isSeatSelected(rowName, seatNumber)) {
      return `${classes} bg-primary-dark text-white`;
    }
    
    // Ghế gợi ý
    if (showSuggestion && isSuggestedSeat(rowName, seatNumber)) {
      return `${classes} bg-blue-600/70 text-white`;
    }
    
    // Ghế premium/VIP
    if (seatValue === 2) {
      return `${classes} bg-yellow-600/80 hover:bg-yellow-500 text-white`;
    }
    
    // Ghế thường
    return `${classes} bg-blue-700/80 hover:bg-blue-600 text-white`;
  };

  // Xử lý khi người dùng chọn ghế
  const handleSeatClick = (rowIndex, colIndex) => {
    if (!localSeats.matrix || !localSeats.rowNames) return;
    
    // Debug info
    console.log("Clicking seat:", rowIndex, colIndex);
    console.log("Matrix value:", localSeats.matrix[rowIndex][colIndex]);
    
    const rowName = localSeats.rowNames[rowIndex];
    const seatNumber = (colIndex + 1).toString();
    const seatValue = localSeats.matrix[rowIndex][colIndex];
    
    if (colIndex < localSeats.matrix[rowIndex].length && 
        seatValue !== 0 && 
        !isSeatReserved(rowIndex, colIndex)) {
      
      const seatType = seatValue === 2 ? 'premium' : 'standard';
      const extraCharge = seatValue === 2 ? 15000 : 0;
      
      // Tìm ID của ghế trong dữ liệu gốc
      const seatId = getSeatId(rowName, seatNumber);
      
      selectSeat(rowName, seatNumber, seatId, seatType, extraCharge);
    }
  };

  // Debug info
  console.log("BookingSeats Render:", {
    hasSeats: localSeats.matrix && localSeats.matrix.length > 0,
    rowsCount: localSeats.matrix?.length,
    seatsMatrix: localSeats.matrix,
    rowNames: localSeats.rowNames,
    selectedSeats: selectedSeats
  });

  if (loading) {
    return (
      <Card className="mb-6 border-gray-800 bg-background">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span>Chọn ghế</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary-dark mb-4" />
            <p className="text-gray-300 animate-pulse">Đang tải thông tin ghế...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Nếu không có dữ liệu, hiển thị thông báo
  if (!localSeats.matrix || !localSeats.rowNames || localSeats.matrix.length === 0) {
    return (
      <Card className="mb-6 border-gray-800 bg-background">
        <CardHeader>
          <CardTitle>Chọn ghế</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6">
            <Info className="h-5 w-5 text-yellow-500 mr-2" />
            Không có dữ liệu ghế. Vui lòng chọn phòng chiếu khác.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-gray-800 bg-background">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <span>Chọn ghế</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border-gray-800">
                <p className="max-w-xs">Chọn ghế mong muốn để đặt vé. Ghế Premium có thêm phụ phí.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        {showSuggestion && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={selectSuggestedSeats}
            className="bg-blue-900/30 border-blue-700/50 hover:bg-blue-800/50 hover:border-blue-600 text-blue-400"
          >
            Chọn ghế gợi ý
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-2xl">
            {/* Màn hình với hiệu ứng */}
            <div className={`screen relative w-4/5 mx-auto mb-12 transition-all duration-1000 ${screenAnimation ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-full h-2 bg-primary-dark/70 rounded-t-full"></div>
              <div className="w-full h-6 bg-gradient-to-b from-primary-dark/70 to-transparent rounded-b-full"></div>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">Màn hình</span>
            </div>
            
            {/* Chú thích */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-sm bg-blue-700/80"></div>
                <span className="text-xs">Ghế thường</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-sm bg-yellow-600/80"></div>
                <span className="text-xs">Ghế Premium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-sm bg-primary-dark"></div>
                <span className="text-xs">Ghế đã chọn</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-sm bg-gray-600"></div>
                <span className="text-xs">Ghế đã đặt</span>
              </div>
              {showSuggestion && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-sm bg-blue-600/70"></div>
                  <span className="text-xs">Ghế gợi ý</span>
                </div>
              )}
            </div>
            
            {/* Ma trận ghế */}
            <div className="flex flex-col items-center bg-gray-800/20 p-6 rounded-lg">
              {localSeats.matrix.map((row, rowIndex) => (
                <div 
                  key={`row-${rowIndex}`} 
                  className="flex justify-center space-x-2 mb-2"
                  style={{
                    animation: `fadeIn 0.3s ease forwards ${0.05 * rowIndex}s`,
                    opacity: 0
                  }}
                >
                  <div className="w-6 flex items-center justify-center font-medium text-primary-dark">
                    {localSeats.rowNames[rowIndex]}
                  </div>
                  {Array.from({ length: localSeats.maxCol }).map((_, colIndex) => (
                    <button
                      key={`seat-${rowIndex}-${colIndex}`}
                      className={getSeatClass(rowIndex, colIndex)}
                      disabled={
                        colIndex >= row.length || 
                        row[colIndex] === 0 || 
                        row[colIndex] === 3 || 
                        isSeatReserved(rowIndex, colIndex)
                      }
                      onClick={() => handleSeatClick(rowIndex, colIndex)}
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
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Info className="h-4 w-4 mr-2 text-primary-dark" />
            Ghế đã chọn:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.length === 0 ? (
              <span className="text-sm text-gray-500">Chưa chọn ghế nào</span>
            ) : (
              selectedSeats.map((seat, index) => (
                <Badge 
                  key={`selected-${index}`}
                  variant={seat.seatType === 'premium' || seat.seatType === 'vip' ? 'secondary' : 'outline'}
                  className={`${seat.seatType === 'premium' || seat.seatType === 'vip' ? 'bg-yellow-600 hover:bg-yellow-500' : 'hover:bg-primary-dark/20'} transition-all duration-300 animate-fadeIn`}
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
  );
}