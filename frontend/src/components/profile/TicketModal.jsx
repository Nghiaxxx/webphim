import React from 'react';

const TicketModal = ({ isOpen, ticket, onClose }) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div className="ticket-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="ticket-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="ticket-modal-header">
          <div className="ticket-modal-label">TÊN PHIM</div>
          <div className="ticket-modal-movie-name">{ticket.movieName}</div>
        </div>

        <div className="ticket-modal-body">
          <div className="ticket-info-section">
            {/* Mã đặt vé và Thời gian nằm ngang nhau */}
            <div className="ticket-info-row-two">
              <div className="ticket-info-item">
                <span className="ticket-info-label">Mã đặt vé</span>
                <span className="ticket-info-value">{ticket.bookingId}</span>
              </div>
              <div className="ticket-info-item">
                <span className="ticket-info-label">Thời gian</span>
                <span className="ticket-info-value">{ticket.time}</span>
              </div>
            </div>

            {/* Phòng chiếu, Số vé, Loại vé nằm ngang nhau */}
            <div className="ticket-info-row-three">
              <div className="ticket-info-item">
                <span className="ticket-info-label">Phòng chiếu</span>
                <span className="ticket-info-value">{ticket.screenRoom}</span>
              </div>
              <div className="ticket-info-item">
                <span className="ticket-info-label">Số vé</span>
                <span className="ticket-info-value">{ticket.numberOfTickets}</span>
              </div>
              <div className="ticket-info-item">
                <span className="ticket-info-label">Loại vé</span>
                <span className="ticket-info-value">{ticket.ticketType}</span>
              </div>
            </div>

            {/* Số ghế */}
            <div className="ticket-info-vertical">
              <span className="ticket-info-label-yellow">Số ghế</span>
              <span className="ticket-info-value-white">{ticket.seatNumber}</span>
            </div>
          </div>

          {/* Rạp */}
          <div className="ticket-cinema-section">
            <div className="ticket-info-vertical">
              <span className="ticket-info-label-yellow">Rạp</span>
              <div className="ticket-cinema-info-vertical">
                <span className="ticket-info-value-white">{ticket.cinema}</span>
                <span className="ticket-address-white">{ticket.address}</span>
              </div>
            </div>
          </div>

          <div className="ticket-total-section">
            <div className="ticket-total-label">TỔNG TIỀN</div>
            <div className="ticket-total-amount">{ticket.total} VNĐ</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;

