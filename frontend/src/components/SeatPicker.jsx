import React, { useEffect, useState } from 'react';
import { publicAPI } from '../services/api';

function SeatPicker({ showtime, selectedSeats, onChangeSelected, onBack, hideBackButton = false, maxSeats = 0, lockedSeats = [] }) {
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [roomLayout, setRoomLayout] = useState(null); // Không dùng DEFAULT_LAYOUT nữa
  const [loadingLayout, setLoadingLayout] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null); // Thông tin phòng (name, id) để dùng cho CSS

  // Fetch room layout from API based on room_id
  useEffect(() => {
    const fetchLayout = async () => {
      console.log('🔍 SeatPicker - showtime:', showtime);
      console.log('🔍 SeatPicker - room_id:', showtime?.room_id);
      
      if (!showtime?.room_id) {
        console.error('❌ No room_id in showtime! Cannot load layout.');
        setRoomLayout(null);
        return;
      }

      setLoadingLayout(true);
      try {
        // Lấy thông tin phòng (name, id) để dùng cho CSS
        try {
          const roomData = await publicAPI.rooms.getById(showtime.room_id);
          if (roomData && roomData.id) {
            setRoomInfo({
              id: roomData.id,
              name: roomData.name || `Phòng ${roomData.id}`,
              cinema_id: roomData.cinema_id
            });
          } else {
            // Fallback: dùng room_id từ showtime
            setRoomInfo({
              id: showtime.room_id,
              name: `Phòng ${showtime.room_id}`,
              cinema_id: null
            });
          }
        } catch (roomError) {
          console.warn('⚠️ Could not fetch room info, using fallback:', roomError);
          // Fallback: dùng room_id từ showtime
          setRoomInfo({
            id: showtime.room_id,
            name: `Phòng ${showtime.room_id}`,
            cinema_id: null
          });
        }

        // Lấy layout
        console.log('📡 Fetching layout for room:', showtime.room_id);
        const layoutResponse = await publicAPI.rooms.getLayout(showtime.room_id);
        console.log('📥 Layout response:', layoutResponse);
        
        // Handle response format (could be {success: true, data: {...}} or direct data)
        const layoutData = layoutResponse.success ? layoutResponse.data : layoutResponse;
        
        if (layoutData && layoutData.rowLetters) {
          console.log('✅ Layout loaded successfully from DB:', layoutData);
          console.log('📊 Layout details:', {
            rowLetters: layoutData.rowLetters,
            totalRows: layoutData.rowLetters?.length,
            seatsPerRow: layoutData.seatsPerRow,
            middleSeats: layoutData.middleSeats,
            rowsWithMiddleSeats: layoutData.rowsWithMiddleSeats
          });
          setRoomLayout(layoutData);
        } else {
          console.error('❌ Layout API failed:', layoutResponse);
          setRoomLayout(null);
        }
      } catch (e) {
        console.error('❌ Error fetching room layout:', e);
        setRoomLayout(null);
      } finally {
        setLoadingLayout(false);
      }
    };

    if (showtime) {
      fetchLayout();
    }
  }, [showtime?.id, showtime?.room_id]); // Trigger when showtime changes

  // Fetch booked seats
  useEffect(() => {
    const fetchSeats = async () => {
      if (!showtime) return;
      setLoadingSeats(true);
      try {
        const data = await publicAPI.bookings.getSeats(showtime.id);
        setBookedSeats(data);
      } catch (e) {
        console.error('Error fetching booked seats:', e);
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchSeats();
  }, [showtime]);

  // Get room name for display
  const getRoomName = () => {
    // Use roomInfo if available (from API)
    if (roomInfo && roomInfo.name) {
      return roomInfo.name.toUpperCase();
    }
    // Fallback to showtime room info
    if (!showtime) return 'PHÒNG 01';
    if (showtime.room_name) {
      return showtime.room_name.toUpperCase();
    }
    if (showtime.room) {
      return `PHÒNG ${showtime.room}`.toUpperCase();
    }
    if (showtime.room_id) {
      return `PHÒNG ${showtime.room_id}`.toUpperCase();
    }
    return 'PHÒNG 01';
  };

  const isBooked = (rowLetter, seatNum) => {
    return bookedSeats.some((s) => {
      // seat_row is always INT (1, 2, 3...) from database
      // Convert index (1,2,3...) to letter (A,B,C...)
      const seatRowIndex = typeof s.seat_row === 'number' 
        ? s.seat_row 
        : parseInt(s.seat_row) || 0;
      
      // Validate index is within range
      if (seatRowIndex < 1 || seatRowIndex > roomLayout.rowLetters.length) {
        return false;
      }
      
      // Convert index to letter
      const seatRowLetter = roomLayout.rowLetters[seatRowIndex - 1];
      
      return seatRowLetter === rowLetter && s.seat_col === seatNum;
    });
  };

  const isLocked = (rowLetter, seatNum) => {
    return lockedSeats.some((lock) => {
      const lockRow = typeof lock.seat_row === 'string' 
        ? lock.seat_row.toUpperCase() 
        : roomLayout.rowLetters[lock.seat_row - 1];
      return lockRow === rowLetter && lock.seat_col === seatNum;
    });
  };

  const isSelected = (rowLetter, seatNum) => {
    return selectedSeats.some((s) => {
      const row = typeof s.row === 'string' 
        ? s.row.toUpperCase() 
        : roomLayout.rowLetters[s.row - 1];
      return row === rowLetter && s.col === seatNum;
    });
  };

  const toggleSeat = (rowLetter, seatNum) => {
    if (isBooked(rowLetter, seatNum)) return;
    if (isLocked(rowLetter, seatNum)) {
      // Không cho phép chọn ghế đang bị lock bởi người khác
      return;
    }
    
    if (isSelected(rowLetter, seatNum)) {
      // Deselect seat
      onChangeSelected(selectedSeats.filter((s) => {
        const row = typeof s.row === 'string' 
          ? s.row.toUpperCase() 
          : roomLayout.rowLetters[s.row - 1];
        return !(row === rowLetter && s.col === seatNum);
      }));
    } else {
      // Try to select seat - parent will validate
      onChangeSelected([...selectedSeats, { row: rowLetter, col: seatNum }]);
    }
  };

  // Check if seat is in the middle section (marked with red border)
  const isMiddleSeat = (rowLetter, seatNum) => {
    const middleSeats = roomLayout.middleSeats || {};
    return middleSeats[rowLetter] && middleSeats[rowLetter].includes(seatNum);
  };

  // Check if row has middle seats
  const hasMiddleSeats = (rowLetter) => {
    const rowsWithMiddle = roomLayout.rowsWithMiddleSeats || [];
    return rowsWithMiddle.includes(rowLetter);
  };

  // Tính toán thông tin layout
  const totalRows = roomLayout?.rowLetters?.length || 0;
  const totalSeats = roomLayout ? Object.values(roomLayout.seatsPerRow || {}).reduce((a, b) => a + b, 0) : 0;

  // Tạo class name dựa trên room_id và room name để CSS riêng cho từng phòng
  const getRoomClassName = () => {
    if (!roomInfo) return '';
    const roomId = roomInfo.id;
    const roomName = roomInfo.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Chuyển ký tự đặc biệt thành dấu gạch ngang
      .replace(/\s+/g, '-') // Chuyển khoảng trắng thành dấu gạch ngang
      .replace(/-+/g, '-') // Loại bỏ nhiều dấu gạch ngang liên tiếp
      .replace(/^-|-$/g, ''); // Loại bỏ dấu gạch ngang ở đầu và cuối
    
    return `room-${roomId} room-${roomName}`;
  };

  // Nếu chưa có layout, hiển thị loading hoặc error
  if (!roomLayout) {
    return (
      <div className={`seat-picker-container ${getRoomClassName()}`.trim()}>
        <div className="seat-picker-header">
          <h2 className="seat-picker-title">CHỌN GHẾ - {getRoomName()}</h2>
        </div>
        {loadingLayout ? (
          <div className="loading">Đang tải sơ đồ ghế từ database...</div>
        ) : (
          <div className="error" style={{ padding: '20px', color: '#ff4444', textAlign: 'center' }}>
            <p>❌ Không thể tải layout phòng chiếu</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              {!showtime?.room_id 
                ? 'Showtime không có room_id' 
                : 'Lỗi khi tải layout từ database'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`seat-picker-container ${getRoomClassName()}`.trim()}>
      <div className="seat-picker-header">
        <h2 className="seat-picker-title">CHỌN GHẾ - {getRoomName()}</h2>
      </div>
      {(loadingSeats || loadingLayout) && <div className="loading">Đang tải sơ đồ ghế...</div>}

      <div className="cinema-screen">
        <svg viewBox="0 0 900 80" preserveAspectRatio="none">
          <path
            d="M 0 80 Q 450 -100 900 80"
            stroke="#fff"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      <div className="seats-grid-container">
        <div className="middle-seats-overlay"></div>
        {roomLayout?.rowLetters?.map((rowLetter) => {
          const numSeats = roomLayout?.seatsPerRow?.[rowLetter] || 12;
          const rowHasMiddle = hasMiddleSeats(rowLetter);
          return (
            <div key={rowLetter} className={`seats-row-wrapper ${rowHasMiddle ? 'has-middle-seats' : ''}`}>
              <div className="row-label">{rowLetter}</div>
              <div style={{ 
                display: 'flex', 
                flex: 1,
                paddingLeft: `${((roomLayout.rowOffsets || {})[rowLetter] || 0) * 65}px`
              }}>
                <div className="seats-row">
                  {Array.from({ length: numSeats }).map((_, idx) => {
                  // Seat numbers from right to left (A12 on right, A01 on left)
                  // Reverse the order so higher numbers appear on right
                  const seatNum = numSeats - idx;
                  const seatId = `${rowLetter}${String(seatNum).padStart(2, '0')}`;
                  const booked = isBooked(rowLetter, seatNum);
                  const selected = isSelected(rowLetter, seatNum);
                  const locked = isLocked(rowLetter, seatNum);
                  const isMiddle = isMiddleSeat(rowLetter, seatNum);
                  
                  return (
                    <button
                      key={seatId}
                      className={[
                        'seat',
                        booked ? 'seat-booked' : '',
                        selected ? 'seat-selected' : '',
                        locked ? 'seat-locked' : '',
                        isMiddle ? 'seat-middle' : ''
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => toggleSeat(rowLetter, seatNum)}
                      disabled={booked || locked}
                      title={locked ? 'Ghế đang được người khác chọn' : ''}
                    >
                      {seatId}
                    </button>
                  );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <span className="seat-legend-sample seat-regular"></span>
          <span className="legend-text">Ghế Thường</span>
        </div>
        <div className="legend-item">
          <span className="seat-legend-sample seat-double"></span>
          <span className="legend-text">Ghế Đôi (2 Người)</span>
        </div>
        <div className="legend-item">
          <span className="seat-legend-sample seat-selected"></span>
          <span className="legend-text">Ghế chọn</span>
        </div>
        <div className="legend-item">
          <span className="seat-legend-sample seat-locked"></span>
          <span className="legend-text">Ghế đang được chọn</span>
        </div>
        <div className="legend-item">
          <span className="seat-legend-sample seat-booked"></span>
          <span className="legend-text">Ghế đã đặt</span>
        </div>
      </div>
    </div>
  );
}

export default SeatPicker;


