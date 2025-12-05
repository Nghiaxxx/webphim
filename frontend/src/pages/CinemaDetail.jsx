import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PromoSlideshow from '../components/PromoSlideshow';
import { useMovies } from '../hooks/useMovies';
import { usePromotions } from '../hooks/usePromotions';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { publicAPI } from '../services/api';
import '../styles/pages/CinemaDetail.css';

// Utility function to create slug from cinema name
const createSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Mapping cinema names to banner image URLs
const getCinemaBannerImage = (cinemaName) => {
  if (!cinemaName) return null;
  
  const name = cinemaName.toLowerCase();
  const bannerMap = {
    'quốc thanh': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/01-Quoc-Thanh-masthead.jpg',
    'quoc thanh': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/01-Quoc-Thanh-masthead.jpg',
    'hai bà trưng': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/03-Hai_Ba_Trung_masthead.jpg',
    'hai ba trung': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/03-Hai_Ba_Trung_masthead.jpg',
    'sinh viên': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/05_sinh_vien_masthead.jpg',
    'sinh vien': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/05_sinh_vien_masthead.jpg',
    'huế': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/04_Hue_masthead.jpg',
    'hue': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/04_Hue_masthead.jpg',
    'đà lạt': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/02-Da_Lat_masthead.jpg',
    'da lat': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/02-Da_Lat_masthead.jpg',
    'lâm đồng': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/08_Lam_Dong_masthead.jpg',
    'lam dong': 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/08_Lam_Dong_masthead.jpg',
    'mỹ tho': 'https://cinestar-api.monamedia.net/media/wysiwyg/CinemaImage/06_My_Tho_masthead.jpg',
    'my tho': 'https://cinestar-api.monamedia.net/media/wysiwyg/CinemaImage/06_My_Tho_masthead.jpg',
    'kiên giang': 'https://cinestar-api.monamedia.net/media/wysiwyg/CinemaImage/07_Kien_Giang_masthead.jpg',
    'kien giang': 'https://cinestar-api.monamedia.net/media/wysiwyg/CinemaImage/07_Kien_Giang_masthead.jpg',
    'satra quận 6': 'https://admin.cinestar.com.vn/Areas/Admin/Content/Fileuploads/images/LOGO/SATRAQ6.png',
    'satra quan 6': 'https://admin.cinestar.com.vn/Areas/Admin/Content/Fileuploads/images/LOGO/SATRAQ6.png',
    'satra q6': 'https://admin.cinestar.com.vn/Areas/Admin/Content/Fileuploads/images/LOGO/SATRAQ6.png',
  };
  
  // Try to find matching key
  for (const [key, url] of Object.entries(bannerMap)) {
    if (name.includes(key)) {
      return url;
    }
  }
  
  return null;
};

