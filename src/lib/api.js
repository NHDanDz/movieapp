import axios from 'axios'

// Cấu hình Axios instance cho API calls
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
  getAll: () => api.get('/movies'),
  getById: (id) => api.get(`/movies/${id}`),
  getNowShowing: () => api.get('/movies?category=nowShowing'),
  getComingSoon: () => api.get('/movies?category=comingSoon'),
  getSuggested: (username) => api.get(`/movies/usermodeling/${username}`)
}

// API functions for Cinemas
export const cinemaApi = {
  getAll: () => api.get('/cinemas'),
  getById: (id) => api.get(`/cinemas/${id}`),
  getUserModeling: (username) => api.get(`/cinemas/usermodeling/${username}`)
}

// API functions for Showtimes
export const showtimeApi = {
  getAll: () => api.get('/showtimes'),
  getByMovie: (movieId) => api.get(`/showtimes?movieId=${movieId}`)
}

// API functions for Reservations
export const reservationApi = {
  getAll: () => api.get('/reservations'),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  getSuggestedSeats: (username) => api.get(`/reservations/usermodeling/${username}`)
}

// API functions for User
export const userApi = {
  getCurrentUser: () => api.get('/users/me'),
  updateUser: (data) => api.patch('/users/me', data),
  uploadImage: (id, formData) => api.post(`/users/photo/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}