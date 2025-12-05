import { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import { formatDateForInput } from '../../utils/helpers';
import '../../styles/admin/AdminPage.css';

// Helper function to transform movie data for display
const transformMovieForDisplay = (movie) => ({
  id: movie.id,
  title: movie.title,
  genre: movie.genre || 'Chưa có',
  duration: `${movie.duration || 0} phút`,
  rating: movie.rating || 0,
  status: movie.status === 'now_showing' ? 'showing' : 'upcoming',
  releaseDate: movie.release_date ? movie.release_date.split('T')[0] : 'Chưa có'
});

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showShowtimesModal, setShowShowtimesModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    poster_url: '',
    duration: '',
    rating: '',
    genre: '',
    description: '',
    country: '',
    subtitle: '',
    trailer_url: '',
    release_date: '',
    status: 'upcoming',
    director: ''
  });

  // Fetch movies from API
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.movies.getAll();
      const transformedMovies = data.map(transformMovieForDisplay);
      setMovies(transformedMovies);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err.message || 'Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { 
      key: 'title', 
      label: 'Tên phim',
      render: (value, row) => (
        <div className="movie-cell">
          <strong>{value}</strong>
          <span className="movie-genre">{row.genre}</span>
        </div>
      )
    },
    { key: 'duration', label: 'Thời lượng', width: '120px' },
    { 
      key: 'rating', 
      label: 'Độ tuổi',
      width: '100px',
      render: (value) => (
        <span className="rating">{value || 'N/A'}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      width: '120px',
      render: (value) => (
        <span className={`status-badge status-${value}`}>
          {value === 'showing' ? 'Đang chiếu' : 'Sắp chiếu'}
        </span>
      )
    },
    { key: 'releaseDate', label: 'Ngày phát hành', width: '140px' },
  ];

  const handleEdit = async (movie) => {
    try {
      setError(null);
      const movieData = await adminAPI.movies.getById(movie.id);
      // Map status từ database về form
      let formStatus = movieData.status;
      if (movieData.status === 'coming_soon') {
        formStatus = 'upcoming';
      }
      // 'ended' và 'now_showing' giữ nguyên
      setFormData({
        title: movieData.title || '',
        slug: movieData.slug || '',
        poster_url: movieData.poster_url || '',
        duration: movieData.duration || '',
        rating: movieData.rating || '',
        genre: movieData.genre || '',
        description: movieData.description || '',
        country: movieData.country || '',
        subtitle: movieData.subtitle || '',
        trailer_url: movieData.trailer_url || '',
        release_date: movieData.release_date ? formatDateForInput(movieData.release_date) : '',
        status: formStatus || 'upcoming',
        director: movieData.director || ''
      });
      setEditingMovie(movie);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching movie:', err);
      setError(err.message || 'Không thể tải thông tin phim');
    }
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      slug: '',
      poster_url: '',
      duration: '',
      rating: '',
      genre: '',
      description: '',
      country: '',
      subtitle: '',
      trailer_url: '',
      release_date: '',
      status: 'upcoming',
      director: ''
    });
    setEditingMovie(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setError(null);
      // Map status từ form về database
      let statusToSave = formData.status;
      if (formData.status === 'upcoming') {
        statusToSave = 'coming_soon';
      }
      // 'now_showing' và 'ended' giữ nguyên
      
      // Convert empty strings to null for optional fields
      const toNull = (value) => (value === '' || value === undefined) ? null : value;
      
      const dataToSave = {
        title: formData.title,
        slug: formData.slug || null,
        poster_url: toNull(formData.poster_url),
        duration: toNull(formData.duration),
        rating: toNull(formData.rating),
        genre: toNull(formData.genre),
        description: toNull(formData.description),
        country: toNull(formData.country),
        subtitle: toNull(formData.subtitle),
        trailer_url: toNull(formData.trailer_url),
        release_date: toNull(formData.release_date),
        status: statusToSave,
        director: toNull(formData.director) // Ensure director is sent even if empty
      };
      
      console.log('Data to save:', JSON.stringify(dataToSave, null, 2)); // Debug log
      console.log('Director value:', dataToSave.director);
      console.log('Director type:', typeof dataToSave.director);
      
      if (editingMovie) {
        await adminAPI.movies.update(editingMovie.id, dataToSave);
      } else {
        await adminAPI.movies.create(dataToSave);
      }
      setShowModal(false);
      await fetchMovies(); // Reload movies
    } catch (err) {
      console.error('Error saving movie:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu phim');
    }
  };

  const handleDelete = async (movie) => {
    if (window.confirm(`Bạn có chắc muốn xóa phim "${movie.title}"?`)) {
      try {
        setError(null);
        await adminAPI.movies.delete(movie.id);
        setMovies(movies.filter(m => m.id !== movie.id));
      } catch (err) {
        console.error('Error deleting movie:', err);
        setError(err.message || 'Không thể xóa phim. Vui lòng thử lại.');
      }
    }
  };

  const handleView = async (movie) => {
    try {
      setLoadingShowtimes(true);
      setError(null);
      setSelectedMovie(movie);
      const data = await adminAPI.showtimes.getAll(movie.id, null);
      setShowtimes(data);
      setShowShowtimesModal(true);
    } catch (err) {
      console.error('Error fetching showtimes:', err);
      setError(err.message || 'Không thể tải danh sách suất chiếu');
    } finally {
      setLoadingShowtimes(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Loading message="Đang tải danh sách phim..." />
        </div>
      </div>
    );
  }

  if (error && movies.length === 0) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Error message={error} onRetry={fetchMovies} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Quản lý phim</h1>
          <p className="page-subtitle">Quản lý phim trong hệ thống</p>
        </div>
        <button className="primary-btn" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> Thêm phim mới
        </button>
      </div>

      <div className="page-content">
        {error && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '20px', 
            background: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#dc2626', 
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
        )}
        <DataTable
          title="Danh sách phim"
          columns={columns}
          data={movies}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
        />
      </div>

      {/* Movie Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMovie ? 'Sửa phim' : 'Thêm phim mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên phim *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="form-input"
                  placeholder="auto-generate"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thời lượng (phút) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Độ tuổi</label>
                  <input
                    type="text"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    className="form-input"
                    placeholder="C13, P, 18+, T16, T18"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Thể loại</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  className="form-input"
                  placeholder="Hành động, Phiêu lưu"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>URL Poster</label>
                <input
                  type="url"
                  value={formData.poster_url}
                  onChange={(e) => setFormData({...formData, poster_url: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>URL Trailer</label>
                <input
                  type="url"
                  value={formData.trailer_url}
                  onChange={(e) => setFormData({...formData, trailer_url: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quốc gia</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phụ đề</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="form-input"
                    placeholder="Vietsub, Engsub, etc."
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày phát hành</label>
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({...formData, release_date: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Đạo diễn</label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => setFormData({...formData, director: e.target.value})}
                    className="form-input"
                    placeholder="Tên đạo diễn"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="form-input"
                >
                  <option value="upcoming">Sắp chiếu</option>
                  <option value="now_showing">Đang chiếu</option>
                  <option value="ended">Đã kết thúc</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className="primary-btn" onClick={handleSave}>
                {editingMovie ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Showtimes Modal */}
      {showShowtimesModal && selectedMovie && (
        <div className="modal-overlay" onClick={() => setShowShowtimesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '80vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>Suất chiếu - {selectedMovie.title}</h2>
              <button className="modal-close" onClick={() => setShowShowtimesModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {loadingShowtimes ? (
                <Loading message="Đang tải suất chiếu..." />
              ) : showtimes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                  <p>Chưa có suất chiếu nào cho phim này</p>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Rạp</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Phòng</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Thời gian bắt đầu</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Thời gian kết thúc</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Giá vé</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showtimes.map((showtime) => (
                        <tr key={showtime.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>{showtime.cinema_name || 'Chưa có'}</td>
                          <td style={{ padding: '12px' }}>{showtime.room_name || 'Chưa có'}</td>
                          <td style={{ padding: '12px' }}>
                            {showtime.start_time ? new Date(showtime.start_time).toLocaleString('vi-VN') : 'Chưa có'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {showtime.end_time ? new Date(showtime.end_time).toLocaleString('vi-VN') : 'Chưa có'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {showtime.price ? `${parseInt(showtime.price).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '4px', fontSize: '14px', color: '#666' }}>
                    <strong>Tổng số suất chiếu:</strong> {showtimes.length}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowShowtimesModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;

