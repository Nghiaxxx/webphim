const db = require('../lib/db');

class Movie {
  // Get all movies with optional filters
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          id, title, slug, poster_url, duration, rating, genre, 
          description, country, subtitle, trailer_url, release_date, status, director
        FROM movies
      `;
      const params = [];

      const conditions = [];
      
      // Support both old format (status as string) and new format (filters object)
      const status = typeof filters === 'string' ? filters : filters.status;
      
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }

      if (typeof filters === 'object' && filters.search) {
        conditions.push('(title LIKE ? OR description LIKE ? OR genre LIKE ? OR director LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY created_at DESC';

      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // Get movie by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM movies WHERE id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Get movie by slug
  static findBySlug(slug) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM movies WHERE slug = ?';
      db.query(sql, [slug], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Create new movie
  static create(movieData) {
    return new Promise((resolve, reject) => {
      const {
        title, slug, poster_url, duration, rating, genre,
        description, country, subtitle, trailer_url, release_date, status, director
      } = movieData;

      console.log('Movie.create - movieData:', JSON.stringify(movieData, null, 2));
      console.log('Movie.create - director extracted:', director);

      // Auto-generate slug if not provided
      const finalSlug = slug || title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const sql = `
        INSERT INTO movies 
        (title, slug, poster_url, duration, rating, genre, description, 
         country, subtitle, trailer_url, release_date, status, director)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Helper function to convert empty string to null
      const toNull = (value) => (value === '' || value === undefined) ? null : value;
      
      const params = [
        title,
        finalSlug,
        toNull(poster_url),
        toNull(duration),
        toNull(rating),
        toNull(genre),
        toNull(description),
        toNull(country),
        toNull(subtitle),
        toNull(trailer_url),
        toNull(release_date),
        status || 'coming_soon', // Map 'upcoming' to 'coming_soon' để khớp với database
        toNull(director) // Convert empty string to null
      ];

      console.log('Movie.create - SQL params:', params);
      console.log('Movie.create - director param:', params[params.length - 1]);

      db.query(sql, params, (err, result) => {
        if (err) {
          console.error('Movie.create - SQL error:', err);
          return reject(err);
        }
        console.log('Movie.create - Success, insertId:', result.insertId);
        resolve({ id: result.insertId, ...movieData, slug: finalSlug });
      });
    });
  }

  // Update movie
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = [
        'title', 'slug', 'poster_url', 'duration', 'rating', 'genre',
        'description', 'country', 'subtitle', 'trailer_url', 'release_date', 'status', 'director'
      ];
      
      // Helper function to convert empty string to null
      const toNull = (value) => (value === '' || value === undefined) ? null : value;
      
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          // Convert empty string to null for all fields
          values.push(toNull(updateData[key]));
        }
      });

      if (fields.length === 0) {
        return resolve(null);
      }

      values.push(id);
      const sql = `UPDATE movies SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Delete movie
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM movies WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = Movie;

