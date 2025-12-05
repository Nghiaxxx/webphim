import { useState, useEffect } from 'react';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import '../../styles/admin/AdminRooms.css';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomLayout, setRoomLayout] = useState(null);
  const [loadingLayout, setLoadingLayout] = useState(false);
  const [layoutError, setLayoutError] = useState(null);
  const [showShowtimesModal, setShowShowtimesModal] = useState(false);
  const [roomShowtimes, setRoomShowtimes] = useState([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    cinema_id: '',
    screen_type: '',
    layout_config: JSON.stringify({
      rowLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      seatsPerRow: {
        'A': 12, 'B': 12, 'C': 12, 'D': 12,
        'E': 15, 'F': 15, 'G': 15, 'H': 15
      }
    }, null, 2)
  });

  useEffect(() => {
    fetchRooms();
    fetchCinemas();
  }, []);

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      room.name?.toLowerCase().includes(search) ||
      room.id?.toString().includes(search) ||
      cinemas.find(c => c.id === room.cinema_id)?.name?.toLowerCase().includes(search)
    );
  });

  const fetchCinemas = async () => {
    try {
      const data = await adminAPI.cinemas.getAll();
      setCinemas(data);
    } catch (err) {
      console.error('Error fetching cinemas:', err);
    }
  };

  const fetchRooms = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = search ? { search } : {};
      const data = await adminAPI.rooms.getAll(params);
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.message || 'Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const loadRoomLayout = async (roomId) => {
    try {
      setLoadingLayout(true);
      setLayoutError(null);
      const result = await adminAPI.rooms.getLayout(roomId);
      
      // Handle API response format: { success: true, data: layout } or { success: false, message: '...' }
      if (result.success === false) {
        throw new Error(result.message || 'Không thể tải layout phòng');
      }
      
      const layout = result.success ? result.data : result;
      
      if (!layout) {
        throw new Error('Layout không tồn tại');
      }
      
      setRoomLayout(layout);
      setSelectedRoom(roomId);
    } catch (err) {
      console.error('Error fetching room layout:', err);
      const room = rooms.find(r => r.id === roomId);
      const roomName = room?.name || `Phòng ${roomId}`;
      const movieTitles = room?.current_showtimes?.map(st => st.movie_title).join(', ') || 'Không có';
      const errorMsg = `Không thể tải layout phòng "${roomName}".\n\nPhim đang chiếu: ${movieTitles}\n\nVui lòng kiểm tra:\n- Layout config trong database\n- Format JSON của layout_config\n- Phòng có tồn tại không`;
      setLayoutError(errorMsg);
    } finally {
      setLoadingLayout(false);
    }
  };

  const renderSeatLayout = (layout) => {
    if (!layout) return null;

    const { rowLetters, seatsPerRow, middleSeats, rowsWithMiddleSeats } = layout;

    return (
      <div className="admin-room-layout">
        <div className="admin-cinema-screen">
          <div className="admin-screen-label">MÀN HÌNH</div>
        </div>
        <div className="admin-seats-container">
          {rowLetters && rowLetters.map((rowLetter) => {
            const numSeats = seatsPerRow && seatsPerRow[rowLetter] ? seatsPerRow[rowLetter] : 0;
            const rowHasMiddle = rowsWithMiddleSeats && rowsWithMiddleSeats.includes(rowLetter);
            const isMiddleSeat = (seatNum) => {
              return middleSeats && middleSeats[rowLetter] && middleSeats[rowLetter].includes(seatNum);
            };

            return (
              <div key={rowLetter} className={`admin-seat-row ${rowHasMiddle ? 'has-middle' : ''}`}>
                <span className="admin-row-label">{rowLetter}</span>
                <div className="admin-seats-row">
                  {Array.from({ length: numSeats }).map((_, idx) => {
                    const seatNum = numSeats - idx;
                    const isMiddle = isMiddleSeat(seatNum);
                    return (
                      <div
                        key={`${rowLetter}-${seatNum}`}
                        className={`admin-seat ${isMiddle ? 'admin-seat-vip' : ''}`}
                        title={`${rowLetter}${String(seatNum).padStart(2, '0')}`}
                      >
                        {String(seatNum).padStart(2, '0')}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="admin-layout-stats">
          <div className="admin-stat-item">
            <strong>Tổng số hàng:</strong> {rowLetters ? rowLetters.length : 0}
          </div>
          <div className="admin-stat-item">
            <strong>Tổng số ghế:</strong>{' '}
            {seatsPerRow ? Object.values(seatsPerRow).reduce((sum, count) => sum + count, 0) : 0}
          </div>
          <div className="admin-stat-item">
            <strong>Hàng có ghế VIP:</strong>{' '}
            {rowsWithMiddleSeats ? rowsWithMiddleSeats.length : 0}
          </div>
        </div>
      </div>
    );
  };

  const closeLayoutModal = () => {
    setSelectedRoom(null);
    setRoomLayout(null);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      cinema_id: '',
      screen_type: '',
      layout_config: JSON.stringify({
        rowLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        seatsPerRow: {
          'A': 12, 'B': 12, 'C': 12, 'D': 12,
          'E': 15, 'F': 15, 'G': 15, 'H': 15
        }
      }, null, 2)
    });
    setEditingRoom(null);
    setShowFormModal(true);
  };

  const handleEdit = async (room) => {
    try {
      setError(null);
      const roomData = await adminAPI.rooms.getById(room.id);
      setFormData({
        name: roomData.name || '',
        cinema_id: roomData.cinema_id || '',
        screen_type: roomData.screen_type || '',
        layout_config: roomData.layout_config 
          ? JSON.stringify(roomData.layout_config, null, 2)
          : JSON.stringify({
              rowLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              seatsPerRow: {
                'A': 12, 'B': 12, 'C': 12, 'D': 12,
                'E': 15, 'F': 15, 'G': 15, 'H': 15
              }
            }, null, 2)
      });
      setEditingRoom(room);
      setShowFormModal(true);
    } catch (err) {
      console.error('Error fetching room:', err);
      setError(err.message || 'Không thể tải thông tin phòng');
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.cinema_id) {
      setError('Vui lòng điền tên phòng và chọn rạp');
      return;
    }

    // Validate JSON layout_config
    let layoutConfig;
    try {
      layoutConfig = JSON.parse(formData.layout_config);
      if (!layoutConfig.rowLetters || !layoutConfig.seatsPerRow) {
        throw new Error('Layout config phải có rowLetters và seatsPerRow');
      }
    } catch (err) {
      setError('Layout config không hợp lệ. Vui lòng kiểm tra định dạng JSON');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const dataToSave = {
        name: formData.name.trim(),
        cinema_id: parseInt(formData.cinema_id),
        screen_type: formData.screen_type.trim() || null,
        layout_config: layoutConfig
      };

      if (editingRoom) {
        await adminAPI.rooms.update(editingRoom.id, dataToSave);
      } else {
        await adminAPI.rooms.create(dataToSave);
      }
      
      setShowFormModal(false);
      await fetchRooms(); // Reload rooms
    } catch (err) {
      console.error('Error saving room:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu phòng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Loading message="Đang tải danh sách phòng..." />
        </div>
      </div>
    );
  }

  if (error && rooms.length === 0) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Error message={error} onRetry={fetchRooms} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Quản lý phòng</h1>
          <p className="page-subtitle">Quản lý và xem layout các phòng chiếu</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="table-search" style={{ margin: 0 }}>
            <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
            <input
              type="text"
              placeholder="Tìm kiếm phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ width: '250px' }}
            />
          </div>
          <button className="primary-btn" onClick={handleAdd}>
            <i className="fa-solid fa-plus"></i> Thêm phòng mới
          </button>
        </div>
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
        {filteredRooms.length === 0 ? (
          <div className="admin-no-rooms">
            <p>{searchTerm ? 'Không tìm thấy phòng nào phù hợp.' : 'Chưa có phòng nào trong hệ thống.'}</p>
          </div>
        ) : (
          <div className="admin-rooms-grid">
            {filteredRooms.map((room) => (
              <div key={room.id} className="admin-room-card">
                <div className="admin-room-card-header">
                  <h3>{room.name || `Phòng ${room.id}`}</h3>
                  {room.cinema_id && (
                    <span className="admin-room-cinema">Rạp ID: {room.cinema_id}</span>
                  )}
                </div>
                <div className="admin-room-card-body">
                  <div className="admin-room-info">
                    <span className="admin-room-id">ID: {room.id}</span>
                    {room.created_at && (
                      <span className="admin-room-date">
                        Tạo: {new Date(room.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                  {room.current_showtimes && room.current_showtimes.length > 0 && (
                    <div className="admin-room-showtimes">
                      <div className="admin-showtimes-label">Phim đang chiếu:</div>
                      <div className="admin-showtimes-list">
                        {room.current_showtimes.map((showtime, idx) => (
                          <div key={showtime.id || idx} className="admin-showtime-item">
                            <span className="admin-movie-title">{showtime.movie_title}</span>
                            <span className="admin-showtime-time">
                              {new Date(showtime.start_time).toLocaleTimeString('vi-VN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!room.current_showtimes || room.current_showtimes.length === 0) && (
                    <div className="admin-room-no-showtimes">
                      <span className="admin-no-showtimes-text">Không có suất chiếu hôm nay</span>
                    </div>
                  )}
                </div>
                <div className="admin-room-card-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="secondary-btn"
                    onClick={() => handleEdit(room)}
                  >
                    <i className="fa-solid fa-edit"></i> Sửa
                  </button>
                  <button
                    className="primary-btn"
                    onClick={() => loadRoomLayout(room.id)}
                    disabled={loadingLayout}
                  >
                    <i className="fa-solid fa-eye"></i> Xem Layout
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={async () => {
                      try {
                        setLoadingShowtimes(true);
                        setError(null);
                        const data = await adminAPI.showtimes.getAll(null, room.id);
                        setRoomShowtimes(data);
                        setSelectedRoom(room.id);
                        setShowShowtimesModal(true);
                      } catch (err) {
                        console.error('Error fetching showtimes:', err);
                        setError(err.message || 'Không thể tải danh sách suất chiếu');
                      } finally {
                        setLoadingShowtimes(false);
                      }
                    }}
                    disabled={loadingShowtimes}
                  >
                    <i className="fa-solid fa-calendar"></i> Suất chiếu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedRoom && (() => {
          const room = rooms.find(r => r.id === selectedRoom);
          const roomName = room?.name || `Phòng ${selectedRoom}`;
          const currentShowtimes = room?.current_showtimes || [];
          
          return (
            <div className="admin-room-layout-modal" onClick={closeLayoutModal}>
              <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <div className="admin-modal-header-content">
                    <h2>
                      CHỌN GHẾ - {roomName}
                    </h2>
                    {currentShowtimes.length > 0 && (
                      <div className="admin-modal-movies">
                        <span className="admin-modal-movies-label">Phim đang chiếu:</span>
                        <div className="admin-modal-movies-list">
                          {currentShowtimes.map((showtime, idx) => (
                            <span key={showtime.id || idx} className="admin-modal-movie-item">
                              {showtime.movie_title}
                              <span className="admin-modal-movie-time">
                                ({new Date(showtime.start_time).toLocaleTimeString('vi-VN', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="admin-modal-close" onClick={closeLayoutModal}>
                    ✕
                  </button>
                </div>
              <div className="admin-modal-body">
                {layoutError && (
                  <div style={{ 
                    padding: '12px', 
                    marginBottom: '20px', 
                    background: '#fee2e2', 
                    color: '#dc2626', 
                    borderRadius: '8px',
                    whiteSpace: 'pre-line'
                  }}>
                    {layoutError}
                    <button 
                      onClick={() => setLayoutError(null)}
                      style={{ 
                        float: 'right',
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
                {loadingLayout ? (
                  <div className="admin-loading-layout">
                    <p>Đang tải layout...</p>
                  </div>
                ) : roomLayout ? (
                  renderSeatLayout(roomLayout)
                ) : (
                  <div className="admin-no-layout">
                    <p>Không có layout cho phòng này.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })()}

        {/* Showtimes Modal */}
        {showShowtimesModal && selectedRoom && (() => {
          const room = rooms.find(r => r.id === selectedRoom);
          const roomName = room?.name || `Phòng ${selectedRoom}`;
          
          return (
            <div className="modal-overlay" onClick={() => setShowShowtimesModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '80vh', overflow: 'auto' }}>
                <div className="modal-header">
                  <h2>Suất chiếu - {roomName}</h2>
                  <button className="modal-close" onClick={() => setShowShowtimesModal(false)}>
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  {loadingShowtimes ? (
                    <Loading message="Đang tải suất chiếu..." />
                  ) : roomShowtimes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                      <p>Chưa có suất chiếu nào cho phòng này</p>
                    </div>
                  ) : (
                    <div style={{ marginTop: '16px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Phim</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Rạp</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Thời gian bắt đầu</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Thời gian kết thúc</th>
                            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Giá vé</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomShowtimes.map((showtime) => (
                            <tr key={showtime.id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {showtime.movie_poster && (
                                    <img 
                                      src={showtime.movie_poster} 
                                      alt={showtime.movie_title}
                                      style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                  )}
                                  <span>{showtime.movie_title || 'Chưa có'}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px' }}>{showtime.cinema_name || 'Chưa có'}</td>
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
                        <strong>Tổng số suất chiếu:</strong> {roomShowtimes.length}
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
          );
        })()}

        {/* Room Form Modal */}
        {showFormModal && (
          <div className="modal-overlay" onClick={() => !saving && setShowFormModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
              <div className="modal-header">
                <h2>{editingRoom ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu mới'}</h2>
                <button 
                  className="modal-close" 
                  onClick={() => !saving && setShowFormModal(false)}
                  disabled={saving}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên phòng *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input"
                    placeholder="VD: Phòng 1, Phòng VIP"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Rạp phim *</label>
                  <select
                    value={formData.cinema_id}
                    onChange={(e) => setFormData({...formData, cinema_id: e.target.value})}
                    className="form-input"
                    required
                    disabled={saving}
                  >
                    <option value="">-- Chọn rạp --</option>
                    {cinemas.map(cinema => (
                      <option key={cinema.id} value={cinema.id}>
                        {cinema.name} - {cinema.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Loại màn hình</label>
                  <select
                    value={formData.screen_type}
                    onChange={(e) => setFormData({...formData, screen_type: e.target.value})}
                    className="form-input"
                    disabled={saving}
                  >
                    <option value="">-- Chọn loại --</option>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                    <option value="ScreenX">ScreenX</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Layout Config (JSON) *</label>
                  <textarea
                    value={formData.layout_config}
                    onChange={(e) => setFormData({...formData, layout_config: e.target.value})}
                    className="form-textarea"
                    rows="15"
                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    placeholder='{"rowLetters": ["A", "B", "C"], "seatsPerRow": {"A": 12, "B": 12, "C": 12}}'
                    required
                    disabled={saving}
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    <strong>Format:</strong> JSON object với <code>rowLetters</code> (array) và <code>seatsPerRow</code> (object).
                    <br />
                    <strong>Ví dụ:</strong> {`{"rowLetters": ["A", "B", "C"], "seatsPerRow": {"A": 12, "B": 12, "C": 15}}`}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="secondary-btn" 
                  onClick={() => setShowFormModal(false)}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button 
                  className="primary-btn" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : editingRoom ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRooms;

