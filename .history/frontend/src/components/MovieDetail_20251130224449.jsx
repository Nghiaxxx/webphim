import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCity, setSelectedCity] = useState('HỒ CHÍ MINH');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`/api/movies/${id}`);
        if (!response.ok) {
          throw new Error('Không thể tải thông tin phim');
        }
        const data = await response.json();
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
        const response = await fetch(`/api/showtimes?movieId=${id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Showtimes data:', data); // Debug log
          setShowtimes(data);
        } else {
          console.error('Failed to fetch showtimes:', response.status);
        }
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
        const response = await fetch('/api/cinemas');
        if (response.ok) {
          const data = await response.json();
          setCinemas(data);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách rạp:', error);
      }
    };

    fetchCinemas();
  }, []);

  // Format release date
  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[date.getDay()];
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${dayName}, ${day}/${month}/${date.getFullYear()}`;
    } catch (error) {
      return dateString;
    }
  };

  // Get unique dates from showtimes
  const getAvailableDates = React.useMemo(() => {
    const dates = new Set();
    showtimes.forEach(st => {
      const date = new Date(st.start_time);
      const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dayName = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][date.getDay()];
      dates.add({ dateStr, dayName, fullDate: date });
    });
    return Array.from(dates).sort((a, b) => a.fullDate - b.fullDate);
  }, [showtimes]);
