import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NotificationModal from '../components/common/NotificationModal';
import { publicAPI } from '../services/api';
import { formatTimer, formatCurrencyVND, formatTime, formatReleaseDate } from '../utils/helpers';
import { APP_CONFIG } from '../constants/app';
import { useAuth } from '../contexts/AuthContext';

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    agreeAge: false,
    agreeTerms: false
  });

  // Load booking data from sessionStorage
  useEffect(() => {
    const savedData = sessionStorage.getItem('bookingData');
    if (!savedData) {
      setNotificationMessage('Không tìm thấy thông tin đặt vé. Vui lòng chọn lại.');
      setShowNotification(true);
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    try {
      const data = JSON.parse(savedData);
      setBookingData(data);
      setTimerSeconds(data.timerSeconds || 0);

      // Pre-fill form if user is logged in
      if (user) {
        setFormData(prev => ({
          ...prev,
          fullName: user.full_name || '',
          phone: user.phone || '',
          email: user.email || ''
        }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error parsing booking data:', error);
      setNotificationMessage('Dữ liệu đặt vé không hợp lệ. Vui lòng chọn lại.');
      setShowNotification(true);
      setTimeout(() => navigate('/'), 2000);
    }
  }, [navigate, user]);

  // Fetch products
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

  // Timer countdown
  useEffect(() => {
    if (timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Time expired - redirect back
            setNotificationMessage('ĐÃ HẾT THỜI GIAN GIỮ VÉ');
            setShowNotification(true);
            setTimeout(() => {
              sessionStorage.removeItem('bookingData');
              navigate(-1);
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerSeconds, navigate]);

  // Calculate totals
  const calculateTicketTotal = () => {
    if (!bookingData) return 0;
    const prices = APP_CONFIG.BOOKING.TICKET_PRICES;
    return (
      bookingData.ticketQuantities.adultSingle * prices.ADULT_SINGLE +
      bookingData.ticketQuantities.studentSingle * prices.STUDENT_SINGLE +
      bookingData.ticketQuantities.seniorSingle * prices.SENIOR_SINGLE +
      bookingData.ticketQuantities.adultDouble * prices.ADULT_DOUBLE
    );
  };

  const calculateProductTotal = () => {
    if (!bookingData) return 0;
    return products.reduce((total, product) => {
      const quantity = bookingData.productQuantities[product.id] || 0;
      return total + (product.price * quantity);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateTicketTotal() + calculateProductTotal();
  };

  // Get ticket summary
  const getTicketSummary = () => {
    if (!bookingData) return [];
    const { ticketQuantities } = bookingData;
    const summary = [];
    if (ticketQuantities.adultSingle > 0) {
      summary.push({ type: 'Người Lớn', quantity: ticketQuantities.adultSingle });
    }
    if (ticketQuantities.studentSingle > 0) {
      summary.push({ type: 'HSSV-U22-GV', quantity: ticketQuantities.studentSingle });
    }
    if (ticketQuantities.seniorSingle > 0) {
      summary.push({ type: 'Người Cao Tuổi', quantity: ticketQuantities.seniorSingle });
    }
    if (ticketQuantities.adultDouble > 0) {
      summary.push({ type: 'Đôi', quantity: ticketQuantities.adultDouble });
    }
    return summary;
  };

  // Get product summary
  const getProductSummary = () => {
    if (!bookingData) return [];
    return products
      .filter(product => bookingData.productQuantities[product.id] > 0)
      .map(product => ({
        name: product.name,
        quantity: bookingData.productQuantities[product.id]
      }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      setNotificationMessage('Vui lòng nhập họ và tên');
      setShowNotification(true);
      return;
    }

    if (!formData.phone.trim()) {
      setNotificationMessage('Vui lòng nhập số điện thoại');
      setShowNotification(true);
      return;
    }

    if (!formData.email.trim()) {
      setNotificationMessage('Vui lòng nhập email');
      setShowNotification(true);
      return;
    }

    if (!formData.agreeAge) {
      setNotificationMessage('Vui lòng xác nhận đảm bảo mua vé đúng số tuổi quy định');
      setShowNotification(true);
      return;
    }

    if (!formData.agreeTerms) {
      setNotificationMessage('Vui lòng đồng ý với điều khoản của Cinestar');
      setShowNotification(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare booking data
      const bookingPayload = {
        showtimeId: bookingData.showtimeId,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        seats: bookingData.seats
      };

      // Create booking
      const result = await publicAPI.bookings.create(bookingPayload);

      // Unlock seats
      if (bookingData.sessionId) {
        try {
          await publicAPI.bookings.unlockSeats(
            bookingData.showtimeId,
            bookingData.seats,
            bookingData.sessionId
          );
        } catch (error) {
          console.error('Error unlocking seats:', error);
        }
      }

      // Clear session storage
      sessionStorage.removeItem('bookingData');

      // Show success and redirect
      setNotificationMessage('Đặt vé thành công! Mã đặt vé: ' + (result.bookingId || result.booking_code || 'N/A'));
      setShowNotification(true);

      setTimeout(() => {
        if (user) {
          navigate('/account/account-history/');
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi đặt vé:', error);
      setNotificationMessage(error.message || 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.');
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !bookingData) {
    return (
      <div className="app-root">
        <Header />
        <main style={{ padding: '100px 20px', textAlign: 'center' }}>
          <div>Đang tải...</div>
        </main>
        <Footer />
      </div>
    );
  }

  const ticketSummary = getTicketSummary();
  const productSummary = getProductSummary();
  const showtime = bookingData.showtime;
  const movie = bookingData.movie;
  const cinemaInfo = bookingData.cinemaInfo;

  return (
    <div className="app-root">
      <Header />
      <main className="checkout-main">
        <div className="checkout-container">
          {/* Left Section - Customer Information */}
          <div className="checkout-left">
            <h1 className="checkout-title">TRANG THANH TOÁN</h1>
            
            {/* Progress Steps */}
            <div className="checkout-progress">
              <div className="progress-step active">
                <span>1</span>
                <span>THÔNG TIN KHÁCH HÀNG</span>
              </div>
              <div className="progress-step">
                <span>2</span>
                <span>THANH TOÁN</span>
              </div>
              <div className="progress-step">
                <span>3</span>
                <span>THÔNG TIN VỀ PHIM</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên</label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Nhập email"
                  required
                />
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.agreeAge}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeAge: e.target.checked }))}
                  />
                  <span>Đảm bảo mua vé đúng số tuổi quy định.</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                  />
                  <span>Đồng ý với điều khoản của Cinestar.</span>
                </label>
              </div>

              <button type="submit" className="checkout-continue-btn" disabled={isSubmitting}>
                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC'}
              </button>
            </form>
          </div>

          {/* Right Section - Order Summary */}
          <div className="checkout-right">
            {/* Timer */}
            <div className="checkout-timer">
              <div className="checkout-timer-label">THỜI GIAN GIỮ VÉ:</div>
              <div className="checkout-timer-value">{formatTimer(timerSeconds)}</div>
            </div>

            {/* Movie Info */}
            <div className="checkout-movie-info">
              <h2 className="checkout-movie-title">{movie?.title}</h2>
              <p className="checkout-movie-rating">
                Phim dành cho khán giả từ đủ {movie?.rating?.replace('T', '') || '16'} tuổi trở lên ({movie?.rating || 'T16'}+)
              </p>

              <div className="checkout-cinema-info">
                <p className="cinema-name">{cinemaInfo?.name}</p>
                <p className="cinema-address">{cinemaInfo?.address}</p>
              </div>

              <div className="checkout-showtime">
                <p>Thời gian {formatTime(showtime?.start_time)} {(() => {
                  if (!showtime?.start_time) return '';
                  const date = new Date(showtime.start_time);
                  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
                  const dayName = days[date.getDay()];
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  return `${dayName} ${day}/${month}/${year}`;
                })()}</p>
              </div>

              <div className="checkout-booking-details">
                <p>Phòng chiếu {showtime?.room || showtime?.room_id || 'N/A'}</p>
                <p>Số vé {bookingData.seats.length}</p>
                {ticketSummary.map((ticket, idx) => (
                  <p key={idx}>Loại vé {ticket.type}</p>
                ))}
                <p>Loại ghế Ghế Thường</p>
                <p>Số ghế {bookingData.seats.map(s => `${s.row}${String(s.col).padStart(2, '0')}`).join(', ')}</p>
              </div>

              {productSummary.length > 0 && (
                <div className="checkout-products">
                  <p className="products-title">Bắp nước:</p>
                  {productSummary.map((product, idx) => (
                    <p key={idx}>{product.quantity} {product.name}</p>
                  ))}
                </div>
              )}

              <div className="checkout-total">
                <p className="total-label">SỐ TIỀN CẦN THANH TOÁN</p>
                <p className="total-amount">{formatCurrencyVND(calculateTotal())}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <NotificationModal
        isOpen={showNotification}
        message={notificationMessage}
        onClose={() => setShowNotification(false)}
      />

      <Footer />
    </div>
  );
}

export default Checkout;

