import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import '../../styles/admin/AdminRooms.css';

const AdminRooms = () => {
  const navigate = useNavigate();
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
  const [cinemas, setCinemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState(null); // Rạp được chọn
  const [viewMode, setViewMode] = useState('cinemas'); // 'cinemas' hoặc 'rooms'

  useEffect(() => {
    fetchCinemas();
    // Load tất cả rooms để đếm số phòng cho mỗi rạp
    fetchRooms();
  }, []);

  useEffect(() => {
    // Khi chọn rạp, load lại phòng của rạp đó
    if (selectedCinemaId) {
      fetchRooms(selectedCinemaId);
    }
  }, [selectedCinemaId]);

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

  // Filter cinemas based on search term
  const filteredCinemas = cinemas.filter(cinema => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      cinema.name?.toLowerCase().includes(search) ||
      cinema.city?.toLowerCase().includes(search) ||
      cinema.address?.toLowerCase().includes(search)
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

  const fetchRooms = async (cinemaId = null, search = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (cinemaId) params.cinema_id = cinemaId;
      if (search) params.search = search;
      const data = await adminAPI.rooms.getAll(params);
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.message || 'Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  // Khi chọn rạp, load phòng của rạp đó
  const handleCinemaSelect = async (cinemaId) => {
    setSelectedCinemaId(cinemaId);
    setViewMode('rooms');
    await fetchRooms(cinemaId);
  };

  // Quay lại danh sách rạp
  const handleBackToCinemas = () => {
    setSelectedCinemaId(null);
    setViewMode('cinemas');
    setRooms([]);
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

            const rowOffset = (layout.rowOffsets || {})[rowLetter] || 0;
            return (
              <div key={rowLetter} className={`admin-seat-row ${rowHasMiddle ? 'has-middle' : ''}`}>
                <span className="admin-row-label">{rowLetter}</span>
                <div className="admin-seats-row">
                  {/* Hiển thị khoảng trống ở đầu hàng nếu có rowOffsets */}
                  {Array.from({ length: rowOffset }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="admin-seat-empty" style={{ visibility: 'hidden' }}></div>
                  ))}
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
    // Navigate to new room form page
    if (selectedCinemaId) {
      navigate(`/admin/rooms/new?cinema_id=${selectedCinemaId}`);
    } else {
      navigate('/admin/rooms/new');
    }
  };

  const handleEdit = (room) => {
    // Navigate to edit room form page
    navigate(`/admin/rooms/edit/${room.id}`);
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
              placeholder={viewMode === 'cinemas' ? 'Tìm kiếm rạp...' : 'Tìm kiếm phòng...'}
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

        {/* Hiển thị nút quay lại nếu đang xem phòng của một rạp */}
        {viewMode === 'rooms' && selectedCinemaId && (
          <div style={{ marginBottom: '20px' }}>
            <button 
              className="secondary-btn"
              onClick={handleBackToCinemas}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Quay lại danh sách rạp
            </button>
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--admin-bg-card)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              <strong>Rạp đang xem:</strong> {cinemas.find(c => c.id === selectedCinemaId)?.name || `Rạp ID: ${selectedCinemaId}`}
            </div>
          </div>
        )}

        {/* Hiển thị danh sách rạp phim */}
        {viewMode === 'cinemas' && (
          <>
            {filteredCinemas.length === 0 ? (
              <div className="admin-no-rooms">
                <p>{searchTerm ? 'Không tìm thấy rạp nào phù hợp.' : 'Chưa có rạp nào trong hệ thống.'}</p>
              </div>
            ) : (
              <div className="admin-rooms-grid">
                {filteredCinemas.map((cinema) => {
                  // Đếm số phòng của rạp này
                  const cinemaRooms = rooms.filter(r => r.cinema_id === cinema.id);
                  return (
                    <div key={cinema.id} className="admin-room-card" style={{ cursor: 'pointer' }} onClick={() => handleCinemaSelect(cinema.id)}>
                      <div className="admin-room-card-header">
                        <h3>{cinema.name}</h3>
                        <span className="admin-room-cinema">{cinema.city || 'Chưa có thành phố'}</span>
                      </div>
                      <div className="admin-room-card-body">
                        <div className="admin-room-info">
                          <span className="admin-room-id">Địa chỉ: {cinema.address || 'Chưa có địa chỉ'}</span>
                          {cinema.phone_number && (
                            <span className="admin-room-date">Điện thoại: {cinema.phone_number}</span>
                          )}
                        </div>
                        <div style={{ marginTop: '12px', padding: '8px', background: 'var(--admin-bg-dark)', borderRadius: '6px' }}>
                          <strong style={{ color: 'var(--admin-gold)' }}>Số phòng:</strong> {cinemaRooms.length} phòng
                        </div>
                      </div>
                      <div className="admin-room-card-actions">
                        <button
                          className="primary-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCinemaSelect(cinema.id);
                          }}
                        >
                          <i className="fa-solid fa-door-open"></i> Xem phòng ({cinemaRooms.length})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Hiển thị danh sách phòng của rạp đã chọn */}
        {viewMode === 'rooms' && (
          <>
            {filteredRooms.length === 0 ? (
              <div className="admin-no-rooms">
                <p>{searchTerm ? 'Không tìm thấy phòng nào phù hợp.' : 'Rạp này chưa có phòng nào.'}</p>
                <button className="primary-btn" onClick={handleAdd} style={{ marginTop: '20px' }}>
                  <i className="fa-solid fa-plus"></i> Thêm phòng mới cho rạp này
                </button>
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
                <div className="admin-room-card-actions">
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
          </>
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

      </div>
    </div>
  );
};

export default AdminRooms;

