import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

/**
 * Kết hợp các class TailwindCSS một cách an toàn
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Cắt ngắn văn bản với dấu ... ở cuối
 */
export function textTruncate(text = '', length = 100) {
  if (text && text.length > length) {
    return text.substring(0, length) + '...'
  }
  return text
}

/**
 * Định dạng ngày tháng
 */
export function formatDate(date) {
  if (!date) return ''
  
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Định dạng tiền tệ VND
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

/**
 * Lấy tên viết tắt từ tên đầy đủ
 */
export function getInitials(name) {
  if (!name) return 'U'
  
  const names = name.split(' ')
  if (names.length === 1) return names[0].charAt(0)
  
  return names[0].charAt(0) + names[names.length - 1].charAt(0)
}

/**
 * Chuyển đổi số thành mã ghế (A, B, C,...)
 */
export function convertToAlphabet(value) {
  return (value + 10).toString(36).toUpperCase()
}

/**
 * Tạo QR code
 */
export async function generateQR(text) {
  try {
    return await QRCode.toDataURL(text)
  } catch (err) {
    console.error('Error generating QR code:', err)
    return null
  }
}

/**
 * Tạo file PDF vé xem phim
 */
export function generateTicketPDF(movieTitle, cinemaName, date, time, seats, qrCode) {
  const doc = new jsPDF()
  
  // Thiết lập font và style
  doc.setFont('helvetica')
  doc.setFontSize(22)
  
  // Tiêu đề và thông tin chính
  doc.text('CINEMA+', 105, 20, { align: 'center' })
  doc.setFontSize(18)
  doc.text('VÉ XEM PHIM', 105, 30, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text(`Phim: ${movieTitle}`, 20, 50)
  doc.text(`Rạp: ${cinemaName}`, 20, 60)
  doc.text(`Ngày: ${formatDate(date)}`, 20, 70)
  doc.text(`Suất chiếu: ${time}`, 20, 80)
  
  const seatStr = seats.map(seat => `${convertToAlphabet(seat[0])}-${seat[1] + 1}`).join(', ')
  doc.text(`Ghế: ${seatStr}`, 20, 90)
  
  // Thêm QR code nếu có
  if (qrCode) {
    doc.addImage(qrCode, 'JPEG', 65, 100, 80, 80)
  }
  
  // Thêm ghi chú
  doc.setFontSize(10)
  doc.text('Vui lòng đến trước giờ chiếu 15 phút để được phục vụ tốt nhất.', 105, 200, { align: 'center' })
  doc.text('Cinema+ - www.cinema-plus.vn', 105, 210, { align: 'center' })
  
  return doc
}

/**
 * Lọc theo từ khóa tìm kiếm
 */
export function filterByKeyword(items, keyword, fields = ['title', 'name']) {
  if (!keyword || !items || !items.length) return items
  
  const lowercasedKeyword = keyword.toLowerCase()
  
  return items.filter(item => {
    return fields.some(field => {
      if (!item[field]) return false
      return item[field].toLowerCase().includes(lowercasedKeyword)
    })
  })
}

/**
 * Lấy dữ liệu phim mẫu
 */
export const getSampleMovieImages = () => {
  return {
    'eternals': 'https://phantom-marca.unidadeditorial.es/927e619e34b67b9e7326c9266914e6f0/crop/68x0/1311x700/resize/1320/f/jpg/assets/multimedia/imagenes/2021/08/20/16294695683527.jpg',
    'spider man-no way home': 'https://images.indianexpress.com/2021/11/spider-man-no-way-home-new-poster-1200.jpg',
    'avengers-infinity war': 'https://pyxis.nymag.com/v1/imgs/8b3/ac6/ca28ec3072fdc00a5b59a72a75a39ab61b-20-avengers-lede.rsquare.w700.jpg',
    'doctor strange-multiverse of madness': 'https://m.media-amazon.com/images/I/818x-d2qUuL.jpg',
    'wakanda forever': 'https://thumbor.forbes.com/thumbor/fit-in/1200x0/filters%3Aformat%28jpg%29/https%3A%2F%2Fblogs-images.forbes.com%2Fscottmendelson%2Ffiles%2F2017%2F10%2FDMQuyI5V4AAUHP0.jpg'
  }
}

/**
 * Lấy hình ảnh phim dựa vào tiêu đề
 */
export function getMovieImage(movie) {
  if (!movie) return null
  
  const images = getSampleMovieImages()
  
  // Nếu phim có hình ảnh thực tế, trả về hình đó
  if (movie.image && !movie.image.includes('undefined')) {
    return movie.image
  }
  
  // Nếu không có hình ảnh, tìm trong danh sách hình mẫu
  for (const key in images) {
    if (movie.title.toLowerCase().includes(key)) {
      return images[key]
    }
  }
  
  // Nếu không tìm thấy, trả về hình ảnh mặc định
  return '/images/login.jpg'
}