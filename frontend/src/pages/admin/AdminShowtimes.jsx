import { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import '../../styles/admin/AdminPage.css';

// Helper function to transform showtime data for display
const transformShowtimeForDisplay = (showtime) => ({
  id: showtime.id,
  movie: showtime.movie_title || 'Chưa có',
  cinema: showtime.cinema_name || 'Chưa có',
  room: showtime.room_name || 'Chưa có',
  startTime: showtime.start_time ? new Date(showtime.start_time).toLocaleString('vi-VN') : 'Chưa có',
  endTime: showtime.end_time ? new Date(showtime.end_time).toLocaleString('vi-VN') : 'Chưa có',
  price: showtime.price ? `${formatCurrency(showtime.price)} ₫` : '0 ₫',
  status: showtime.status || 'active',
  movieId: showtime.movie_id,
  roomId: showtime.room_id
});

const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [formData, setFormData] = useState({
    movie_id: '',
    cinema_id: '',
    room_id: '',
    start_time: '',
    end_time: '',
    price: '',
    status: 'active'
  });
  const [batchFormData, setBatchFormData] = useState({
    movie_id: '',
    cinema_id: '',
    room_id: '',
    date: '',
    times: '', // Comma-separated or newline-separated times like "7:00,9:00,11:00,13:00,15:00"
    price: '',
    status: 'active'
  });

  // Fetch showtimes from API
  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.showtimes.getAll();
      const transformed = data.map(transformShowtimeForDisplay);
      setShowtimes(transformed);
    } catch (err) {
      console.error('Error fetching showtimes:', err);
      setError(err.message || 'Không thể tải danh sách suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
    fetchMovies();
    fetchCinemas();
  }, []);

  // Fetch movies for dropdown
  const fetchMovies = async () => {
    try {
      const data = await adminAPI.movies.getAll();
      setMovies(data);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  // Fetch cinemas for dropdown
  const fetchCinemas = async () => {
    try {
      const data = await adminAPI.cinemas.getAll();
      setCinemas(data);
    } catch (err) {
      console.error('Error fetching cinemas:', err);
    }
  };

  // Fetch rooms by cinema
  const fetchRoomsByCinema = async (cinemaId) => {
    if (!cinemaId) {
      setRooms([]);
      return;
    }
    try {
      setLoadingRooms(true);
      const data = await adminAPI.rooms.getByCinema(cinemaId);
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.message || 'Không thể tải danh sách phòng');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Calculate end_time from movie duration
  const calculateEndTime = (startTime, movieId) => {
    if (!startTime || !movieId) return '';
    const movie = movies.find(m => m.id === parseInt(movieId));
    if (!movie || !movie.duration) return '';
    
    const start = new Date(startTime);
    const end = new Date(start.getTime() + movie.duration * 60000); // duration in minutes
    return end.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { 
      key: 'movie', 
      label: 'Phim',
      render: (value, row) => (
        <div className="movie-cell">
          <strong>{value}</strong>
        </div>
      )
    },
    { key: 'cinema', label: 'Rạp', width: '150px' },
    { key: 'room', label: 'Phòng', width: '120px' },
    { key: 'startTime', label: 'Thời gian bắt đầu', width: '180px' },
    { key: 'endTime', label: 'Thời gian kết thúc', width: '180px' },
    { 
      key: 'price', 
      label: 'Giá vé',
      width: '120px',
      render: (value) => <strong>{value}</strong>
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      width: '120px',
      render: (value) => (
        <span className={`status-badge status-${value}`}>
          {value === 'active' ? 'Đang hoạt động' : 'Đã hủy'}
        </span>
      )
    },
  ];

  const handleEdit = async (showtime) => {
    try {
      setError(null);
      // Get full showtime data from API
      const allShowtimes = await adminAPI.showtimes.getAll();
      const fullShowtime = allShowtimes.find(s => s.id === showtime.id);
      
      if (!fullShowtime) {
        setError('Không tìm thấy thông tin suất chiếu');
        return;
      }

      // Find cinema_id from room
      let cinemaId = '';
      if (fullShowtime.room_id) {
        const allRooms = await adminAPI.rooms.getAll();
        const room = allRooms.find(r => r.id === fullShowtime.room_id);
        if (room) {
          cinemaId = room.cinema_id.toString();
          await fetchRoomsByCinema(cinemaId);
        }
      }

      // Format datetime for input (datetime-local format: YYYY-MM-DDTHH:mm)
      const formatDateTimeForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        movie_id: fullShowtime.movie_id?.toString() || '',
        cinema_id: cinemaId,
        room_id: fullShowtime.room_id?.toString() || '',
        start_time: formatDateTimeForInput(fullShowtime.start_time),
        end_time: formatDateTimeForInput(fullShowtime.end_time),
        price: fullShowtime.price?.toString() || '',
        status: fullShowtime.status || 'active'
      });
      setEditingShowtime(showtime);
      setShowModal(true);
    } catch (err) {
      console.error('Error loading showtime for edit:', err);
      setError(err.message || 'Không thể tải thông tin suất chiếu');
    }
  };

  const handleDelete = async (showtime) => {
    if (window.confirm(`Bạn có chắc muốn xóa suất chiếu ID "${showtime.id}"?`)) {
      try {
        setError(null);
        await adminAPI.showtimes.delete(showtime.id);
        setShowtimes(showtimes.filter(s => s.id !== showtime.id));
      } catch (err) {
        console.error('Error deleting showtime:', err);
        setError(err.message || 'Không thể xóa suất chiếu. Vui lòng thử lại.');
      }
    }
  };

  const handleView = (showtime) => {
    console.log('View showtime:', showtime);
    // TODO: Implement view logic
  };

  const handleAdd = () => {
    setIsBatchMode(false);
    setFormData({
      movie_id: '',
      cinema_id: '',
      room_id: '',
      start_time: '',
      end_time: '',
      price: '',
      status: 'active'
    });
    setBatchFormData({
      movie_id: '',
      cinema_id: '',
      room_id: '',
      date: '',
      times: '',
      price: '',
      status: 'active'
    });
    setEditingShowtime(null);
    setRooms([]);
    setShowModal(true);
  };

  const handleBatchCinemaChange = async (e) => {
    const cinemaId = e.target.value;
    setBatchFormData({ ...batchFormData, cinema_id: cinemaId, room_id: '' });
    await fetchRoomsByCinema(cinemaId);
  };

  const handleCinemaChange = async (e) => {
    const cinemaId = e.target.value;
    setFormData({ ...formData, cinema_id: cinemaId, room_id: '' });
    await fetchRoomsByCinema(cinemaId);
  };

  const handleMovieChange = (e) => {
    const movieId = e.target.value;
    setFormData({ ...formData, movie_id: movieId });
    
    // Auto-calculate end_time if start_time is set
    if (formData.start_time) {
      const endTime = calculateEndTime(formData.start_time, movieId);
      if (endTime) {
        setFormData(prev => ({ ...prev, movie_id: movieId, end_time: endTime }));
      }
    }
  };

  const handleStartTimeChange = (e) => {
    const startTime = e.target.value;
    setFormData({ ...formData, start_time: startTime });
    
    // Auto-calculate end_time if movie is selected
    if (formData.movie_id) {
      const endTime = calculateEndTime(startTime, formData.movie_id);
      if (endTime) {
        setFormData(prev => ({ ...prev, start_time: startTime, end_time: endTime }));
      }
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      
      // Validation
      if (!formData.movie_id) {
        setError('Vui lòng chọn phim');
        return;
      }
      if (!formData.room_id) {
        setError('Vui lòng chọn phòng chiếu');
        return;
      }
      if (!formData.start_time) {
        setError('Vui lòng nhập thời gian bắt đầu');
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError('Vui lòng nhập giá vé hợp lệ');
        return;
      }

      // Format datetime for API (ISO format)
      const formatDateTimeForAPI = (dateTimeString) => {
        if (!dateTimeString) return null;
        return new Date(dateTimeString).toISOString();
      };

      const dataToSave = {
        movie_id: parseInt(formData.movie_id),
        room_id: parseInt(formData.room_id),
        start_time: formatDateTimeForAPI(formData.start_time),
        end_time: formData.end_time ? formatDateTimeForAPI(formData.end_time) : null,
        price: parseFloat(formData.price),
        status: formData.status
      };

      if (editingShowtime) {
        await adminAPI.showtimes.update(editingShowtime.id, dataToSave);
      } else {
        await adminAPI.showtimes.create(dataToSave);
      }
      
      setShowModal(false);
      await fetchShowtimes();
    } catch (err) {
      console.error('Error saving showtime:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu suất chiếu');
    }
  };

  const handleBatchSave = async () => {
    try {
      setError(null);
      
      // Validation
      if (!batchFormData.movie_id) {
        setError('Vui lòng chọn phim');
        return;
      }
      if (!batchFormData.room_id) {
        setError('Vui lòng chọn phòng chiếu');
        return;
      }
      if (!batchFormData.date) {
        setError('Vui lòng chọn ngày');
        return;
      }
      if (!batchFormData.times || batchFormData.times.trim() === '') {
        setError('Vui lòng nhập danh sách giờ chiếu');
        return;
      }
      if (!batchFormData.price || parseFloat(batchFormData.price) <= 0) {
        setError('Vui lòng nhập giá vé hợp lệ');
        return;
      }

      // Parse times (support both comma-separated and newline-separated)
      const timeStrings = batchFormData.times
        .split(/[,\n]/)
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (timeStrings.length === 0) {
        setError('Vui lòng nhập ít nhất một giờ chiếu');
        return;
      }

      // Get movie duration
      const movie = movies.find(m => m.id === parseInt(batchFormData.movie_id));
      if (!movie) {
        setError('Không tìm thấy thông tin phim');
        return;
      }

      // Create showtimes array
      const showtimes = timeStrings.map(timeStr => {
        // Parse time (support formats: "7:00", "7h", "07:00", "7h00")
        let hours = 0;
        let minutes = 0;
        
        if (timeStr.includes(':')) {
          const [h, m] = timeStr.split(':');
          hours = parseInt(h) || 0;
          minutes = parseInt(m) || 0;
        } else if (timeStr.includes('h')) {
          const parts = timeStr.replace('h', '').split(/\s+/);
          hours = parseInt(parts[0]) || 0;
          if (parts[1]) {
            minutes = parseInt(parts[1]) || 0;
          }
        } else {
          hours = parseInt(timeStr) || 0;
        }

        // Create start_time from date + time
        const date = new Date(batchFormData.date);
        date.setHours(hours, minutes, 0, 0);
        const startTime = date.toISOString();

        // Calculate end_time from movie duration
        let endTime = null;
        if (movie.duration) {
          const end = new Date(date.getTime() + movie.duration * 60000);
          endTime = end.toISOString();
        }

        return {
          movie_id: parseInt(batchFormData.movie_id),
          room_id: parseInt(batchFormData.room_id),
          start_time: startTime,
          end_time: endTime,
          price: parseFloat(batchFormData.price),
          status: batchFormData.status
        };
      });

      const result = await adminAPI.showtimes.createMultiple(showtimes);
      setShowModal(false);
      await fetchShowtimes();
      // Show success message if available
      if (result.message) {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error saving batch showtimes:', err);
      // Try to extract error message from response
      let errorMessage = 'Có lỗi xảy ra khi lưu suất chiếu';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response) {
        try {
          const errorData = await err.response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = 'Lỗi kết nối server. Vui lòng kiểm tra lại.';
        }
      }
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Loading message="Đang tải danh sách suất chiếu..." />
        </div>
      </div>
    );
  }

  if (error && showtimes.length === 0) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Error message={error} onRetry={fetchShowtimes} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Quản lý suất chiếu</h1>
          <p className="page-subtitle">Quản lý suất chiếu trong hệ thống</p>
        </div>
        <button className="primary-btn" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> Thêm suất chiếu mới
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
          title="Danh sách suất chiếu"
          columns={columns}
          data={showtimes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
        />
      </div>

      {/* Showtime Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>
                {editingShowtime ? 'Sửa suất chiếu' : (isBatchMode ? 'Thêm nhiều suất chiếu' : 'Thêm suất chiếu mới')}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            {!editingShowtime && (
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #eee', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsBatchMode(false)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: !isBatchMode ? '#007bff' : '#f0f0f0',
                    color: !isBatchMode ? '#fff' : '#333',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Thêm 1 suất chiếu
                </button>
                <button
                  onClick={() => setIsBatchMode(true)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: isBatchMode ? '#007bff' : '#f0f0f0',
                    color: isBatchMode ? '#fff' : '#333',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Thêm nhiều suất chiếu
                </button>
              </div>
            )}

            <div className="modal-body">
              {isBatchMode && !editingShowtime ? (
                /* Batch Form */
                <>
                  <div className="form-group">
                    <label>Phim *</label>
                    <select
                      value={batchFormData.movie_id}
                      onChange={(e) => setBatchFormData({ ...batchFormData, movie_id: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="">-- Chọn phim --</option>
                      {movies.map(movie => (
                        <option key={movie.id} value={movie.id}>
                          {movie.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Rạp *</label>
                    <select
                      value={batchFormData.cinema_id}
                      onChange={handleBatchCinemaChange}
                      className="form-input"
                      required
                    >
                      <option value="">-- Chọn rạp --</option>
                      {cinemas.map(cinema => (
                        <option key={cinema.id} value={cinema.id}>
                          {cinema.name} {cinema.city ? `- ${cinema.city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Phòng chiếu *</label>
                    <select
                      value={batchFormData.room_id}
                      onChange={(e) => setBatchFormData({ ...batchFormData, room_id: e.target.value })}
                      className="form-input"
                      required
                      disabled={!batchFormData.cinema_id || loadingRooms}
                    >
                      <option value="">-- Chọn phòng --</option>
                      {loadingRooms ? (
                        <option>Đang tải...</option>
                      ) : (
                        rooms.map(room => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ngày chiếu *</label>
                    <input
                      type="date"
                      value={batchFormData.date}
                      onChange={(e) => setBatchFormData({ ...batchFormData, date: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Danh sách giờ chiếu *</label>
                    <textarea
                      value={batchFormData.times}
                      onChange={(e) => setBatchFormData({ ...batchFormData, times: e.target.value })}
                      className="form-textarea"
                      rows="4"
                      placeholder="Nhập các giờ chiếu, mỗi giờ một dòng hoặc cách nhau bởi dấu phẩy&#10;Ví dụ:&#10;7:00&#10;9:00&#10;11:00&#10;13:00&#10;15:00&#10;&#10;Hoặc: 7:00, 9:00, 11:00, 13:00, 15:00"
                      required
                    />
                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      Có thể nhập: 7:00, 9h, 11:30, 13h00, 15:00 (mỗi giờ một dòng hoặc cách nhau bởi dấu phẩy)
                    </small>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Giá vé (VNĐ) *</label>
                      <input
                        type="number"
                        value={batchFormData.price}
                        onChange={(e) => setBatchFormData({ ...batchFormData, price: e.target.value })}
                        className="form-input"
                        placeholder="50000"
                        min="0"
                        step="1000"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select
                        value={batchFormData.status}
                        onChange={(e) => setBatchFormData({ ...batchFormData, status: e.target.value })}
                        className="form-input"
                      >
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Tạm dừng</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* Single Form */
                <>
              <div className="form-group">
                <label>Phim *</label>
                <select
                  value={formData.movie_id}
                  onChange={handleMovieChange}
                  className="form-input"
                  required
                >
                  <option value="">-- Chọn phim --</option>
                  {movies.map(movie => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Rạp *</label>
                <select
                  value={formData.cinema_id}
                  onChange={handleCinemaChange}
                  className="form-input"
                  required
                >
                  <option value="">-- Chọn rạp --</option>
                  {cinemas.map(cinema => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name} {cinema.city ? `- ${cinema.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Phòng chiếu *</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="form-input"
                  required
                  disabled={!formData.cinema_id || loadingRooms}
                >
                  <option value="">-- Chọn phòng --</option>
                  {loadingRooms ? (
                    <option>Đang tải...</option>
                  ) : (
                    rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))
                  )}
                </select>
                {!formData.cinema_id && (
                  <small style={{ color: '#666', fontSize: '12px' }}>Vui lòng chọn rạp trước</small>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={handleStartTimeChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="form-input"
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    (Tự động tính từ thời lượng phim nếu để trống)
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá vé (VNĐ) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-input"
                    placeholder="50000"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className="primary-btn" onClick={isBatchMode && !editingShowtime ? handleBatchSave : handleSave}>
                {editingShowtime ? 'Cập nhật' : (isBatchMode ? 'Thêm nhiều suất chiếu' : 'Thêm mới')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowtimes;

