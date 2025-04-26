// server/src/models/movie.js
const { sql, poolPromise } = require('../db/mssql');

class Movie {
  constructor(data) {
    this.id = data.ID;
    this.title = data.Title;
    this.image = data.Image;
    this.language = data.Language;
    this.genre = data.Genre;
    this.director = data.Director;
    this.cast = data.Cast;
    this.description = data.Description;
    this.duration = data.Duration;
    this.releaseDate = data.ReleaseDate;
    this.endDate = data.EndDate;
    this.createdAt = data.CreatedAt;
    this.updatedAt = data.UpdatedAt;
  }

  // Lưu phim vào DB
  async save() {
    try {
      const pool = await poolPromise;
      
      if (this.id) {
        // Update phim
        await pool.request()
          .input('id', sql.Int, this.id)
          .input('title', sql.NVarChar, this.title)
          .input('image', sql.NVarChar, this.image)
          .input('language', sql.NVarChar, this.language)
          .input('genre', sql.NVarChar, this.genre)
          .input('director', sql.NVarChar, this.director)
          .input('cast', sql.NVarChar, this.cast)
          .input('description', sql.NText, this.description)
          .input('duration', sql.Int, this.duration)
          .input('releaseDate', sql.Date, this.releaseDate)
          .input('endDate', sql.Date, this.endDate)
          .query(`
            UPDATE Movies 
            SET Title = @title,
                Image = @image,
                Language = @language,
                Genre = @genre,
                Director = @director,
                Cast = @cast,
                Description = @description,
                Duration = @duration,
                ReleaseDate = @releaseDate,
                EndDate = @endDate,
                UpdatedAt = GETDATE()
            WHERE ID = @id
          `);
      } else {
        // Thêm phim mới
        const result = await pool.request()
          .input('title', sql.NVarChar, this.title)
          .input('image', sql.NVarChar, this.image)
          .input('language', sql.NVarChar, this.language)
          .input('genre', sql.NVarChar, this.genre)
          .input('director', sql.NVarChar, this.director)
          .input('cast', sql.NVarChar, this.cast)
          .input('description', sql.NText, this.description)
          .input('duration', sql.Int, this.duration)
          .input('releaseDate', sql.Date, this.releaseDate)
          .input('endDate', sql.Date, this.endDate)
          .query(`
            INSERT INTO Movies (Title, Image, Language, Genre, Director, Cast, Description, Duration, ReleaseDate, EndDate)
            OUTPUT INSERTED.ID
            VALUES (@title, @image, @language, @genre, @director, @cast, @description, @duration, @releaseDate, @endDate)
          `);
          
        this.id = result.recordset[0].ID;
      }
      
      return this;
    } catch (error) {
      console.error('Error saving movie:', error);
      throw error;
    }
  }

  // Xóa phim
  async remove() {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, this.id)
        .query('DELETE FROM Movies WHERE ID = @id');
      