function CinemaDetail() {
  const { cinemaPath } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);
  const { nowShowingMovies, comingSoonMovies, loading: moviesLoading } = useMovies();
  const { promotionsData } = usePromotions();

  // State
  const [cinema, setCinema] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movieCategory, setMovieCategory] = useState('now_showing'); // 'now_showing', 'coming_soon', 'special', or 'price_list'
  const [priceListTab, setPriceListTab] = useState('2D'); // '2D', '3D', or 'CME'
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [expandedShowtimes, setExpandedShowtimes] = useState({}); // Track which movie's showtimes are expanded

  // Find cinema by slug
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await publicAPI.cinemas.getAll();
        setCinemas(data || []);
        
        // Find cinema by matching slug
        const foundCinema = data.find(c => {
          const slug = createSlug(c.name);
          return slug === cinemaPath;
        });
        
        if (foundCinema) {
          setCinema(foundCinema);
        } else {
          console.error('Cinema not found:', cinemaPath);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách rạp:', error);
      }
    };
    
    fetchCinemas();
  }, [cinemaPath]);

  // Fetch showtimes for this cinema
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!cinema) return;
      
      try {
        setLoading(true);
        const data = await publicAPI.showtimes.getAll();
        // Filter showtimes for this cinema
        const cinemaShowtimes = data.filter(st => {
          const cinemaId = st.cinema_id_full || st.cinema_id;
          return cinemaId === cinema.id;
        });
        setShowtimes(cinemaShowtimes);
        
        // Extract available dates
        const dates = new Set();
        cinemaShowtimes.forEach(st => {
          if (st.start_time) {
            const date = new Date(st.start_time);
            const dateKey = date.toDateString();
            const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
            const dayName = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][date.getDay()];
            dates.add(JSON.stringify({ dateKey, dateStr, dayName, fullDate: date.toISOString() }));
          }
        });
        
        const datesArray = Array.from(dates).map(d => {
          const parsed = JSON.parse(d);
          parsed.fullDate = new Date(parsed.fullDate);
          return parsed;
        }).filter(d => !isNaN(d.fullDate.getTime())).sort((a, b) => a.fullDate - b.fullDate);
        
        setAvailableDates(datesArray);
        
        // Set default date to today if available
        if (datesArray.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayKey = today.toDateString();
          const todayDate = datesArray.find(d => {
            const dDate = new Date(d.fullDate);
            dDate.setHours(0, 0, 0, 0);
            return dDate.toDateString() === todayKey;
          });
          setSelectedDate(todayDate || datesArray[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải lịch chiếu:', error);
        setLoading(false);
      }
    };
    
    fetchShowtimes();
  }, [cinema]);

  // Auto-expand showtimes when date is selected for the first time
  useEffect(() => {
    if (selectedDate && cinema) {
      // Auto-expand showtimes for all movies when date is first selected
      const movieIds = new Set();
      showtimes.forEach(st => {
        const cinemaId = st.cinema_id_full || st.cinema_id;
        if (cinemaId === cinema.id && st.movie_id) {
          movieIds.add(st.movie_id);
        }
      });
      
      setExpandedShowtimes(prev => {
        const newState = { ...prev };
        movieIds.forEach(movieId => {
          if (!prev[`${movieId}_showtimes`]) {
            newState[`${movieId}_showtimes`] = true;
          }
        });
        return newState;
      });
    }
  }, [selectedDate, cinema, showtimes]);

  // Format date display
  const formatDateDisplay = (dateObj) => {
    if (!dateObj) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toDateString();
    
    const dateObjDate = dateObj.fullDate instanceof Date 
      ? dateObj.fullDate 
      : new Date(dateObj.fullDate);
    dateObjDate.setHours(0, 0, 0, 0);
    
    if (dateObjDate.toDateString() === todayKey) {
      return `Hôm nay ${dateObj.dateStr}`;
    }
    return `${dateObj.dayName}, ${dateObj.dateStr}`;
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
        return { description: 'Phim dành cho khán giả mọi lứa tuổi', cssClass: 'rating-p' };
      case 'C':
        return { description: 'được phép xem theo độ tuổi được cấp phép', cssClass: 'rating-c' };
      case 'T13':
        return { description: 'Phim dành cho khán giả từ 13 tuổi trở lên (13+)', cssClass: 'rating-t13' };
      case 'T16':
        return { description: 'Phim dành cho khán giả từ 16 tuổi trở lên (16+)', cssClass: 'rating-t16' };
      case 'T18':
        return { description: 'Phim dành cho khán giả từ 18 tuổi trở lên (18+)', cssClass: 'rating-t18' };
      case 'K':
        return { description: 'dành cho khán giả từ dưới 13 tuổi với điều kiện xem cùng cha, mẹ hoặc người giám hộ', cssClass: 'rating-k' };
      default:
        return { description: 'Không xác định', cssClass: 'rating-default' };
    }
  };

  // Format release date
  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `DỰ KIẾN RA MẮT ${day}.${month}.${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Get movies with showtimes for selected date
  const moviesWithShowtimes = useMemo(() => {
    if (!cinema) return [];
    
    const selectedMovies = movieCategory === 'now_showing' ? nowShowingMovies : comingSoonMovies;
    
    // For coming soon movies, show all movies (they may not have showtimes yet)
    if (movieCategory === 'coming_soon') {
      return selectedMovies.map(movie => ({
        movie,
        showtimes: []
      }));
    }
    
    // For now showing movies, only show movies with showtimes at this cinema
    if (showtimes.length === 0) return [];
    
    // Get all unique movie IDs that have showtimes at this cinema (any date)
    const cinemaMovieIds = new Set();
    showtimes.forEach(st => {
      const cinemaId = st.cinema_id_full || st.cinema_id;
      if (cinemaId === cinema.id && st.movie_id) {
        cinemaMovieIds.add(st.movie_id);
      }
    });
    
    // Get all movies that are showing at this cinema
    const cinemaMovies = selectedMovies.filter(m => cinemaMovieIds.has(m.id));
    
    // If no date selected yet, return all movies with all their showtimes
    if (!selectedDate) {
      const movieMap = new Map();
      cinemaMovies.forEach(movie => {
        const movieShowtimes = showtimes.filter(st => {
          const cinemaId = st.cinema_id_full || st.cinema_id;
          return cinemaId === cinema.id && st.movie_id === movie.id;
        });
        if (movieShowtimes.length > 0) {
          movieMap.set(movie.id, {
            movie,
            showtimes: movieShowtimes.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          });
        }
      });
      return Array.from(movieMap.values());
    }
    
    // Filter showtimes for selected date
    const selectedDateObj = selectedDate.fullDate instanceof Date 
      ? selectedDate.fullDate 
      : new Date(selectedDate.fullDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    // For each movie at this cinema, get showtimes for selected date
    const movieMap = new Map();
    cinemaMovies.forEach(movie => {
      const dateShowtimes = showtimes.filter(st => {
        const cinemaId = st.cinema_id_full || st.cinema_id;
        if (cinemaId !== cinema.id || st.movie_id !== movie.id || !st.start_time) {
          return false;
        }
        const stDate = new Date(st.start_time);
        stDate.setHours(0, 0, 0, 0);
        return stDate.toDateString() === selectedDateObj.toDateString();
      });
      
      // Include movie even if no showtimes for selected date (but has showtimes at this cinema)
      movieMap.set(movie.id, {
        movie,
        showtimes: dateShowtimes.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      });
    });
    
    // Convert to array
    return Array.from(movieMap.values());
  }, [selectedDate, showtimes, cinema, movieCategory, nowShowingMovies, comingSoonMovies]);

  // Handle showtime click
  const handleShowtimeClick = (showtime) => {
    navigate(`/movie/${showtime.movie_id}?showtime=${showtime.id}`);
  };

  if (loading || !cinema) {
    return (
      <div className="app-root">
        <Header />
        <main className="cinema-detail-main">
          <div className="cinema-detail-loading">
            <p>{t('home.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header />
      
      <main className="cinema-detail-main">
        {/* Cinema Banner */}
        <section className="cinema-detail-banner">
          <div className="cinema-detail-banner-content">
            <div className="cinema-detail-banner-image">
              {getCinemaBannerImage(cinema.name) ? (
                <img 
                  src={getCinemaBannerImage(cinema.name)} 
                  alt={cinema.name}
                  className="cinema-detail-banner-img"
                />
              ) : (
                <div className="cinema-detail-banner-placeholder">
                  <div className="cinema-detail-banner-placeholder-icon">
                    <i className="fas fa-film"></i>
                  </div>
                </div>
              )}
            </div>
            <div className="cinema-detail-banner-info">
              <h1 className="cinema-detail-banner-title">{cinema.name}</h1>
              {cinema.address && (
                <p className="cinema-detail-banner-address">
                  <i className="fas fa-map-marker-alt cinema-detail-banner-icon"></i>
                  {cinema.address}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Navigation Bar */}
        <section className="cinema-detail-nav-bar">
          <div className="cinema-detail-nav-container">
            <button
              className={`cinema-detail-nav-btn ${movieCategory === 'now_showing' ? 'active' : ''}`}
              onClick={() => setMovieCategory('now_showing')}
            >
              PHIM ĐANG CHIẾU
            </button>
            <button
              className={`cinema-detail-nav-btn ${movieCategory === 'coming_soon' ? 'active' : ''}`}
              onClick={() => setMovieCategory('coming_soon')}
            >
              PHIM SẮP CHIẾU
            </button>
            <button
              className={`cinema-detail-nav-btn ${movieCategory === 'special' ? 'active' : ''}`}
              onClick={() => setMovieCategory('special')}
            >
              SUẤT CHIẾU ĐẶC BIỆT
            </button>
            <button
              className={`cinema-detail-nav-btn ${movieCategory === 'price_list' ? 'active' : ''}`}
              onClick={() => setMovieCategory('price_list')}
            >
              BẢNG GIÁ VÉ
            </button>
          </div>
        </section>

        {/* Special Showtimes Content */}
        {movieCategory === 'special' ? (
          <section className="cinema-detail-special-content">
            <h1 className="cinema-detail-special-title">SUẤT CHIẾU ĐẶC BIỆT</h1>
            <div className="cinema-detail-special-video-container">
              <div className="cinema-detail-special-video-icon">
                <div className="cinema-detail-special-video-frame">
                  <div className="cinema-detail-special-play-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 15L45 30L20 45V15Z" fill="white"/>
                    </svg>
                  </div>
                </div>
                <div className="cinema-detail-special-progress-bar">
                  <div className="cinema-detail-special-progress-line"></div>
                  <div className="cinema-detail-special-progress-dot"></div>
                </div>
              </div>
              <p className="cinema-detail-special-updating">ĐANG CẬP NHẬT</p>
            </div>
          </section>
        ) : movieCategory === 'price_list' ? (
          <section className="cinema-detail-price-list-content">
            <h1 className="cinema-detail-price-list-title">BẢNG GIÁ VÉ</h1>
            <div className="cinema-detail-price-list-tabs">
              <button
                className={`cinema-detail-price-list-tab ${priceListTab === '2D' ? 'active' : ''}`}
                onClick={() => setPriceListTab('2D')}
              >
                2D
              </button>
              <button
                className={`cinema-detail-price-list-tab ${priceListTab === '3D' ? 'active' : ''}`}
                onClick={() => setPriceListTab('3D')}
              >
                3D
              </button>
              <button
                className={`cinema-detail-price-list-tab ${priceListTab === 'CME' ? 'active' : ''}`}
                onClick={() => setPriceListTab('CME')}
              >
                C'MÊ
              </button>
            </div>
            <div className="cinema-detail-price-list-image-container">
              {priceListTab === '2D' && (
                <img
                  src="https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Ticket/QuocThanh/CQT_2D-min.png"
                  alt="Bảng giá vé 2D"
                  className="cinema-detail-price-list-image"
                />
              )}
              {priceListTab === '3D' && (
                <img
                  src="https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Ticket/QuocThanh/CQT_3D-min.jpg"
                  alt="Bảng giá vé 3D"
                  className="cinema-detail-price-list-image"
                />
              )}
              {priceListTab === 'CME' && (
                <img
                  src="https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Ticket/QuocThanh/CQT_C_M__min_v2.jpg"
                  alt="Bảng giá vé C'MÊ"
                  className="cinema-detail-price-list-image"
                />
              )}
            </div>
          </section>
        ) : (
          <>
        {/* Movies List */}
        <section className="cinema-detail-movies">
          <div className="cinema-detail-movies-container">
            <h2 className="cinema-detail-movies-title">
              {movieCategory === 'now_showing' ? 'PHIM ĐANG CHIẾU' : 'PHIM SẮP CHIẾU'}
            </h2>
            {moviesLoading ? (
              <div className="cinema-detail-loading">
                <p>{t('home.loading')}</p>
              </div>
            ) : moviesWithShowtimes.length === 0 ? (
              <div className="cinema-detail-empty">
                <p>
                  {showtimes.length === 0 
                    ? `Không có phim ${movieCategory === 'now_showing' ? 'đang chiếu' : 'sắp chiếu'} tại rạp này.`
                    : `Không có phim ${movieCategory === 'now_showing' ? 'đang chiếu' : 'sắp chiếu'} tại rạp này.`
                  }
                </p>
              </div>
            ) : (
              <div className="cinema-detail-movies-grid">
                {moviesWithShowtimes.map(({ movie, showtimes: movieShowtimes }) => {
                const ratingDetails = getAgeRatingDetails(movie.rating);
                return (
                  <div key={movie.id} className="cinema-detail-movie-item">
                    <div className="cinema-detail-movie-poster">
                      {movie.poster_url ? (
                        <img src={movie.poster_url} alt={movie.title} />
                      ) : (
                        <div className="poster-placeholder">{movie.title.charAt(0)}</div>
                      )}
                    </div>
                    <div className="cinema-detail-movie-content">
                      <div className="cinema-detail-movie-header">
                        <h3 className="cinema-detail-movie-title">{movie.title}</h3>
                        {/* {movie.release_date && (
                          <p className="cinema-detail-movie-release">
                            {formatReleaseDate(movie.release_date)}
                          </p>
                        )} */}
                      </div>
                      <div className="cinema-detail-movie-info">
                        {movie.genre && (
                          <span className="cinema-detail-movie-genre">
                            <img src="https://cinestar.com.vn/assets/images/icon-tag.svg" alt="" style={{ marginRight: '6px', width: '11px', height: '11px' }} />
                            {movie.genre}
                          </span>
                        )}
                        {movie.duration && (
                          <span className="cinema-detail-movie-duration">
                            <img src="https://cinestar.com.vn/assets/images/icon-clock.svg" alt="" style={{ marginRight: '6px', width: '11px', height: '11px' }} />
                            {movie.duration}
                          </span>
                        )}
                        {movie.country && (
                          <span className="cinema-detail-movie-country">
                            <i className="fa-solid fa-earth-americas country-icon" style={{ marginRight: '6px', fontSize: '11px' }}></i>
                            {movie.country}
                          </span>
                        )}
                        {movie.subtitle && (
                          <span className="cinema-detail-movie-subtitle">
                            <img src="https://cinestar.com.vn/assets/images/subtitle.svg" alt="" style={{ marginRight: '6px', width: '11px', height: '11px' }} />
                            {movie.subtitle}
                          </span>
                        )}
                        {/* {movie.rating && (
                          <span className={`cinema-detail-movie-rating ${ratingDetails.cssClass}`}>
                            {movie.rating}
                          </span>
                        )} */}
                      </div>
                      {movie.rating && (
                        <p className="cinema-detail-movie-rating-desc">
                          <i className="fas fa-user" style={{ marginRight: '6px', fontSize: '11px' }}></i>
                          {movie.rating}. {ratingDetails.description}
                        </p>
                      )}
                      
                      {/* Showtimes Box - Collapsible */}
                      {movieCategory === 'coming_soon' ? (
                        <div className="cinema-detail-coming-soon-message">
                          <img src="https://cinestar.com.vn/assets/images/movie-updating.png" alt="Chưa có suất chiếu" />
                          <span>Chưa có suất chiếu</span>
                        </div>
                      ) : (
                        availableDates.length > 0 && (
                          <div className={`cinema-detail-showtimes-box ${expandedShowtimes[`${movie.id}_showtimes`] ? 'expanded' : ''}`}>
                            <button
                              className="cinema-detail-showtimes-toggle"
                              onClick={() => {
                                setExpandedShowtimes(prev => ({
                                  ...prev,
                                  [`${movie.id}_showtimes`]: !prev[`${movie.id}_showtimes`]
                                }));
                              }}
                            >
                              <span>
                                {selectedDate ? formatDateDisplay(selectedDate) : 'Chọn ngày'}
                              </span>
                              <i className={`fas ${expandedShowtimes[`${movie.id}_showtimes`] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            </button>
                            <div className="cinema-detail-showtimes-content">
                              {movieShowtimes.length > 0 ? (
                                <div className="cinema-detail-showtimes">
                                {(() => {
                                  // Group showtimes by screen type
                                  const groupedByType = {};
                                  movieShowtimes.forEach(st => {
                                    const type = st.screen_type && st.screen_type.toUpperCase() || 'STANDARD';
                                    if (!groupedByType[type]) {
                                      groupedByType[type] = [];
                                    }
                                    groupedByType[type].push(st);
                                  });
                                  
                                  return Object.entries(groupedByType).map(([type, showtimes]) => (
                                    <div key={type} className="cinema-detail-showtime-group">
                                      <div className="cinema-detail-showtime-type">{type}</div>
                                      <div className="cinema-detail-showtime-times">
                                        {showtimes.map((st) => (
                                          <button
                                            key={st.id}
                                            className={`cinema-detail-showtime-btn ${
                                              type === 'STANDARD' ? 'standard' : 
                                              type === 'DELUXE' ? 'deluxe' : ''
                                            }`}
                                            onClick={() => handleShowtimeClick(st)}
                                          >
                                            {formatTime(st.start_time)}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                              ) : (
                                <div className="cinema-detail-no-showtimes">
                                  <p>Không có suất chiếu cho ngày đã chọn.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                      
                      {/* More Showtimes Link - Outside the box */}
                      <a href="#" className="cinema-detail-more-showtimes">
                        Xem thêm lịch chiếu
                      </a>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </section>

            {/* Promotions Section */}
            {promotionsData.length > 0 && (
              <section className="cinema-detail-promotions">
                <PromoSlideshow promotions={promotionsData} title={null} />
                <div className="cinema-detail-promotions-action">
                  <button 
                    className="cinema-detail-promotions-btn"
                    onClick={() => navigate('/chuong-trinh-khuyen-mai')}
                  >
                    TẤT CẢ ƯU ĐÃI
                  </button>
                </div>
              </section>
            )}

            {/* Map Section */}
            {cinema.address && (
          <section className="cinema-detail-map">
            <div className="cinema-detail-map-container">
              <h2 className="cinema-detail-map-title">Vị trí rạp</h2>
              <div className="cinema-detail-map-wrapper">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6Y4c3uG5ZPY&q=${encodeURIComponent(cinema.address)}`}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Bản đồ ${cinema.name}`}
                ></iframe>
              </div>
              <div className="cinema-detail-map-actions">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cinema.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cinema-detail-map-link"
                >
                  Chỉ đường
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cinema.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cinema-detail-map-link"
                >
                  Xem bản đồ lớn hơn
                </a>
              </div>
            </div>
          </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CinemaDetail;

