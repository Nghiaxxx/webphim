import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useMovies } from '../hooks/useMovies';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

function MovieShowing() {
  const { nowShowingMovies, loading } = useMovies();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = (key) => getTranslation(key, language);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTrailerId, setCurrentTrailerId] = useState(null);
  const [currentMovieTitle, setCurrentMovieTitle] = useState('');

  // Hàm trích xuất YouTube ID
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match && match[1].length === 11 ? match[1] : null;
  };

  // Hàm mở Modal và đặt ID video
  const openTrailerModal = (trailerUrl, movieTitle) => {
    const videoId = extractYouTubeId(trailerUrl);
    if (videoId) {
      setCurrentTrailerId(videoId);
      setCurrentMovieTitle(movieTitle);
      setIsModalOpen(true);
    } else {
      console.warn("Lỗi: Không tìm thấy ID video hợp lệ hoặc trailerUrl bị thiếu.");
    }
  };

  // Hàm đóng Modal
  const closeTrailerModal = () => {
    setIsModalOpen(false);
    setCurrentTrailerId(null);
    setCurrentMovieTitle('');
  };

  // Hàm format ngày
  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error);
      return dateString;
    }
  };

  return (
    <div className="app-root">
      <Header />

      <main className="movie-showing-main">
        {/* Header Title */}
        <div className="section-header">
          <h2>{t('home.nowShowing')}</h2>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            {t('home.loading')}
          </div>
        ) : nowShowingMovies.length > 0 ? (
          <div className="movie-showing-grid">
            {nowShowingMovies.map((movie) => {
              const formattedDate = formatReleaseDate(movie.release_date);
              return (
                <div key={movie.id} className="movie-showing-card">
                  <div className="movie-showing-poster">
                    {movie.rating && (
                      <div className="movie-badges">
                        <span className="badge badge-format">
                          <span>2D</span>
                        </span>
                        <span className="badge badge-rating">
                          <span className="rating-number">{movie.rating}</span>
                          <span className="rating-text">
                            {movie.rating === 'P' ? 'KID' : 
                             movie.rating === 'C' ? 'ALL' : 
                             movie.rating.startsWith('T') ? 'TEEN' : 'ALL'}
                          </span>
                        </span>
                      </div>
                    )}
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt={movie.title} />
                    ) : (
                      <div className="movie-showing-poster-placeholder">
                        {movie.title.charAt(0)}
                      </div>
                    )}
                    <div className="movie-showing-overlay">
                      <h3 className="movie-showing-overlay-title">{movie.title}</h3>
                      <ul className="movie-showing-overlay-list">
                        {movie.genre && (
                          <li>
                            <img src="https://cinestar.com.vn/assets/images/icon-tag.svg" alt="" />
                            <span>{movie.genre}</span>
                          </li>
                        )}
                        {movie.duration && (
                          <li>
                            <img src="https://cinestar.com.vn/assets/images/icon-clock.svg" alt="" />
                            <span>{movie.duration} phút</span>
                          </li>
                        )}
                        {movie.country && (
                          <li>
                            <i className="fa-solid fa-earth-americas country-icon"></i>
                            <span>{movie.country}</span>
                          </li>
                        )}
                        {movie.subtitle && (
                          <li>
                            <img src="https://cinestar.com.vn/assets/images/subtitle.svg" alt="" />
                            <span>{movie.subtitle}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="movie-showing-info">
                    <h3 className="movie-showing-title">{movie.title}</h3>
                    {formattedDate && (
                      <div className="movie-showing-date">{formattedDate}</div>
                    )}
                    
                    <div className="movie-showing-actions">
                      <button
                        className="movie-btn-outline movie-trailer-btn"
                        onClick={() => openTrailerModal(movie.trailer_url, movie.title)}
                      >
                        <img src="https://cinestar.com.vn/assets/images/icon-play-vid.svg" alt="" />
                        <span className="trailer-text">{t('common.trailer')}</span>
                      </button>
                      <button
                        className="cssbuttons-io"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        <span>{t('movieSlideshow.bookTicket')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            {t('home.noMoviesNowShowing')}
          </div>
        )}
      </main>

      <Footer />

      {/* Trailer Modal */}
      {isModalOpen && currentTrailerId && (
        <div className="trailer-modal-overlay" onClick={closeTrailerModal}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="trailer-modal-header">
              <h3>{currentMovieTitle}</h3>
              <button className="close-modal-btn" onClick={closeTrailerModal}>×</button>
            </div>
            <div className="trailer-video-wrapper">
              <iframe
                title="Movie Trailer"
                src={`https://www.youtube.com/embed/${currentTrailerId}?autoplay=1&rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieShowing;

