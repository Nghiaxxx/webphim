import React, { useMemo } from 'react';
import LazyImage from './common/LazyImage';

// Hàm chuyển đổi định dạng ngày (YYYY-MM-DD sang DD/MM/YYYY)
// Moved outside component to avoid recreation on every render
const formatReleaseDate = (dateString) => {
  if (!dateString) return '';
  try {
      // Đảm bảo dateString ở định dạng YYYY-MM-DD để new Date() hoạt động nhất quán
      const date = new Date(dateString);
      // Sử dụng toLocaleDateString để định dạng theo ngôn ngữ (ví dụ: vi-VN sẽ cho ra DD/MM/YYYY)
      // Tùy chọn: { timeZone: 'UTC' } để tránh lệch múi giờ nếu dateString chỉ là ngày
      return date.toLocaleDateString('vi-VN'); 
  } catch (error) {
      console.error("Lỗi định dạng ngày:", error);
      return dateString; // Trả về chuỗi gốc nếu có lỗi
  }
};

function MovieCard({ movie, active, onClick }) {
  const formattedDate = useMemo(() => {
    return movie.release_date ? formatReleaseDate(movie.release_date) : null;
  }, [movie.release_date]);
  return (
    <div
      className={`movie-card ${active ? 'movie-card-active' : ''}`}
      onClick={onClick}
    >
      <div className="movie-poster">
      
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
          <LazyImage src={movie.poster_url} alt={movie.title} />
        ) : (
          <div className="poster-placeholder">{movie.title.charAt(0)}</div>
        )}
        <div className="movie-overlay">
          <h3 className="overlay-title">{movie.title}</h3>
          <ul className="overlay-list">
            {movie.genre && (
              <li>
       
                <img src="https://cinestar.com.vn/assets/images/icon-tag.svg" alt="" />
               
                <span>
                  {movie.genre}
                </span>
              </li>
            )}
            {movie.duration && (
              <li>
         
                <img src="https://cinestar.com.vn/assets/images/icon-clock.svg" alt="" />
              
                <span>
                   {movie.duration} phút
                </span>
              </li>
            )}
            {movie.country && (
    <li>
        <i className="fa-solid fa-earth-americas country-icon"></i> 
        <span>
            {movie.country}
        </span>
    </li>
)}
            {movie.subtitle && (
              <li>
        
                <img src="https://cinestar.com.vn/assets/images/subtitle.svg" alt="" />
            
                <span> {movie.subtitle}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="movie-info">
      {movie.status === 'coming_soon' && formattedDate && (
                    <div className="movie-coming-soon-date">
                        Khởi chiếu: {formattedDate}
                    </div>
                )}
        <h3>{movie.title}</h3>
      </div>
    </div>
  );
}

export default React.memo(MovieCard);


