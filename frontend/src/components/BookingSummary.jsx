import React from 'react';

function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });
}

function BookingSummary({
  movie,
  showtime,
  seats = [],
  customer,
  compact,
  onConfirm,
  onChangeCustomer,
  onBack
}) {
  const total =
    showtime && seats.length
      ? Number(showtime.price || 0) * seats.length
      : 0;

  if (compact) {
    return (
      <div className="summary-card">
        <h3>Thông tin đặt vé</h3>
        {!movie && <p className="empty">Vui lòng chọn phim, suất chiếu, ghế.</p>}
        {movie && (
          <div className="summary-section">
            <div className="summary-row">
              <span>Phim</span>
              <strong>{movie.title}</strong>
            </div>
            {showtime && (
              <>
                <div className="summary-row">
                  <span>Suất chiếu</span>
                  <strong>{formatDateTime(showtime.start_time)}</strong>
                </div>
                <div className="summary-row">
                  <span>Phòng</span>
                  <strong>{showtime.room || 'A1'}</strong>
                </div>
              </>
            )}
          </div>
        )}

        {seats.length > 0 && (
          <div className="summary-section">
            <div className="summary-row">
              <span>Ghế đã chọn</span>
              <strong>
                {seats
                  .map((s) => `${s.row}${String.fromCharCode(64 + s.col)}`)
                  .join(', ')}
              </strong>
            </div>
            <div className="summary-row">
              <span>Số lượng</span>
              <strong>{seats.length}</strong>
            </div>
          </div>
        )}

        <div className="summary-section">
          <div className="summary-row">
            <span>Họ tên</span>
            <input
              type="text"
              placeholder="Nhập họ tên"
              value={customer?.name || ''}
              onChange={(e) =>
                onChangeCustomer?.({ ...customer, name: e.target.value })
              }
            />
          </div>
          <div className="summary-row">
            <span>Số điện thoại</span>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              value={customer?.phone || ''}
              onChange={(e) =>
                onChangeCustomer?.({ ...customer, phone: e.target.value })
              }
            />
          </div>
        </div>

        <div className="summary-footer">
          <div className="summary-total">
            <span>Tổng tiền</span>
            <strong>{total.toLocaleString('vi-VN')} đ</strong>
          </div>
          <button
            className="btn-primary"
            disabled={!movie || !showtime || !seats.length}
            onClick={onConfirm}
          >
            Xác nhận đặt vé
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {onBack && (
        <button className="btn-link" onClick={onBack}>
          ← Quay lại
        </button>
      )}
      <h2 className="section-title">Tóm tắt đặt vé</h2>
      {!movie && <div className="empty">Vui lòng chọn phim, suất chiếu, ghế.</div>}
      {movie && (
        <div className="summary-card">
          <div className="summary-section">
            <div className="summary-row">
              <span>Phim</span>
              <strong>{movie.title}</strong>
            </div>
            {showtime && (
              <>
                <div className="summary-row">
                  <span>Suất chiếu</span>
                  <strong>{formatDateTime(showtime.start_time)}</strong>
                </div>
                <div className="summary-row">
                  <span>Phòng</span>
                  <strong>{showtime.room || 'A1'}</strong>
                </div>
              </>
            )}
          </div>

          {seats.length > 0 && (
            <div className="summary-section">
              <div className="summary-row">
                <span>Ghế</span>
                <strong>
                  {seats
                    .map((s) => `${s.row}${String.fromCharCode(64 + s.col)}`)
                    .join(', ')}
                </strong>
              </div>
              <div className="summary-row">
                <span>Số lượng</span>
                <strong>{seats.length}</strong>
              </div>
            </div>
          )}

          <div className="summary-section">
            <div className="summary-row">
              <span>Tổng tiền</span>
              <strong>{total.toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingSummary;


