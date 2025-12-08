import React, { useState, useEffect } from 'react';
import { formatTimer, formatCurrencyVND } from '../../utils/helpers';
import { APP_CONFIG } from '../../constants/app';
import { publicAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BookingFooter = ({ 
  movie, 
  selectedShowtime, 
  cinemaInfo, 
  timerSeconds, 
  ticketQuantities, 
  productQuantities = {},
  selectedSeats = [],
  onBookTickets,
  isBooking = false
}) => {
  const [products, setProducts] = useState([]);

  // Fetch all products to get prices
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [combosData, drinksData, bottledData, snacksData, pocasData] = await Promise.all([
          publicAPI.products.getAll('combo'),
          publicAPI.products.getAll('drink'),
          publicAPI.products.getAll('bottled_drink'),
          publicAPI.products.getAll('snack'),
          publicAPI.products.getAll('poca')
        ]);

        const allProducts = [
          ...(Array.isArray(combosData) ? combosData : []),
          ...(Array.isArray(drinksData) ? drinksData : []),
          ...(Array.isArray(bottledData) ? bottledData : []),
          ...(Array.isArray(snacksData) ? snacksData : []),
          ...(Array.isArray(pocasData) ? pocasData : [])
        ];
        setProducts(allProducts);
      } catch (error) {
        console.error('Lỗi khi tải thông tin sản phẩm:', error);
      }
    };

    fetchProducts();
  }, []);

  if (!selectedShowtime) return null;

  const calculateTicketTotal = () => {
    const prices = APP_CONFIG.BOOKING.TICKET_PRICES;
    return (
      ticketQuantities.adultSingle * prices.ADULT_SINGLE +
      ticketQuantities.studentSingle * prices.STUDENT_SINGLE +
      ticketQuantities.seniorSingle * prices.SENIOR_SINGLE +
      ticketQuantities.adultDouble * prices.ADULT_DOUBLE
    );
  };

  const calculateProductTotal = () => {
    return products.reduce((total, product) => {
      const quantity = productQuantities[product.id] || 0;
      return total + (product.price * quantity);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateTicketTotal() + calculateProductTotal();
  };

  const getTicketSummary = () => {
    const parts = [];
    if (ticketQuantities.adultSingle > 0) {
      parts.push(`${ticketQuantities.adultSingle} Người Lớn`);
    }
    if (ticketQuantities.studentSingle > 0) {
      parts.push(`${ticketQuantities.studentSingle} HSSV-U22-GV`);
    }
    if (ticketQuantities.seniorSingle > 0) {
      parts.push(`${ticketQuantities.seniorSingle} Người Cao Tuổi`);
    }
    if (ticketQuantities.adultDouble > 0) {
      parts.push(`${ticketQuantities.adultDouble} Đôi`);
    }
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const getProductSummary = () => {
    const selectedProducts = products
      .filter(product => productQuantities[product.id] > 0)
      .map(product => ({
        name: product.name,
        quantity: productQuantities[product.id]
      }));

    if (selectedProducts.length === 0) {
      return null;
    }

    return selectedProducts
      .map(product => `${product.quantity} ${product.name}`)
      .join(', ');
  };

  const ticketSummary = getTicketSummary();
  const productSummary = getProductSummary();

  const handleBookClick = () => {
    if (onBookTickets) {
      onBookTickets();
    }
  };

  // Check if booking is enabled (must have seats selected and tickets)
  const canBook = selectedSeats.length > 0 && calculateTotal() > 0;

  return (
    <div className="booking-sticky-footer">
      <div className="booking-footer-content">
        <div className="booking-footer-left">
          <div className="booking-movie-title">{movie?.title}</div>
          <div className="booking-cinema-name">
            {cinemaInfo && `${cinemaInfo.name}`}
            {ticketSummary && (
              <>
                {cinemaInfo ? ' | ' : ''}
                {ticketSummary}
              </>
            )}
            {productSummary && (
              <>
                {(cinemaInfo || ticketSummary) ? ', ' : ''}
                {productSummary}
              </>
            )}
          </div>
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
          <button 
            className="booking-book-button"
            onClick={handleBookClick}
            disabled={!canBook || isBooking || timerSeconds === 0}
          >
            {isBooking ? 'ĐANG XỬ LÝ...' : 'ĐẶT VÉ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFooter;

