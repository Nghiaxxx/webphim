import React from 'react';
import { APP_CONFIG } from '../../constants/app';
import { formatCurrencyVND } from '../../utils/helpers';

const TicketSelection = ({ ticketQuantities, onQuantityChange }) => {
  const { TICKET_PRICES } = APP_CONFIG.BOOKING;

  const updateQuantity = (type, delta) => {
    onQuantityChange(type, delta);
  };

  return (
    <div className="ticket-selection-section">
      <h2 className="ticket-selection-title">CHỌN LOẠI VÉ</h2>
      <div className="ticket-types-grid">
        {/* Người lớn đơn */}
        <div className="ticket-type-card">
          <div className="ticket-type-header">
            <h3 className="ticket-type-name">NGƯỜI LỚN</h3>
            <span className="ticket-type-subtitle">ĐƠN</span>
          </div>
          <div className="ticket-type-price">{formatCurrencyVND(TICKET_PRICES.ADULT_SINGLE)}</div>
          <div className="ticket-quantity-selector">
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity('adultSingle', -1)}
              disabled={ticketQuantities.adultSingle === 0}
            >
              -
            </button>
            <span className="quantity-value">{ticketQuantities.adultSingle}</span>
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity('adultSingle', 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* HSSV-U22-GV đơn */}
        <div className="ticket-type-card">
          <div className="ticket-type-header">
            <h3 className="ticket-type-name">HSSV-U22-GV</h3>
            <span className="ticket-type-subtitle">ĐƠN</span>
          </div>
          <div className="ticket-type-price">{formatCurrencyVND(TICKET_PRICES.STUDENT_SINGLE)}</div>
          <div className="ticket-quantity-selector">
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity('studentSingle', -1)}
              disabled={ticketQuantities.studentSingle === 0}
            >
              -
            </button>
            <span className="quantity-value">{ticketQuantities.studentSingle}</span>
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity('studentSingle', 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Người cao tuổi đơn */}
        <div className="ticket-type-card">
          <div className="ticket-type-header">
            <h3 className="ticket-type-name">NGƯỜI CAO TUỔI</h3>
            <span className="ticket-type-subtitle">ĐƠN</span>
          </div>
          <div className="ticket-type-price">{formatCurrencyVND(TICKET_PRICES.SENIOR_SINGLE)}</div>
          <div className="ticket-quantity-selector">
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity('seniorSingle', -1)}
              disabled={ticketQuantities.seniorSingle === 0}
            >
              -
            </button>
            <span className="quantity-value">{ticketQuantities.seniorSingle}</span>
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity('seniorSingle', 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Người lớn đôi */}
        <div className="ticket-type-card">
          <div className="ticket-type-header">
            <h3 className="ticket-type-name">NGƯỜI LỚN</h3>
            <span className="ticket-type-subtitle">ĐÔI</span>
          </div>
          <div className="ticket-type-price">{formatCurrencyVND(TICKET_PRICES.ADULT_DOUBLE)}</div>
          <div className="ticket-quantity-selector">
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity('adultDouble', -1)}
              disabled={ticketQuantities.adultDouble === 0}
            >
              -
            </button>
            <span className="quantity-value">{ticketQuantities.adultDouble}</span>
            <button 
              className="quantity-btn"
              onClick={() => updateQuantity('adultDouble', 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSelection;

