import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import SeatPicker from './SeatPicker';
import Loading from './common/Loading';
import NotificationModal from './common/NotificationModal';
import { publicAPI } from '../services/api';
import { getAvailableDates } from '../utils/helpers';
import { APP_CONFIG } from '../constants/app';
import MovieInfo from './movie/MovieInfo';
import ShowtimeSchedule from './movie/ShowtimeSchedule';
import CinemaList from './movie/CinemaList';
import TicketSelection from './movie/TicketSelection';
import BookingFooter from './movie/BookingFooter';
import PopcornDrinkSelection from './movie/PopcornDrinkSelection';
import { useAuth } from '../contexts/AuthContext';

// Generate unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

function MovieDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [ticketQuantities, setTicketQuantities] = useState({
    adultSingle: 0,
    studentSingle: 0,
    seniorSingle: 0,
    adultDouble: 0
  });
  const [timerSeconds, setTimerSeconds] = useState(0); // Bắt đầu từ 0, chỉ tăng khi chọn ghế
  const [timerActive, setTimerActive] = useState(false); // Flag để biết timer có đang chạy không
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [productQuantities, setProductQuantities] = useState({});
  const [lockedSeats, setLockedSeats] = useState([]); // Ghế đang bị lock bởi người khác
  const [isBooking, setIsBooking] = useState(false);
  const sessionIdRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const lockPollingIntervalRef = useRef(null);
  const isTimerExpiredRef = useRef(false);
  const { user } = useAuth();

  // Generate session ID on mount
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
    }
  }, []);

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await publicAPI.movies.getById(id);
        setMovie(data);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải thông tin phim:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id]);

  // Fetch showtimes
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const data = await publicAPI.showtimes.getAll(id);
        setShowtimes(data);
      } catch (error) {
        console.error('Lỗi khi tải lịch chiếu:', error);
      }
    };

    if (id) {
      fetchShowtimes();
    }
  }, [id]);

  // Fetch cinemas
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await publicAPI.cinemas.getAll();
        setCinemas(data);
        // Set selectedCity mặc định là thành phố đầu tiên nếu có
        if (data.length > 0 && data[0].city && !selectedCity) {
          setSelectedCity(data[0].city);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách rạp:', error);
      }
    };

    fetchCinemas();
  }, []);

  // Get available dates from showtimes
  const availableDates = useMemo(() => {
    return getAvailableDates(showtimes);
  }, [showtimes]);

  // Lock/unlock seats functions - định nghĩa trước để dùng trong useEffect
  const handleUnlockAllSeats = useCallback(async () => {
    if (!selectedShowtime || !sessionIdRef.current || selectedSeats.length === 0) return;

    try {
      await publicAPI.bookings.unlockSeats(
        selectedShowtime.id,
        selectedSeats.map(s => ({ row: s.row, col: s.col })),
        sessionIdRef.current
      );
    } catch (error) {
      console.error('Lỗi khi unlock tất cả ghế:', error);
    }
  }, [selectedShowtime, selectedSeats]);

  // Timer countdown effect - chỉ chạy khi timerActive = true
  useEffect(() => {
    if (timerActive && timerSeconds > 0 && !isTimerExpiredRef.current) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            isTimerExpiredRef.current = true;
            setTimerActive(false);
            // Hiển thị notification và reset
            setNotificationMessage('ĐÃ HẾT THỜI GIAN GIỮ VÉ');
            setShowNotification(true);
            // Unlock tất cả ghế
            handleUnlockAllSeats();
            // Reset state
            setTimeout(() => {
              setSelectedSeats([]);
              setTicketQuantities({
                adultSingle: 0,
                studentSingle: 0,
                seniorSingle: 0,
                adultDouble: 0
              });
              setProductQuantities({});
              setSelectedShowtime(null);
              // Reload trang
              window.location.reload();
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [timerActive, timerSeconds, handleUnlockAllSeats]);

  // Reset timer when showtime changes
  useEffect(() => {
    if (selectedShowtime) {
      // Unlock tất cả ghế trước khi reset (nếu có)
      const currentSeats = selectedSeats;
      if (currentSeats.length > 0 && sessionIdRef.current) {
        publicAPI.bookings.unlockSeats(
          selectedShowtime.id,
          currentSeats.map(s => ({ row: s.row, col: s.col })),
          sessionIdRef.current
        ).catch(err => console.error('Lỗi khi unlock ghế:', err));
      }
      
      setTimerSeconds(0);
      setTimerActive(false);
      isTimerExpiredRef.current = false;
      setTicketQuantities({
        adultSingle: 0,
        studentSingle: 0,
        seniorSingle: 0,
        adultDouble: 0
      });
      setSelectedSeats([]);
      setProductQuantities({});
      setLockedSeats([]);
    }
  }, [selectedShowtime]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (lockPollingIntervalRef.current) {
        clearInterval(lockPollingIntervalRef.current);
      }
      // Unlock tất cả ghế khi unmount
      handleUnlockAllSeats();
    };
  }, [handleUnlockAllSeats]);

  // Polling để check locked seats từ người khác
  useEffect(() => {
    if (selectedShowtime && timerActive) {
      const checkLockedSeats = async () => {
        try {
          const locks = await publicAPI.bookings.getLockedSeats(selectedShowtime.id);
          // Ensure locks is an array
          const locksArray = Array.isArray(locks) ? locks : [];
          // Filter ra các ghế không phải của session này
          const otherLocks = locksArray.filter(lock => lock && lock.session_id !== sessionIdRef.current);
          setLockedSeats(otherLocks);
        } catch (error) {
          console.error('Lỗi khi check locked seats:', error);
          // Set empty array on error
          setLockedSeats([]);
        }
      };

      // Check ngay lập tức
      checkLockedSeats();

      // Polling mỗi 2 giây
      lockPollingIntervalRef.current = setInterval(checkLockedSeats, 2000);

      return () => {
        if (lockPollingIntervalRef.current) {
          clearInterval(lockPollingIntervalRef.current);
        }
      };
    }
  }, [selectedShowtime, timerActive]);

  // Lock/unlock seats functions
  const handleLockSeats = async (seats) => {
    if (!selectedShowtime || !sessionIdRef.current || seats.length === 0) return;

    try {
      let result;
      try {
        result = await publicAPI.bookings.lockSeats(
          selectedShowtime.id,
          seats.map(s => ({ row: s.row, col: s.col })),
          sessionIdRef.current
        );
      } catch (apiError) {
        // Nếu API trả về error response (status 409), error.data sẽ chứa full response
        if (apiError.data) {
          result = apiError.data;
        } else {
          throw apiError;
        }
      }

      // Handle response structure:
      // Success: { lockedSeats: [...] }
      // Error: { success: false, status: 409, message: '...', data: { lockedSeats: [...], failedSeats: [...] } }
      const failedSeats = (result.data && result.data.failedSeats) || [];
      
      if (failedSeats.length > 0) {
        const failedMessages = failedSeats.map(f => `${f.row}${f.col}: ${f.reason || 'Không thể chọn'}`).join(', ');
        setNotificationMessage(`Không thể chọn một số ghế: ${failedMessages}`);
        setShowNotification(true);
        // Remove failed seats from selection
        const validSeats = seats.filter(seat => {
          return !failedSeats.some(f => f.row === seat.row && f.col === seat.col);
        });
        setSelectedSeats(validSeats);
      }
    } catch (error) {
      console.error('Lỗi khi lock ghế:', error);
      setNotificationMessage(error.message || 'Có lỗi xảy ra khi chọn ghế. Vui lòng thử lại.');
      setShowNotification(true);
    }
  };

  const handleUnlockSeats = async (seats) => {
    if (!selectedShowtime || !sessionIdRef.current || seats.length === 0) return;

    try {
      await publicAPI.bookings.unlockSeats(
        selectedShowtime.id,
        seats.map(s => ({ row: s.row, col: s.col })),
        sessionIdRef.current
      );
    } catch (error) {
      console.error('Lỗi khi unlock ghế:', error);
    }
  };


  // Calculate total tickets
  const getTotalTickets = () => {
    return (
      ticketQuantities.adultSingle +
      ticketQuantities.studentSingle +
      ticketQuantities.seniorSingle +
      ticketQuantities.adultDouble * 2 // Double tickets count as 2 seats
    );
  };

  // Update ticket quantity
  const updateTicketQuantity = (type, delta) => {
    const MAX_SEATS = APP_CONFIG.BOOKING.MAX_SEATS;
    
    setTicketQuantities(prev => {
      const newQuantities = {
        ...prev,
        [type]: Math.max(0, prev[type] + delta)
      };
      
      // Calculate new total tickets
      const newTotalTickets = 
        newQuantities.adultSingle +
        newQuantities.studentSingle +
        newQuantities.seniorSingle +
        newQuantities.adultDouble * 2;
      
      // Check maximum seats limit (8 seats) when increasing
      if (delta > 0 && newTotalTickets > MAX_SEATS) {
        setNotificationMessage(`Vui lòng chọn tối đa ${MAX_SEATS} ghế`);
        setShowNotification(true);
        // Revert to previous quantities
        return prev;
      }
      
      // If decreasing tickets, remove excess seats
      if (delta < 0 && selectedSeats.length > newTotalTickets) {
        const seatsToKeep = newTotalTickets;
        setSelectedSeats(prevSeats => prevSeats.slice(0, seatsToKeep));
      }
      
      return newQuantities;
    });
  };

  // Handle seat selection with validation
  const handleSeatSelection = async (newSeats) => {
    const totalTickets = getTotalTickets();
    const MAX_SEATS = APP_CONFIG.BOOKING.MAX_SEATS;
    
    // Check if user is trying to select seat without selecting ticket type
    if (totalTickets === 0 && newSeats.length > selectedSeats.length) {
      setNotificationMessage("Bạn không có mua ghế loại này!");
      setShowNotification(true);
      return;
    }
    
    // Check maximum seats limit (8 seats)
    if (newSeats.length > MAX_SEATS) {
      setNotificationMessage(`Vui lòng chọn tối đa ${MAX_SEATS} ghế`);
      setShowNotification(true);
      return;
    }
    
    // Limit seat selection to total tickets
    if (newSeats.length > totalTickets) {
      setNotificationMessage("Bạn không có mua ghế loại này!");
      setShowNotification(true);
      return;
    }

    // Nếu đang chọn ghế (tăng số lượng)
    if (newSeats.length > selectedSeats.length) {
      // Bắt đầu timer nếu đây là ghế đầu tiên
      if (selectedSeats.length === 0 && newSeats.length === 1) {
        setTimerSeconds(APP_CONFIG.BOOKING.TIMER_SECONDS);
        setTimerActive(true);
        isTimerExpiredRef.current = false;
      }

      // Lock ghế mới được chọn
      const newlySelectedSeats = newSeats.filter(newSeat => {
        return !selectedSeats.some(oldSeat => 
          oldSeat.row === newSeat.row && oldSeat.col === newSeat.col
        );
      });
      
      if (newlySelectedSeats.length > 0) {
        await handleLockSeats(newlySelectedSeats);
      }
    } else if (newSeats.length < selectedSeats.length) {
      // Nếu đang bỏ chọn ghế (giảm số lượng)
      const unselectedSeats = selectedSeats.filter(oldSeat => {
        return !newSeats.some(newSeat => 
          newSeat.row === oldSeat.row && newSeat.col === oldSeat.col
        );
      });

      // Unlock ghế đã bỏ chọn
      if (unselectedSeats.length > 0) {
        await handleUnlockSeats(unselectedSeats);
      }

      // Dừng timer nếu không còn ghế nào được chọn
      if (newSeats.length === 0) {
        setTimerActive(false);
        setTimerSeconds(0);
        isTimerExpiredRef.current = false;
      }
    }
    
    setSelectedSeats(newSeats);
  };

  // Handle product quantity change
  const handleProductQuantityChange = (productId, delta) => {
    setProductQuantities(prev => {
      const current = prev[productId] || 0;
      const newQuantity = Math.max(0, current + delta);
      return {
        ...prev,
        [productId]: newQuantity
      };
    });
  };

  // Get selected cinema info
  const getSelectedCinemaInfo = () => {
    if (!selectedShowtime) return null;
    const cinemaId = selectedShowtime.cinema_id_full || selectedShowtime.cinema_id;
    return cinemas.find(c => c.id === cinemaId);
  };

  // Handle book tickets - redirect to checkout
  const handleBookTickets = () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      setNotificationMessage('Vui lòng chọn ghế trước khi đặt vé');
      setShowNotification(true);
      return;
    }

    // Prepare booking data to pass to checkout
    const bookingData = {
      movieId: movie?.id,
      movie: movie,
      showtimeId: selectedShowtime.id,
      showtime: selectedShowtime,
      cinemaInfo: getSelectedCinemaInfo(),
      seats: selectedSeats.map(seat => ({
        row: typeof seat.row === 'string' ? seat.row : String.fromCharCode(64 + seat.row),
        col: seat.col
      })),
      ticketQuantities,
      productQuantities,
      timerSeconds,
      sessionId: sessionIdRef.current
    };

    // Save to sessionStorage to persist across navigation
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Redirect to checkout
    navigate('/checkout');
  };

  // Set initial selected date từ URL params hoặc ngày đầu tiên
  useEffect(() => {
    if (availableDates.length > 0) {
      const dateFromUrl = searchParams.get('date');
      
      if (dateFromUrl) {
        const matchedDate = availableDates.find(dateObj => {
          return dateObj.dateStr === dateFromUrl;
        });
        
        if (matchedDate) {
          if (!selectedDate || selectedDate.dateStr !== dateFromUrl) {
            setSelectedDate(matchedDate);
          }
          return;
        }
      }
      
      if (!selectedDate) {
        setSelectedDate(availableDates[0]);
      }
    }
  }, [availableDates, selectedDate, searchParams]);

  if (loading) {
    return (
      <div className="app-root">
        <Header />
        <main className="movie-detail-main">
          <Loading message="Đang tải thông tin phim..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="app-root">
        <Header />
        <main className="movie-detail-main">
        <div style={{ textAlign: 'center', padding: '100px', color: '#9ca3af' }}>
          Không tìm thấy phim
        </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header />

      <main className="movie-detail-main">
        <MovieInfo movie={movie} />

        {/* Showtime Schedule */}
        {showtimes.length > 0 && (
          <ShowtimeSchedule 
            showtimes={showtimes}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        )}

        {/* Banner: HIỆN CHƯA CÓ LỊCH CHIẾU */}
        {showtimes.length === 0 && (
          <div className="movie-detail-no-showtime-banner">
            <i className="fa-solid fa-calendar-xmark"></i>
            <span>HIỆN CHƯA CÓ LỊCH CHIẾU</span>
          </div>
        )}

        {/* Cinema List */}
        {showtimes.length > 0 && (
          <CinemaList
            showtimes={showtimes}
            cinemas={cinemas}
            selectedDate={selectedDate}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            selectedShowtime={selectedShowtime}
            onShowtimeSelect={(showtime) => {
              setSelectedShowtime(showtime);
              if (!showtime) {
                                        setTicketQuantities({
                                          adultSingle: 0,
                                          studentSingle: 0,
                                          seniorSingle: 0,
                                          adultDouble: 0
                                        });
              }
            }}
          />
        )}

        {/* Ticket Type Selection */}
        {selectedShowtime && (
          <TicketSelection 
            ticketQuantities={ticketQuantities}
            onQuantityChange={updateTicketQuantity}
          />
        )}

        {/* Seat Selection */}
        {selectedShowtime && (
          <div className="seat-selection-wrapper">
           
            <div className="seat-picker-wrapper">
              {(() => {
                try {
                  return (
                    <SeatPicker
                      showtime={selectedShowtime}
                      selectedSeats={selectedSeats}
                      onChangeSelected={handleSeatSelection}
                      maxSeats={getTotalTickets()}
                      lockedSeats={lockedSeats}
                      onBack={() => {
                        setSelectedSeats([]);
                      }}
                      hideBackButton={true}
                    />
                  );
                } catch (error) {
                  console.error('Error rendering SeatPicker:', error);
                  return (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#ff4444' }}>
                      <p>❌ Lỗi khi tải sơ đồ ghế</p>
                      <p style={{ fontSize: '14px', marginTop: '10px', color: '#9ca3af' }}>
                        Vui lòng thử lại hoặc chọn suất chiếu khác
                      </p>
                      <button
                        onClick={() => setSelectedShowtime(null)}
                        style={{
                          marginTop: '20px',
                          padding: '10px 20px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Quay lại
                      </button>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {/* Popcorn & Drink Selection */}
        {selectedShowtime && (
          <PopcornDrinkSelection
            productQuantities={productQuantities}
            onQuantityChange={handleProductQuantityChange}
          />
        )}

        {/* Notification Modal */}
        <NotificationModal
          isOpen={showNotification}
          message={notificationMessage}
          onClose={() => {
            setShowNotification(false);
            setNotificationMessage('');
          }}
        />
      </main>

      {/* Booking Footer */}
      <BookingFooter 
        movie={movie}
        selectedShowtime={selectedShowtime}
        cinemaInfo={getSelectedCinemaInfo()}
        timerSeconds={timerSeconds}
        ticketQuantities={ticketQuantities}
        productQuantities={productQuantities}
        selectedSeats={selectedSeats}
        onBookTickets={handleBookTickets}
        isBooking={isBooking}
      />

      <Footer />
    </div>
  );
}

export default MovieDetail;