// Hàm lấy thông tin rating để hiển thị
const getAgeRatingDetails = (ratingCode) => {
  if (!ratingCode) return { description: '', cssClass: 'rating-default' };

  // Chuẩn hóa mã rating và loại bỏ khoảng trắng thừa
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
      return { description: 'dành cho khán giả từ dưới 13 tuổi với điều kiện xem cùng cha, mẹ hoặc người giám hộ', cssClass: 'rating-k'};
    default:
      return { description: 'Không xác định', cssClass: 'rating-default' };
  }
};
  // Get showtimes for selected date
  const getShowtimesForDate = React.useCallback((dateObj) => {
    if (!dateObj) return [];
    return showtimes.filter(st => {
      const stDate = new Date(st.start_time);
      return stDate.toDateString() === dateObj.fullDate.toDateString();
    });
  }, [showtimes]);

  // Group showtimes by cinema
  const getShowtimesByCinema = React.useMemo(() => {
    if (!selectedDate) return {};
    
    const dateShowtimes = getShowtimesForDate(selectedDate);
    const grouped = {};
    
    dateShowtimes.forEach(st => {
      // Hỗ trợ cả cinema_id_full (từ join) và cinema_id (trực tiếp)
      const cinemaId = st.cinema_id_full || st.cinema_id;
      const cinemaName = st.cinema_name;
      
      // Nếu có cinema_id và cinema_name từ join
      if (cinemaId && cinemaName) {
        if (!grouped[cinemaId]) {
          grouped[cinemaId] = {
            id: cinemaId,
            name: cinemaName,
            address: st.cinema_address || '',
            showtimes: [],
            screenTypes: new Set()
          };
        }
        grouped[cinemaId].showtimes.push(st);
        if (st.screen_type) {
          grouped[cinemaId].screenTypes.add(st.screen_type);
        }
      } else {
        // Fallback: Nếu không có cinema info từ join, hiển thị tất cả showtimes trong một nhóm
        // Hoặc có thể map với cinemas từ state nếu có
        const fallbackId = 'all-showtimes';
        if (!grouped[fallbackId]) {
          grouped[fallbackId] = {
            id: fallbackId,
            name: 'Tất cả các rạp',
            address: '',
            showtimes: [],
            screenTypes: new Set()
          };
        }
        grouped[fallbackId].showtimes.push(st);
        if (st.screen_type) {
          grouped[fallbackId].screenTypes.add(st.screen_type);
        }
      }
    });
    
    return grouped;
  }, [selectedDate, getShowtimesForDate]);

  // Extract YouTube ID
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match && match[1].length === 11 ? match[1] : null;
  };

  // Set initial selected date
  useEffect(() => {
    if (getAvailableDates.length > 0 && !selectedDate) {
      setSelectedDate(getAvailableDates[0]);
    }
  }, [getAvailableDates, selectedDate]);

  if (loading) {
    return (
      <div className="app-root">
        <div style={{ textAlign: 'center', padding: '100px', color: '#9ca3af' }}>
          Đang tải thông tin phim...
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="app-root">
        <div style={{ textAlign: 'center', padding: '100px', color: '#9ca3af' }}>
          Không tìm thấy phim
        </div>
      </div>
    );
  }

  const videoId = extractYouTubeId(movie.trailer_url);

  return (
    <div className="app-root">
      <Header />

      <main className="movie-detail-main">
        <div className="movie-detail-container">
          {/* Left: Poster */}
          <div className="movie-detail-poster">
            <img src={movie.poster_url || ''} alt={movie.title} />
          </div>

          {/* Right: Movie Info */}
          <div className="movie-detail-info">
            <h1 className="movie-detail-title font-anton-large">{movie.title}</h1>
            
            {movie.genre && (
              <div className="movie-detail-meta">
                 <div className="movie-detail-meta-genre">
                  <img src="https://cinestar.com.vn/assets/images/icon-tag.svg" alt="" />
                  </div>
                <span className="movie-detail-value">{movie.genre}</span>
              </div>
            )}

            {movie.duration && (
              <div className="movie-detail-meta">
                 <div className="movie-detail-meta-duration">
                    <img src="https://cinestar.com.vn/assets/images/icon-clock.svg" alt="" />
                    </div>
                <span className="movie-detail-value">{movie.duration}'</span>
              </div>
            )}

            {movie.country && (
              <div className="movie-detail-meta">
                 <div className="movie-detail-meta-country">
                <i class="fa-solid fa-earth-americas country-icon"></i>
                </div>
                <span className="movie-detail-value">{movie.country}</span>
              </div>
            )}

            {movie.subtitle && (
              <div className="movie-detail-meta">
                 <div className="movie-detail-meta-sub">
                       <img src="https://cinestar.com.vn/assets/images/subtitle.svg" alt="" />
                       </div>
                <span className="movie-detail-value">{movie.subtitle}</span>
              </div>
            )}
            {movie.rating && (() => {
              const ratingDetails = getAgeRatingDetails(movie.rating);
              return (
                <div className="movie-detail-meta">
                  <div className="movie-detail-meta-limit-age">
                    <i className="fa-solid fa-user-check"></i>
                  </div>
                  <span className="movie-detail-value">Phim {ratingDetails.description}</span>
                </div>
              );
            })()}
            <div className="movie-detail-description">
              <h3 className="movie-detail-section-title">MÔ TẢ</h3>
              {movie.director && (
                <div className="movie-detail-desc-item">
                  <span className="movie-detail-desc-label">Đạo diễn: {movie.director}</span>          
                </div>
                )}

              {movie.release_date && (
                <div className="movie-detail-desc-item">
                  <span className="movie-detail-desc-label">Khởi chiếu: {formatReleaseDate(movie.release_date)}</span>
                </div>
              )}

              {movie.description && (
                <div className="movie-detail-synopsis">
                  <h4 className="movie-detail-synopsis-title">NỘI DUNG PHIM</h4>
                  <p className="movie-detail-synopsis-text">{movie.description}</p>
                </div>
              )}

              {movie.trailer_url && videoId && (
                <button
                  className="movie-btn-outline movie-trailer-btn-detail"
                  onClick={() => setIsTrailerOpen(true)}
                >
                  <img src="https://cinestar.com.vn/assets/images/icon-play-vid.svg" alt="" />
                  Xem Trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Showtime Schedule */}
        {showtimes.length > 0 && (
          <div className="movie-detail-showtimes">
            <h2 className="movie-detail-section-header">LỊCH CHIẾU</h2>
            {getAvailableDates.length > 0 ? (
              <div className="showtime-dates">
                {getAvailableDates.map((dateObj, index) => (
                  <button
                    key={index}
                    className={`showtime-date-btn ${selectedDate?.dateStr === dateObj.dateStr ? 'active' : ''}`}
                    onClick={() => setSelectedDate(dateObj)}
                  >
                    {/* Ngày ở dòng trên */}
                    <span className="showtime-date">{dateObj.dateStr}</span>
                    {/* Thêm ngắt dòng */}
                    <br />
                    <span className="showtime-day">{dateObj.dayName}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ color: '#9ca3af', padding: '20px' }}>Không có ngày chiếu nào</p>
            )}
          </div>
        )}

        {/* Cinema List */}
        {showtimes.length > 0 && (
          <div className="movie-detail-cinemas">
            <h2 className="movie-detail-section-header">DANH SÁCH RẠP</h2>
            <div className="cinema-city-selector">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="cinema-city-select"
              >
                <option value="HỒ CHÍ MINH">HỒ CHÍ MINH</option>
                <option value="HÀ NỘI">HÀ NỘI</option>
                <option value="ĐÀ NẴNG">ĐÀ NẴNG</option>
              </select>
            </div>
            <div className="cinema-list">
              {Object.keys(getShowtimesByCinema).length > 0 ? (
                Object.values(getShowtimesByCinema).map((cinemaData) => {
                  const screenType = Array.from(cinemaData.screenTypes)[0] || 'Standard';
                  return (
                    <div key={cinemaData.id} className="cinema-item-detail">
                      <div className="cinema-item-header">
                        <h3 className="cinema-item-name">{cinemaData.name}</h3>
                        {screenType && (
                          <span className="cinema-screen-type">{screenType}</span>
                        )}
                      </div>
                      {cinemaData.address && (
                        <p className="cinema-item-address">{cinemaData.address}</p>
                      )}
                      {cinemaData.showtimes.length > 0 ? (
                        <div className="cinema-showtimes">
                          {cinemaData.showtimes
                            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                            .map((st, idx) => {
                              const time = new Date(st.start_time);
                              const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
                              return (
                                <button 
                                  key={st.id || idx} 
                                  className="cinema-showtime-btn"
                                  onClick={() => {
                                    // TODO: Navigate to booking page
                                    console.log('Selected showtime:', st);
                                  }}
                                >
                                  {timeStr}
                                </button>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="cinema-no-showtime">Hiện chưa có lịch chiếu</p>
                      )}
                    </div>
                  );
                })
              ) : selectedDate ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
                  Không có lịch chiếu cho ngày đã chọn
                </p>
              ) : (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
                  Vui lòng chọn ngày để xem lịch chiếu
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Trailer Modal */}
      {isTrailerOpen && videoId && (
        <div className="trailer-modal-overlay" onClick={() => setIsTrailerOpen(false)}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="trailer-modal-header">
              <h3>{movie.title}</h3>
              <button className="close-modal-btn" onClick={() => setIsTrailerOpen(false)}>×</button>
            </div>
            <div className="trailer-video-wrapper">
              <iframe
                title="Movie Trailer"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default MovieDetail;