      return this;
    } catch (error) {
      console.error('Error removing movie:', error);
      throw error;
    }
  }

  // Lấy tất cả suất chiếu của phim
  async getShowtimes() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('movieId', sql.Int, this.id)
        .query(`
          SELECT s.*, r.Name AS RoomName, c.Name AS CinemaName, c.City
          FROM Showtimes s
          JOIN Rooms r ON s.RoomID = r.ID
          JOIN Cinemas c ON r.CinemaID = c.ID
          WHERE s.MovieID = @movieId AND s.EndDate >= GETDATE()
          ORDER BY s.StartDate, s.StartAt
        `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error getting movie showtimes:', error);
      throw error;
    }
  }

  // Static methods
  static async findById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Movies WHERE ID = @id');
      
      if (result.recordset.length === 0) return null;
      
      return new Movie(result.recordset[0]);
    } catch (error) {
      console.error('Error finding movie by ID:', error);
      throw error;
    }
  }

  static async find(criteria = {}) {
    try {
      const pool = await poolPromise;
      let query = 'SELECT * FROM Movies';
      const request = pool.request();
      
      // Nếu có tiêu chí, thêm vào truy vấn
      if (Object.keys(criteria).length > 0) {
        query += ' WHERE ';
        const conditions = [];
        
        Object.keys(criteria).forEach((key, index) => {
          const paramName = `param${index}`;
          
          // Chuyển đổi key từ camelCase sang PascalCase
          const dbKey = key.charAt(0).toUpperCase() + key.slice(1);
          
          conditions.push(`${dbKey} = @${paramName}`);
          request.input(paramName, criteria[key]);
        });
        
        query += conditions.join(' AND ');
      }
      
      const result = await request.query(query);
      
      return result.recordset.map(record => new Movie(record));
    } catch (error) {
      console.error('Error finding movies:', error);
      throw error;
    }
  }

  // Lấy tất cả phim đang chiếu
  static async findNowShowing() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT * FROM Movies 
          WHERE ReleaseDate <= GETDATE() AND EndDate >= GETDATE()
          ORDER BY ReleaseDate DESC
        `);
      
      return result.recordset.map(record => new Movie(record));
    } catch (error) {
      console.error('Error finding now showing movies:', error);
      throw error;
    }
  }

  // Lấy tất cả phim sắp chiếu
  static async findComingSoon() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT * FROM Movies 
          WHERE ReleaseDate > GETDATE()
          ORDER BY ReleaseDate ASC
        `);
      
      return result.recordset.map(record => new Movie(record));
    } catch (error) {
      console.error('Error finding coming soon movies:', error);
      throw error;
    }
  }

  // Tìm phim phổ biến cho user (user modeling)
  static async findSuggestedForUser(username) {
    try {
      const pool = await poolPromise;
      
      // Lấy thông tin thể loại, đạo diễn, diễn viên từ các phim người dùng đã xem
      const userPreferences = await pool.request()
        .input('username', sql.NVarChar, username)
        .query(`
          WITH UserMovies AS (
            SELECT m.*
            FROM Movies m
            JOIN Reservations r ON m.ID = r.MovieID
            JOIN Users u ON r.UserID = u.ID
            WHERE u.Username = @username
          )
          SELECT 
            (SELECT STRING_AGG(Genre, ',') FROM UserMovies) AS Genres,
            (SELECT STRING_AGG(Director, ',') FROM UserMovies) AS Directors,
            (SELECT STRING_AGG(Cast, ',') FROM UserMovies) AS Casts
        `);
      
      if (userPreferences.recordset.length === 0 || !userPreferences.recordset[0].Genres) {
        // Nếu người dùng chưa xem phim nào, trả về phim đang chiếu
        return await this.findNowShowing();
      }
      
      // Phân tích preference
      const genres = userPreferences.recordset[0].Genres.split(',');
      const directors = userPreferences.recordset[0].Directors.split(',');
      const casts = userPreferences.recordset[0].Casts.split(',');
      
      // Tìm phim dựa trên preference
      let query = `
        SELECT m.*, 
          (
            CASE WHEN m.Genre IN (${genres.map((_, i) => `@genre${i}`).join(',')}) THEN 3 ELSE 0 END +
            CASE WHEN m.Director IN (${directors.map((_, i) => `@director${i}`).join(',')}) THEN 2 ELSE 0 END +
            CASE WHEN m.Cast LIKE ANY (${casts.map((_, i) => `'%' + @cast${i} + '%'`).join(',')}) THEN 1 ELSE 0 END
          ) AS MatchScore
        FROM Movies m
        WHERE m.ReleaseDate <= GETDATE() AND m.EndDate >= GETDATE()
          AND m.ID NOT IN (
            SELECT r.MovieID
            FROM Reservations r
            JOIN Users u ON r.UserID = u.ID
            WHERE u.Username = @username
          )
        ORDER BY MatchScore DESC, m.ReleaseDate DESC
      `;
      
      const request = pool.request().input('username', sql.NVarChar, username);
      
      // Thêm tham số cho genres, directors, casts
      genres.forEach((genre, i) => {
        request.input(`genre${i}`, sql.NVarChar, genre.trim());
      });
      
      directors.forEach((director, i) => {
        request.input(`director${i}`, sql.NVarChar, director.trim());
      });
      
      casts.forEach((cast, i) => {
        request.input(`cast${i}`, sql.NVarChar, cast.trim());
      });
      
      const result = await request.query(query);
      
      return result.recordset.map(record => {
        const movie = new Movie(record);
        movie.matchScore = record.MatchScore;
        return movie;
      });
    } catch (error) {
      console.error('Error finding suggested movies for user:', error);
      throw error;
    }
  }
}

module.exports = Movie;