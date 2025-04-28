import axios from 'axios'  // Cấu hình Axios instance cho API calls

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor để thêm token vào mỗi request nếu có
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// API functions for Movies
export const movieApi = {
  getAll: () => api.get('/movies1'),
  getById: (id) => api.get(`/movies1/${id}`),
  getNowShowing: () => api.get('/movies1?category=nowShowing'),
  getComingSoon: () => api.get('/movies1?category=comingSoon'),
  getSuggested: (username) => api.get(`/movies1/usermodeling/${username}`),
  // Thêm các phương thức mới cho quản lý phim
  create: (data) => api.post('/movies1', data),
  update: (id, data) => api.put(`/movies1/${id}`, data),
  delete: (id) => api.delete(`/movies1/${id}`),
  uploadPhoto: (id, formData) => api.post(`/movies1/photo/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// API functions for Cinemas
export const cinemaApi = {
  getAll: () => api.get('/cinemas'),
  getById: (id) => api.get(`/cinemas/${id}`),
  getUserModeling: (username) => api.get(`/cinemas/usermodeling/${username}`),
  // Thêm các phương thức mới cho quản lý rạp
  create: (data) => api.post('/cinemas', data),
  update: (id, data) => api.patch(`/cinemas/${id}`, data),
  delete: (id) => api.delete(`/cinemas/${id}`),
  uploadPhoto: (id, formData) => api.post(`/cinemas/photo/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// API functions for Showtimes
export const showtimeApi = {
  getAll: () => api.get('/showtimes'),
  getByMovie: (movieId) => api.get(`/showtimes?movieId=${movieId}`),
  // Thêm các phương thức mới cho quản lý lịch chiếu
  create: (data) => api.post('/showtimes', data),
  update: (id, data) => api.patch(`/showtimes/${id}`, data),
  delete: (id) => api.delete(`/showtimes/${id}`)
}

// API functions for Reservations
export const reservationApi = {
  getAll: () => api.get('/reservations'),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  getSuggestedSeats: (username) => api.get(`/reservations/usermodeling/${username}`),
  // Thêm các phương thức mới cho quản lý đặt vé
  update: (id, data) => api.patch(`/reservations/${id}`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
  checkIn: (id) => api.get(`/reservations/checkin/${id}`)
}

// API functions for User
export const userApi = {
  getCurrentUser: () => api.get('/users/me'),
  updateUser: (data) => api.patch('/users/me', data),
  uploadImage: (id, formData) => api.post(`/users/photo/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  // Thêm phương thức cho quản lý người dùng
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserById: (id, data) => api.patch(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`)
}
 
// Interceptor để thêm token vào mỗi request nếu có
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
 