import React, { useEffect, useState } from 'react';
import { publicAPI } from '../services/api';

function RoomViewer() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await publicAPI.rooms.getAll();
      setRooms(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoomLayout = async (roomId) => {
    try {
      const layoutResponse = await publicAPI.rooms.getLayout(roomId);
      // Handle response format (could be {success: true, data: {...}} or direct data)
      const layoutData = layoutResponse.success ? layoutResponse.data : layoutResponse;
      setSelectedRoom({ id: roomId, layout: layoutData });
    } catch (error) {
      console.error('Lỗi khi tải layout:', error);
    }
  };

  const renderSeatLayout = (layout) => {
    if (!layout) return null;

    const { rowLetters, seatsPerRow, middleSeats, rowsWithMiddleSeats } = layout;

    return (
      <div className="room-layout-preview">
        <div className="cinema-screen-preview">
          <div className="screen-label">MÀN HÌNH</div>
        </div>
        <div className="seats-preview-container">
          {rowLetters.map((rowLetter) => {
            const numSeats = seatsPerRow[rowLetter] || 0;
            const rowHasMiddle = rowsWithMiddleSeats && rowsWithMiddleSeats.includes(rowLetter);
            const isMiddleSeat = (seatNum) => {
              return middleSeats && middleSeats[rowLetter] && middleSeats[rowLetter].includes(seatNum);
            };

            return (
              <div key={rowLetter} className={`seat-row-preview ${rowHasMiddle ? 'has-middle' : ''}`}>
                <span className="row-label-preview">{rowLetter}</span>
                <div className="seats-preview-row">
                  {Array.from({ length: numSeats }).map((_, idx) => {
                    const seatNum = numSeats - idx;
                    const isMiddle = isMiddleSeat(seatNum);
                    return (
                      <div
                        key={`${rowLetter}-${seatNum}`}
                        className={`seat-preview ${isMiddle ? 'seat-middle-preview' : ''}`}
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
        <div className="layout-stats">
          <div className="stat-item">
            <strong>Tổng số hàng:</strong> {rowLetters.length}
          </div>
          <div className="stat-item">
            <strong>Tổng số ghế:</strong>{' '}
            {Object.values(seatsPerRow).reduce((sum, count) => sum + count, 0)}
          </div>
          <div className="stat-item">
            <strong>Hàng có ghế VIP:</strong>{' '}
            {rowsWithMiddleSeats ? rowsWithMiddleSeats.length : 0}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Đang tải danh sách phòng...</div>;
  }

  return (
    <div className="room-viewer-container">
      <h1 className="room-viewer-title">Danh Sách Phòng Chiếu</h1>
      
      <div className="rooms-list">
        {rooms.length === 0 ? (
          <div className="no-rooms">Chưa có phòng nào. Hãy chạy script tạo phòng mẫu.</div>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <h3>{room.name}</h3>
                <span className="room-id">ID: {room.id}</span>
              </div>
              <div className="room-actions">
                <button
                  className="btn-view-layout"
                  onClick={() => loadRoomLayout(room.id)}
                >
                  Xem Layout
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedRoom && (
        <div className="room-layout-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Layout - {rooms.find(r => r.id === selectedRoom.id)?.name}</h2>
              <button
                className="btn-close"
                onClick={() => setSelectedRoom(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {renderSeatLayout(selectedRoom.layout)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomViewer;



