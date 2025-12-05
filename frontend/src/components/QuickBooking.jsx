import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { publicAPI } from '../services/api';

const QuickBooking = ({ movies = [] }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);
  
  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableShowtimes, setAvailableShowtimes] = useState([]);
  
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');

  // Fetch cinemas từ API
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await publicAPI.cinemas.getAll();
        setCinemas(data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách rạp:', error);
      }
    };
    fetchCinemas();
  }, []);

  // Fetch showtimes khi chọn phim
  useEffect(() => {
    if (selectedMovie) {
      const fetchShowtimes = async () => {
        try {
          const data = await publicAPI.showtimes.getAll(selectedMovie);
          setShowtimes(data);
          
          // Extract dates từ showtimes
          const dates = new Set();
          data.forEach(st => {
            if (st.start_time) {
              const date = new Date(st.start_time);
              const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
              dates.add(dateStr);
            }
          });
          setAvailableDates(Array.from(dates).sort());
        } catch (error) {
          console.error('Lỗi khi tải lịch chiếu:', error);
        }
      };
      fetchShowtimes();
    } else {
      setShowtimes([]);
      setAvailableDates([]);
      setAvailableShowtimes([]);
      setSelectedDate('');
      setSelectedShowtime('');
    }
  }, [selectedMovie]);

  // Filter showtimes theo date
  useEffect(() => {
    if (selectedDate && showtimes.length > 0) {
      const filtered = showtimes.filter(st => {
        if (!st.start_time) return false;
        const date = new Date(st.start_time);
        const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        return dateStr === selectedDate;
      });
      
      // Extract time từ showtimes
      const times = filtered.map(st => {
        const date = new Date(st.start_time);
        return {
          id: st.id,
          time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
          fullTime: st.start_time
        };
      });
      
      setAvailableShowtimes(times.sort((a, b) => a.time.localeCompare(b.time)));
    } else {
      setAvailableShowtimes([]);
      setSelectedShowtime('');
    }
  }, [selectedDate, showtimes]);

  // Reset các select phụ thuộc khi thay đổi
  const handleCinemaChange = (e) => {
    setSelectedCinema(e.target.value);
    // Reset movie và các select phụ thuộc
    setSelectedMovie('');
    setSelectedDate('');
    setSelectedShowtime('');
  };

  const handleMovieChange = (e) => {
    setSelectedMovie(e.target.value);
    // Reset date và showtime
    setSelectedDate('');
    setSelectedShowtime('');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedShowtime('');
  };

  const handleBookNow = () => {
    if (selectedCinema && selectedMovie && selectedDate && selectedShowtime) {
      // Extract DD/MM từ selectedDate (format: DD/MM/YYYY)
      const dateParts = selectedDate.split('/');
      const dateParam = dateParts.length === 3 ? `${dateParts[0]}/${dateParts[1]}` : selectedDate;
      // Chuyển đến trang chi tiết phim với query param date
      navigate(`/movie/${selectedMovie}?date=${encodeURIComponent(dateParam)}`);
    }
  };

  return (
    <section className="quick-booking-container">
      <div className="quick-steps-wrapper">
        <h2 className="quick-booking-title">{t('quickBooking.title')}</h2>
        
        <div className="quick-select-group">
          {/* Bước 1: Chọn Rạp */}
          <div className="quick-step-select">
            <select 
              value={selectedCinema} 
              onChange={handleCinemaChange}
            >
              <option value="" disabled hidden>1. {t('quickBooking.selectCinema')}</option>
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Bước 2: Chọn Phim */}
          <div className="quick-step-select">
            <select 
              value={selectedMovie} 
              onChange={handleMovieChange}
              disabled={!selectedCinema}
            >
              <option value="" disabled hidden>2. {t('quickBooking.selectMovie')}</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>
          
          {/* Bước 3: Chọn Ngày */}
          <div className="quick-step-select">
            <select 
              value={selectedDate} 
              onChange={handleDateChange}
              disabled={!selectedMovie || availableDates.length === 0}
            >
              <option value="" disabled hidden>3. {t('quickBooking.selectDate')}</option>
              {availableDates.map((date, index) => (
                <option key={index} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
          
          {/* Bước 4: Chọn Suất */}
          <div className="quick-step-select">
            <select 
              value={selectedShowtime} 
              onChange={(e) => setSelectedShowtime(e.target.value)}
              disabled={!selectedDate || availableShowtimes.length === 0}
            >
              <option value="" disabled hidden>4. {t('quickBooking.selectShowtime')}</option>
              {availableShowtimes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.time}
                </option>
              ))}
            </select>
          </div>
          
          {/* Nút Đặt Ngay */}
          <button 
            className="quick-submit-btn"
            onClick={handleBookNow}
            disabled={!selectedCinema || !selectedMovie || !selectedDate || !selectedShowtime}
          >
            {t('quickBooking.bookNow')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuickBooking;
