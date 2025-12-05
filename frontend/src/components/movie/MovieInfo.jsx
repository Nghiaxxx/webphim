import React, { useState } from 'react';
import { formatReleaseDate, getAgeRatingDetails, extractYouTubeId } from '../../utils/helpers';
import { APP_CONFIG } from '../../constants/app';
import TrailerModal from './TrailerModal';
import LazyImage from '../common/LazyImage';

const MovieInfo = ({ movie }) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const videoId = extractYouTubeId(movie?.trailer_url);

  if (!movie) return null;

  return (
    <>
      <div className="movie-detail-container">
        {/* Left: Poster */}
        <div className="movie-detail-poster">
          <LazyImage src={movie.poster_url || ''} alt={movie.title} />
        </div>

        {/* Right: Movie Info */}
        <div className="movie-detail-info">
          <h1 className="movie-detail-title font-anton-large">{movie.title}</h1>
          
          {movie.genre && (
            <div className="movie-detail-meta">
              <div className="movie-detail-meta-genre">
                <img src={APP_CONFIG.IMAGES.IC_TAG} alt="" />
              </div>
              <span className="movie-detail-value">{movie.genre}</span>
            </div>
          )}

          {movie.duration && (
            <div className="movie-detail-meta">
              <div className="movie-detail-meta-duration">
                <img src={APP_CONFIG.IMAGES.IC_CLOCK} alt="" />
              </div>
              <span className="movie-detail-value">{movie.duration}'</span>
            </div>
          )}

          {movie.country && (
            <div className="movie-detail-meta">
              <div className="movie-detail-meta-country">
                <i className="fa-solid fa-earth-americas country-icon"></i>
              </div>
              <span className="movie-detail-value">{movie.country}</span>
            </div>
          )}

          {movie.subtitle && (
            <div className="movie-detail-meta">
              <div className="movie-detail-meta-sub">
                <img src={APP_CONFIG.IMAGES.SUBTITLE} alt="" />
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
                <img src={APP_CONFIG.IMAGES.IC_PLAY_VID} alt="" />
                Xem Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      <TrailerModal 
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movie={movie}
        videoId={videoId}
      />
    </>
  );
};

export default MovieInfo;

