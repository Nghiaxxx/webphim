import React from 'react';
import { formatTimer, formatCurrencyVND } from '../../utils/helpers';
import { APP_CONFIG } from '../../constants/app';

const BookingFooter = ({ movie, selectedShowtime, cinemaInfo, timerSeconds, ticketQuantities }) => {
  if (!selectedShowtime) return null;

  const calculateTotal = () => {
    const prices = APP_CONFIG.BOOKING.TICKET_PRICES;
    return (
      ticketQuantities.adultSingle * prices.ADULT_SINGLE +
      ticketQuantities.studentSingle * prices.STUDENT_SINGLE +
      ticketQuantities.seniorSingle * prices.SENIOR_SINGLE +
      ticketQuantities.adultDouble * prices.ADULT_DOUBLE
    );
  };

  return (
    <div className="booking-sticky-footer">
      <div className="booking-footer-content">
        <div className="booking-footer-left">
          <div className="booking-movie-title">{movie?.title}</div>
          {cinemaInfo && (
            <div className="booking-cinema-name">{cinemaInfo.name}</div>
          )}
        </div>
        <div className="booking-footer-right">
          <div className="booking-timer-box">
            <div className="booking-timer-label">Thời gian giữ vé:</div>
            <div className="booking-timer-value">{formatTimer(timerSeconds)}</div>
          </div>
          <div className="booking-total-section">
            <span className="booking-total-label">Tạm tính</span>
            <span className="booking-total-amount">{formatCurrencyVND(calculateTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFooter;

