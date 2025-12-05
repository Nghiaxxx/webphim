import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieSlideshow from '../components/MovieSlideshow';
import { useMovies } from '../hooks/useMovies';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { publicAPI } from '../services/api';
import '../styles/pages/Showtimes.css';

function Showtimes() {
  const navigate = useNavigate();
  const { nowShowingMovies, loading: moviesLoading } = useMovies();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);

  // State for filters
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  
  // State for data
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);

  // Fetch cinemas
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await publicAPI.cinemas.getAll();
        console.log('Fetched cinemas:', data.length);
        setCinemas(data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách rạp:', error);
      }
    };
    fetchCinemas();
  }, []);

  // Fetch showtimes
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        const data = await publicAPI.showtimes.getAll(selectedMovie || null);
        console.log('Fetched showtimes:', data.length);
        setShowtimes(data || []);
        
        // Extract available dates
        const dates = new Set();
        data.forEach(st => {
          if (st.start_time) {
            const date = new Date(st.start_time);
            const dateKey = date.toDateString();
            const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
            const dayName = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][date.getDay()];
            dates.add(JSON.stringify({ dateKey, dateStr, dayName, fullDate: date }));
          }
        });
        
        const datesArray = Array.from(dates).map(d => {
          const parsed = JSON.parse(d);
          // Convert fullDate back to Date object
          try {
            if (parsed.fullDate instanceof Date) {
              parsed.fullDate = new Date(parsed.fullDate.getTime());
            } else if (typeof parsed.fullDate === 'string' || typeof parsed.fullDate === 'number') {
              parsed.fullDate = new Date(parsed.fullDate);
            } else {
              // If fullDate is already a Date object from JSON, create new one
              parsed.fullDate = new Date(parsed.fullDate);
            }
            
            // Validate date
            if (isNaN(parsed.fullDate.getTime())) {
              console.warn('Invalid date in datesArray:', parsed);
              return null;
            }
          } catch (error) {
            console.error('Error parsing date in datesArray:', error, parsed);
            return null;
          }
          return parsed;
        }).filter(d => d !== null).sort((a, b) => a.fullDate - b.fullDate);
        setAvailableDates(datesArray);
        
        // Set default date to today if available
        if (!selectedDate && datesArray.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayKey = today.toDateString();
          const todayDate = datesArray.find(d => {
            const dDate = new Date(d.fullDate);
            dDate.setHours(0, 0, 0, 0);
            return dDate.toDateString() === todayKey;
          });
          if (todayDate) {
            setSelectedDate(todayDate);
          } else {
            setSelectedDate(datesArray[0]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải lịch chiếu:', error);
        setLoading(false);
      }
    };
    
    fetchShowtimes();
  }, [selectedMovie]);

  // Format date display
  const formatDateDisplay = (dateObj) => {
    if (!dateObj) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toDateString();
    
    // Ensure we're comparing date strings correctly
    const dateObjDate = dateObj.fullDate instanceof Date 
      ? dateObj.fullDate 
      : new Date(dateObj.fullDate);
    dateObjDate.setHours(0, 0, 0, 0);
    
    if (dateObjDate.toDateString() === todayKey) {
      return `Hôm nay ${dateObj.dateStr}`;
    }
    return `${dateObj.dayName} ${dateObj.dateStr}`;
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Get age rating details
  const getAgeRatingDetails = (ratingCode) => {
    if (!ratingCode) return { description: '', cssClass: 'rating-default' };
    const code = ratingCode.trim().toUpperCase();
    
    switch (code) {
      case 'P':
        return { description: 'dành cho mọi lứa tuổi', cssClass: 'rating-p' };
      case 'C':
        return { description: 'được phép xem theo độ tuổi được cấp phép', cssClass: 'rating-c' };
      case 'T13':
        return { description: 'dành cho khán giả từ đủ 13 tuổi trở lên (13+)', cssClass: 'rating-t13' };
      case 'T16':
        return { description: 'dành cho khán giả từ đủ 16 tuổi trở lên', cssClass: 'rating-t16' };
      case 'T18':
        return { description: 'dành cho khán giả từ đủ 18 tuổi trở lên', cssClass: 'rating-t18' };
      case 'K':
        return { description: 'dành cho khán giả từ dưới 13 tuổi với điều kiện xem cùng cha, mẹ hoặc người giám hộ', cssClass: 'rating-k' };
      default:
        return { description: 'Không xác định', cssClass: 'rating-default' };
    }
  };

  // Group showtimes by cinema
  const groupShowtimesByCinema = useCallback((movieShowtimes) => {
    const grouped = {};
    movieShowtimes.forEach(st => {
      const cinemaId = st.cinema_id_full || st.cinema_id;
      const cinemaName = st.cinema_name;
      
      if (!cinemaId || !cinemaName) return;
      
      if (!grouped[cinemaId]) {
        const cinemaData = cinemas.find(c => c.id === cinemaId);
        grouped[cinemaId] = {
          id: cinemaId,
          name: cinemaName,
          address: st.cinema_address || cinemaData?.address || '',
          city: cinemaData?.city || '',
          showtimes: []
        };
      }
      
      grouped[cinemaId].showtimes.push(st);
    });
    
    // Sort showtimes by time
    Object.values(grouped).forEach(cinema => {
      cinema.showtimes.sort((a, b) => {
        return new Date(a.start_time) - new Date(b.start_time);
      });
    });
    
    return Object.values(grouped);
  }, [cinemas]);

  // Filter and get nearest 3 movies
  const nearestMovies = useMemo(() => {
    if (!selectedDate || !selectedDate.fullDate || showtimes.length === 0) {
      return [];
    }
    
    const now = new Date();
    // Ensure selectedDate.fullDate is a Date object
    let selectedDateObj;
    try {
      if (selectedDate.fullDate instanceof Date) {
        selectedDateObj = new Date(selectedDate.fullDate.getTime());
      } else if (typeof selectedDate.fullDate === 'string' || typeof selectedDate.fullDate === 'number') {
        selectedDateObj = new Date(selectedDate.fullDate);
      } else {
        console.warn('Invalid selectedDate.fullDate:', selectedDate.fullDate);
        return [];
      }
      
      // Validate date
      if (isNaN(selectedDateObj.getTime())) {
        console.warn('Invalid date object:', selectedDateObj);
        return [];
      }
      
      selectedDateObj.setHours(0, 0, 0, 0);
    } catch (error) {
      console.error('Error parsing selectedDate:', error, selectedDate);
      return [];
    }
    
    // Filter showtimes by selected date and filters
    let filteredShowtimes = showtimes.filter(st => {
      if (!st.start_time) return false;
      
      try {
        const stDate = new Date(st.start_time);
        const stDateOnly = new Date(stDate);
        stDateOnly.setHours(0, 0, 0, 0);
        const sameDate = stDateOnly.toDateString() === selectedDateObj.toDateString();
        
        if (!sameDate) return false;
        
        if (selectedCinema) {
          const cinemaId = st.cinema_id_full || st.cinema_id;
          if (cinemaId !== parseInt(selectedCinema)) return false;
        }
        
        // Only show future showtimes
        return stDate >= now;
      } catch (error) {
        console.error('Error filtering showtime:', error);
        return false;
      }
    });
    
    // Group by movie
    const movieMap = new Map();
    filteredShowtimes.forEach(st => {
      const movieId = st.movie_id;
      if (!movieMap.has(movieId)) {
        movieMap.set(movieId, {
          movieId,
          movieTitle: st.movie_title,
          moviePoster: st.movie_poster,
          nearestShowtime: null,
          showtimes: []
        });
      }
      
      const movieData = movieMap.get(movieId);
      movieData.showtimes.push(st);
      
      // Find nearest showtime
      if (!movieData.nearestShowtime || new Date(st.start_time) < new Date(movieData.nearestShowtime.start_time)) {
        movieData.nearestShowtime = st;
      }
    });
    
    // Convert to array and sort by nearest showtime
    const moviesArray = Array.from(movieMap.values())
      .filter(m => m.nearestShowtime !== null)
      .sort((a, b) => {
        const timeA = new Date(a.nearestShowtime.start_time);
        const timeB = new Date(b.nearestShowtime.start_time);
        return timeA - timeB;
      })
      .slice(0, 3);
    
    // Get full movie details
    return moviesArray.map(m => {
      const fullMovie = nowShowingMovies.find(movie => movie.id === m.movieId);
      return {
        ...m,
        movie: fullMovie || {
          id: m.movieId,
          title: m.movieTitle,
          poster_url: m.moviePoster,
          rating: null,
          duration: null,
          country: null,
          subtitle: null,
          genre: null
        },
        showtimesByCinema: groupShowtimesByCinema(m.showtimes)
      };
    });
  }, [showtimes, selectedDate, selectedCinema, nowShowingMovies, groupShowtimesByCinema]);

  // Handle showtime click
  const handleShowtimeClick = (showtime) => {
    navigate(`/movie/${showtime.movie_id}?showtime=${showtime.id}`);
  };

  return (
    <div className="app-root">
      <Header />
      
      <main className="showtimes-main">
        {/* Filter Section */}
        <section className="showtimes-filters">
          <div className="showtimes-filters-container">
            <div className="filter-item">
              <label className="filter-label">
                1. Ngày
                <i className="fas fa-calendar-alt filter-icon"></i>
              </label>
              <select
                className="filter-select"
                value={selectedDate ? JSON.stringify(selectedDate) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      // Convert fullDate back to Date object
                      parsed.fullDate = new Date(parsed.fullDate);
                      setSelectedDate(parsed);
                    } catch (err) {
                      console.error('Error parsing date:', err);
                    }
                  } else {
                    setSelectedDate(null);
                  }
                }}
                disabled={availableDates.length === 0}
              >
                <option value="">{t('showtimes.selectDate')}</option>
                {availableDates.map((date, index) => (
                  <option key={index} value={JSON.stringify(date)}>
                    {formatDateDisplay(date)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label className="filter-label">
                2. Phim
                <i className="fas fa-film filter-icon"></i>
              </label>
              <select
                className="filter-select"
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                disabled={moviesLoading || nowShowingMovies.length === 0}
              >
                <option value="">{t('showtimes.selectMovie')}</option>
                {nowShowingMovies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label className="filter-label">
                3. Rạp
                <i className="fas fa-map-marker-alt filter-icon"></i>
              </label>
              <select
                className="filter-select"
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                disabled={cinemas.length === 0}
              >
                <option value="">{t('showtimes.selectCinema')}</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name} ({cinema.city || ''})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Separator Line */}
        <div className="showtimes-separator"></div>

        {/* Movies Display Section */}
        <section className="showtimes-content">
          {loading || moviesLoading ? (
            <div className="showtimes-loading">
              {t('home.loading')}
            </div>
          ) : showtimes.length === 0 ? (
            <div className="showtimes-empty">
              <p>{t('showtimes.noShowtimes')}</p>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
                Vui lòng chọn ngày khác hoặc kiểm tra lại sau.
              </p>
            </div>
          ) : nearestMovies.length === 0 ? (
            <div className="showtimes-empty">
              <p>{t('showtimes.noShowtimes')}</p>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
                Không có suất chiếu cho ngày đã chọn. Vui lòng chọn ngày khác.
              </p>
            </div>
          ) : (
            <div className="showtimes-movies-list">
              {nearestMovies.map((movieData) => {
                const movie = movieData.movie;
                
                return (
                  <div key={movieData.movieId} className="showtimes-movie-item">
                    {/* Left: Movie Info */}
                    <div className="showtimes-movie-info">
                      <div className="showtimes-movie-poster">
                        {movie.poster_url ? (
                          <img src={movie.poster_url} alt={movie.title} />
                        ) : (
                          <div className="poster-placeholder">{movie.title.charAt(0)}</div>
                        )}
                      </div>
                      <div className="showtimes-movie-details">
                        <h3 className="showtimes-movie-title">{movie.title}</h3>
                        <div className="showtimes-movie-meta">
                          {movie.genre && (
                            <div className="showtimes-movie-meta-item">
                              <img src="https://cinestar.com.vn/assets/images/icon-tag.svg" alt="" className="showtimes-meta-icon" />
                              <span>{movie.genre}</span>
                            </div>
                          )}
                          {movie.duration && (
                            <div className="showtimes-movie-meta-item">
                              <img src="https://cinestar.com.vn/assets/images/icon-clock.svg" alt="" className="showtimes-meta-icon" />
                              <span>{movie.duration} phút</span>
                            </div>
                          )}
                          {movie.country && (
                            <div className="showtimes-movie-meta-item">
                              <i className="fa-solid fa-earth-americas showtimes-meta-icon"></i>
                              <span>{movie.country}</span>
                            </div>
                          )}
                          {movie.subtitle && (
                            <div className="showtimes-movie-meta-item">
                              <img src="https://cinestar.com.vn/assets/images/subtitle.svg" alt="" className="showtimes-meta-icon" />
                              <span>{movie.subtitle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Cinemas and Showtimes */}
                    <div className="showtimes-cinemas-list">
                      {movieData.showtimesByCinema.length === 0 ? (
                        <div className="showtimes-no-cinemas">
                          {t('showtimes.noShowtimes')}
                        </div>
                      ) : (
                        movieData.showtimesByCinema.map((cinema) => (
                          <div key={cinema.id} className="showtimes-cinema-group">
                            <div className="showtimes-cinema-info">
                              <div className="showtimes-cinema-name">
                                {cinema.name} ({cinema.city || ''})
                              </div>
                              {cinema.address && (
                                <div className="showtimes-cinema-address">
                                  {cinema.address}
                                </div>
                              )}
                            </div>
                            <div className="showtimes-times-container">
                              {(() => {
                                // Group showtimes by screen type
                                const groupedByType = {};
                                cinema.showtimes.forEach(st => {
                                  const type = st.screen_type && st.screen_type.toUpperCase() || 'STANDARD';
                                  if (!groupedByType[type]) {
                                    groupedByType[type] = [];
                                  }
                                  groupedByType[type].push(st);
                                });
                                
                                return Object.entries(groupedByType).map(([type, showtimes]) => (
                                  <div key={type} className="showtimes-type-group">
                                    <div className="showtimes-type-label">{type}</div>
                                    <div className="showtimes-times-grid">
                                      {showtimes.map((st) => {
                                        const isStandard = type === 'STANDARD';
                                        const isDeluxe = type === 'DELUXE';
                                        return (
                                          <button
                                            key={st.id}
                                            className={`showtimes-time-btn ${isStandard ? 'showtimes-time-standard' : isDeluxe ? 'showtimes-time-deluxe' : ''}`}
                                            onClick={() => handleShowtimeClick(st)}
                                          >
                                            <span className="showtimes-time-text">{formatTime(st.start_time)}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* View All Showtimes Button */}
          {nearestMovies.length > 0 && (
            <div className="showtimes-view-all">
              <button
                className="showtimes-view-all-btn"
                onClick={() => navigate('/movie')}
              >
                {t('showtimes.viewAllShowtimes')}
              </button>
            </div>
          )}
        </section>

        {/* Now Showing Carousel */}
        <section className="showtimes-carousel-section">
          {nowShowingMovies.length > 0 && (
            <MovieSlideshow movies={nowShowingMovies} title={null} />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Showtimes;

