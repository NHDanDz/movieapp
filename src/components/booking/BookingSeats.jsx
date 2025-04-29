"use client"

import { useState, useEffect } from 'react'
import { useBooking } from '@/hooks/useBooking'
import { roomApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

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
  
  // Lấy dữ liệu ghế từ DB khi chọn phòng
  useEffect(() => {
    const fetchRoomSeats = async () => {
      if (!selectedRoom) return;
      
      try {
        setLoading(true);
        
        // Lấy danh sách ghế trong phòng
        const seatsRes = await roomApi.getSeats(selectedRoom);
        
        if (seatsRes.data && seatsRes.data.length > 0) {
          // Tạo mảng các hàng và số cột duy nhất
          const uniqueRows = [...new Set(seatsRes.data.map(seat => seat.RowName))].sort();
          const uniqueCols = [...new Set(seatsRes.data.map(seat => parseInt(seat.SeatNumber)))].sort((a, b) => a - b);
          
          // Tạo mảng 2D với hàng là index của uniqueRows, cột là số thứ tự thực
          const maxCol = Math.max(...uniqueCols);
          const seatsMatrix = Array(uniqueRows.length).fill().map(() => Array(maxCol).fill(0));
          
          // Lưu trữ ánh xạ giữa tên hàng và index trong mảng
          const rowMapping = {};
          uniqueRows.forEach((rowName, index) => {
            rowMapping[rowName] = index;
          });
          
          // Cập nhật ma trận ghế với dữ liệu từ API
          seatsRes.data.forEach(seat => {
            const rowIndex = rowMapping[seat.RowName];
            const colIndex = parseInt(seat.SeatNumber) - 1; // Chuyển về index 0-based
            
            if (rowIndex !== undefined && colIndex >= 0 && colIndex < maxCol) {
              // Gán kiểu ghế: 1 = thường, 2 = premium/vip
              seatsMatrix[rowIndex][colIndex] = 
                seat.SeatType === 'premium' || seat.SeatType === 'vip' ? 2 : 1;
            }
          });
          
          // Lưu trữ thông tin các hàng
          setLocalSeats({
            matrix: seatsMatrix,
            rowNames: uniqueRows,
            maxCol: maxCol,
            originalData: seatsRes.data  // Lưu dữ liệu gốc để sử dụng ID ghế
          });
          
          // Nếu đã chọn showtime, lấy danh sách ghế đã đặt
          if (selectedShowtime) {
            fetchReservedSeats(selectedShowtime);
          }
        } else {
          // Nếu không có dữ liệu ghế, tạo ma trận trống
          setLocalSeats({
            matrix: [],
            rowNames: [],
            maxCol: 0,
            originalData: []
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin ghế:', error);
        setLocalSeats({
          matrix: [],
          rowNames: [],
          maxCol: 0,
          originalData: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomSeats();
  }, [selectedRoom]);
  
  // Lấy ghế đã đặt khi chọn suất chiếu
  useEffect(() => {
    if (selectedShowtime && selectedRoom && localSeats.matrix.length > 0) {
      fetchReservedSeats(selectedShowtime);
    }
  }, [selectedShowtime, selectedRoom, localSeats.matrix.length]);
  
  // Lấy danh sách ghế đã đặt
  const fetchReservedSeats = async (showtimeId) => {
    try {
      const checkData = {
        showtimeId: parseInt(showtimeId),
        seats: [] // Gửi mảng rỗng để lấy tất cả ghế đã đặt
      };
      
      const response = await roomApi.checkSeatsAvailability(selectedRoom, checkData);
      
      if (response.data && response.data.reservedSeats) {
        setLocalReservedSeats(response.data.reservedSeats);
        
        // Cập nhật ma trận ghế để đánh dấu ghế đã đặt
        if (localSeats && localSeats.matrix) {
          const updatedMatrix = [...localSeats.matrix];
          const rowMapping = {};
          
          // Tạo mapping từ tên hàng -> index
          localSeats.rowNames.forEach((rowName, index) => {
            rowMapping[rowName] = index;
          });
          
          response.data.reservedSeats.forEach(reservedSeat => {
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
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ghế đã đặt:', error);
    }
  };
  
  // Hiển thị gợi ý ghế nếu có
  useEffect(() => {
    if (suggestedSeats && suggestedSeats.preferredPosition) {
      setShowSuggestion(true);
    }
  }, [suggestedSeats]);
  
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
  
  // Xác định CSS class cho ghế
  const getSeatClass = (row, col) => {
    if (!localSeats.matrix || !localSeats.rowNames) return 'invisible';
    
    const seatValue = localSeats.matrix[row][col];
    const rowName = localSeats.rowNames[row];
    const seatNumber = (col + 1).toString();
    
    if (seatValue === 0) return 'invisible'; // Không có ghế
    
    let classes = 'flex items-center justify-center text-xs w-8 h-8 rounded-md cursor-pointer transition-all';
    
    // Ghế đã đặt
    if (isSeatReserved(row, col)) {
      return `${classes} bg-gray-500 text-white cursor-not-allowed opacity-50`;
    }
    
    // Ghế đã chọn
    if (isSeatSelected(rowName, seatNumber)) {
      return `${classes} bg-primary text-white`;
    }
    
    // Ghế premium/VIP
    if (seatValue === 2) {
      return `${classes} bg-yellow-200 hover:bg-yellow-300`;
    }
    
    // Ghế thường
    return `${classes} bg-gray-200 hover:bg-gray-300`;
  };

  // Xử lý khi người dùng chọn ghế
  const handleSeatClick = (rowIndex, colIndex) => {
    if (!localSeats.matrix || !localSeats.rowNames) return;
    
    const rowName = localSeats.rowNames[rowIndex];
    const seatNumber = (colIndex + 1).toString();
    const seatValue = localSeats.matrix[rowIndex][colIndex];
    
    if (colIndex < localSeats.matrix[rowIndex].length && seatValue !== 0 && !isSeatReserved(rowIndex, colIndex)) {
      const seatType = seatValue === 2 ? 'premium' : 'standard';
      const extraCharge = seatValue === 2 ? 15000 : 0;
      
      // Tìm ID của ghế trong dữ liệu gốc
      const seatId = getSeatId(rowName, seatNumber);
      
      selectSeat(rowName, seatNumber, seatId, seatType, extraCharge);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chọn ghế</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p>Đang tải thông tin ghế...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Nếu không có dữ liệu, hiển thị thông báo
  if (!localSeats.matrix || !localSeats.rowNames || localSeats.matrix.length === 0) {
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
    );
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
              {localSeats.matrix.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex justify-center space-x-2 mb-2">
                  <div className="w-6 flex items-center justify-center font-medium">
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
  );
}