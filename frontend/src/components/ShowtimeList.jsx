import React from 'react';

function formatDateTime(dt) {
  const d = new Date(dt);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });
}

function ShowtimeList({ movie, showtimes, onBack, onSelect }) {
  return (
    <div>
      <button className="btn-link" onClick={onBack}>
        ← Quay lại chọn phim
      </button>
      <h2 className="section-title">Chọn suất chiếu</h2>
      {movie && <p className="section-subtitle">Phim: {movie.title}</p>}

      {!showtimes.length && (
        <div className="empty">
          Hiện chưa có suất chiếu cho phim này.
        </div>
      )}

      <div className="showtimes-grid">
        {showtimes.map((s) => (
          <button
            key={s.id}
            className="showtime-card"
            onClick={() => onSelect(s)}
          >
            <div className="showtime-time">{formatDateTime(s.start_time)}</div>
            <div className="showtime-meta">
              <span>Phòng: {s.room || 'A1'}</span>
              <span>Giá: {Number(s.price).toLocaleString('vi-VN')} đ</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ShowtimeList;


