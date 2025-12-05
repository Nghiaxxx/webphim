import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import SeatPicker from './SeatPicker';
import Loading from './common/Loading';
import { publicAPI } from '../services/api';
import { getAvailableDates } from '../utils/helpers';
import { APP_CONFIG } from '../constants/app';
import MovieInfo from './movie/MovieInfo';
import ShowtimeSchedule from './movie/ShowtimeSchedule';
import CinemaList from './movie/CinemaList';
import TicketSelection from './movie/TicketSelection';
import BookingFooter from './movie/BookingFooter';

function MovieDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
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
  const [timerSeconds, setTimerSeconds] = useState(APP_CONFIG.BOOKING.TIMER_SECONDS);
  const [selectedSeats, setSelectedSeats] = useState([]);

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

  // Timer countdown effect
  useEffect(() => {
    if (selectedShowtime && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedShowtime, timerSeconds]);

  // Reset timer when showtime changes
  useEffect(() => {
    if (selectedShowtime) {
      setTimerSeconds(APP_CONFIG.BOOKING.TIMER_SECONDS);
      setTicketQuantities({
        adultSingle: 0,
        studentSingle: 0,
        seniorSingle: 0,
        adultDouble: 0
      });
    }
  }, [selectedShowtime]);

  // Update ticket quantity
  const updateTicketQuantity = (type, delta) => {
    setTicketQuantities(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
    }));
  };

  // Get selected cinema info
  const getSelectedCinemaInfo = () => {
    if (!selectedShowtime) return null;
    const cinemaId = selectedShowtime.cinema_id_full || selectedShowtime.cinema_id;
    return cinemas.find(c => c.id === cinemaId);
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
            {selectedSeats.length > 0 && (
              <div className="seat-selection-info">
                <p>Đã chọn: <strong>{selectedSeats.length}</strong> ghế</p>
              </div>
            )}
            <div className="seat-picker-wrapper">
              {(() => {
                try {
                  return (
                    <SeatPicker
                      showtime={selectedShowtime}
                      selectedSeats={selectedSeats}
                      onChangeSelected={setSelectedSeats}
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
      </main>

      {/* Booking Footer */}
      <BookingFooter 
        movie={movie}
        selectedShowtime={selectedShowtime}
        cinemaInfo={getSelectedCinemaInfo()}
        timerSeconds={timerSeconds}
        ticketQuantities={ticketQuantities}
      />

      <Footer />
    </div>
  );
}

export default MovieDetail;

